import { motion, useTransform, useMotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { preloadImages } from "@/hooks/useOptimizedImage";

// Critical hero images to preload immediately
const HERO_IMAGES = [
  '/images/hero/panel-1-texture.webp',
  '/images/hero/panel-1-texture-dark.webp',
  '/images/hero/panel-4-books.webp',
];

export default function Hero() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Mouse parallax state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Preload images on mount
  useEffect(() => {
    // Set to true immediately to avoid shimmer delay if assets are cached
    setImagesLoaded(true);
    preloadImages(HERO_IMAGES);
  }, []);

  // Handle video load
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to preload video
      video.preload = 'auto';
      
      const handleCanPlay = () => setVideoLoaded(true);
      video.addEventListener('canplaythrough', handleCanPlay);
      
      // If video is already ready
      if (video.readyState >= 3) {
        setVideoLoaded(true);
      }
      
      return () => video.removeEventListener('canplaythrough', handleCanPlay);
    }
  }, []);

  // Handle logo video autoplay
  useEffect(() => {
    const logoVideo = logoVideoRef.current;
    if (logoVideo) {
      logoVideo.play().catch(() => {
        // Autoplay blocked, will show first frame
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only apply parallax on desktop
    if (window.innerWidth < 768) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  // Touch handler for mobile - subtle feedback
  const handleTouchStart = () => {
    // Reset parallax on touch
    mouseX.set(0);
    mouseY.set(0);
  };

  // Mouse parallax transforms (desktop only)
  const xMoveReverse = useTransform(mouseX, [-0.5, 0.5], ["2%", "-2%"]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-white dark:bg-background touch-pan-y"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
    >
      {/* Loading skeleton - shows until images are ready */}
      {!imagesLoaded && (
        <div className="absolute inset-0 z-10 grid w-full grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-white dark:bg-background">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse min-h-[300px] md:min-h-[800px]"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
              }}
            />
          ))}
        </div>
      )}

      <div 
        className={`grid w-full grid-cols-1 md:grid-cols-4 gap-2 p-2 h-auto md:h-[800px] bg-white dark:bg-background overflow-hidden transition-opacity duration-500 ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Panel 1: Logo Video + Tagline - STATIC */}
        <div
          className="relative min-h-[350px] sm:min-h-[400px] md:h-[99%] flex flex-col items-center justify-center overflow-hidden bg-card border border-border shadow-sm"
          style={{ isolation: 'auto' }}
        >

          {/* Logo Video + Tagline — single centered column, nudged slightly above center */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center -mt-[6%] sm:-mt-[8%] md:-mt-[12%]"
          >
            {/* Logo Video */}
            <video
              ref={logoVideoRef}
              data-logo-video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/videos/logo-poster.webp"
              className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] object-contain flex-shrink-0"
              style={{ mixBlendMode: 'multiply' }}
            >
              <source src="/videos/AIMCentre360_3-ezgif.com-mute-video.mp4" type="video/mp4" />
            </video>

            {/* Tight spacer between video and text */}
            <div className="h-3 sm:h-4 md:h-5 flex-shrink-0" />

            {/* Tagline Text */}
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground tracking-normal cursor-default text-center flex flex-col gap-1 sm:gap-1.5 px-4 sm:px-6">
              <span className="inline-block text-primary">
                {t("hero.subtitle").split(',')[0]},
              </span>
              <span className="block text-muted-foreground italic">
                {t("hero.subtitle").split(',')[1] ? t("hero.subtitle").split(',')[1].trim().split(' ')[0] : ''}
              </span>
              <span className="inline-block font-bold text-foreground">
                {t("hero.subtitle").split(',')[1] ? t("hero.subtitle").split(',')[1].trim().split(' ').slice(1).join(' ') : ''}
              </span>
            </h2>
          </div>

          {/* Dark mode: switch blend mode to screen */}
          <style>{`
            .dark [data-logo-video] {
              mix-blend-mode: screen;
              filter: brightness(1.2);
            }
          `}</style>
        </div>

        {/* Panel 2: Video Background - Mouse Parallax Only on Desktop */}
        <motion.div
          style={{ x: typeof window !== 'undefined' && window.innerWidth >= 768 ? xMoveReverse : 0 }}
          className="relative min-h-[250px] sm:min-h-[300px] md:h-[99%] overflow-hidden order-3 md:order-none"
        >
          {/* Video placeholder while loading */}
          {!videoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
          )}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            fetchPriority="high"
            className="h-full w-full object-cover"
            poster="/images/hero/hero-video-poster.webp"
          >
            <source src="/images/hero/hero-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Panel 3: White Background + Title + CTA - STATIC */}
        <div
          className="relative min-h-[450px] sm:min-h-[500px] md:h-[99%] flex flex-col items-center justify-center bg-card text-center px-4 border border-border py-8 sm:py-12 md:py-0 shadow-sm order-1 md:order-none"
        >
          <div className="flex flex-col items-center gap-8 sm:gap-12 md:-mt-12">
            {/* Option B: Minimalist Luxury (Refined) */}
            <h1 className="font-sans text-center text-foreground cursor-default flex flex-col items-center gap-2">
              <span className="text-[10px] sm:text-xs md:text-sm uppercase font-medium tracking-[0.5em] sm:tracking-[0.8em] block text-muted-foreground ml-1 sm:ml-2">
                {t("hero.est")}
              </span>
              <div className="flex flex-col items-center relative py-2">
                <span className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase block">
                  {t("hero.title1")}
                </span>
                <span className="w-12 sm:w-16 h-[1px] bg-primary my-3 sm:my-4"></span>
                <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase block text-muted-foreground">
                  {t("hero.title2")}
                </span>
              </div>
              <span className="text-5xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-thin tracking-tighter leading-none block text-primary font-serif -mt-1 sm:-mt-2 md:-mt-4">
                {t("hero.title3")}
              </span>
            </h1>

            <Link href="/signup">
              <Button
                asChild
                variant="outline"
                className="rounded-none border-foreground bg-transparent px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg uppercase tracking-wider sm:tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all duration-300 active:scale-95 touch-manipulation"
              >
                <span>{t("hero.cta")} <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></span>
              </Button>
            </Link>

            {/* Scroll Indicator - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:flex mt-8 md:mt-12 flex-col items-center gap-2">
              <motion.span
                animate={{
                  opacity: [0.6, 1, 0.6],
                  y: [0, 2, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[10px] sm:text-xs uppercase font-medium tracking-[0.3em] text-muted-foreground selection:bg-transparent"
              >
                {t("hero.scroll")}
              </motion.span>
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-8 sm:h-10 w-[1px] bg-muted-foreground/40"
              />
            </div>
          </div>
        </div>

        {/* Panel 4: Books Image */}
        <motion.div
          style={{ x: typeof window !== 'undefined' && window.innerWidth >= 768 ? xMoveReverse : 0 }}
          className="relative min-h-[250px] sm:min-h-[300px] md:h-[99%] overflow-hidden border border-border/10 shadow-sm order-4 md:order-none"
        >
          <img
            src="/images/hero/panel-4-books.webp"
            alt="Stacked Books"
            className="h-full w-full object-cover"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
