import { motion } from "framer-motion";
import { Brain, Heart, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SpecialNeeds() {
  const { t } = useLanguage();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Force autoplay when component mounts
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;

      const playVideo = () => {
        videoRef.current?.play().catch(e => console.log("Autoplay failed:", e));
      };

      playVideo();

      // Double check after a small delay to handle hydration/loading capability
      const timer = setTimeout(playVideo, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">{t("special.tag")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-4 sm:mb-6">
              {t("special.title")}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-justify">
              {t("special.desc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-background p-4 sm:p-6 border border-border hover:border-primary transition-all duration-300 group hover-lift hover-glow cursor-pointer active:border-primary touch-manipulation"
              >
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">{t("special.sensory")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Tailored environments that respect sensory sensitivities while promoting engagement through tactile, visual, and auditory stimuli.</p>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-background p-4 sm:p-6 border border-border hover:border-primary transition-all duration-300 group hover-lift hover-glow cursor-pointer active:border-primary touch-manipulation"
              >
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">{t("special.emotional")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Building confidence and emotional resilience through positive reinforcement, social stories, and guided interaction.</p>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-background p-4 sm:p-6 border border-border hover:border-primary transition-all duration-300 group hover-lift hover-glow cursor-pointer active:border-primary touch-manipulation"
              >
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">{t("special.individualized")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Customized Individualized Education Programs (IEPs) that evolve with your child's growth and milestones.</p>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-background p-4 sm:p-6 border border-border hover:border-primary transition-all duration-300 group hover-lift hover-glow cursor-pointer active:border-primary touch-manipulation"
              >
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">{t("special.lifeSkills")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Practical training in daily living skills, communication, and social interaction to foster independence.</p>
              </motion.div>
            </div>

            <Button size="lg" className="rounded-none px-6 sm:px-8 py-5 sm:py-6 text-sm touch-manipulation active:scale-95">
              Learn About Our Approach
            </Button>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-first lg:order-last"
          >
            <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555819206-7b30da4f1506?q=80&w=2071&auto=format&fit=crop"
                alt="Child learning with sensory toys"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 bg-background p-4 sm:p-6 shadow-xl border border-border max-w-[200px] sm:max-w-xs hidden sm:block"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-2">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 flex items-center justify-center rounded-full">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">Autism Support</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Level 1, 2, 3 & Undefined</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 border-t-2 border-r-2 border-primary/30"></div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-16 h-16 sm:w-24 sm:h-24 border-b-2 border-l-2 border-primary/30"></div>
          </motion.div>
        </div>
      </div>

      {/* Parents Resources Section */}
      <div className="container mt-16 sm:mt-24 md:mt-32">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">Support & Community</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-4 sm:mb-6">{t("special.resources")}</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("special.resourcesDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
          {/* Video Section */}
          <div className="relative group">
            <div className="aspect-video bg-black relative overflow-hidden border border-border shadow-2xl z-10">
              {/* Video placeholder */}
              {!videoLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
              )}
              <video
                key="github-classroom-v1"
                width="100%"
                height="100%"
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                className={`w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoadedData={() => setVideoLoaded(true)}
              >
                <source src="https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/classroom.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 sm:mt-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">{t("special.classroom")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t("special.classroomDesc")}</p>
            </div>
          </div>

          {/* Resources List */}
          <div className="space-y-6 sm:space-y-8">
            <div className="border-l-2 border-primary pl-4 sm:pl-6 py-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Recommended Reading</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <li className="hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation py-1">
                  <span className="font-bold block text-foreground">The Reason I Jump</span>
                  by Naoki Higashida - An inner voice of a thirteen-year-old boy with autism.
                </li>
                <li className="hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation py-1">
                  <span className="font-bold block text-foreground">Neurotribes</span>
                  by Steve Silberman - The legacy of autism and the future of neurodiversity.
                </li>
              </ul>
            </div>

            <div className="border-l-2 border-primary pl-4 sm:pl-6 py-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Helpful Blogs & Guides</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <li className="hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation py-1">
                  <span className="font-bold block text-foreground">Autism Speaks Tool Kits</span>
                  Comprehensive guides for every stage of the journey, from diagnosis to adulthood.
                </li>
                <li className="hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation py-1">
                  <span className="font-bold block text-foreground">Sensory Processing Guide</span>
                  Understanding and managing sensory sensitivities in daily life.
                </li>
              </ul>
            </div>

            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto text-sm touch-manipulation active:scale-95">
              View All Resources
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
