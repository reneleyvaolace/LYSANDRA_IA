"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import {
    getConversations,
    getConversationHistory,
    Conversation,
    Message
} from "./actions";
import {
    Search,
    User,
    Phone,
    Clock,
    MessageCircle,
    ShieldCheck,
    Send,
    MoreVertical,
    RefreshCw
} from "lucide-react";

export default function ChatsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function load() {
            const data = await getConversations();
            setConversations(data);
            setIsLoading(false);
            if (data.length > 0) {
                // Seleccionar el primero por defecto
                handleSelectChat(data[0].phoneNumber);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSelectChat = async (id: string) => {
        setSelectedChat(id);
        setIsHistoryLoading(true);
        const chatHistory = await getConversationHistory(id);
        setHistory(chatHistory);
        setIsHistoryLoading(false);
    };

    return (
        <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* List Side */}
            <div className="w-80 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Conversaciones</h1>
                    <p className="text-xs text-zinc-500">Monitorea la actividad de Lysandra en tiempo real.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar por número..."
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                        ))
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                            <p className="text-sm text-zinc-600 font-medium">No hay chats activos.</p>
                        </div>
                    ) : (
                        conversations.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => handleSelectChat(chat.phoneNumber)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${selectedChat === chat.phoneNumber
                                    ? "bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]"
                                    : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedChat === chat.phoneNumber ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-700'}`} />
                                        {chat.phoneNumber}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {new Date(chat.lastActive || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors">
                                    {chat.lastMessage}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Side */}
            <div className="flex-1 glass rounded-3xl border-white/5 flex flex-col overflow-hidden relative">
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                            <MessageCircle className="w-8 h-8 text-zinc-800" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Selecciona un chat</h3>
                        <p className="text-zinc-500 max-w-xs">
                            Selecciona una conversación de la lista para ver el historial completo entre el usuario y Lysandra.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-cyan-400 glow-cyan">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{selectedChat}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">WhatsApp Business</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                        <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Cifrado
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </header>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                        >
                            {isHistoryLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                                </div>
                            ) : history.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-2">
                                        {msg.role === 'model' && (
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-500/30">
                                                <img
                                                    src="/images/lysandra-avatar.png"
                                                    alt="Lysandra AI"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${msg.role === 'user' ? 'text-zinc-500' : 'text-cyan-500'}`}>
                                            {msg.role === 'user' ? 'Usuario' : 'Lysandra AI'}
                                        </span>
                                        <Clock className="w-3 h-3 text-zinc-700" />
                                        <span className="text-[10px] text-zinc-700 font-mono">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? "bg-zinc-800 text-zinc-200 rounded-tr-none border border-white/5"
                                        : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-white rounded-tl-none border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
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
                                </div>
                            ))}
                        </div>

                        {/* Footer / Input (ReadOnly for now) */}
                        <footer className="p-6 border-t border-white/5 bg-zinc-950/20 relative">
                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                            <div className="flex items-center gap-4 bg-zinc-900/50 rounded-2xl p-2 border border-white/5 opacity-50 cursor-not-allowed">
                                <input
                                    disabled
                                    type="text"
                                    placeholder="La monitorización está en modo lectura..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-zinc-500"
                                />
                                <button disabled className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-zinc-600 mt-2 font-medium italic">
                                Interactúa directamente desde WhatsApp. Este panel es solo para supervisión.
                            </p>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}
