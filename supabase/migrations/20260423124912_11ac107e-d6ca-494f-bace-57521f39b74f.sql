-- Atribuir role de admin ao novo usuário
INSERT INTO public.user_roles (user_id, role)
VALUES ('e664ddcc-eb78-4740-96e5-21a8866af247', 'admin')
ON CONFLICT DO NOTHING;

-- Remover dados do admin antigo
DELETE FROM public.user_roles WHERE user_id = '7650e9a2-80d6-4fd8-bc65-5d0dddf20a30';
DELETE FROM public.push_subscriptions WHERE user_id = '7650e9a2-80d6-4fd8-bc65-5d0dddf20a30';
DELETE FROM public.profiles WHERE user_id = '7650e9a2-80d6-4fd8-bc65-5d0dddf20a30';
DELETE FROM auth.users WHERE id = '7650e9a2-80d6-4fd8-bc65-5d0dddf20a30';