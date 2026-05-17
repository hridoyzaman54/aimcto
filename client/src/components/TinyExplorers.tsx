import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Palette, Rocket, Brain, Music, Heart, Star, Sparkles, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  icon: any;
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
};

const ICONS = [
  { icon: Rocket, color: "text-red-500" },
  { icon: Brain, color: "text-blue-500" },
  { icon: Music, color: "text-purple-500" },
  { icon: Heart, color: "text-pink-500" },
  { icon: Star, color: "text-yellow-500" },
  { icon: Palette, color: "text-green-500" },
];

export default function TinyExplorers() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const duplicatedIcons = [...ICONS, ...ICONS];

    // Fisher-Yates Shuffle for true randomness
    for (let i = duplicatedIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicatedIcons[i], duplicatedIcons[j]] = [duplicatedIcons[j], duplicatedIcons[i]];
    }

    const shuffled = duplicatedIcons.map((item, index) => ({
      id: index,
      icon: item.icon,
      color: item.color,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsLocked(false);
  };

  const handleCardClick = (id: number) => {
    if (isLocked || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);
      checkForMatch(newFlipped);
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"); // Pleasant chime sound
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const checkForMatch = (currentFlipped: number[]) => {
    const [first, second] = currentFlipped;
    if (cards[first].icon === cards[second].icon) {
      playSuccessSound();
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);

        if (newCards.every(card => card.isMatched)) {
          setIsWon(true);
        }
      }, 500);
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);
      }, 1000);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }}
      ></div>

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">Preschool & Kindergarten</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-bold mt-2 mb-4 sm:mb-6">
              Tiny Explorers
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              A magical journey of discovery where every play session is a lesson in disguise.
              Interactive workshops and games designed to spark curiosity in our youngest learners.
            </p>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-24 md:mb-32">
          {[
            {
              icon: Rocket,
              title: "Fun Workshops",
              desc: "Interactive sessions where learning meets play through hands-on activities.",
              image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2072&auto=format&fit=crop"
            },
            {
              icon: Gamepad2,
              title: "Play-Based Learning",
              desc: "Gamified experiences that make complex concepts easy to grasp for little minds.",
              image: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=2083&auto=format&fit=crop"
            },
            {
              icon: Palette,
              title: "Creative Arts",
              desc: "Expressive arts and crafts to develop fine motor skills and imagination.",
              image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative h-[280px] sm:h-[350px] md:h-[400px] overflow-hidden border border-border hover-lift cursor-pointer rounded-2xl touch-manipulation"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500">
                <div className="mb-4 p-3 bg-white/10 backdrop-blur-md w-fit rounded-full">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm mb-4 sm:mb-6 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 delay-100">
                  {item.desc}
                </p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 delay-200 touch-manipulation active:scale-95 text-xs sm:text-sm">
                  Explore More
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Improved Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center mb-16 sm:mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold">Nurturing Little Minds</h3>
            <div className="space-y-6">
              {[
                { title: "Social Interaction", desc: "Building confidence through collaborative play and group activities." },
                { title: "Cognitive Growth", desc: "Developing problem-solving skills with age-appropriate puzzles." },
                { title: "Motor Skills", desc: "Fine and gross motor development through active movement and crafts." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors duration-300">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="/images/tiny-explorers/tiny_explorers_premium.png"
              alt="child discovering magical learning"
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>

        {/* Game Section */}
        <div className="max-w-4xl mx-auto bg-card border rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Gamepad2 className="w-32 h-32 rotate-12" />
          </div>

          <div className="text-center mb-10 relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <Sparkles className="text-yellow-500" />
              Memory Match Challenge
              <Sparkles className="text-yellow-500" />
            </h3>
            <p className="text-muted-foreground">Match the pairs to win! A fun way to boost memory skills.</p>
            <div className="mt-4 inline-flex items-center gap-4 bg-secondary/50 px-6 py-2 rounded-full">
              <span className="font-medium">Moves: {moves}</span>
              <div className="h-4 w-[1px] bg-foreground/20"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewGame}
                className="hover:bg-background/80"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 relative z-10">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={cn(
                  "aspect-square relative cursor-pointer perspective-1000"
                )}
                onClick={() => handleCardClick(card.id)}
                whileHover={!card.isMatched && !card.isFlipped ? { scale: 1.05 } : {}}
                whileTap={!card.isMatched && !card.isFlipped ? { scale: 0.95 } : {}}
              >
                <AnimatePresence mode="wait">
                  {card.isMatched ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="flex flex-col items-center">
                        <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 fill-yellow-500 animate-pulse" />
                        <span className="text-xs md:text-sm font-bold text-yellow-500 mt-1">Yay!</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-full h-full relative"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Card Front (Hidden) */}
                      <div
                        className="absolute inset-0 bg-primary/10 border-2 border-primary/20 rounded-xl flex items-center justify-center p-4"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <span className="text-4xl text-primary font-bold">?</span>
                      </div>

                      {/* Card Back (Revealed) */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-xl flex items-center justify-center bg-white dark:bg-card shadow-lg border-2",
                          "border-primary"
                        )}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)"
                        }}
                      >
                        <card.icon className={cn("w-8 h-8 md:w-12 md:h-12", card.color)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <div className="bg-background p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border-2 border-primary/20">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-pulse" />
                  </div>
                  <h4 className="text-3xl font-bold mb-2">Great Job!</h4>
                  <p className="text-muted-foreground mb-8">You found all pairs in {moves} moves!</p>
                  <Button onClick={startNewGame} size="lg" className="w-full font-bold">
                    Play Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
