import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";

const galleryItems = [
  {
    id: 1,
    title: "Abstract Emotions",
    student: "Sarah Ahmed",
    age: 12,
    category: "Paintings",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2028&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Urban Perspectives",
    student: "Rahim Khan",
    age: 15,
    category: "Photography",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Paper Crane",
    student: "Aisha Rahman",
    age: 10,
    category: "Paper Crafts",
    image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?q=80&w=2080&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Clay Vase",
    student: "Karim Uddin",
    age: 14,
    category: "Pottery",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Digital Dreams",
    student: "Nadia Islam",
    age: 16,
    category: "Digital Art",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Nature's Patterns",
    student: "Tanvir Hasan",
    age: 13,
    category: "Photography",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop"
  }
];

export default function CreativeGallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const selectedItem = galleryItems.find(item => item.id === selectedId);
  const selectedIndex = galleryItems.findIndex(item => item.id === selectedId);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedId]);

  const handleNext = useCallback(() => {
    const nextIndex = (selectedIndex + 1) % galleryItems.length;
    setSelectedId(galleryItems[nextIndex].id);
  }, [selectedIndex]);

  const handlePrev = useCallback(() => {
    const prevIndex = (selectedIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedId(galleryItems[prevIndex].id);
  }, [selectedIndex]);

  // Touch handlers for swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleNext, handlePrev]);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">Student Showcase</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-4 sm:mb-6">
              Creative Exploration
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Celebrating the artistic talents of our students across various mediums.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {galleryItems.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-2 sm:gap-3">
              <motion.div
                layoutId={`card-${item.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedId(item.id)}
                whileTap={{ scale: 0.98 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg hover-lift touch-manipulation"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 group-active:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-xs sm:text-sm md:text-base">{item.title}</h3>
                </div>
              </motion.div>
              <div className="text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1">{item.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-6 sm:px-8 py-5 sm:py-6 text-sm touch-manipulation active:scale-95"
          >
            View More Creations
          </Button>
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4"
            onClick={() => setSelectedId(null)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/40 backdrop-blur-md z-[60] touch-manipulation"
              onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12 hidden md:flex"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12 hidden md:flex"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </Button>

            {/* Mobile swipe hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs md:hidden">
              Swipe to navigate
            </div>

            <motion.div
              layoutId={`card-${selectedId}`}
              className="relative max-w-5xl w-full max-h-[90vh] sm:max-h-[85vh] bg-background rounded-lg overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-2/3 h-[40vh] sm:h-[50vh] md:h-auto bg-black">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full md:w-1/3 p-4 sm:p-6 md:p-8 flex flex-col justify-center bg-card overflow-y-auto">
                <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">{selectedItem.category}</span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">{selectedItem.title}</h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-8">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Artist</span>
                    <span className="font-medium text-sm">{selectedItem.student}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Age</span>
                    <span className="font-medium text-sm">{selectedItem.age} years</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Class</span>
                    <span className="font-medium text-sm">Standard 8</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs sm:text-sm italic">
                  "Art is not what you see, but what you make others see."
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
