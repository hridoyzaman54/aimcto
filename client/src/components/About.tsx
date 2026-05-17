import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function About() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-transparent py-12 sm:py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">

          {/* Left Column: Text Content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground uppercase leading-[0.9]">
                {t("about.title")}
              </h2>
              <div className="text-4xl sm:text-5xl md:text-6xl font-serif">*</div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl text-justify">
              <p>{t("about.desc")}</p>
            </div>

            <div className="pt-2 sm:pt-4">
              <Button
                variant="outline"
                className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background px-6 sm:px-8 py-5 sm:py-6 text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 touch-manipulation active:scale-95"
              >
                Explore More
              </Button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative h-[350px] sm:h-[450px] md:h-[600px] w-full overflow-hidden rounded-2xl md:rounded-none group cursor-pointer">
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
            )}
            <motion.div
              style={{ y: isMobile ? 0 : imageY }}
              whileTap={{ scale: 0.98 }}
              className="h-[120%] -top-[10%] relative transition-transform duration-500"
            >
              <motion.img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop"
                alt="Modern Learning Environment"
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                initial={isMobile ? { filter: "grayscale(100%)" } : {}}
                whileInView={isMobile ? { filter: "grayscale(0%)" } : {}}
                viewport={{ amount: 0.5 }}
                className={`h-full w-full object-cover grayscale md:group-hover:grayscale-0 transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
