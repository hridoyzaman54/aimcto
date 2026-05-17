import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-secondary/50 pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-12 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12 md:mb-16">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 group touch-manipulation">
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-serif font-bold text-lg sm:text-xl">
                <span>A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg font-bold leading-none tracking-tight">AIM Centre</span>
                <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] text-muted-foreground">360</span>
              </div>
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors h-9 w-9 sm:h-10 sm:w-10 touch-manipulation active:scale-95">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors h-9 w-9 sm:h-10 sm:w-10 touch-manipulation active:scale-95">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors h-9 w-9 sm:h-10 sm:w-10 touch-manipulation active:scale-95">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-serif text-base sm:text-lg font-bold mb-4 sm:mb-6">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { name: t("nav.about"), href: "/about" },
                { name: t("nav.courses"), href: "/courses" },
                { name: t("nav.specialNeeds"), href: "/special-needs" },
                { name: t("nav.mentalHealth"), href: "/mental-health" },
                { name: t("nav.aimVerse"), href: "/aimverse" },
                { name: t("footer.contact"), href: "/contact" },
                { name: "Admin Dashboard", href: "/admin" }
              ].map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-sm sm:text-base text-muted-foreground hover:text-primary active:text-primary transition-colors flex items-center gap-2 group touch-manipulation py-1">
                    <span className="h-px w-4 bg-primary scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 transition-transform origin-left"></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info (Simplified) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-serif text-base sm:text-lg font-bold mb-4 sm:mb-6">{t("footer.contact")}</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
              <li>
                <strong className="block text-foreground mb-1 text-sm sm:text-base">{t("footer.email")}</strong>
                <a href="mailto:info@aimcentre360.com" className="hover:text-primary active:text-primary transition-colors touch-manipulation">
                  info@aimcentre360.com
                </a>
              </li>
              <li>
                <strong className="block text-foreground mb-1 text-sm sm:text-base">{t("footer.phone")}</strong>
                <a href="tel:+8801234567890" className="hover:text-primary active:text-primary transition-colors touch-manipulation">
                  +880 1234 567890
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <h3 className="font-serif text-base sm:text-lg font-bold mb-4 sm:mb-6">{t("footer.newsletter.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{t("footer.newsletter.desc")}</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                className="flex-grow h-10 sm:h-11 text-sm sm:text-base"
              />
              <Button type="submit" className="h-10 sm:h-11 px-4 sm:px-6 touch-manipulation active:scale-95">
                {t("footer.newsletter.subscribe")}
              </Button>
            </form>
          </motion.div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <p className="text-center sm:text-left">&copy; 2026 AIM Centre 360. {t("footer.rights")}</p>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="hover:text-primary active:text-primary transition-colors touch-manipulation py-1">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-primary active:text-primary transition-colors touch-manipulation py-1">{t("footer.terms")}</a>
            <Link href="/admin" className="hover:text-primary active:text-primary transition-colors touch-manipulation py-1 border-l pl-4 border-border">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
