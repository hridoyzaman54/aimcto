import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Sparkles, Star, Eye, Ear, Hand, Volume2, VolumeX, Music, Waves, TreePine, Bird, Sun, Moon as MoonIcon, ArrowRight, Play, Pause, CheckCircle2, BookOpen, Users, Shield, Lightbulb, Target, ChevronDown, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

// Breathing circle component
function BreathingCircle() {
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'>('inhale');
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    const cycle = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'), 4000);
      setTimeout(() => setPhase('exhale'), 7000);
    };
    cycle();
    const id = setInterval(cycle, 11000);
    return () => clearInterval(id);
  }, [active]);
  const label = phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out';
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={active ? {
          scale: phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 1,
          backgroundColor: phase === 'inhale' ? 'hsl(200,80%,70%)' : phase === 'hold' ? 'hsl(260,60%,70%)' : 'hsl(150,60%,65%)',
        } : { scale: 1 }}
        transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 3 : 4, ease: "easeInOut" }}
        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer border-2 border-primary/30 shadow-lg"
        onClick={() => setActive(!active)}
      >
        <span className="text-sm sm:text-base font-medium text-foreground">{active ? label : 'Tap to Start'}</span>
      </motion.div>
      <p className="text-xs text-muted-foreground">Calming breathing exercise</p>
    </div>
  );
}

// Sound button component
function SoundButton({ icon: Icon, label, freq, type }: { icon: any; label: string; freq: number; type: OscillatorType }) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const toggle = useCallback(() => {
    if (playing) {
      gainRef.current?.gain.exponentialRampToValueAtTime(0.001, ctxRef.current!.currentTime + 0.5);
      setTimeout(() => { oscRef.current?.stop(); setPlaying(false); }, 500);
      return;
    }
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
    setPlaying(true);
  }, [playing, freq, type]);

  return (
    <motion.button whileTap={{ scale: 0.93 }} onClick={toggle}
      className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 touch-manipulation ${playing ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border bg-card hover:border-primary/50'}`}>
      <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${playing ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
      <span className="text-xs sm:text-sm font-medium">{label}</span>
      {playing && <span className="text-[10px] text-primary">Playing</span>}
    </motion.button>
  );
}

// Color pad
function ColorPad({ color, label }: { color: string; label: string }) {
  const [tapped, setTapped] = useState(false);
  return (
    <motion.div whileTap={{ scale: 0.9 }} onTapStart={() => setTapped(true)} onTap={() => setTimeout(() => setTapped(false), 600)}
      className="relative rounded-2xl h-24 sm:h-32 cursor-pointer touch-manipulation overflow-hidden shadow-md" style={{ backgroundColor: color }}>
      {tapped && <motion.div initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.6 }}
        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/40" />}
      <span className="absolute bottom-2 left-3 text-xs font-medium text-white/90 drop-shadow">{label}</span>
    </motion.div>
  );
}

// FAQ item
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="border-b border-border" initial={false}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left touch-manipulation">
        <span className="font-serif text-base sm:text-lg font-semibold pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" /></motion.div>
      </button>
      <AnimatePresence>{open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
          <p className="pb-5 text-sm sm:text-base text-muted-foreground leading-relaxed">{a}</p>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

export default function SpecialNeedsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollProgress />
      <Header />
      <main className="w-full">

        {/* === HERO === */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 dark:from-background dark:via-card dark:to-background">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                className="absolute rounded-full opacity-20 dark:opacity-10"
                style={{ width: 60 + i * 40, height: 60 + i * 40, left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
                  background: `hsl(${200 + i * 30}, 70%, 70%)` }} />
            ))}
          </div>
          <div className="container relative z-10 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs sm:text-sm">Inclusive Education</span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mt-4 mb-6 leading-[0.95]">
                  Every Child<br /><span className="italic text-primary">Deserves</span> to<br />Shine ✨
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                  Our specialized programs for children with Autism (Level 1, 2 & 3) provide nurturing, sensory-friendly environments where every child can learn, grow, and thrive at their own pace.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest">
                    Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-none border-foreground px-8 py-6 text-sm uppercase tracking-widest">
                    Book a Visit
                  </Button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border/20">
                  <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop" alt="Child learning with joy" className="w-full h-full object-cover" loading="eager" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center"><Heart className="h-5 w-5 text-primary" /></div>
                    <div><p className="font-bold text-sm">500+ Children</p><p className="text-[10px] text-muted-foreground">Supported & Thriving</p></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* === UNDERSTANDING AUTISM === */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Understanding</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">The Autism Spectrum</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Every child on the spectrum is unique. We tailor our approach to meet each child exactly where they are.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { level: "Level 1", title: "Requiring Support", color: "from-emerald-400 to-teal-500", desc: "Children who need some support with social communication and may have difficulty initiating interactions. Focus on social skills, flexibility, and organization.", icon: Star },
                { level: "Level 2", title: "Requiring Substantial Support", color: "from-amber-400 to-orange-500", desc: "Children with marked difficulties in verbal and nonverbal social communication. We provide structured environments with visual schedules and clear routines.", icon: Heart },
                { level: "Level 3", title: "Requiring Very Substantial Support", color: "from-rose-400 to-pink-500", desc: "Children with severe challenges in communication and very limited social interaction. Our intensive 1-on-1 programs focus on building core communication skills.", icon: Shield },
              ].map((item, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="group relative bg-card border border-border p-6 sm:p-8 hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{item.level}</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === SENSORY EXPERIENCE ZONE === */}
        <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Interactive</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">Sensory Experience Zone</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Explore calming sounds, colors, and breathing exercises designed for sensory regulation and emotional well-being.</p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sound Buttons */}
              <motion.div {...fadeUp} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Ear className="h-6 w-6 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Auditory Feedback</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SoundButton icon={Waves} label="Ocean" freq={110} type="sine" />
                  <SoundButton icon={TreePine} label="Forest" freq={180} type="triangle" />
                  <SoundButton icon={Bird} label="Birds" freq={520} type="sine" />
                  <SoundButton icon={Music} label="Melody" freq={330} type="triangle" />
                </div>
              </motion.div>
              {/* Color Therapy */}
              <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-6 w-6 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Visual Therapy</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPad color="#5B9BD5" label="Calm Blue" />
                  <ColorPad color="#7BC67E" label="Gentle Green" />
                  <ColorPad color="#C9A0DC" label="Soft Lavender" />
                  <ColorPad color="#FFD699" label="Warm Peach" />
                </div>
              </motion.div>
              {/* Breathing Exercise */}
              <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <Hand className="h-6 w-6 text-primary" />
                  <h3 className="font-serif text-xl font-bold">Breathing Exercise</h3>
                </div>
                <BreathingCircle />
              </motion.div>
            </div>
          </div>
        </section>

        {/* === OUR APPROACH === */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              <motion.div {...fadeUp}>
                <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Methodology</span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6">Our <span className="italic text-primary">Approach</span></h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">We combine evidence-based methodologies with heartfelt care, creating a learning experience that honors each child's unique strengths.</p>
                <div className="space-y-6">
                  {[
                    { icon: Target, title: "Applied Behavior Analysis (ABA)", desc: "Structured positive reinforcement techniques to develop social, communication, and learning skills." },
                    { icon: BookOpen, title: "TEACCH Methodology", desc: "Structured teaching using visual supports, organized physical environments, and predictable sequences." },
                    { icon: Lightbulb, title: "Individualized Education Plans", desc: "Custom IEPs that evolve with your child's milestones, reviewed and updated every quarter." },
                    { icon: Users, title: "Family-Centered Practice", desc: "Parents are partners in the journey — we provide training, resources, and ongoing support." },
                  ].map((item, i) => (
                    <motion.div key={i} whileTap={{ scale: 0.98 }} className="flex gap-4 p-4 border border-border hover:border-primary/50 bg-card transition-all duration-300 group cursor-pointer touch-manipulation">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit"><item.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" /></div>
                      <div><h4 className="font-bold mb-1">{item.title}</h4><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border border-border/20">
                  <img src="https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?q=80&w=1200&auto=format&fit=crop" alt="Therapy session" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2 border-primary/30" />
                <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2 border-primary/30" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* === PROGRAMS === */}
        <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">What We Offer</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">Specialized Programs</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Brain, title: "Sensory Integration", desc: "Tactile, visual, and auditory stimulation in controlled, calming environments." },
                { icon: Heart, title: "Emotional Growth", desc: "Social stories, role-play, and guided interactions to build confidence and resilience." },
                { icon: Sparkles, title: "Creative Expression", desc: "Art therapy, music therapy, pottery, and movement — creativity as communication." },
                { icon: Star, title: "Life Skills Training", desc: "Practical daily living skills, communication tools, and independence building." },
              ].map((item, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                  className="bg-card border border-border p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group">
                  <item.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === SUCCESS STORIES === */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12">
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Testimonials</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">Stories of <span className="italic text-primary">Hope</span></h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { name: "Fatima R.", role: "Mother of Aryan, Level 2", text: "Within 6 months, Aryan started making eye contact and using simple words. The transformation has been beyond anything we imagined. The team truly cares." },
                { name: "Kamal H.", role: "Father of Nadia, Level 1", text: "Nadia's social skills have blossomed. She now plays with other children and even initiated a conversation with a stranger at the park. We are so grateful." },
                { name: "Ruksana B.", role: "Mother of Imran, Level 3", text: "The 1-on-1 attention Imran receives is exceptional. He can now follow simple instructions and his sensory meltdowns have reduced dramatically." },
              ].map((t, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }} className="bg-card border border-border p-6 sm:p-8 relative">
                  <div className="text-4xl text-primary/20 font-serif absolute top-4 left-6">"</div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed pt-6">{t.text}</p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">{t.name[0]}</div>
                    <div><p className="font-bold text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === FAQ === */}
        <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30">
          <div className="container max-w-3xl">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
            </motion.div>
            <motion.div {...fadeUp}>
              <FAQItem q="What age group do you support?" a="We support children from ages 2 to 18 across all autism spectrum levels. Our programs are designed with age-appropriate activities and goals tailored to each developmental stage." />
              <FAQItem q="How are Individualized Education Plans (IEPs) created?" a="Our multidisciplinary team conducts thorough assessments including behavioral observation, parent interviews, and standardized testing. IEPs are reviewed quarterly and adjusted based on progress." />
              <FAQItem q="Can parents participate in therapy sessions?" a="Absolutely! We encourage parent involvement. We offer parent training workshops, observation sessions, and regular progress meetings to ensure consistency between home and centre." />
              <FAQItem q="What qualifications do your therapists have?" a="Our team includes certified ABA therapists, speech-language pathologists, occupational therapists, and special education teachers — all with specialized training in autism spectrum disorders." />
              <FAQItem q="Do you offer assessments for children not yet diagnosed?" a="Yes, we provide developmental screenings and can refer families to clinical psychologists for formal diagnostic assessments. Early identification leads to better outcomes." />
            </motion.div>
          </div>
        </section>

        {/* === CTA === */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container">
            <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Begin Your Child's <span className="italic text-primary">Journey</span></h2>
              <p className="text-muted-foreground mb-8">Every step forward is a victory. Let us walk alongside your family with compassion, expertise, and unwavering support.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="rounded-none px-10 py-6 uppercase tracking-widest text-sm">Enroll Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline" size="lg" className="rounded-none border-foreground px-10 py-6 uppercase tracking-widest text-sm">
                  <Phone className="mr-2 h-4 w-4" /> Contact Us
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
