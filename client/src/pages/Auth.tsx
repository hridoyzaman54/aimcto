import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, User, Users, Mail, Lock, UserPlus, LogIn, Sparkles } from "lucide-react";

export default function Auth() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<"student" | "parent">("student");

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden selection:bg-primary/20">
            {/* Left Side: Premium Branding Panel */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative hidden md:flex md:w-1/2 bg-foreground p-12 flex-col justify-between overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/40 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>

                <div className="relative z-10">
                    <Link href="/">
                        <motion.div
                            whileHover={{ x: -5 }}
                            className="flex items-center gap-2 text-background/80 hover:text-background transition-colors cursor-pointer group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-medium uppercase tracking-widest">{t("nav.home")}</span>
                        </motion.div>
                    </Link>
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"
                    >
                        <span className="text-3xl font-serif font-bold text-white">A</span>
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-5xl md:text-7xl font-serif font-bold text-background leading-tight"
                        >
                            {t("auth.branding.title")}<br />
                            <span className="text-primary italic font-light tracking-tight">360°</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-xl text-background/60 font-light max-w-md"
                        >
                            {t("auth.branding.subtitle")}
                        </motion.p>
                    </div>
                </div>

                <div className="relative z-10 border-t border-background/10 pt-8 mt-12">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-foreground bg-muted flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="avatar" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-background/40">
                            <span className="text-background/80 font-medium">500+</span> Students Joined This Week
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 md:p-12 lg:p-24 bg-card relative min-h-screen">
                {/* Mobile Logo */}
                <div className="md:hidden absolute top-10 left-0 right-0 flex justify-center px-8">
                    <Link href="/">
                        <div className="flex items-center gap-3 group bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-serif font-bold text-lg">A</span>
                            </div>
                            <span className="font-serif font-bold text-foreground text-lg tracking-tight">AIM Centre 360</span>
                        </div>
                    </Link>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md space-y-8"
                >
                    <div className="space-y-3 text-center md:text-left pt-16 md:pt-0">
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
                            {isLogin ? t("auth.title.login") : t("auth.title.signup")}
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-muted-foreground font-light italic text-lg">
                            {isLogin ? t("auth.subtitle.login") : t("auth.subtitle.signup")}
                        </motion.p>
                    </div>

                    {/* Form Toggle (Login/Signup) */}
                    <motion.div variants={itemVariants} className="p-1 bg-muted rounded-xl flex gap-1">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <LogIn className="h-4 w-4" /> {t("nav.login")}
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <UserPlus className="h-4 w-4" /> {t("nav.signup")}
                        </button>
                    </motion.div>

                    {/* Role Selection */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <Label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{t("auth.label.student")} / {t("auth.label.parent")}</Label>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <button
                                onClick={() => setRole("student")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group ${role === "student" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                            >
                                <div className={`p-2.5 rounded-lg transition-colors ${role === "student" ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                                    <User className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold tracking-tight ${role === "student" ? "text-foreground" : "text-muted-foreground"}`}>{t("auth.label.student")}</span>
                            </button>
                            <button
                                onClick={() => setRole("parent")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group ${role === "parent" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                            >
                                <div className={`p-2.5 rounded-lg transition-colors ${role === "parent" ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold tracking-tight ${role === "parent" ? "text-foreground" : "text-muted-foreground"}`}>{t("auth.label.parent")}</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Main Form Fields */}
                    <div className="space-y-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="name" className="text-sm font-medium">{t("auth.label.fullName")}</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-muted-foreground">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <Input id="name" placeholder="John Doe" className="pl-10 h-11 rounded-xl bg-muted/30" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">{t("auth.label.email")}</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input id="email" type="email" placeholder="aim@example.com" className="pl-10 h-11 rounded-xl bg-muted/30" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="password">{t("auth.label.password")}</Label>
                                {isLogin && (
                                    <button className="text-xs text-primary hover:underline font-medium">Forgot Password?</button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input id="password" type="password" className="pl-10 h-11 rounded-xl bg-muted/30" />
                            </div>
                        </div>

                        {/* Mandatory Child UID for Parents */}
                        <AnimatePresence mode="popLayout">
                            {role === "parent" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <Label htmlFor="childUid" className="text-sm font-bold text-primary">{t("auth.label.childUid")} *</Label>
                                    </div>
                                    <Input id="childUid" placeholder="e.g. AIM-2026-X12" className="h-11 rounded-xl bg-background border-primary/20 focus:border-primary" />
                                    <p className="text-[10px] text-primary/60 font-medium italic mt-1">Mandatory for parent accounts to sync with student progress.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.div variants={itemVariants} className="pt-4">
                        <Button className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 group">
                            {isLogin ? (
                                <>
                                    {t("auth.btn.login")} <LogIn className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            ) : (
                                <>
                                    {t("auth.btn.signup")} <Sparkles className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                </>
                            )}
                        </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-center pt-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                            {isLogin ? t("auth.switch.signup") : t("auth.switch.login")}
                        </button>
                    </motion.div>
                </motion.div>

                {/* Copyright/Footer */}
                <div className="mt-auto pt-12 text-center text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-medium">
                    © 2026 AIM Centre 360 • All Rights Reserved
                </div>
            </div>
        </div>
    );
}
