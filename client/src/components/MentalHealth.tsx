import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain, Users, User, Shield, Flower2, Wind, Sun, BookOpen, Phone, Mail, Clock, CheckCircle2, ArrowRight, ChevronDown, Calendar, Sparkles, Leaf, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState, useEffect, useRef } from "react";

// Animated counter
function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration * 60);
    const id = setInterval(() => { start += step; if (start >= end) { setCount(end); clearInterval(id); } else setCount(Math.floor(start)); }, 1000 / 60);
    return () => clearInterval(id);
  }, [started, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// Mood check component
function MoodCheck() {
  const [selected, setSelected] = useState<number | null>(null);
  const moods = [
    { emoji: "😊", label: "Great", color: "#4CAF50", msg: "Wonderful! Keep nurturing that positive energy. Remember, you deserve to feel this good!" },
    { emoji: "🙂", label: "Good", color: "#8BC34A", msg: "That's nice to hear! Small moments of joy add up. Keep going!" },
    { emoji: "😐", label: "Okay", color: "#FFC107", msg: "It's okay to feel neutral. Take a moment to do something you enjoy today." },
    { emoji: "😔", label: "Low", color: "#FF9800", msg: "We see you. It's brave to acknowledge how you feel. Consider talking to someone you trust." },
    { emoji: "😢", label: "Struggling", color: "#f44336", msg: "You're not alone. Please reach out — our counselors are here for you. You matter." },
  ];
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3 sm:gap-4">
        {moods.map((m, i) => (
          <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => setSelected(i)}
            className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl transition-all touch-manipulation ${selected === i ? 'bg-primary/10 ring-2 ring-primary shadow-lg' : 'hover:bg-muted'}`}>
            <span className="text-2xl sm:text-3xl">{m.emoji}</span>
            <span className="text-[10px] sm:text-xs font-medium">{m.label}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selected !== null && (
          <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-center p-4 rounded-xl border border-border bg-card">
            <p className="text-sm sm:text-base text-muted-foreground">{moods[selected].msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// FAQ
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="border-b border-border">
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

export default function MentalHealth() {
  return (
    <div className="w-full bg-background text-foreground">
      
      {/* === HERO === */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 dark:from-background dark:via-card dark:to-background border-b border-border/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut", delay: i }}
              className="absolute opacity-10 dark:opacity-5"
              style={{ left: `${15 + i * 18}%`, top: `${25 + (i % 3) * 20}%` }}>
              <Leaf className="text-emerald-500" style={{ width: 40 + i * 20, height: 40 + i * 20 }} />
            </motion.div>
          ))}
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs sm:text-sm">Wellness & Support</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 leading-[1.05]">
                Your Mind<br /><span className="italic text-primary">Matters</span><br />Here 🌿
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Professional mental health counseling for students and parents. Because well-being is the foundation of learning, growth, and a fulfilling life.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest">
                  Book a Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-none border-foreground px-8 py-6 text-sm uppercase tracking-widest">
                  Learn More
                </Button>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border/20">
                <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1200&auto=format&fit=crop" alt="Peaceful therapy space" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 bg-card p-4 rounded-xl shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center"><Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                  <div><p className="font-bold text-sm">100% Confidential</p><p className="text-[10px] text-muted-foreground">Safe & Judgment-Free</p></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === WHY MENTAL HEALTH === */}
      <section className="py-16 sm:py-24 bg-background border-b border-border/20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Why It Matters</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">The Numbers Speak</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: 1, suffix: " in 7", label: "Children globally face a mental health condition" },
              { num: 75, suffix: "%", label: "Of mental health issues begin before age 18" },
              { num: 50, suffix: "%", label: "Improvement with early counseling intervention" },
              { num: 300, suffix: "+", label: "Families supported by AIM Centre 360" },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center p-6 bg-card border border-border hover:shadow-md transition-shadow">
                <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2"><Counter end={s.num} suffix={s.suffix} /></p>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === SERVICES === */}
      <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30 border-b border-border/20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Services</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">How We <span className="italic text-primary">Help</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, title: "Student Counseling", items: ["Exam stress & anxiety management", "Peer pressure & bullying support", "Self-esteem & confidence building", "ADHD & focus strategies", "Grief & loss processing"] },
              { icon: User, title: "Parent Counseling", items: ["Positive parenting techniques", "Managing expectations", "Supporting special needs children", "Family communication strategies", "Caregiver burnout prevention"] },
              { icon: Heart, title: "Family Therapy", items: ["Conflict resolution sessions", "Building stronger bonds", "Blended family adjustment", "Sibling relationship support", "Shared coping strategies"] },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }}
                className="bg-card border border-border p-6 sm:p-8 hover:shadow-xl transition-all duration-500 group">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-4">{s.title}</h3>
                <ul className="space-y-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === MOOD CHECK === */}
      <section className="py-16 sm:py-24 bg-background border-b border-border/20">
        <div className="container max-w-2xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Self-Care</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3 mb-4">How Are You Feeling Today?</h2>
            <p className="text-muted-foreground">Take a moment to check in with yourself. There are no wrong answers.</p>
          </motion.div>
          <motion.div {...fadeUp}><MoodCheck /></motion.div>
        </div>
      </section>

      {/* === MEET THE TEAM === */}
      <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30 border-b border-border/20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Our Team</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">Certified <span className="italic text-primary">Professionals</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { name: "Dr. Nusrat Jahan", title: "Clinical Psychologist", exp: "12+ years", spec: "Child & Adolescent Psychology, CBT" },
              { name: "Farzana Ahmed", title: "Counseling Psychologist", exp: "8+ years", spec: "Family Therapy, Trauma Recovery" },
              { name: "Md. Rafiq Islam", title: "Behavioral Therapist", exp: "10+ years", spec: "ABA Therapy, Autism Spectrum Disorders" },
            ].map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }}
                className="bg-card border border-border p-6 sm:p-8 text-center group hover:shadow-lg transition-all">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl font-bold text-primary">{p.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold">{p.name}</h3>
                <p className="text-sm text-primary font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.exp} experience</p>
                <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-3">{p.spec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === BOOKING FORM === */}
      <section className="py-16 sm:py-24 bg-background border-b border-border/20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            <motion.div {...fadeUp}>
              <span className="text-primary font-medium tracking-[0.3em] uppercase text-xs">Get Started</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6">Schedule an <span className="italic text-primary">Appointment</span></h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">Taking the first step is the hardest part — and you've already done it by being here. Fill out the form and our team will reach out within 24 hours.</p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "100% confidential — your privacy is our priority" },
                  { icon: Clock, text: "Flexible scheduling — mornings, evenings, and weekends" },
                  { icon: Heart, text: "No judgment — just compassionate, professional support" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3"><item.icon className="h-5 w-5 text-primary flex-shrink-0" /><p className="text-sm text-muted-foreground">{item.text}</p></div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-card border border-border p-6 sm:p-8 shadow-lg relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <form className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup defaultValue="student" className="flex gap-6">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="student" id="mh-student" /><Label htmlFor="mh-student">Student</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="parent" id="mh-parent" /><Label htmlFor="mh-parent">Parent</Label></div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="Your name" className="h-11" /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input type="tel" placeholder="+880..." className="h-11" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="your@email.com" className="h-11" /></div>
                  <div className="space-y-1.5"><Label>Preferred Date</Label><Input type="date" className="h-11" /></div>
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred Time</Label>
                  <Select><SelectTrigger className="h-11"><SelectValue placeholder="Select time slot" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                      <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Reason for Visit</Label><Textarea placeholder="Briefly describe your concerns..." className="min-h-[100px]" /></div>
                <Button className="w-full py-6 text-base">Book Appointment</Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="py-16 sm:py-24 bg-[#EFEDE8] dark:bg-card/30 border-b border-border/20">
        <div className="container max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">Common Questions</h2>
          </motion.div>
          <motion.div {...fadeUp}>
            <FAQItem q="Is counseling really confidential?" a="Absolutely. All sessions are strictly confidential. Information is only shared with your explicit consent, except in cases where there is immediate risk of harm — in which case we follow ethical safety protocols." />
            <FAQItem q="How long is each counseling session?" a="Sessions typically last 45-60 minutes. The first session may be slightly longer as we take time to understand your situation thoroughly." />
            <FAQItem q="Do you offer online/virtual counseling?" a="Yes! We offer both in-person and virtual counseling sessions via secure video platforms, making mental health support accessible from anywhere." />
            <FAQItem q="How many sessions will I need?" a="This varies for everyone. Some concerns can be addressed in 4-6 sessions, while others may benefit from ongoing support. Your counselor will discuss a recommended plan after the initial assessment." />
          </motion.div>
        </div>
      </section>

      {/* === EMERGENCY BANNER === */}
      <section className="py-10 bg-red-50 dark:bg-red-950/20 border-y border-red-200 dark:border-red-900/30">
        <div className="container text-center">
          <motion.div {...fadeUp}>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400 mb-3">Need Immediate Help?</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">If you or someone you know is in crisis, please reach out immediately.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="border-red-400 text-red-600 hover:bg-red-100 dark:hover:bg-red-950"><Phone className="mr-2 h-4 w-4" />National Helpline: 16789</Button>
              <Button variant="outline" className="border-red-400 text-red-600 hover:bg-red-100 dark:hover:bg-red-950"><Mail className="mr-2 h-4 w-4" />crisis@aimcentre360.com</Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
