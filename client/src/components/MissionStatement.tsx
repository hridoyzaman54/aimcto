import { motion } from "framer-motion";

export default function MissionStatement() {
  const text = "Knowledge for anybody, anywhere, anytime.";

  return (
    <section className="py-40 bg-gradient-to-br from-[#F5F5F0] via-[#FAF9F6] to-[#EAEAEA] dark:from-card/50 dark:via-background dark:to-card/50 text-foreground relative overflow-hidden flex items-center justify-center min-h-[60vh]">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] rounded-full blur-[180px] opacity-10 animate-pulse duration-[8000ms]"></div>
      </div>

      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-20 mix-blend-multiply"></div>

      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Elegant Quotation Mark */}
            <span className="absolute -top-12 -left-4 md:-left-12 text-6xl md:text-8xl font-cormorant text-[#1a1a1a] dark:text-foreground opacity-30 font-bold">“</span>

            <motion.h2
              className="text-4xl md:text-6xl lg:text-7xl font-cormorant font-bold italic leading-tight tracking-tight text-[#1a1a1a] dark:text-foreground"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {text.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
                  {word.split("").map((char, charIndex) => (
                    <motion.span
                      key={`${wordIndex}-${charIndex}`}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 15,
                          textShadow: "2px 2px 0px rgba(0,0,0,0.15), 0px 0px 0px rgba(212,175,55,0)"
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          textShadow: [
                            "2px 2px 0px rgba(0,0,0,0.15), 0px 0px 0px rgba(212,175,55,0)",
                            "2px 2px 0px rgba(0,0,0,0.15), 0px 0px 30px rgba(212,175,55,0.8), 0px 0px 10px rgba(212,175,55,0.6)",
                            "2px 2px 0px rgba(0,0,0,0.15), 0px 0px 0px rgba(212,175,55,0)"
                          ],
                          transition: {
                            opacity: { duration: 0.5 },
                            y: { duration: 0.5 },
                            textShadow: {
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }
                          }
                        }
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h2>

            <span className="absolute -bottom-16 -right-4 md:-right-12 text-6xl md:text-8xl font-cormorant text-[#1a1a1a] dark:text-foreground opacity-30 font-bold rotate-180">“</span>

            <div className="mt-16 flex justify-center items-center gap-4">
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-[#1a1a1a] dark:to-foreground"></div>
              <div className="h-2 w-2 rotate-45 bg-[#1a1a1a] dark:bg-foreground"></div>
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-[#1a1a1a] dark:to-foreground"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
