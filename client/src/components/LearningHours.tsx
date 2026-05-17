import { Command, Clock } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const TiltCard = ({ imageY }: { imageY: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        y: imageY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-64 h-96 rounded-t-full z-10 shadow-2xl cursor-pointer perspective-1000"
    >
      <div className="relative w-full h-full overflow-hidden rounded-t-full transform-style-3d">
        <motion.div
          style={{ x: useTransform(mouseX, [-0.5, 0.5], ["-5%", "5%"]), y: useTransform(mouseY, [-0.5, 0.5], ["-5%", "5%"]), scale: 1.1 }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
            alt="Library Archway"
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

        {/* Shine Effect */}
        <motion.div
          style={{
            opacity: useTransform(mouseX, [-0.5, 0.5], [0, 0.3]),
            background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 255, 255, 0.6) 50%, transparent 54%)"
          }}
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-20"
        />
      </div>
    </motion.div>
  );
};

export default function LearningHours() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section ref={containerRef} className="w-full bg-[#F4F4F4] dark:bg-card/20 py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">

          {/* Left: Learning Hours */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center relative group"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl transform -translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-6 relative z-10"
            >
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-card border border-border shadow-sm flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <h3 className="font-sans text-sm tracking-widest uppercase text-muted-foreground mb-2">
              {t("learning.title")}
            </h3>
            <p className="font-cormorant text-2xl font-bold text-foreground">
              {t("learning.schedule")}
            </p>
            <p className="font-sans text-xs text-muted-foreground mt-1">
              {t("learning.weekend")}
            </p>
          </motion.div>

          {/* Center: Arched Image with 3D Tilt */}
          <div className="flex justify-center relative perspective-container">
            <TiltCard imageY={imageY} />
          </div>

          {/* Right: 24/7 Access */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center relative group"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl transform -translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="mb-6 relative z-10"
            >
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-card border border-border shadow-sm flex items-center justify-center transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300">
                <Command className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <h3 className="font-sans text-sm tracking-widest uppercase text-muted-foreground mb-2">
              {t("learning.digital")}
            </h3>
            <p className="font-cormorant text-2xl font-bold text-foreground max-w-[200px]">
              {t("learning.access")}
            </p>
            <p className="font-sans text-xs text-muted-foreground mt-1">
              {t("learning.resources")}
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
