import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Bot, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
};

export default function AIVoicePage() {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Hello! I'm your AIM Centre assistant. I'm here to help with all your educational questions! 🎓", sender: "ai" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initialize Speech Synthesis and find a female voice
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.includes("Google US English") ||
                v.name.includes("Zira") ||
                v.name.includes("Female")
            ) || voices[0];
            setVoice(femaleVoice);
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = "en-US";
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleUserMessage(transcript);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.pitch = 1.1;
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const getAIResponse = async (userText: string) => {
        setIsThinking(true);
        const models = [
            "meta-llama/llama-3.1-8b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "microsoft/phi-3-medium-128k-instruct:free",
            "qwen/qwen-2-7b-instruct:free"
        ];

        let lastError = "";

        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "AIM Centre 360 Client",
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": [
                            {
                                "role": "system",
                                "content": `You are "AIM Bot", a friendly, humorous, and educational AI assistant for "AIM Centre 360".
              
              YOUR PERSONA:
              - Friendly (use emojis).
              - Humorous and witty.
              - Expert on education, special needs (Autism), and mental health.
              
              YOUR KNOWLEDGE BASE:
              - **Tiny Explorers**: Preschool.
              - **Special Needs**: Autism support.
              - **Courses**: Academic, Spoken English, Pottery.
              - **Mental Health**: Counseling.
              - **Booking**: "Click 'Enroll Now'!".
              
              INSTRUCTIONS:
              - Short answer (max 2 sentences).
              - Be fun!
              `
                            },
                            {
                                "role": "user",
                                "content": userText
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errMsg = `Error ${response.status}: ${errorData.error?.message || response.statusText}`;
                    console.error(`Failed ${model}:`, errMsg);
                    lastError = errMsg;
                    continue; // Try next model
                }

                const data = await response.json();
                if (!data.choices?.[0]?.message?.content) {
                    throw new Error("Empty response from AI");
                }

                setIsThinking(false);
                return data.choices[0].message.content;

            } catch (error: any) {
                console.error(`Exception with ${model}:`, error);
                lastError = error.message;
            }
        }

        setIsThinking(false);
        return `I'm having trouble connecting to all my brain cells today! 🤯 (Debug: ${lastError})`;
    };

    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg: Message = { id: Date.now().toString(), text, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");

        // Get AI Response
        const responseText = await getAIResponse(text);

        const aiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: "ai" };
        setMessages(prev => [...prev, aiMsg]);
        speak(responseText);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col pt-20">
            <div className="container max-w-2xl flex-1 flex flex-col py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                    >
                        <Bot className="h-10 w-10 text-primary" />
                        {isSpeaking && (
                            <span className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></span>
                        )}
                    </motion.div>
                    <h1 className="text-3xl font-serif font-bold">AIM Voice Assistant</h1>
                    <p className="text-muted-foreground">Ask me about courses, pricing, or special needs support</p>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-card border border-border rounded-xl p-4 mb-4 overflow-y-auto min-h-[400px] shadow-sm">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    {msg.text}
                                </div>
                            </motion.div>
                        ))}
                        {isThinking && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 flex-row"
                            >
                                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="rounded-2xl px-4 py-2 bg-muted text-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUserMessage(inputText)}
                            placeholder="Type your question..."
                            className="pr-12"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            onClick={() => handleUserMessage(inputText)}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        size="icon"
                        onClick={toggleListening}
                        className={`rounded-full transition-all duration-300 ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                    >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => window.speechSynthesis.cancel()}
                        className="rounded-full"
                    >
                        {isSpeaking ? <Volume2 className="h-5 w-5 animate-pulse text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
