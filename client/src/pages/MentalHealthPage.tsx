import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import MentalHealth from "@/components/MentalHealth";

export default function MentalHealthPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main className="w-full">
        {/* Render the supreme premium MentalHealth component directly inside the layout */}
        <MentalHealth />
      </main>
      <Footer />
    </div>
  );
}
