import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import SpecialNeeds from "@/components/SpecialNeeds";

export default function SpecialNeedsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main className="w-full">
        {/* Render the supreme premium SpecialNeeds component directly inside the layout */}
        <SpecialNeeds />
      </main>
      <Footer />
    </div>
  );
}
