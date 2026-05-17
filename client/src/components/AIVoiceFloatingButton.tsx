import { Bot } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function AIVoiceFloatingButton() {
    return (
        <div className="fixed bottom-10 left-10 z-50">
            <Link href="/ai-voice">
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="group relative flex items-center justify-center bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 ring-2 ring-white dark:ring-background"
                >
                    <Bot className="h-7 w-7" />

                    {/* Tooltip */}
                    <span className="absolute left-full ml-3 px-2 py-1 bg-background border border-border rounded text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-sm pointer-events-none">
                        AIM Assistant
                    </span>

                    {/* Ripple Effect */}
                    <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-75"></span>
                </motion.button>
            </Link>
        </div>
    );
}
