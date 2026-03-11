import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import RequestForm from "@/components/RequestForm";
import TopBrokers from "@/components/TopBrokers";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <RequestForm />
      <TopBrokers />
      <Footer />
    </div>
  );
};

export default Index;
