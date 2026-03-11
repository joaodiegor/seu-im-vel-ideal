import { motion } from "framer-motion";
import { Star, Award, MapPin } from "lucide-react";

interface BrokerCardProps {
  name: string;
  rating: number;
  reviews: number;
  specialty: string;
  area: string;
  image?: string;
}

const BrokerCard = ({ name, rating, reviews, specialty, area }: BrokerCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl font-bold text-primary font-display">
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-foreground font-display truncate">{name}</h4>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-gold text-gold" : "text-border"}`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {rating.toFixed(1)} ({reviews})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>{specialty}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-accent" />
          <span>{area}</span>
        </div>
      </div>
    </div>
  );
};

const brokers = [
  { name: "Carlos Mendes", rating: 4.9, reviews: 87, specialty: "Casas em condomínio", area: "Aracagy, Araçagy" },
  { name: "Ana Paula Silva", rating: 4.8, reviews: 63, specialty: "Apartamentos alto padrão", area: "Calhau, Renascença" },
  { name: "Roberto Lima", rating: 4.7, reviews: 45, specialty: "Imóveis comerciais", area: "Centro, Cohama" },
  { name: "Marina Costa", rating: 4.9, reviews: 92, specialty: "Casas e terrenos", area: "Turu, Olho D'Água" },
  { name: "João Batista", rating: 4.6, reviews: 38, specialty: "Primeiro imóvel", area: "Cohama, Turu" },
  { name: "Fernanda Reis", rating: 4.8, reviews: 71, specialty: "Alto padrão", area: "Ponta D'Areia, São Francisco" },
];

const TopBrokers = () => {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brokers.map((broker, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <BrokerCard {...broker} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrokers;
