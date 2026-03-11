import { motion } from "framer-motion";
import { MessageSquare, Users, Trophy, Star } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Descreva o que quer",
    description: "Informe tipo de imóvel, bairro, preço máximo e outras preferências. Seja específico!",
  },
  {
    icon: Users,
    title: "Corretores competem",
    description: "Corretores cadastrados enviam propostas exclusivas. Só você vê as ofertas recebidas.",
  },
  {
    icon: Trophy,
    title: "Escolha a melhor",
    description: "Compare propostas, veja avaliações dos corretores e escolha a oferta ideal para você.",
  },
  {
    icon: Star,
    title: "Avalie o corretor",
    description: "Após a negociação, avalie o corretor e ajude outros compradores a escolher melhor.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background" id="como-funciona">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest">Como funciona</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 font-display">
            Simples como deve ser
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
            Em poucos passos, receba propostas de imóveis sob medida para você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300 h-full border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-5xl font-bold text-border font-display absolute top-6 right-8">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3 font-display">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
