import { motion } from "framer-motion";
import { Calendar, User, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

export default function MentalHealth() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-transparent relative">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm">Wellness & Support</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-4 sm:mb-6">
              Mental Health <br />
              <span className="italic text-primary">Counseling</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
              We offer mental health counseling by certified professionals for both parents and students. Understanding the importance of mental well-being is crucial for academic success and personal growth.
            </p>

            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-300 cursor-pointer hover-lift active:bg-secondary/70 touch-manipulation"
              >
                <div className="p-2 sm:p-3 bg-secondary rounded-full shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">For Students</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Managing exam stress, peer pressure, and building emotional resilience.</p>
                </div>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-300 cursor-pointer hover-lift active:bg-secondary/70 touch-manipulation"
              >
                <div className="p-2 sm:p-3 bg-secondary rounded-full shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">For Parents</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Guidance on parenting strategies and supporting your child's development.</p>
                </div>
              </motion.div>
            </div>

            <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop"
                alt="Counseling session"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border p-4 sm:p-6 md:p-8 shadow-lg relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Schedule an Appointment</h3>

            <form className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base">I am a...</Label>
                <RadioGroup defaultValue="student" className="flex gap-4 sm:gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" className="touch-manipulation" />
                    <Label htmlFor="student" className="text-sm sm:text-base cursor-pointer">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parent" id="parent" className="touch-manipulation" />
                    <Label htmlFor="parent" className="text-sm sm:text-base cursor-pointer">Parent</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="h-10 sm:h-11 text-sm sm:text-base" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="child-uid" className="text-sm sm:text-base">Child UID (if Parent)</Label>
                  <Input id="child-uid" placeholder="e.g. AIM-1234" className="h-10 sm:h-11 text-sm sm:text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="h-10 sm:h-11 text-sm sm:text-base" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+880..." className="h-10 sm:h-11 text-sm sm:text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm sm:text-base">Preferred Date</Label>
                  <div className="relative">
                    <Input type="date" className="h-10 sm:h-11 text-sm sm:text-base" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm sm:text-base">Preferred Time</Label>
                  <Select>
                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning" className="text-sm sm:text-base">Morning (9AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon" className="text-sm sm:text-base">Afternoon (12PM - 4PM)</SelectItem>
                      <SelectItem value="evening" className="text-sm sm:text-base">Evening (4PM - 8PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="message" className="text-sm sm:text-base">Reason for Visit</Label>
                <Textarea id="message" placeholder="Briefly describe your concerns..." className="min-h-[100px] text-sm sm:text-base" />
              </div>

              <Button className="w-full text-base sm:text-lg py-5 sm:py-6 touch-manipulation active:scale-[0.98]">Book Appointment</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
