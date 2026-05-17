import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, Globe, X, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "student":
        return "/student";
      case "parent":
        return "/parent";
      default:
        return "/student";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t("nav.home"), href: "#top" },
    { name: t("nav.courses"), href: "#courses" },
    { name: t("nav.specialNeeds"), href: "/special-needs" },
    { name: t("nav.tinyExplorers"), href: "#tiny-explorers" },
    { name: t("nav.mentalHealth"), href: "/mental-health" },
    { name: t("nav.aimVerse"), href: "#aimverse" },
    { name: t("nav.gallery"), href: "#gallery" },
    // Add Admin link only for admin users
    ...(user?.role === 'admin' ? [{ name: "Admin", href: "/admin", isExternal: true }] : []),
  ];

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement> | React.TouchEvent<HTMLAnchorElement>, href: string, isExternal?: boolean) => {
    if (isExternal) return; // Let default behavior handle it
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Client-side page navigation (SPA style)
    if (href.startsWith("/")) {
      setLocation(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Scroll to section on same page, or redirect to home first if on another page
    if (href.startsWith("#")) {
      if (location !== "/") {
        setLocation("/");
        window.location.hash = href;
        return;
      }

      if (href === "#top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  }, [location, setLocation]);

  // Handle smooth scroll to section if loaded from another page with a hash
  useEffect(() => {
    if (location === "/" && window.location.hash) {
      const hash = window.location.hash;
      const element = document.querySelector(hash);
      if (element) {
        const timer = setTimeout(() => {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }, 150); // Small delay to let the DOM fully mount
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 left-0 right-0 z-50 bg-white dark:bg-background border-b-0 py-3 sm:py-4 transition-shadow duration-300 ${isScrolled ? 'shadow-sm' : ''}`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, "#top")}
          className="flex items-center gap-2 group cursor-pointer touch-manipulation"
        >
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden bg-foreground text-background flex items-center justify-center font-serif font-bold text-lg sm:text-xl transition-transform duration-500 group-hover:rotate-180 group-active:scale-95">
            <span>A</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-base sm:text-lg font-bold leading-none tracking-tight">AIM Centre 360</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-4 2xl:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href, (link as any).isExternal)}
              className={`relative text-sm font-bold tracking-wide transition-colors hover:text-foreground whitespace-nowrap cursor-pointer hover-trigger px-2 py-1 ${location === link.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                {link.name}
              </motion.span>
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Language & Theme Toggles */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-muted transition-colors font-bold gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 h-8 sm:h-9 touch-manipulation active:scale-95"
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs md:text-sm">{language === 'en' ? 'BN' : 'EN'}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted transition-colors h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 touch-manipulation active:scale-95"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>

          <div className="hidden md:block h-6 w-[1px] bg-border mx-1 sm:mx-2"></div>

          {/* Auth Section - Shows Dashboard if logged in, Login/Signup if not */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {!loading && user ? (
              // Logged in state - show Dashboard button and user menu
              <>
                <Link href={getDashboardPath()}>
                  <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 lg:px-6 text-sm gap-2">
                    <span>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                      <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation(getDashboardPath())} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Logged out state - show Login/Signup buttons
              <>
                <Link href="/login">
                  <Button asChild variant="ghost" className="font-medium hover:bg-transparent hover:text-primary text-foreground text-sm">
                    <span>{t("nav.login")}</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-4 lg:px-6 text-sm">
                    <span>{t("nav.signup")}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle - Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden ml-1 sm:ml-2 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation active:scale-95 relative"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[57px] sm:top-[65px] z-40 bg-background/98 backdrop-blur-xl xl:hidden overflow-y-auto overscroll-contain"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="container py-6 sm:py-8 flex flex-col gap-4 sm:gap-6 min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-65px)]"
            >
              {/* User Info (if logged in) */}
              {!loading && user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 pb-4 border-b border-border"
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="text-xl sm:text-2xl font-serif font-bold py-3 sm:py-4 border-b border-border text-foreground hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation active:bg-muted/50 -mx-4 px-4"
                    onClick={(e) => handleNavClick(e, link.href, (link as any).isExternal)}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>

              {/* Auth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6"
              >
                {!loading && user ? (
                  // Logged in - show Dashboard and Logout
                  <>
                    <Link href={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button asChild className="w-full rounded-full bg-primary text-primary-foreground py-5 sm:py-6 text-base sm:text-lg touch-manipulation active:scale-[0.98] transition-transform gap-2">
                        <span>
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 py-5 sm:py-6 text-base sm:text-lg touch-manipulation active:scale-[0.98] transition-transform gap-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  // Logged out - show Signup and Login
                  <>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button asChild className="w-full rounded-full bg-foreground text-background py-5 sm:py-6 text-base sm:text-lg touch-manipulation active:scale-[0.98] transition-transform">
                        <span>{t("nav.signup")}</span>
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button asChild variant="outline" className="w-full rounded-full border-foreground text-foreground py-5 sm:py-6 text-base sm:text-lg touch-manipulation active:scale-[0.98] transition-transform">
                        <span>{t("nav.login")}</span>
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Spacer to push content up */}
              <div className="flex-grow" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
