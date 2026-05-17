import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Search, ChevronLeft, ChevronRight, FolderTree, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Sample courses to always display alongside database courses
const sampleCourses = [
  {
    id: -1,
    title: "English Medium - Class 5",
    category: "Academic",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
    price: "2500",
    description: "Comprehensive curriculum covering all major subjects for Class 5 English Medium students."
  },
  {
    id: -2,
    title: "Preschool Discovery",
    category: "Tiny Explorers",
    thumbnail: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2072&auto=format&fit=crop",
    price: "1800",
    description: "Fun and interactive learning sessions designed for preschoolers to spark curiosity."
  },
  {
    id: -3,
    title: "Autism Support - Level 1",
    category: "Special Needs",
    thumbnail: "https://images.unsplash.com/photo-1555819206-7b30da4f1506?q=80&w=2071&auto=format&fit=crop",
    price: "3000",
    description: "Tailored educational support for children with Level 1 Autism, focusing on social skills."
  },
  {
    id: -4,
    title: "Professional Spoken English",
    category: "Spoken English & Grammar",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
    price: "2200",
    description: "Master the art of communication with our professional spoken English course."
  },
  {
    id: -5,
    title: "Pottery Workshop",
    category: "Skills and Creativities",
    thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=2070&auto=format&fit=crop",
    price: "1500",
    description: "Hands-on pottery workshop to unleash your creativity and learn a new skill."
  },
  {
    id: -6,
    title: "Bangla Medium - Class 8",
    category: "Academic",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop",
    price: "2800",
    description: "In-depth academic support for Class 8 Bangla Medium students across all subjects."
  },
  {
    id: -7,
    title: "Kindergarten Fun Learning",
    category: "Tiny Explorers",
    thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=2070&auto=format&fit=crop",
    price: "2000",
    description: "Engaging activities and games to make learning fun for kindergartners."
  },
  {
    id: -8,
    title: "English Version - Class 10",
    category: "Academic",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop",
    price: "3500",
    description: "Complete SSC preparation for English Version students with expert guidance."
  },
  {
    id: -9,
    title: "Art & Craft for Kids",
    category: "Skills and Creativities",
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop",
    price: "1200",
    description: "Creative art and craft sessions to develop fine motor skills and imagination."
  },
  {
    id: -10,
    title: "ADHD Learning Support",
    category: "Special Needs",
    thumbnail: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?q=80&w=2070&auto=format&fit=crop",
    price: "3200",
    description: "Specialized learning techniques for children with ADHD to improve focus and retention."
  },
  {
    id: -11,
    title: "Grammar Mastery",
    category: "Spoken English & Grammar",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop",
    price: "1800",
    description: "Master English grammar with comprehensive lessons and practice exercises."
  },
  {
    id: -12,
    title: "Nursery Rhymes & Stories",
    category: "Tiny Explorers",
    thumbnail: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2072&auto=format&fit=crop",
    price: "1000",
    description: "Delightful nursery rhymes and storytelling sessions for early childhood development."
  }
];

// Wishlist Heart Button Component
function WishlistButton({ courseId, className = "" }: { courseId: number; className?: string }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  // Get wishlist IDs for the current user
  const { data: wishlistIds = [] } = trpc.wishlist.getMyWishlistIds.useQuery(undefined, {
    enabled: !!user,
  });
  
  const isWishlisted = wishlistIds.includes(courseId);
  
  const toggleMutation = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      utils.wishlist.getMyWishlistIds.invalidate();
      utils.wishlist.getMyWishlist.invalidate();
      if (data.isWishlisted) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist");
      }
    },
    onError: () => {
      toast.error("Failed to update wishlist");
    },
  });
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    
    if (courseId < 0) {
      toast.error("Sample courses cannot be added to wishlist");
      return;
    }
    
    toggleMutation.mutate({ courseId });
  };
  
  return (
    <motion.button
      className={`p-2 bg-background/90 backdrop-blur-sm rounded-full transition-all duration-300 z-20 ${className} ${
        isWishlisted 
          ? 'text-red-500 bg-red-50 dark:bg-red-900/30' 
          : 'hover:bg-red-500 hover:text-white'
      }`}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={toggleMutation.isPending}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-300 ${isWishlisted ? 'fill-current' : ''}`} 
      />
    </motion.button>
  );
}

export default function Courses() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch categories from database
  const { data: dbCategories, isLoading: categoriesLoading } = trpc.category.getAll.useQuery();
  
  // Fetch courses from database
  const { data: dbCourses, isLoading: coursesLoading } = trpc.course.getPublished.useQuery();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Combine sample courses with database courses
  const allCourses = [
    ...sampleCourses.map(course => ({
      ...course,
      categoryName: course.category,
    })),
    ...(dbCourses || []).map(course => ({
      ...course,
      categoryName: (course as any).categoryName || course.category || "Uncategorized",
    }))
  ];

  // Get unique categories from both sample and database courses
  const categories = ["All", ...Array.from(new Set([
    ...sampleCourses.map(c => c.category),
    ...(dbCategories || []).map(c => c.name),
  ]))];

  // Filter courses based on category and search
  const filteredCourses = allCourses.filter(course => {
    const matchesCategory = activeCategory === "All" || course.categoryName === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNext = () => {
    const maxIndex = Math.max(0, filteredCourses.length - (isMobile ? 1 : 3));
    setCarouselIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  // Touch handlers for swipe
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

  const isLoading = categoriesLoading || coursesLoading;

  return (
    <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden bg-transparent">
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-medium tracking-widest uppercase text-sm"
            >
              {t("courses.subtitle")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2"
            >
              {t("courses.title")}
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative w-full md:w-72 mt-4 md:mt-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10 bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>

        <Tabs defaultValue="All" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap justify-start gap-1 sm:gap-2 bg-transparent p-0 mb-8 sm:mb-12 h-auto overflow-x-auto scrollbar-hide">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : (
              categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <TabsTrigger
                    value={category}
                    className="rounded-none border-b-2 border-transparent px-2 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-300 hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5 touch-manipulation whitespace-nowrap"
                  >
                    {category}
                  </TabsTrigger>
                </motion.div>
              ))
            )}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {/* Main Course Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-24">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative bg-card border border-border overflow-hidden hover-lift transition-all duration-500 flex flex-col cursor-pointer active:border-primary touch-manipulation"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"}
                        alt={course.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium uppercase tracking-wider">
                        {course.categoryName}
                      </div>

                      {/* Wishlist Button */}
                      <WishlistButton 
                        courseId={course.id} 
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 relative flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-xl font-bold text-premium-hover">
                          {course.title}
                        </h3>
                        <span className="font-bold text-primary">
                          {parseFloat(course.price || '0') > 0 ? `৳${course.price}` : 'Free'}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                        {course.description || "Explore this comprehensive course designed to help you achieve your learning goals."}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{(course as any).totalLessons || 0} Lessons</span>
                          </div>

                          <Button variant="ghost" className="group/btn p-0 hover:bg-transparent text-premium-hover text-xs">
                            View Details
                            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>

                        <Link href={user ? "/student/catalog" : "/login"}>
                          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] font-medium tracking-wide shadow-sm hover:shadow-md">
                            <span>{user ? "Browse & Enroll" : (t("courses.enroll") || "Enroll Now")}</span>
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex justify-center mb-16">
              <Link href={user ? "/student/catalog" : "/login"}>
                <Button
                  variant="outline"
                  className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-12 py-5 sm:py-7 text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium transition-all duration-300 hover-magnetic touch-manipulation active:scale-95"
                >
                  View All Courses
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Extra Courses Carousel Section */}
            {filteredCourses.length > 3 && (
              <div className="border-t border-border pt-8 sm:pt-16">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold">More to Explore</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrev}
                      className="rounded-full hover:bg-primary hover:text-white transition-colors h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNext}
                      className="rounded-full hover:bg-primary hover:text-white transition-colors h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div 
                  className="relative overflow-hidden touch-pan-y" 
                  ref={carouselRef}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <motion.div
                    className="flex gap-4 sm:gap-6 cursor-grab active:cursor-grabbing"
                    animate={{ x: -carouselIndex * (isMobile ? 216 : 256) }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={`carousel-${course.id}`}
                        className="w-[200px] sm:w-[220px] lg:w-[240px] flex-shrink-0 bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all duration-500 hover:shadow-lg group"
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Image Container - square aspect */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={course.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"}
                            alt={course.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded">
                            {course.categoryName}
                          </div>
                          {/* Animated Heart/Favorite Button */}
                          <WishlistButton 
                            courseId={course.id} 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          />
                        </div>
                        {/* Content - compact */}
                        <div className="p-3">
                          <h4 className="font-serif text-sm font-bold line-clamp-1 mb-1">{course.title}</h4>
                          <p className="text-muted-foreground text-xs line-clamp-1 mb-2">
                            {course.description || "Explore this course."}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-primary text-sm">
                              {parseFloat(course.price || '0') > 0 ? `৳${course.price}` : 'Free'}
                            </span>
                            <span className="text-xs text-muted-foreground">{(course as any).totalLessons || 0} Lessons</span>
                          </div>
                          {/* Enroll Now Button */}
                          <Link href={user ? "/student/catalog" : "/login"}>
                            <Button 
                              className="w-full h-8 text-xs bg-primary hover:bg-primary/90 transition-all duration-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {user ? "View Course" : "Enroll Now"}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
