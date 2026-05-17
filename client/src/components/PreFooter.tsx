import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function PreFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect: Image moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div ref={containerRef} className="relative h-[60vh] overflow-hidden">
      <motion.div 
        style={{ y }}
        className="absolute inset-0 w-full h-[140%] -top-[20%]"
      >
        <img 
          src="/images/pre_footer_books.webp" 
          alt="Antique Books Collection" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Optional Overlay if needed for text contrast, though reference seems clean */}
      {/* <div className="absolute inset-0 bg-black/10" /> */}
    </div>
  );
}
