import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function FAQ() {
  const { t } = useLanguage();
  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "Enrolling is simple! Browse our 'Courses' section, select the program that fits your needs, and click the 'Enroll Now' button. You'll be guided through a quick registration and payment process."
    },
    {
      question: "What makes your Special Needs program unique?",
      answer: "Our program uses a sensory-induced teaching method tailored to individual needs, specifically designed for children with Autism (Levels 1-3). We focus on holistic development, combining academic learning with emotional and social skill building."
    },
    {
      question: "Is financial aid available?",
      answer: "Yes, we believe in accessible education for all. We offer scholarships and flexible payment plans for eligible families. Please contact our support team for more details on how to apply."
    },
    {
      question: "Can parents access mental health support?",
      answer: "Absolutely. We understand that raising a child, especially one with special needs, can be challenging. Our Mental Health Counseling services are available for both students and parents to ensure the well-being of the entire family unit."
    },
    {
      question: "What is AIMVerse?",
      answer: "AIMVerse is our unique gamified learning universe. It features animated episodes and interactive elements that make learning fun and engaging, helping students grasp complex concepts through storytelling and play."
    },
    {
      question: "Do you offer online classes?",
      answer: "Yes, we offer comprehensive Live Classes that you can attend from anywhere. Our platform is designed to provide a seamless remote learning experience with real-time interaction with instructors."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">{t("faq.title")}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-6">{t("faq.title")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("faq.subtitle")}
            </p>
          </motion.div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <AccordionItem value={`item-${index}`} className="border border-border px-6 rounded-lg data-[state=open]:border-primary/50 transition-colors duration-300">
                <AccordionTrigger className="text-lg font-serif font-medium hover:text-primary hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
