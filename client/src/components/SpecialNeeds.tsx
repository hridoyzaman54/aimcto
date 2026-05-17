import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Star, Eye, Ear, Hand, Volume2, VolumeX, Music, Waves, TreePine, Bird, Sun, ArrowRight, Play, Pause, CheckCircle2, BookOpen, Users, Shield, Lightbulb, Target, ChevronDown, Phone, Mail, Lock, Unlock, ArrowLeft, Heart as HeartIcon, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

// ==========================================
// 1. PREMIUM SYNTHESIZER & AUDIO GENERATOR
// ==========================================
class CalmingSynthesizer {
  private ctx: AudioContext | null = null;
  private activeNodes: { osc?: AudioNode; gain?: GainNode; filter?: BiquadFilterNode; lfo?: OscillatorNode }[] = [];
  private currentSoundName: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try {
        if (node.lfo) node.lfo.stop();
        if (node.osc && (node.osc as any).stop) (node.osc as any).stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeNodes = [];
    this.currentSoundName = null;
  }

  getCurrentSound() {
    return this.currentSoundName;
  }

  playOcean() {
    this.initCtx();
    this.stopAll();
    if (!this.ctx) return;

    this.currentSoundName = "ocean";

    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1.0;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.08; 
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.001;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    filter.frequency.value = 450;

    lfo.start();
    noiseNode.start();

    gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 2);

    this.activeNodes.push({ osc: noiseNode, gain, filter, lfo });
  }

  playWind() {
    this.initCtx();
    this.stopAll();
    if (!this.ctx) return;

    this.currentSoundName = "wind";

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 250;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.001;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    filter.frequency.value = 350;

    lfo.start();
    noiseNode.start();

    gain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 1.5);

    this.activeNodes.push({ osc: noiseNode, gain, filter, lfo });
  }

  playHarp() {
    this.initCtx();
    this.stopAll();
    if (!this.ctx) return;

    this.currentSoundName = "harp";

    const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    let currentNoteIndex = 0;

    const scheduleNextNote = () => {
      if (this.currentSoundName !== "harp" || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pentatonicScale[currentNoteIndex], this.ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(filter).connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);

      this.activeNodes.push({ osc, gain, filter });

      const step = Math.random() > 0.5 ? 1 : -1;
      currentNoteIndex = (currentNoteIndex + step + pentatonicScale.length) % pentatonicScale.length;

      const nextDelay = 1200 + Math.random() * 600;
      setTimeout(scheduleNextNote, nextDelay);
    };

    scheduleNextNote();
  }

  playBirds() {
    this.initCtx();
    this.stopAll();
    if (!this.ctx) return;

    this.currentSoundName = "birds";

    const scheduleBirdChirp = () => {
      if (this.currentSoundName !== "birds" || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      
      const now = this.ctx.currentTime;
      const baseFreq = 2200 + Math.random() * 600;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 800, now + 0.15);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.2);

      this.activeNodes.push({ osc, gain });

      const nextChirp = 300 + Math.random() * 2500;
      setTimeout(scheduleBirdChirp, nextChirp);
    };

    scheduleBirdChirp();
  }
}

const synth = new CalmingSynthesizer();

// ==========================================
// 2. BREATHING GLOWING LOTUS COMPONENT
// ==========================================
function BreathingZone() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [counter, setCounter] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathing = () => {
    if (phase !== 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('idle');
      return;
    }
    setPhase('inhale');
    setCounter(4);
  };

  useEffect(() => {
    if (phase === 'idle') return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 3;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const getCircleStyles = () => {
    switch (phase) {
      case 'inhale':
        return { scale: 1.5, bg: 'rgba(56, 189, 248, 0.4)', border: '#38bdf8', text: 'Breathe In' };
      case 'hold':
        return { scale: 1.5, bg: 'rgba(192, 132, 252, 0.4)', border: '#c084fc', text: 'Hold Breath' };
      case 'exhale':
        return { scale: 1.0, bg: 'rgba(52, 211, 153, 0.4)', border: '#34d399', text: 'Breathe Out' };
      default:
        return { scale: 1.0, bg: 'rgba(100, 116, 139, 0.1)', border: 'var(--border)', text: 'Tap to Start' };
    }
  };

  const style = getCircleStyles();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl relative overflow-hidden shadow-2xl h-full min-h-[380px]">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <h3 className="font-serif text-xl sm:text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Calming Breathing Sphere
      </h3>

      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
        <AnimatePresence>
          {phase !== 'idle' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: style.scale * 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: phase === 'hold' ? 3 : 4, ease: "easeOut" }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ backgroundColor: style.bg }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={startBreathing}
          animate={{ scale: style.scale }}
          transition={{ duration: phase === 'hold' ? 0.5 : 4, ease: "easeInOut" }}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center shadow-lg border-4 transition-colors duration-500 relative z-10 touch-manipulation"
          style={{ backgroundColor: style.bg, borderColor: style.border }}
        >
          <span className="text-sm sm:text-base font-bold text-foreground drop-shadow">{style.text}</span>
          {phase !== 'idle' && (
            <motion.span
              key={counter}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl sm:text-3xl font-extrabold mt-1 text-foreground"
            >
              {counter}
            </motion.span>
          )}
        </motion.button>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mt-8 text-center px-4 leading-relaxed">
        {phase === 'idle'
          ? "Click the sphere to start a guided 4-3-4 breathing exercise tailored to help soothe sensory overload."
          : `Phase active: ${phase.toUpperCase()} — Relax your body.`}
      </p>
    </div>
  );
}

// ==========================================
// 3. INTERACTIVE SHATTER-PARTICLE CANVAS
// ==========================================
function InteractiveShatterZone() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; life: number }[] = [];

    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = 350;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const spawnParticles = (x: number, y: number, color: string, amount: number = 3) => {
      for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // Slight upward initial velocity
          r: 2 + Math.random() * 6,
          color,
          alpha: 1,
          life: 1.0
        });
      }
    };

    const playSound = (y: number) => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        // Map Y position to frequency
        const freq = 300 + ((canvas.height - y) / canvas.height) * 500;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (e) {}
    };

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true);
      const pos = getPos(e);
      if (pos) {
        spawnParticles(pos.x, pos.y, currentColor, 15);
        playSound(pos.y);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      if (pos) {
        spawnParticles(pos.x, pos.y, currentColor, 5);
        if (Math.random() > 0.8) playSound(pos.y);
      }
    };

    const handleUp = () => setIsDrawing(false);

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleUp);
    canvas.addEventListener('touchstart', handleDown, { passive: true });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchend', handleUp);

    const render = () => {
      // Premium fade effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      // If dark mode, use a dark fade, but we can't easily detect here without class.
      // We will clear rect completely for crisp particles.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(156, 163, 175, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('Tap, Hold, and Drag to Draw Magic', canvas.width / 2, canvas.height / 2);

      particles.forEach((p, idx) => {
        p.vy += 0.05; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.alpha = Math.max(0, p.life);

        if (p.alpha <= 0 || p.y > canvas.height) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleDown);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', handleUp);
        canvas.removeEventListener('mouseleave', handleUp);
        canvas.removeEventListener('touchstart', handleDown);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleUp);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentColor, isDrawing]);

  const palette = [
    { color: '#3b82f6', label: 'Sky' },
    { color: '#10b981', label: 'Flora' },
    { color: '#a855f7', label: 'Magic' },
    { color: '#f59e0b', label: 'Sun' },
    { color: '#f43f5e', label: 'Love' },
    { color: '#0ea5e9', label: 'Ocean' }
  ];

  return (
    <div ref={containerRef} className="flex flex-col bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl h-full justify-between overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full pointer-events-none translate-x-10 -translate-y-10 blur-2xl" />
      
      <div className="z-10 relative">
        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
          <Eye className="h-6 w-6 text-primary animate-pulse" /> Sensory Magic Canvas
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-sm">
          A premium, interactive particle playground. Choose a relaxing tone palette, then click and drag to draw magical, musical gravity bursts.
        </p>
      </div>

      <div className="border border-border/80 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-secondary/20 relative h-[350px] shadow-inner z-10">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair touch-none" />
      </div>

      <div className="flex flex-wrap gap-2 mt-6 justify-center z-10 relative">
        {palette.map((p, i) => (
          <button
            key={i}
            onClick={() => setCurrentColor(p.color)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all shadow-sm hover:scale-105 active:scale-95 ${currentColor === p.color ? 'border-foreground shadow-md ring-2 ring-foreground/20 ring-offset-2 ring-offset-background' : 'border-transparent hover:brightness-110'}`}
            style={{ backgroundColor: p.color, color: '#fff' }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. BALOON POPPING & PLAYFUL GAME ZONE
// ==========================================
function BalloonPopGame() {
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<{ id: number; x: number; size: number; colorObj: {color:string; name:string}; speed: number; y: number; mathEq: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetColor, setTargetColor] = useState<{color:string; name:string} | null>(null);
  const [floatingMath, setFloatingMath] = useState<{id:number, text:string, x:number, y:number}[]>([]);

  const colorsList = [
    {color: '#f43f5e', name: 'Red'}, 
    {color: '#3b82f6', name: 'Blue'}, 
    {color: '#10b981', name: 'Green'}, 
    {color: '#f59e0b', name: 'Orange'}, 
    {color: '#ec4899', name: 'Pink'}, 
    {color: '#8b5cf6', name: 'Purple'}
  ];

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setBalloons([]);
    setFloatingMath([]);
    setTargetColor(colorsList[Math.floor(Math.random() * colorsList.length)]);
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const spawner = setInterval(() => {
      const c = colorsList[Math.floor(Math.random() * colorsList.length)];
      const num1 = Math.floor(Math.random() * 5) + 1;
      const num2 = Math.floor(Math.random() * 5) + 1;
      setBalloons(prev => [
        ...prev,
        {
          id: Math.random(),
          x: 10 + Math.random() * 80,
          y: 110,
          size: 55 + Math.random() * 25,
          colorObj: c,
          speed: 1.0 + Math.random() * 1.2,
          mathEq: `${num1} + ${num2} = ${num1+num2}`
        }
      ]);
    }, 1500);

    const floater = setInterval(() => {
      setBalloons(prev =>
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20)
      );
    }, 30);

    return () => {
      clearInterval(spawner);
      clearInterval(floater);
    };
  }, [isPlaying]);

  const popBalloon = (b: any) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freqs: any = { 'Red': 400, 'Blue': 500, 'Green': 600, 'Orange': 700, 'Pink': 800, 'Purple': 900 };
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[b.colorObj.name] || 600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}

    const isCorrect = targetColor && b.colorObj.name === targetColor.name;
    if (isCorrect) {
      setScore(prev => prev + 10);
      setTargetColor(colorsList[Math.floor(Math.random() * colorsList.length)]);
    } else {
      setScore(prev => Math.max(0, prev - 2));
    }

    setFloatingMath(prev => [...prev, { id: Math.random(), text: b.mathEq, x: b.x, y: b.y }]);
    setTimeout(() => {
      setFloatingMath(prev => prev.slice(1));
    }, 1000);

    setBalloons(prev => prev.filter(bl => bl.id !== b.id));
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden h-[500px] justify-between">
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
            🎈 Smart Balloon Burst
          </h3>
          <p className="text-xs text-muted-foreground">Pop balloons, learn colors & numbers!</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-inner">
          <span className="text-sm font-bold text-primary">Score: {score}</span>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/20 dark:to-background border border-dashed border-border rounded-2xl relative overflow-hidden mt-4 min-h-[250px] shadow-inner">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 z-20 backdrop-blur-sm">
            <motion.span animate={{ y: [0,-10,0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl sm:text-5xl">🎈</motion.span>
            <h4 className="font-serif text-xl font-bold text-primary">Interactive Pop Math</h4>
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-6 max-w-sm">Enhances cognitive reflexes, color recognition, and basic arithmetic through multi-sensory feedback.</p>
            <Button onClick={startGame} className="rounded-full px-8 py-5 font-bold tracking-wider uppercase text-xs shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground">Start Learning Game</Button>
          </div>
        ) : (
          <>
            {targetColor && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-card border-2 shadow-lg px-4 py-2 rounded-full z-20 flex items-center gap-2" style={{ borderColor: targetColor.color }}>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pop the</span>
                <span className="text-sm font-black uppercase tracking-widest" style={{ color: targetColor.color }}>{targetColor.name}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Balloon!</span>
              </div>
            )}
            
            <div className="absolute inset-0 z-10">
              {balloons.map(b => (
                <motion.button
                  key={b.id}
                  onClick={() => popBalloon(b)}
                  onTouchStart={() => popBalloon(b)}
                  className="absolute rounded-full shadow-lg cursor-pointer flex items-center justify-center border border-white/30 touch-manipulation z-10 hover:brightness-110"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: b.size,
                    height: b.size * 1.25,
                    backgroundColor: b.colorObj.color,
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%'
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full absolute top-3 left-4" />
                  <div className="w-[1px] h-6 bg-foreground/30 absolute bottom-[-16px] left-[50%]" />
                  <span className="text-[11px] font-bold text-white drop-shadow-md pointer-events-none mt-2">{b.mathEq.split('=')[0]} = ?</span>
                </motion.button>
              ))}
              <AnimatePresence>
                {floatingMath.map(fm => (
                  <motion.div
                    key={fm.id}
                    initial={{ opacity: 1, y: fm.y, x: `${fm.x}%` }}
                    animate={{ opacity: 0, y: fm.y - 15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute z-20 font-black text-lg text-primary drop-shadow-xl pointer-events-none"
                    style={{ left: `${fm.x}%` }}
                  >
                    {fm.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {isPlaying && (
        <Button onClick={stopGame} variant="outline" className="rounded-full mt-4 self-center px-8 text-xs border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold uppercase tracking-wider">End Game</Button>
      )}
    </div>
  );
}

// ==========================================
// 5. MEMORY SOUNDS PAIRS GAME
// ==========================================
function MemorySoundGame() {
  const [cards, setCards] = useState<{ id: number; freq: number; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [turns, setTurns] = useState(0);

  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];

  const initGame = () => {
    const list = [...notes, ...notes]
      .map((freq, idx) => ({ id: idx, freq, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(list);
    setSelected([]);
    setTurns(0);
    setIsPlaying(true);
  };

  const playFreq = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  };

  const selectCard = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;

    playFreq(cards[idx].freq);

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setTurns(prev => prev + 1);
      const [first, second] = newSelected;
      if (cards[first].freq === cards[second].freq) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setSelected([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setSelected([]);
        }, 1000);
      }
    }
  };

  const won = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div className="flex flex-col bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden h-[450px] justify-between">
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
            🧩 Sound Memory Match
          </h3>
          <p className="text-xs text-muted-foreground">Match the hidden cards by their beautiful musical tones!</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-primary">Turns: {turns}</span>
        </div>
      </div>

      <div className="flex-1 border border-dashed border-border rounded-2xl bg-background/50 flex items-center justify-center p-4 mt-4 relative">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 rounded-2xl z-20">
            <span className="text-3xl sm:text-4xl animate-pulse">🎹</span>
            <h4 className="font-serif text-lg font-bold">Sound Matcher</h4>
            <p className="text-xs text-muted-foreground text-center px-8">Improves cognitive retention and pattern discrimination through warm tones.</p>
            <Button onClick={initGame} className="rounded-full px-6 bg-primary text-primary-foreground">Start Game</Button>
          </div>
        ) : won ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 rounded-2xl z-20">
            <span className="text-4xl animate-bounce">🏆</span>
            <h4 className="font-serif text-xl font-bold text-primary">Wonderful Job!</h4>
            <p className="text-xs text-muted-foreground">You matched all the notes in {turns} turns.</p>
            <Button onClick={initGame} className="rounded-full px-6 bg-primary text-primary-foreground">Play Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
            {cards.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => selectCard(i)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold shadow transition-all border-2 touch-manipulation ${c.matched ? 'bg-emerald-100 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600' : c.flipped ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:border-primary/50'}`}
                whileTap={{ scale: 0.93 }}
              >
                {c.matched ? '🎵' : c.flipped ? '🔊' : '?'}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {isPlaying && !won && (
        <Button onClick={initGame} variant="outline" className="rounded-full mt-4 self-center px-6 text-xs gap-1 border-primary text-primary"><RefreshCw className="h-3 w-3" /> Restart</Button>
      )}
    </div>
  );
}

// ==========================================
// 5. SPECIAL NEEDS COURSES INFINITE CAROUSEL
// ==========================================
interface Course {
  id: number;
  title: string;
  desc: string;
  image: string;
  price: string;
  unlocked: boolean;
}

const SpecialCoursesList: Course[] = [
  { id: 1, title: "Level 1: Social Communication Catalyst", desc: "For Level 1 autism. Focuses on social nuances, organization, conversation initiation, and flexible thinking in group environments.", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600", price: "$29.00", unlocked: true },
  { id: 2, title: "Level 2: Structured Visual Learning Journey", desc: "For Level 2 autism. Leverages robust visual schedules, TEACCH principles, and functional communication tools to enhance independence.", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600", price: "$49.00", unlocked: false },
  { id: 3, title: "Level 3: Core Sensory & Speech Development", desc: "For Level 3 autism. Intensive, compassionate 1-on-1 care targeting sensory integration, low-tech AAC supports, and core emotional regulation.", image: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?q=80&w=600", price: "$79.00", unlocked: false },
  { id: 4, title: "Parenting Autistic Children: A Practical Guide", desc: "Comprehensive caregiver training for positive behavioral support, burnout management, and creating customized sensory setups at home.", image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600", price: "$39.00", unlocked: false },
  { id: 5, title: "Music & Rhythm Sensory Therapy", desc: "Interactive rhythmic patterns designed to soothe auditory sensitivities and improve verbal pacing.", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600", price: "$34.00", unlocked: false },
  { id: 6, title: "Art Expression & Fine Motor Skills", desc: "Guided, low-pressure art classes that encourage non-verbal expression while building essential fine motor strength.", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=600", price: "$44.00", unlocked: false },
  { id: 7, title: "Emotional Regulation & Breathing", desc: "Deep breathing, mindfulness, and gentle stretching routines adapted for sensory-sensitive children.", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600", price: "$24.00", unlocked: false },
  { id: 8, title: "Life Skills: Transition & Independence", desc: "Practical workshops for teenagers focusing on personal hygiene, safe community navigation, and self-advocacy.", image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=600", price: "$89.00", unlocked: false }
];

function CourseCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showPaywall, setShowPaywall] = useState<Course | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SpecialCoursesList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % SpecialCoursesList.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + SpecialCoursesList.length) % SpecialCoursesList.length);
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const triggerEnroll = (course: Course) => {
    if (!course.unlocked) {
      setShowPaywall(course);
    } else {
      alert("Successfully enrolled in free preview preview class!");
    }
  };

  const curCourse = SpecialCoursesList[currentIndex];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden group/carousel">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full pointer-events-none translate-x-20 -translate-y-20 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full pointer-events-none -translate-x-20 translate-y-20 blur-2xl" />

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
        
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-border/50 group"
            >
              <div className="absolute inset-0 bg-black/10 z-0 group-hover:bg-black/0 transition-colors duration-500" />
              <img src={curCourse.image} alt={curCourse.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => toggleWishlist(curCourse.id)}
                  className="p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md hover:scale-110 active:scale-95 transition-all"
                >
                  <HeartIcon className={`h-5 w-5 transition-colors ${wishlist.includes(curCourse.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                </button>
              </div>
              
              {!curCourse.unlocked && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <Lock className="h-3 w-3" /> Premium
                </div>
              )}
              {curCourse.unlocked && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <Unlock className="h-3 w-3" /> Free Preview
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 items-center justify-center md:justify-start">
            <Button onClick={handlePrev} variant="outline" className="rounded-full h-12 w-12 p-0 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"><ArrowLeft className="h-5 w-5" /></Button>
            <div className="flex gap-2">
              {SpecialCoursesList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'}`}
                />
              ))}
            </div>
            <Button onClick={handleNext} variant="outline" className="rounded-full h-12 w-12 p-0 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"><ArrowRight className="h-5 w-5" /></Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">{curCourse.unlocked ? 'TRIAL' : 'CERTIFICATE'}</span>
                <span className="text-lg font-black text-foreground/80 bg-foreground/5 px-3 py-1 rounded-full">{curCourse.price}</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold leading-tight">{curCourse.title}</h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{curCourse.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-4 border-t border-border pt-6 mt-2">
            <Button
              onClick={() => triggerEnroll(curCourse)}
              className={`rounded-full px-8 py-6 uppercase tracking-widest text-xs font-black transition-all hover:scale-105 shadow-lg ${curCourse.unlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-primary text-primary-foreground shadow-primary/20'}`}
            >
              {curCourse.unlocked ? "Start Free Preview" : "Enroll Now"}
            </Button>
            <Button variant="outline" className="rounded-full border-2 border-foreground px-8 py-6 uppercase tracking-widest text-xs font-black hover:bg-foreground hover:text-background transition-colors">
              Course Details
            </Button>
          </div>
        </div>

      </div>

      <div className="mt-16 text-center pt-8">
        <Link href="/courses#special-needs">
          <a className="inline-flex items-center gap-2 group bg-card border-2 border-primary/20 hover:border-primary text-primary font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-all hover:shadow-lg hover:shadow-primary/10">
            Explore All Special Needs Courses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Link>
      </div>

      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold">Premium Course Locked</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The course <strong className="text-foreground">"{showPaywall.title}"</strong> is protected behind a premium security paywall. Register or log in to a parent/student account with premium billing options to unlock access.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <Button className="w-full py-5 rounded-none uppercase tracking-widest text-xs font-bold">Upgrade Account</Button>
                  <Button onClick={() => setShowPaywall(null)} variant="ghost" className="w-full text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest">Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 6. PARENT TESTIMONIALS SECTION
// ==========================================
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  flag: string;
}

const ParentTestimonialsList: Testimonial[] = [
  { quote: "Our son Aryan (Level 2) was practically non-verbal at 4. After a year of customized visual therapies and IEP milestones at AIM Centre, he now speaks in full sentences and loves sharing his feelings. Absolute miracle!", name: "Anika Chowdhury", role: "Mother of Aryan — Dhaka, Bangladesh", flag: "🇧🇩" },
  { quote: "Sensory processing overload made public parks a nightmare for Mia. The occupational therapists here taught her emotional regulation and built her confidence from scratch. Deepest thanks!", name: "Dr. Sarah Jenkins", role: "Mother of Mia — Sydney, Australia", flag: "🇦🇺" },
  { quote: "We were lost trying to understand our daughter's Level 3 autistic meltdowns. The family training workshops and customized IEP setups changed everything. We are now closer than ever.", name: "Tariqul Islam", role: "Father of Raisa — Sylhet, Bangladesh", flag: "🇧🇩" },
  { quote: "Autism Level 1 was tough due to school bullying. AIM Centre's social communication groups gave Leo the confidence and strategies he needed. He now has true friends and a bright smile.", name: "Marc Dupond", role: "Father of Leo — Paris, France", flag: "🇫🇷" }
];

function PremiumParentTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % ParentTestimonialsList.length);
    }, 6000);
    return () => clearInterval(loop);
  }, []);

  const cur = ParentTestimonialsList[activeIdx];

  return (
    <div className="bg-gradient-to-r from-primary to-primary/95 text-primary-foreground rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none translate-x-20 -translate-y-20 blur-xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-x-20 translate-y-20 blur-xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/75">Global Testimonials</span>
        <div className="text-4xl sm:text-5xl font-serif text-primary-foreground/30">“</div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-lg sm:text-xl md:text-2xl italic leading-relaxed font-light"
          >
            {cur.quote}
          </motion.p>
        </AnimatePresence>

        <div className="text-2xl sm:text-3xl font-serif text-primary-foreground/30">”</div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            <p className="font-bold text-base sm:text-lg">{cur.name} {cur.flag}</p>
            <p className="text-xs sm:text-sm text-primary-foreground/75">{cur.role}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 justify-center pt-6">
          {ParentTestimonialsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${activeIdx === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. INTERACTIVE AUTISM LEVELS SECTION
// ==========================================
function AutismLevelsTabs() {
  const [activeLevel, setActiveLevel] = useState(1);

  const levels = [
    {
      num: 1,
      title: "Autism Level 1: Requiring Support",
      symptoms: [
        "Difficulty initiating social interactions and conversation",
        "Atypical or unsuccessful responses to social overtures",
        "Difficulty with planning, organization, and transition between tasks",
        "Rigid behavior causing significant interference with daily functions"
      ],
      approach: "Focused social communication groups, cognitive organizational strategies, cognitive flexibility reinforcement, and low-intensity behavioral therapy.",
      color: "border-emerald-500",
      accent: "text-emerald-500",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      num: 2,
      title: "Autism Level 2: Requiring Substantial Support",
      symptoms: [
        "Marked deficits in verbal and nonverbal social communication skills",
        "Social impairments apparent even with support in place",
        "Inflexibility of behavior, difficulty coping with change",
        "Repetitive behaviors appear frequently and disrupt general routines"
      ],
      approach: "Structured teaching (TEACCH framework), speech-language therapy with visual supports, occupational therapy for sensory integration, and consistent daily schedules.",
      color: "border-amber-500",
      accent: "text-amber-500",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
    },
    {
      num: 3,
      title: "Autism Level 3: Requiring Very Substantial Support",
      symptoms: [
        "Severe deficits in verbal and nonverbal social communication skills",
        "Very limited initiation of social interactions, minimal response",
        "Great distress when changing focus or altering rigid routines",
        "Repetitive/restrictive behaviors interfere greatly with daily actions"
      ],
      approach: "Highly intensive 1-on-1 therapist attention, augmentative & alternative communication (AAC) devices, sensory regulation space integration, and basic daily living skill (ADL) development.",
      color: "border-rose-500",
      accent: "text-rose-500",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
    }
  ];

  const cur = levels.find(l => l.num === activeLevel)!;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative">
      <div className="flex flex-col gap-8">
        
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {levels.map((l) => (
            <button
              key={l.num}
              onClick={() => setActiveLevel(l.num)}
              className={`py-3 sm:py-4 px-2 sm:px-6 rounded-xl font-serif text-sm sm:text-lg font-bold border transition-all ${activeLevel === l.num ? `bg-primary text-primary-foreground ${l.color}` : 'bg-background hover:bg-muted border-border'}`}
            >
              Level {l.num}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className={`border-l-4 ${cur.color} pl-4 sm:pl-8 py-2 space-y-6`}
          >
            <div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${cur.badge}`}>{cur.title}</span>
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold mt-3 text-foreground">Common Indicators & Traits</h3>
            </div>

            <ul className="space-y-3">
              {cur.symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-muted-foreground">
                  <CheckCircle2 className={`h-5 w-5 ${cur.accent} mt-0.5 flex-shrink-0`} /> {s}
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-6 mt-6">
              <h4 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Brain className={`h-5 w-5 ${cur.accent}`} /> Recommended Therapeutic Approach
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">{cur.approach}</p>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

export default function SpecialNeeds() {
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const toggleSound = (soundType: 'ocean' | 'wind' | 'harp' | 'birds') => {
    const current = synth.getCurrentSound();
    if (current === soundType) {
      synth.stopAll();
      setActiveSound(null);
    } else {
      if (soundType === 'ocean') synth.playOcean();
      else if (soundType === 'wind') synth.playWind();
      else if (soundType === 'harp') synth.playHarp();
      else if (soundType === 'birds') synth.playBirds();
      setActiveSound(soundType);
    }
  };

  useEffect(() => {
    return () => {
      synth.stopAll();
    };
  }, []);

  return (
    <div className="w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary py-12 sm:py-16 md:py-24 relative overflow-hidden">
      
      {/* ambient lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 dark:opacity-5 blur-3xl"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `${10 + i * 15}%`,
              top: `${10 + (i % 2) * 40}%`,
              background: `radial-gradient(circle, hsl(${200 + i * 30}, 80%, 75%) 0%, transparent 70%)`
            }}
          />
        ))}
      </div>

      <div className="container relative z-10">
        
        {/* === PREMIUM CINEMATIC HERO INTRO === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 sm:mb-28 relative">
          
          {/* Subtle Premium Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div animate={{ y: [-20, 20, -20], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <motion.div animate={{ x: [-30, 30, -30], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-[40%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>

          <motion.div {...fadeUp} className="space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-4"
            >
              <div className="h-[1px] w-8 bg-primary"></div>
              <span className="text-primary font-bold tracking-[0.4em] uppercase text-xs">
                Sensory Learning Academy
              </span>
            </motion.div>
            
            <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Every Child Has a <br />
              <span className="relative inline-block mt-3">
                <span className="relative z-10 italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary">
                  Beautiful Mind
                </span>
                <motion.div 
                  initial={{ scaleX: 0 }} 
                  animate={{ scaleX: 1 }} 
                  transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }} 
                  className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-transparent origin-left z-0" 
                />
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-light">
              Welcome to AIM Centre's specialized sensory harbor. Through clinical sound therapy, elegant interactive interfaces, and customized Autism Level 1-3 programs, we help neurodiverse children express their highest potential in a secure, sophisticated environment.
            </p>
            
            <div className="flex flex-wrap gap-5 pt-4">
              <Button size="lg" className="rounded-none px-10 py-7 text-xs uppercase tracking-[0.2em] font-bold group transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] bg-primary text-primary-foreground relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Begin Journey <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-none border-[1px] border-border hover:border-primary px-10 py-7 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-500 hover:bg-primary/5 text-foreground">
                <Shield className="mr-3 h-4 w-4 text-primary" /> Parent Portal
              </Button>
            </div>
          </motion.div>

          <motion.div 
            {...fadeUp} 
            transition={{ delay: 0.3, duration: 1 }} 
            className="relative z-10 perspective-1000"
            whileHover={{ scale: 1.01, rotateY: -2, rotateX: 2 }}
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-2xl rounded-br-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
              <img
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1200"
                alt="Child engaging in specialized sensory learning"
                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
              
              {/* Elegant floating light specks instead of emojis */}
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }} 
                  transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }} 
                  className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_2px_rgba(var(--primary),0.8)]"
                  style={{ left: `${20 + i * 15}%`, bottom: `${10 + (i % 3) * 10}%` }}
                />
              ))}
            </div>
            
            {/* Premium Clinical Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-6 -left-6 sm:-left-12 bg-card/80 backdrop-blur-xl p-5 sm:p-6 rounded-none border border-border/50 shadow-2xl flex items-center gap-5 cursor-pointer group"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
                <Heart className="h-5 w-5 text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-foreground tracking-wide">IEP Certified</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Specialized Care</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* === SENSORY ZONE === */}
        <div className="mb-20 sm:mb-28">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Sensory Zone</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Sensory Therapy Playground</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Explore beautifully crafted, high-end sensory interactive exercises built to help autistic children with calming down, regulation, and spatial focus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div {...fadeUp} className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl h-full flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2 text-foreground">
                  <Ear className="h-5 w-5 text-primary animate-pulse" /> Auditory Soundscape Synth
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                  A beautiful, premium ambient sound machine. Triggering a new soundscape stops the previous immediately for seamless auditory therapy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6">
                {[
                  { type: 'ocean', label: 'Ocean Waves', icon: Waves },
                  { type: 'wind', label: 'Forest Wind', icon: TreePine },
                  { type: 'harp', label: 'Zen Harp', icon: Music },
                  { type: 'birds', label: 'Chirping Birds', icon: Bird }
                ].map((s, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSound(s.type as any)}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 touch-manipulation min-h-[100px] ${activeSound === s.type ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                  >
                    <s.icon className={`h-7 w-7 ${activeSound === s.type ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-bold">{s.label}</span>
                    {activeSound === s.type && <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider">Active</span>}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Pure organic synthesizer waveforms</p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <InteractiveShatterZone />
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
              <BreathingZone />
            </motion.div>
          </div>
        </div>

        {/* === GAMES ZONE === */}
        <div className="mb-20 sm:mb-28">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs font-sans">Educational Play</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Sensory-Friendly Interactive Games</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Colorful, warm, and zero-stress games designed with instant positive feedback to support fine motor skills and pattern recognition.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div {...fadeUp}>
              <BalloonPopGame />
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <MemorySoundGame />
            </motion.div>
          </div>
        </div>

        {/* === AUTISM LEVELS === */}
        <div className="mb-20 sm:mb-28">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Spectrum Insights</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Autism Spectrum Levels</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Autism is a broad, colorful spectrum. We target specialized strategies mapped carefully to Levels 1, 2, and 3.
            </p>
          </motion.div>
          <AutismLevelsTabs />
        </div>

        {/* === SPECIAL COURSES CAROUSEL === */}
        <div className="mb-20 sm:mb-28">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Curated Academy</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Special Needs Courses</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Explore specialized, certified courses mapped to Autism levels, including positive parenting, sensory education, and speech development.
            </p>
          </motion.div>
          <CourseCarousel />
        </div>

        {/* === HAPPY GALLERY === */}
        <div className="mb-20 sm:mb-28">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Our Gallery</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2">Happily Learning With Us</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Take a peek inside AIM Centre's classrooms, playgrounds, and visual therapy rooms in Bangladesh and abroad.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Art Class in Dhaka", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=600" },
              { title: "Sensory Playground Sydney", img: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600" },
              { title: "Parent Workshop Paris", img: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=600" },
              { title: "Speech Therapy Class", img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600" }
            ].map((g, idx) => (
              <motion.div key={idx} {...fadeUp} transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover-lift">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-4 border-t border-border bg-card">
                  <h4 className="font-serif font-bold text-sm text-foreground">{g.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* === TESTIMONIALS === */}
        <motion.div {...fadeUp} className="mb-8">
          <PremiumParentTestimonials />
        </motion.div>

      </div>
    </div>
  );
}
