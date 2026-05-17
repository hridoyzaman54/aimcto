import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    id: 1,
    name: "Tahmina Akhter",
    role: "Parent",
    image: "/images/tahmina-akhter.jpg",
    content: "The progress my son has made in the Special Needs program is miraculous. The teachers are so caring and the sensory learning approach has truly unlocked his potential.",
    rating: 5
  },
  {
    id: 2,
    name: "Rafiqul Islam",
    role: "Spoken English Student",
    image: "/images/rafiqul-islam.jpg",
    content: "I was hesitant at first, but the Spoken English course helped me gain the confidence I needed. I recently secured my dream job thanks to the communication skills I learned here.",
    rating: 5
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Parent (International)",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop",
    content: "We joined the Tiny Explorers program from the UK, and even remotely, the connection is amazing. The interactive sessions keep my daughter engaged and excited to learn every day.",
    rating: 5
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    role: "Mental Health Client",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
    content: "The mental health support at AIM Centre is a safe haven. I feel heard, understood, and guided. It's rare to find such a compassionate and professional team.",
    rating: 5
  },
  {
    id: 5,
    name: "Michael Chen",
    role: "Parent (International)",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    content: "AIMVerse is such a unique concept! My kids are learning complex topics while having fun in a virtual environment. It's the future of education, and we're glad to be part of it.",
    rating: 4
  },
  {
    id: 6,
    name: "Abrar Ahmed",
    role: "Student",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    content: "The instructors are world-class. I've taken multiple courses here, and the quality of content and delivery is consistently excellent. Highly recommended for anyone looking to upskill.",
    rating: 5
  }
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl font-serif font-bold text-primary">"</div>
        <div className="absolute bottom-10 right-10 text-9xl font-serif font-bold text-primary rotate-180">"</div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">{t("testimonials.title")}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-6">{t("testimonials.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative min-h-[400px] flex items-center">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex hover:bg-transparent hover:text-primary"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex hover:bg-transparent hover:text-primary"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="w-full overflow-hidden px-4 md:px-16">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
              >
                {/* Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-background shadow-xl">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                    <Quote className="h-6 w-6 fill-current" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonials[currentIndex].rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl font-serif leading-relaxed mb-6 italic text-foreground/90">
                    "{testimonials[currentIndex].content}"
                  </blockquote>

                  <div>
                    <h4 className="text-lg font-bold">{testimonials[currentIndex].name}</h4>
                    <p className="text-primary font-medium text-sm uppercase tracking-wide">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
                }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
