"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Settings,
    ShieldCheck,
    BrainCircuit,
    Terminal,
    LogOut,
    Database
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.HTMLAttributes<HTMLDivElement>["children"];
}) {
    const pathname = usePathname();
    const menuItems = [
        { icon: LayoutDashboard, label: "Vista General", href: "/dashboard" },
        { icon: MessageSquare, label: "Conversaciones", href: "/dashboard/chats" },
        { icon: Terminal, label: "Laboratorio IA", href: "/dashboard/test" },
        { icon: Calendar, label: "Citas Agendadas", href: "/dashboard" },
        { icon: BrainCircuit, label: "Entrenamiento IA", href: "/dashboard/training" },
        { icon: Database, label: "Base de Conocimiento", href: "/dashboard/knowledge" },
        { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
    ];

    return (
        <div className="flex min-h-screen bg-[#0a0a0c] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center glow-purple">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold tracking-tight text-xl">LYSANDRA</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">CoreAura AI Control</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-white/5 ${isActive ? "bg-white/5 text-cyan-400" : "text-zinc-400"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors group-hover:text-cyan-400 ${isActive ? "text-cyan-400" : ""
                                    }`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/30 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-xs font-bold">RL</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">Rene Leyva</p>
                            <p className="text-xs text-zinc-500 truncate">Admin</p>
                        </div>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md flex items-center justify-between px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500">Status:</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-400">Gemini-2.0-Flash Sincronizado</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs font-mono text-zinc-500">v1.2.0-stable</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-transparent to-purple-900/5">
                    {children}
                </div>
            </main>
        </div>
    );
}
