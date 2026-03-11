import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BrokerWithStats {
  user_id: string;
  full_name: string;
  specialty: string | null;
  area: string | null;
  avatar_url: string | null;
  avg_rating: number;
  review_count: number;
}

const BrokerCard = ({ broker }: { broker: BrokerWithStats }) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
          {broker.avatar_url ? (
            <img src={broker.avatar_url} alt={broker.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary font-display">
              {broker.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-foreground font-display truncate">{broker.full_name}</h4>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(broker.avg_rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {broker.avg_rating > 0 ? `${broker.avg_rating.toFixed(1)} (${broker.review_count})` : "Sem avaliações"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {broker.specialty && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span>{broker.specialty}</span>
          </div>
        )}
        {broker.area && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            <span>{broker.area}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TopBrokers = () => {
  const [brokers, setBrokers] = useState<BrokerWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopBrokers();
  }, []);

  const fetchTopBrokers = async () => {
    setLoading(true);

    // Get all broker profiles
    const { data: brokerProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, specialty, area, avatar_url")
      .eq("user_type", "broker");

    if (!brokerProfiles || brokerProfiles.length === 0) {
      setBrokers([]);
      setLoading(false);
      return;
    }

    // Get reviews grouped by broker
    const { data: reviews } = await supabase
      .from("broker_reviews")
      .select("broker_id, rating");

    // Calculate stats
    const statsMap: Record<string, { total: number; count: number }> = {};
    (reviews || []).forEach((r: any) => {
      if (!statsMap[r.broker_id]) statsMap[r.broker_id] = { total: 0, count: 0 };
      statsMap[r.broker_id].total += r.rating;
      statsMap[r.broker_id].count += 1;
    });

    const enriched: BrokerWithStats[] = brokerProfiles.map((b: any) => {
      const stats = statsMap[b.user_id];
      return {
        ...b,
        avg_rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
        review_count: stats?.count || 0,
      };
    });

    // Sort by rating desc, then by review count desc
    enriched.sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);

    setBrokers(enriched.slice(0, 6));
    setLoading(false);
  };

  return (
    <section className="py-24 bg-background" id="corretores">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest">Corretores destaque</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 font-display">
            Os melhores avaliados
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
            Corretores com as melhores avaliações de clientes reais em São Luís.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        ) : brokers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Ainda não há corretores cadastrados. Seja o primeiro!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker, index) => (
              <motion.div
                key={broker.user_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <BrokerCard broker={broker} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopBrokers;
