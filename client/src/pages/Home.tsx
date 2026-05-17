import Header from "@/components/Header";
import ScrollProgress from "@/components/ScrollProgress";
import CreativeGallery from "@/components/CreativeGallery";
import Footer from "@/components/Footer";
import Courses from "@/components/Courses";
import AIMVerse from "@/components/AIMVerse";
import MentalHealth from "@/components/MentalHealth";
import SpecialNeeds from "@/components/SpecialNeeds";
import TinyExplorers from "@/components/TinyExplorers";
import Hero from "@/components/Hero";
import About from "@/components/About";
import NewArrivals from "@/components/NewArrivals";
import LearningHours from "@/components/LearningHours";
import Contact from "@/components/Contact";
import PreFooter from "@/components/PreFooter";
import MissionStatement from "@/components/MissionStatement";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import AimAdvantage from "@/components/AimAdvantage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main className="w-full">
        <div className="bg-background"><Hero /></div>

        <div id="about" className="bg-[#EFEDE8] dark:bg-card/30">
          <About />
        </div>

        <div className="bg-background">
          <AimAdvantage />
        </div>

        <div className="bg-[#EFEDE8] dark:bg-card/30">
          <NewArrivals />
        </div>

        <div id="courses" className="bg-background">
          <Courses />
        </div>

        <div className="bg-[#EFEDE8] dark:bg-card/30">
          <LearningHours />
        </div>

        <div className="bg-background">
          <MissionStatement />
        </div>

        <div id="special-needs" className="bg-[#EFEDE8] dark:bg-card/30">
          <SpecialNeeds />
        </div>

        <div id="tiny-explorers" className="bg-background">
          <TinyExplorers />
        </div>

        <div id="mental-health" className="bg-[#EFEDE8] dark:bg-card/30">
          <MentalHealth />
        </div>

        <div id="aimverse" className="bg-background">
          <AIMVerse />
        </div>

        <div id="gallery" className="bg-[#EFEDE8] dark:bg-card/30">
          <CreativeGallery />
        </div>

        <div className="bg-background">
          <Contact />
        </div>

        <div className="bg-[#EFEDE8] dark:bg-card/30">
          <Testimonials />
        </div>

        <div className="bg-background">
          <FAQ />
        </div>

        <div className="bg-[#EFEDE8] dark:bg-card/30">
          <PreFooter />
        </div>
      </main>
      <Footer />
    </div>
  );
}
