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
    History
} from "lucide-react";
import { sendMessageToAI } from "./actions";

interface Message {
    role: "user" | "model";
    content: string;
    timestamp: Date;
}

export default function TestPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
                        Prueba el comportamiento de Lysandra con el prompt de sistema actual.
                    </p>
                </div>
                <button
                    onClick={clearChat}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-bold"
                >
                    <Trash2 className="w-4 h-4" />
                    Limpiar Consola
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Chat Area */}
                <div className="lg:col-span-3 flex flex-col glass rounded-3xl border border-white/5 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center animate-pulse">
                                    <BrainCircuit className="w-8 h-8 text-zinc-700" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Consola de Pruebas</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2">
                                        Inicia una conversación para validar cómo responde Lysandra a diferentes escenarios.
                                        Este chat usa las instrucciones configuradas en "Entrenamiento IA".
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${msg.role === 'user' ? 'bg-cyan-500' : 'bg-purple-600/20 border border-purple-500/30'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-5 h-5 text-white" />
                                    ) : (
                                        <img
                                            src="/images/lysandra-avatar.png"
                                            alt="Lysandra AI"
                                            className="w-full h-full object-cover"
                                        />
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
                                            <div className="markdown-content">
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
                                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 animate-pulse overflow-hidden">
                                    <img
                                        src="/images/lysandra-avatar.png"
                                        alt="Lysandra AI"
                                        className="w-full h-full object-cover"
                                    />
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
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4 text-cyan-400">
                            <Sparkles className="w-5 h-5" />
                            <h3 className="font-bold">IA Specs</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Modelo</p>
                                <p className="text-xs text-white font-mono bg-white/5 p-2 rounded">gemini-2.0-flash</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">System Instruction</p>
                                <div className="p-2 rounded bg-zinc-900/50 border border-white/5">
                                    <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                        "Cargado dinámicamente desde Firestore/settings/main..."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4 text-purple-400">
                            <AlertCircle className="w-5 h-5" />
                            <h3 className="font-bold">Notas de Test</h3>
                        </div>
                        <ul className="space-y-3 text-[11px] text-zinc-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-purple-500">•</span>
                                Las conversaciones aquí no se guardan en el historial del cliente.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-500">•</span>
                                Los Function Calls (Citas) están activos en este entorno.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-500">•</span>
                                Úsalo para probar prompts negativos o límites éticos.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
