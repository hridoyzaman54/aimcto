import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Timer } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AIMVerse() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to 3 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- Sound Engine ---
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);

  const stopAllSounds = () => {
    // Stop local audio
    if (activeAudioRef.current) {
      const audio = activeAudioRef.current;
      // Fade out effect
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 50);
      activeAudioRef.current = null;
    }

    // Stop synths
    activeOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) { /* ignore already stopped */ }
    });
    activeOscillatorsRef.current = [];

    // Disconnect gains to clean up
    activeGainNodesRef.current.forEach(gain => {
      try { gain.disconnect(); } catch (e) { /* ignore */ }
    });
    activeGainNodesRef.current = [];
  };

  const playHeroSound = () => {
    stopAllSounds(); // Prevent stacking
    const audio = new Audio("/sounds/hero.mp3");
    audio.volume = 0.4;
    // Lower volume or shorten if needed, but stop-on-leave handles duration best
    audio.play()
      .then(() => { activeAudioRef.current = audio; })
      .catch(() => playHeroSynth());
  };

  const playVillainSound = () => {
    stopAllSounds();
    const audio = new Audio("/sounds/villain.mp3");
    audio.volume = 0.4;
    audio.play()
      .then(() => { activeAudioRef.current = audio; })
      .catch(() => playVillainSynth());
  };

  // Web Audio API Fallbacks
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const playHeroSynth = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(3520, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);

      activeOscillatorsRef.current.push(osc);
      activeGainNodesRef.current.push(gain);
    } catch (e) { console.error("Synth failed", e); }
  };

  const playVillainSynth = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const freqs = [55, 110, 112];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = f;

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2);

        activeOscillatorsRef.current.push(osc);
        activeGainNodesRef.current.push(gain);
      });
    } catch (e) { console.error("Synth failed", e); }
  };
  // --------------------

  return (
    <section ref={containerRef} className="py-12 sm:py-16 md:py-24 bg-background text-foreground relative overflow-hidden">
      {/* Subtle Texture Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 opacity-5 h-[120%] -top-[10%]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:invert dark:opacity-10"></div>
      </motion.div>

      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-muted-foreground font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm">{t("aimverse.tag")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-serif font-bold mt-3 sm:mt-4 mb-4 sm:mb-6 text-foreground">
              {t("aimverse.title")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t("aimverse.desc")}
            </p>
          </motion.div>
        </div>

        {/* Video Trailer Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-video w-full max-w-5xl mx-auto bg-gray-100 rounded-none overflow-hidden shadow-xl mb-8 sm:mb-12 md:mb-16 group"
        >
          <img
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop"
            alt="AIMVerse Trailer"
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
            <Button
              size="icon"
              className="h-24 w-24 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all duration-300 border-none"
            >
              <Play className="h-8 w-8 ml-1 fill-current" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 font-serif">Episode 1: The Quantum Realm</h3>
            <p className="text-gray-200 text-xs sm:text-sm md:text-base">Discover the secrets of subatomic particles with Captain Quantum.</p>
          </div>
        </motion.div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-foreground">
              <Timer className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              {t("aimverse.nextEpisode")}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              {t("aimverse.nextEpisodeDesc")}
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-6 sm:px-10 py-5 sm:py-7 text-sm sm:text-base md:text-lg uppercase tracking-wider sm:tracking-widest transition-all duration-300 hover:scale-105 touch-manipulation active:scale-95">
              {t("aimverse.reminder")}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: t("aimverse.days"), value: timeLeft.days },
              { label: t("aimverse.hours"), value: timeLeft.hours },
              { label: t("aimverse.minutes"), value: timeLeft.minutes },
              { label: t("aimverse.seconds"), value: timeLeft.seconds }
            ].map((item, index) => (
              <div key={index} className="bg-card border border-border p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground mb-1 sm:mb-2">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Power Glossary Section */}
        <div className="mt-16 sm:mt-24 md:mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4">
            <span className="text-muted-foreground font-medium tracking-[0.3em] uppercase text-sm">{t("aimverse.glossaryTag")}</span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 text-foreground">{t("aimverse.glossaryTitle")}</h3>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t("aimverse.glossaryDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Hero Profile */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onMouseEnter={playHeroSound}
              onMouseLeave={stopAllSounds}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-background to-amber-50/10 dark:from-background dark:to-amber-900/10 border-2 border-amber-400/30 p-8 shadow-xl shadow-amber-500/10 relative overflow-hidden group hover:border-amber-400 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">{t("aimverse.hero")}</div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-3xl font-serif font-bold text-foreground">{t("aimverse.heroName")}</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">{t("aimverse.heroEp")}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl"
                >
                  ⚡
                </motion.div>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-wide text-foreground mb-2 border-b border-amber-400/20 pb-1">{t("aimverse.heroPower")}</h5>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("aimverse.heroPowerDesc")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase text-muted-foreground/70 mb-1">{t("aimverse.theory")}</h5>
                    <p className="text-sm font-medium text-foreground">{t("aimverse.heroTheory")}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-muted-foreground/70 mb-1">{t("aimverse.plausibility")}</h5>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "40%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-amber-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground">{t("aimverse.heroPlausibility")}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-muted-foreground/70 mb-1">{t("aimverse.mechanism")}</h5>
                  <p className="text-sm text-muted-foreground">
                    {t("aimverse.heroMechanism")}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-muted-foreground/70 mb-1">{t("aimverse.future")}</h5>
                  <p className="text-sm text-muted-foreground italic">
                    {t("aimverse.heroFuture")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Villain Profile */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onMouseEnter={playVillainSound}
              onMouseLeave={stopAllSounds}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-background to-red-50/10 dark:from-background dark:to-red-900/10 border-2 border-red-500/30 p-8 shadow-xl shadow-red-500/10 relative overflow-hidden group hover:border-red-500 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">{t("aimverse.villain")}</div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-3xl font-serif font-bold">{t("aimverse.villainName")}</h4>
                  <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">{t("aimverse.villainEp")}</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="text-4xl"
                >
                  🌀
                </motion.div>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-wide text-secondary-foreground mb-2 border-b border-border pb-1">{t("aimverse.villainPower")}</h5>
                  <p className="text-secondary-foreground/80 text-sm leading-relaxed">
                    {t("aimverse.villainPowerDesc")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase text-secondary-foreground/60 mb-1">{t("aimverse.theory")}</h5>
                    <p className="text-sm font-medium text-secondary-foreground">{t("aimverse.villainTheory")}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-secondary-foreground/60 mb-1">{t("aimverse.plausibility")}</h5>
                    <div className="w-full bg-gray-800 h-2 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "85%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-red-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <p className="text-xs text-right mt-1 text-secondary-foreground/60">{t("aimverse.villainPlausibility")}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-secondary-foreground/60 mb-1">{t("aimverse.mechanism")}</h5>
                  <p className="text-sm text-secondary-foreground/80">
                    {t("aimverse.villainMechanism")}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-secondary-foreground/60 mb-1">{t("aimverse.future")}</h5>
                  <p className="text-sm text-secondary-foreground/80 italic">
                    {t("aimverse.villainFuture")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
