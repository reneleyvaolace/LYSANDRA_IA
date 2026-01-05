"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import {
    Send,
    Bot,
    User,
    Trash2,
    Sparkles,
    Terminal,
    AlertCircle,
    BrainCircuit,
    History,
    RefreshCw
} from "lucide-react";
import { sendMessageToAI, getTestSettings } from "./actions";

interface Message {
    role: "user" | "model";
    content: string;
    timestamp: Date;
}

export default function TestPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [currentModel, setCurrentModel] = useState<string>("Cargando...");
    const [agentInfo, setAgentInfo] = useState({ name: "Cargando...", image: "" });
    const [imageLoadError, setImageLoadError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getTestSettings();
            console.log('🔍 Agent Settings Loaded:', settings);
            setCurrentModel(settings.aiModel);
            setAgentInfo({ name: settings.agentName, image: settings.agentImage });
            console.log('🖼️ Agent Image URL:', settings.agentImage);
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Prepare history for API
        const history = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const result = await sendMessageToAI(input, history);

        if (result.success) {
            setMessages(prev => [...prev, {
                role: "model",
                content: result.text || "",
                timestamp: new Date()
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: "model",
                content: "⚠️ Error: " + result.text,
                timestamp: new Date()
            }]);
        }

        setIsTyping(false);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-cyan-400 font-bold" />
                        Laboratorio IA
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Prueba el comportamiento de {agentInfo.name} con el prompt de sistema actual.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/5 text-xs font-mono text-zinc-400">
                        <span className="text-zinc-600">Modelo:</span> <span className="text-cyan-400">{currentModel}</span>
                    </div>
                    <button
                        onClick={async () => {
                            const settings = await getTestSettings();
                            console.log('🔄 Recargando configuración:', settings);
                            setCurrentModel(settings.aiModel);
                            setAgentInfo({ name: settings.agentName, image: settings.agentImage });
                            setImageLoadError(false); // Reset error state
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recargar Config
                    </button>
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/5"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="flex-1 glass rounded-[3rem] border-white/5 flex flex-col overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-cyan-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Entorno de Pruebas Activo</h3>
                                <p className="text-sm text-zinc-500 max-w-md">
                                    Escribe un mensaje para probar las capacidades de {agentInfo.name}. Puedes consultar sobre servicios, agendar citas o hacer preguntas generales.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${msg.role === 'user' ? 'bg-cyan-500' : 'bg-purple-600/20 border border-purple-500/30'
                                }`}>
                                {msg.role === 'user' ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (agentInfo.image && !imageLoadError) ? (
                                    <img
                                        src={agentInfo.image}
                                        alt={agentInfo.name}
                                        className="w-full h-full object-cover"
                                        onError={() => {
                                            console.error('❌ Failed to load agent image:', agentInfo.image);
                                            setImageLoadError(true);
                                        }}
                                        onLoad={() => {
                                            console.log('✅ Agent image loaded successfully');
                                        }}
                                    />
                                ) : (
                                    <Bot className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-zinc-800 text-white rounded-tr-none border border-white/5'
                                    : 'bg-zinc-900/50 text-zinc-200 rounded-tl-none border border-white/5 backdrop-blur-sm'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="markdown-content prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeHighlight]}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-zinc-600 font-mono">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 animate-pulse overflow-hidden">
                                {agentInfo.image ? (
                                    <img src={agentInfo.image} alt={agentInfo.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Bot className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div className="flex gap-1.5 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-2 border border-white/10 focus-within:border-cyan-500/50 transition-all"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje de prueba..."
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 text-sm text-white"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
