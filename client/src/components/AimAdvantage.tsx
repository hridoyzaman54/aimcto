import { motion } from "framer-motion";
import { Video, Baby, HeartHandshake, Brain, Rocket, Hammer, Bot, Accessibility } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AimAdvantage() {
    const { t } = useLanguage();

    return (
        <section className="w-full bg-transparent py-24 overflow-hidden">
            <div className="container mx-auto px-4 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-border pb-8">
                    <div>
                        <span className="text-muted-foreground font-medium tracking-[0.2em] uppercase text-xs block mb-4">Why Choose Us</span>
                        <h3 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-none">The AIM<br />Advantage</h3>
                    </div>
                    <p className="text-muted-foreground max-w-md text-right mt-6 md:mt-0 leading-relaxed">
                        A holistic ecosystem designed to nurture every aspect of a learner's journey, from academic excellence to emotional well-being.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
                    {[
                        { title: t("about.features.liveClasses"), desc: t("about.features.liveClasses.desc"), number: "01", icon: Video },
                        { title: t("about.features.tinyExplorers"), desc: t("about.features.tinyExplorers.desc"), number: "02", icon: Baby },
                        { title: t("about.features.specialNeeds"), desc: t("about.features.specialNeeds.desc"), number: "03", icon: HeartHandshake },
                        { title: t("about.features.mentalHealth"), desc: t("about.features.mentalHealth.desc"), number: "04", icon: Brain },
                        { title: t("about.features.aimVerse"), desc: t("about.features.aimVerse.desc"), number: "05", icon: Rocket },
                        { title: t("about.features.skillBased"), desc: t("about.features.skillBased.desc"), number: "06", icon: Hammer },
                        { title: t("about.features.aimBot"), desc: t("about.features.aimBot.desc"), number: "07", icon: Bot },
                        { title: t("about.features.accessibility"), desc: t("about.features.accessibility.desc"), number: "08", icon: Accessibility }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
                            whileHover={{
                                y: -12,
                                scale: 1.03,
                                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                            }}
                            whileTap={{ scale: 0.97, y: -4 }}
                            className="group flex flex-col items-start hover-trigger bg-card border border-foreground p-8 rounded-2xl shadow-md transition-all duration-300 dark:bg-card/50 cursor-pointer active:border-primary"
                        >
                            <div className="flex items-center justify-between w-full mb-6">
                                <span className="text-xs font-bold text-muted-foreground/50 font-serif tracking-widest group-hover:text-primary transition-colors duration-500">{feature.number}</span>
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <feature.icon className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                            <h4 className="font-serif text-2xl font-bold mb-4 text-foreground group-hover:translate-x-2 transition-transform duration-500">{feature.title}</h4>
                            <div className="w-12 h-[1px] bg-border mb-4 group-hover:w-full group-hover:bg-primary transition-all duration-700 ease-in-out"></div>
                            <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
