import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const publicKeyBytes = base64UrlDecode(publicKeyB64);
  const privateKeyBytes = base64UrlDecode(privateKeyB64);

  const publicKey = await crypto.subtle.importKey(
    "raw", publicKeyBytes, { name: "ECDSA", namedCurve: "P-256" }, true, []
  );

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC", crv: "P-256",
      x: base64UrlEncode(publicKeyBytes.slice(1, 33)),
      y: base64UrlEncode(publicKeyBytes.slice(33, 65)),
      d: base64UrlEncode(privateKeyBytes),
    },
    { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]
  );

  return { publicKey, privateKey, publicKeyBytes };
}

async function createVapidAuthHeader(
  endpoint: string, publicKeyB64: string, privateKeyB64: string, subject: string
) {
  const { privateKey, publicKeyBytes } = await importVapidKeys(publicKeyB64, privateKeyB64);
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, privateKey, encoder.encode(unsignedToken)
  );

  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  } else {
    const rLen = sigBytes[3];
    const rStart = 4;
    r = sigBytes.slice(rStart, rStart + rLen);
    const sLen = sigBytes[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    s = sigBytes.slice(sStart, sStart + sLen);
    if (r.length > 32) r = r.slice(r.length - 32);
    if (s.length > 32) s = s.slice(s.length - 32);
    if (r.length < 32) { const t = new Uint8Array(32); t.set(r, 32 - r.length); r = t; }
    if (s.length < 32) { const t = new Uint8Array(32); t.set(s, 32 - s.length); s = t; }
  }
  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  const token = `${unsignedToken}.${base64UrlEncode(rawSig)}`;
  const pubKeyB64 = base64UrlEncode(publicKeyBytes);

  return { authorization: `vapid t=${token}, k=${pubKeyB64}` };
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string, vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string
) {
  const { authorization } = await createVapidAuthHeader(
    subscription.endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject
  );

  return await fetch(subscription.endpoint, {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/json", TTL: "86400" },
    body: payload,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = "BLaZDZmpRQrxx_N7rMFC6Djn4Aesu-fWE-KQeRypkloyK2jiVec6M58N2KRt5bVf5gK9lrsroNsg0O3NurpP3aI";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!VAPID_PRIVATE_KEY) throw new Error("VAPID_PRIVATE_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { title, body, url, target_user_id } = await req.json();

    let targetSubs: any[] = [];

    if (target_user_id) {
      // Send to a specific user
      const { data: subs, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id")
        .eq("user_id", target_user_id);
      if (error) throw error;
      targetSubs = subs || [];
    } else {
      // Send to all brokers (original behavior)
      const { data: subscriptions, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id");
      if (error) throw error;

      const { data: brokerProfiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_type", "broker");

      const brokerIds = new Set((brokerProfiles || []).map((p: any) => p.user_id));
      targetSubs = (subscriptions || []).filter((s: any) => brokerIds.has(s.user_id));
    }

    const payload = JSON.stringify({ title, body, url });
    const results = { sent: 0, failed: 0, removed: 0 };

    for (const sub of targetSubs) {
      try {
        const res = await sendWebPush(
          sub, payload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, "mailto:contato@slzimoveis.com.br"
        );

        if (res.status === 201 || res.status === 200) {
          results.sent++;
        } else if (res.status === 404 || res.status === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          results.removed++;
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${res.status}`);
          results.failed++;
        }
      } catch (err) {
        console.error(`Push error for ${sub.endpoint}:`, err);
        results.failed++;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
