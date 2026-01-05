"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, MessageSquare, Smartphone, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function WhatsAppSimulatorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [phoneNumber] = useState("+52 55 1234 5678"); // Número simulado
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

        try {
            // Simular mensaje de WhatsApp al webhook
            const whatsappPayload = {
                object: 'whatsapp_business_account',
                entry: [{
                    id: 'simulator_entry',
                    changes: [{
                        value: {
                            messaging_product: 'whatsapp',
                            metadata: {
                                display_phone_number: phoneNumber,
                                phone_number_id: 'simulator_phone_id'
                            },
                            contacts: [{
                                profile: {
                                    name: 'Usuario Simulado'
                                },
                                wa_id: phoneNumber.replace(/\s/g, '')
                            }],
                            messages: [{
                                from: phoneNumber.replace(/\s/g, ''),
                                id: `sim_${Date.now()}`,
                                timestamp: Date.now().toString(),
                                text: {
                                    body: input
                                },
                                type: 'text'
                            }]
                        },
                        field: 'messages'
                    }]
                }]
            };

            // Llamar al webhook local
            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(whatsappPayload)
            });

            if (response.ok) {
                const data = await response.json();

                // La respuesta del webhook contiene el mensaje de Lysandra
                if (data.reply) {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: data.reply,
                        timestamp: new Date()
                    }]);
                }
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "⚠️ Error: No se pudo procesar el mensaje. Verifica que el servidor esté corriendo.",
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "⚠️ Error de conexión. Asegúrate de que el servidor esté corriendo (npm run dev).",
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Smartphone className="w-8 h-8 text-green-400" />
                        Simulador WhatsApp
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Prueba Lysandra sin configurar Meta. Funciona exactamente como WhatsApp real.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/5 text-xs font-mono text-zinc-400">
                        <span className="text-zinc-600">Número:</span> <span className="text-green-400">{phoneNumber}</span>
                    </div>
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/5"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 glass rounded-[3rem] border-white/5 flex flex-col overflow-hidden">
                {/* WhatsApp-style header */}
                <div className="bg-green-600 px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">Lysandra IA</h3>
                        <p className="text-xs text-white/80">Asistente Virtual de CoreAura</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/20 text-xs text-white font-bold">
                        SIMULADOR
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-[#0a0a0a]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px)'
                    }}
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-white/10 flex items-center justify-center">
                                <MessageSquare className="w-10 h-10 text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Simulador WhatsApp Activo</h3>
                                <p className="text-sm text-zinc-500 max-w-md">
                                    Escribe un mensaje para probar Lysandra. Funciona exactamente como WhatsApp real,
                                    pero sin necesidad de configurar Meta.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                <button
                                    onClick={() => setInput("Hola")}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-all border border-white/5"
                                >
                                    💬 "Hola"
                                </button>
                                <button
                                    onClick={() => setInput("¿Qué día es hoy?")}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-all border border-white/5"
                                >
                                    📅 "¿Qué día es hoy?"
                                </button>
                                <button
                                    onClick={() => setInput("Quiero una cita para el próximo lunes")}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-all border border-white/5"
                                >
                                    🗓️ "Quiero una cita para el próximo lunes"
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-cyan-500' : 'bg-green-500'
                                }`}>
                                {msg.role === 'user' ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (
                                    <Bot className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-cyan-500 text-white rounded-tr-none'
                                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="markdown-content prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-zinc-600 font-mono mt-1 px-2">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 animate-pulse">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex gap-1.5 p-4 bg-zinc-800 rounded-2xl border border-white/5">
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-2 border border-white/10 focus-within:border-green-500/50 transition-all"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 text-sm text-white placeholder:text-zinc-600"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Info Panel */}
            <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Información del Simulador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                        <p className="text-zinc-600">Estado</p>
                        <p className="text-white font-bold">✅ Activo</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-600">Número Simulado</p>
                        <p className="text-white font-mono">{phoneNumber}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-600">Mensajes Enviados</p>
                        <p className="text-white font-bold">{messages.filter(m => m.role === 'user').length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
