import { motion } from "framer-motion";
import { Button } from "./ui/button";

export default function NewArrivals() {
  const products = [
    {
      title: "Professional Spoken English",
      description: "Master the art of communication with our comprehensive Spoken English course. Designed for students and professionals alike, this program focuses on fluency, pronunciation, and confidence-building through interactive sessions and real-world practice scenarios.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
      type: "course"
    },
    {
      title: "New Gamified Elements",
      description: "Experience learning like never before with our cutting-edge gamified platform. We've integrated immersive challenges, reward systems, and interactive milestones to make education engaging, fun, and highly effective for learners of all ages.",
      image: "https://images.unsplash.com/photo-1556438064-2d7646166914?q=80&w=800&auto=format&fit=crop",
      type: "feature"
    }
  ];

  return (
    <section className="w-full bg-muted/30 py-24">
      <div className="container mx-auto px-4 md:px-12">

        <div className="mb-16">
          <h2 className="font-serif text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
            New Arrivals
          </h2>
          <p className="text-lg text-muted-foreground">
            Exciting Courses & Programs
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              whileTap={{ scale: 0.98 }}
              className="bg-card border border-border p-0 flex flex-col md:flex-row h-auto md:h-[400px] group overflow-hidden hover-lift cursor-pointer active:border-primary"
            >
              {/* Content Left */}
              <div className="flex-1 p-12 flex flex-col items-center justify-center text-center gap-6">
                <h3 className="font-serif text-3xl font-bold text-card-foreground">
                  {product.title}
                </h3>
                <p className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base">
                  {product.description}
                </p>
                <div className="w-8 h-[1px] bg-border"></div>
                <Button
                  variant="outline"
                  className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-xs uppercase tracking-widest mt-4 transition-all duration-300 hover-magnetic"
                >
                  {product.type === 'course' ? 'View Details' : 'Explore Feature'}
                </Button>
              </div>

              {/* Image Right */}
              <div className="flex-1 relative overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end mt-12">
          <Button
            variant="outline"
            className="rounded-none border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-xs uppercase tracking-widest hover-magnetic"
          >
            Browse All
          </Button>
        </div>

      </div>
    </section>
  );
}
