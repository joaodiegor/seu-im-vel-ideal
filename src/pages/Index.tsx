import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import RequestForm from "@/components/RequestForm";
import TopBrokers from "@/components/TopBrokers";
import SellCTA from "@/components/SellCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <RequestForm />
      <HowItWorks />
      <TopBrokers />
      <SellCTA />
      <Footer />
    </div>
  );
};

export default Index;
