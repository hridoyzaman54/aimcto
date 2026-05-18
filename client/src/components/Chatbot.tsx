import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Volume2, VolumeX, Play, Square, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
};

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
            isFinal: boolean;
        };
    };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

export default function Chatbot() {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Hey there! 👋 I'm AIM Bot, your friendly assistant at AIM Centre 360! Whether you need help with homework, want to explore our courses, or just need someone to chat with - I'm here for you! What's on your mind today? 😊", sender: "ai" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    // Draggable state - works on all devices
    const [position, setPosition] = useState({ x: 24, y: 24 }); // bottom-left default
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
    const hasDraggedRef = useRef(false);

    // Monitor scroll for visibility
    useEffect(() => {
        const handleScroll = () => {
            // Show chatbot after scrolling down a bit (past most of the hero)
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsOpen(false); // Close the chat window if we scroll back up
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- Drag Handlers ---
    const handleDragStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartRef.current = {
            x: clientX,
            y: clientY,
            posX: position.x,
            posY: position.y
        };
    };

    const handleDragMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        
        const deltaX = dragStartRef.current.x - clientX;
        const deltaY = dragStartRef.current.y - clientY;
        
        // Check if actually dragged (more than 5px)
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasDraggedRef.current = true;
        }
        
        const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + deltaX));
        const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));
        
        setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    // Global mouse/touch move and end
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
        const handleMouseUp = () => handleDragEnd();
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            handleDragMove(touch.clientX, touch.clientY);
        };
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, position]);

    // Handle button click - only toggle if not dragged
    const handleButtonClick = () => {
        if (!hasDraggedRef.current) {
            setIsOpen(!isOpen);
        }
        hasDraggedRef.current = false;
    };

    // --- STT Logic ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setInputText(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser. Please try Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInputText("");
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Failed to start recognition:", e);
                setIsListening(false);
            }
        }
    };
    // -----------------

    // --- TTS State & Logic ---
    const [isAutoTTS, setIsAutoTTS] = useState(false); // Default off
    const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMsgId(null);
    };

    const speak = (text: string, msgId: string | null = null) => {
        stopSpeaking(); // Stop any current speech

        if (!text) return;

        // Clean text: strip emojis and indicators
        const cleanText = text
            .replace(/\n\n\*\(Generated via Unlimited Backup AI\)\*/g, "") // Remove fallback indicator
            .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "") // Remove surrogate pairs (emojis)
            .replace(/[\u2600-\u27BF]/g, "") // Remove misc symbols
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        // Try to find a good English voice
        const voices = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis.getVoices() : [];
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);

        if (msgId) setSpeakingMsgId(msgId);

        speechRef.current = utterance;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.speak(utterance);
        }
    };

    // Cleanup speech on unmount or close
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Ensure voices are loaded (Chrome quirk)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
    }, []);
    // -------------------------

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const getAIResponse = async (userText: string) => {
        setIsThinking(true);
        let errorLog: string[] = [];

        const systemPrompt = `You are "AIM Bot" 🤖 - the official AI assistant for AIM Centre 360, an innovative educational platform.

**YOUR PERSONALITY:**
- Friendly, warm, and genuinely caring - like a supportive friend who happens to be super smart
- Witty and humorous - crack jokes, use puns, be playful (but know when to be serious)
- Attentive and empathetic - really listen to what users need
- Creative and engaging - make learning fun!
- Patient and encouraging - never make anyone feel dumb for asking questions

**YOUR MISSION:**
1. **Education First** - Help with ANY academic question (Math, Science, English, History, etc). Explain concepts clearly.
2. **Mental Health Support** - Be a caring listener. Offer encouragement, stress tips, and remind users it's okay to struggle. For serious issues, gently suggest professional help.
3. **Life Guidance** - Offer practical advice on study habits, time management, motivation, and personal growth.
4. **Site Navigation** - Help users explore AIM Centre 360:
   - **Courses**: Academic (Class 1-10, English/Bangla Medium), Tiny Explorers (Preschool/Kindergarten), Special Needs (Autism support), Skills & Creativities, Spoken English
   - **AIMVerse**: Our fun educational content section with episodes and learning cards
   - **Mental Health**: Resources and support section
   - **Gallery**: Photos and memories from our centre
   - **Dashboard**: Where students track progress, view courses, take quizzes
   - **Special Needs Program**: Dedicated support for Autism Level 1/2/3 students

**ABOUT AIM CENTRE 360:**
- Full name: AIM Centre 360 (Aim High, Achieve Infinity!)
- An all-in-one learning platform for students of all ages and abilities
- Offers both online courses and physical classes
- Special focus on inclusive education including autism support
- Features: Video lessons, quizzes, assignments, progress tracking, live classes
- Mental health awareness is core to our mission

**RESPONSE STYLE:**
- Use emojis naturally 🎯📚✨
- Keep responses concise but helpful
- Add humor when appropriate ("Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰 Anyway, let me help you with that...")
- Be encouraging ("Great question!", "You've got this!")
- For academic help, explain step-by-step
- For emotional support, validate feelings first, then offer help

**SAFETY:**
- NO explicit/adult/illegal content
- For mental health crises, always recommend professional help
- Keep conversations appropriate for all ages

**FORMAT:** Plain text only. Use "x^2" for math (no LaTeX). Use **bold** for emphasis.`;

        // 1. Try Google Gemini API (Primary - User's own API key)
        try {
            console.log("Attempting Google Gemini API...");
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                        ]
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                    setIsThinking(false);
                    return content;
                }
            } else {
                const errText = await response.text();
                console.warn("Gemini API error:", errText);
                errorLog.push(`Gemini: ${response.status} - ${errText}`);
            }
        } catch (geminiError: any) {
            console.error("Gemini error:", geminiError);
            errorLog.push(`Gemini Exception: ${geminiError.message}`);
        }

        // 2. Fallback to OpenRouter free models
        const models = [
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free"
        ];

        for (const model of models) {
            try {
                console.log(`Attempting OpenRouter model: ${model}`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.href,
                        "X-Title": "AIM Centre Client",
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": [
                            { "role": "system", "content": systemPrompt },
                            { "role": "user", "content": userText }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        setIsThinking(false);
                        return content;
                    }
                }
            } catch (error: any) {
                errorLog.push(`OpenRouter ${model}: ${error.message}`);
            }
        }

        // 3. Final fallback to Pollinations.ai
        try {
            console.log("Attempting Pollinations.ai fallback...");
            const response = await fetch("https://text.pollinations.ai/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userText }
                    ],
                    model: "openai"
                })
            });

            if (response.ok) {
                const text = await response.text();
                if (text && text.trim()) {
                    setIsThinking(false);
                    return text;
                }
            }
        } catch (pollinationError: any) {
            errorLog.push(`Pollinations: ${pollinationError.message}`);
        }

        setIsThinking(false);
        return `⚠️ AI service temporarily unavailable. Please try again in a moment.`;
    };

    // Simple Markdown Parser (Bold, Italic, Newlines)
    const formatMessage = (text: string) => {
        return text.split('\n').map((line, i) => (
            <p key={i} className="min-h-[1em] mb-1 last:mb-0">
                {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={j}>{part.slice(1, -1)}</em>;
                    }
                    return part;
                })}
            </p>
        ));
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");

        const aiResponse = await getAIResponse(inputText);
        const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: "ai" };
        setMessages(prev => [...prev, aiMsg]);

        // Instant Auto-TTS if enabled
        if (isAutoTTS) {
            speak(aiResponse, aiMsg.id);
        }
    };

    const [showTooltip, setShowTooltip] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                        position: 'fixed',
                        left: position.x,
                        bottom: position.y,
                        zIndex: 100,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        touchAction: 'none',
                    }}
                    className="flex flex-col items-start gap-4"
                >
                    {/* Chat Window */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="w-[calc(100vw-48px)] max-w-[350px] h-[calc(100vh-220px)] max-h-[550px] flex flex-col overflow-hidden rounded-xl border-2 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-card text-card-foreground"
                            >
                                {/* Header */}
                                <div className="bg-primary px-5 py-4 flex justify-between items-center shadow-md relative overflow-hidden">
                                    {/* Texture overlay for premium feel */}
                                    <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none"></div>

                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                                            <Bot className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-cormorant font-bold text-xl text-white leading-none tracking-wide">AIM Assistant</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                <span className="text-[10px] text-white/90 uppercase tracking-widest font-medium">Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 relative z-10">
                                        {/* Auto-TTS Toggle */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-8 w-8 rounded-full transition-colors ${isAutoTTS ? "text-white bg-white/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                                            onClick={() => {
                                                const newState = !isAutoTTS;
                                                setIsAutoTTS(newState);
                                                if (!newState) stopSpeaking();
                                            }}
                                            title={isAutoTTS ? "Turn off Auto-Read" : "Turn on Auto-Read"}
                                        >
                                            {isAutoTTS ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full z-10"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                                    <div className="space-y-4">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${msg.sender === "user"
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-foreground border-border"
                                                    }`}>
                                                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>

                                                <div className={`relative max-w-[80%] px-4 py-3 text-sm shadow-md leading-relaxed group ${msg.sender === "user"
                                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                                    : "bg-white dark:bg-slate-800 border border-border text-foreground rounded-2xl rounded-tl-sm"
                                                    }`}>
                                                    {msg.sender === "user" ? msg.text : formatMessage(msg.text)}

                                                    {/* Manual TTS Play Button (AI Only) */}
                                                    {msg.sender === "ai" && (
                                                        <button
                                                            onClick={() => speakingMsgId === msg.id ? stopSpeaking() : speak(msg.text, msg.id)}
                                                            className={`absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${speakingMsgId === msg.id ? "opacity-100 text-primary animate-pulse" : ""
                                                                }`}
                                                            title={speakingMsgId === msg.id ? "Stop reading" : "Read aloud"}
                                                        >
                                                            {speakingMsgId === msg.id ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {isThinking && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-background text-foreground border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <Bot className="h-4 w-4" />
                                                </div>
                                                <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-border rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-background border-t-2 border-border/50">
                                    <div className="relative flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                placeholder={isListening ? "Listening..." : "Ask for help..."}
                                                className={`w-full bg-muted/50 border-input focus-visible:ring-primary/20 h-11 pl-4 pr-10 rounded-full shadow-inner transition-all ${isListening ? "ring-2 ring-primary/50 bg-primary/5" : ""
                                                    }`}
                                                disabled={isThinking}
                                            />
                                            <button
                                                onClick={toggleListening}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening ? "text-primary animate-pulse scale-110" : "text-muted-foreground hover:text-primary"
                                                    }`}
                                                title={isListening ? "Stop listening" : "Speak to AIM Bot"}
                                            >
                                                {isListening ? <Mic className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={handleSend}
                                            disabled={isThinking || !inputText.trim()}
                                            className="h-11 w-11 rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg active:scale-95 bg-primary text-white"
                                        >
                                            {isThinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating Trigger Button Container */}
                    <div className="relative group">
                        {/* Pulse Ring */}
                        {!isOpen && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-ping duration-[3s]"></span>
                        )}

                        {/* Tooltip Label (fades in on hover or periodically) */}
                        <AnimatePresence>
                            {showTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        y: [0, -8, 0] // Gentle bounce using Framer Motion
                                    }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{
                                        y: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                    className={`absolute left-full ml-4 top-1/2 -mt-6 bg-card text-card-foreground text-sm font-semibold pl-4 pr-9 py-2 rounded-xl shadow-xl border border-primary/20 whitespace-nowrap z-[60] pointer-events-auto ${isOpen ? "hidden" : "block"}`}
                                >
                                    <span className="relative z-10">Chat with AIMbot! 👋</span>

                                    {/* Close Button - High Z-Index & Hit Area */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowTooltip(false);
                                        }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors cursor-pointer z-50 group-hover:scale-110"
                                        aria-label="Close tooltip"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Triangle Arrow - pointing left */}
                                    <div className="absolute left-0 top-1/2 -translate-x-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-card border-l border-b border-primary/20 rotate-45"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Button - Draggable */}
                        <motion.button
                            animate={isOpen ? {} : {
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                            }}
                            whileHover={isDragging ? {} : { scale: 1.1, rotate: 0 }}
                            whileTap={isDragging ? {} : { scale: 0.9 }}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            onClick={handleButtonClick}
                            className={`relative w-16 h-16 rounded-full shadow-[0_10px_30_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 border-[3px] border-white/20 backdrop-blur-sm select-none ${isOpen
                                ? "bg-slate-800 rotate-90"
                                : "bg-gradient-to-br from-primary to-primary/80 hover:brightness-110"
                                } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                        >
                            {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-8 w-8 text-white fill-white/20" />}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
