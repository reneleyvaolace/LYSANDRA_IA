"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Target,
    MessageSquare,
    Zap,
    TrendingUp,
    Activity,
    Calendar,
    Clock,
    RefreshCw
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getDashboardData, DashboardMetrics } from "./actions";

interface Appointment {
    id: string;
    clientName: string;
    date: string;
    type: string;
    status: string;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState("resumen");
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);

        // Use real appointments from data if possible, or mock for now if action doesn't return list
        // (Improving the action to return limited list for summary)
        setAppointments([
            { id: "1", clientName: "Juan Pérez", date: new Date().toISOString(), type: "Consultoría IA", status: "confirmed" },
            { id: "2", clientName: "Maria García", date: new Date().toISOString(), type: "Soporte Técnico", status: "pending" },
        ]);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: "Total Interacciones", value: data.totalInteractions.toString(), icon: MessageSquare, color: "text-blue-400" },
        { label: "Citas Agendadas", value: data.scheduledAppointments.toString(), icon: Target, color: "text-purple-400" },
        { label: "Leads Generados", value: data.capturedLeads.toString(), icon: Users, color: "text-cyan-400" },
        { label: "Tasa de Éxito", value: `${data.successRate}%`, icon: Zap, color: "text-amber-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Rene</span>
                    </h1>
                    <p className="text-zinc-500 max-w-2xl">
                        Monitoriza el rendimiento de Lysandra en tiempo real.
                        Última actualización: {new Date().toLocaleTimeString()}
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                    <RefreshCw className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl space-y-3 transition-transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Acumulado</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl w-fit border border-white/5">
                {["resumen", "citas", "métricas"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab
                            ? "bg-zinc-800 text-cyan-400 shadow-lg border border-white/5"
                            : "text-zinc-500 hover:text-white"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === "resumen" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass rounded-2xl p-6 border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                Actividad Cruda
                            </h3>
                            <button className="text-xs text-zinc-500 hover:text-white">Ver todo</button>
                        </div>
                        <div className="space-y-4">
                            {data.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-white/5 group hover:border-cyan-500/30 transition-colors">
                                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${activity.status === 'success' ? 'text-green-400' : 'text-zinc-400'
                                        }`}>
                                        {activity.status === 'success' ? <Calendar className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-zinc-200">{activity.user}</p>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <p className="text-xs text-zinc-400">{activity.action}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6 border-white/5">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Estado del Núcleo
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-zinc-400">Latencia de Inferencia</span>
                                    <span className="text-cyan-400 font-bold">{data.modelHealth.latency}</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[85%] glow-cyan" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-zinc-400">Uptime del Motor</span>
                                    <span className="text-purple-400 font-bold">{data.modelHealth.uptime}</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[99%]" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">Tokens Procesados</span>
                                    <span className="text-zinc-300 font-mono">{data.modelHealth.tokensUsed}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform">
                                <Zap className="w-12 h-12 text-cyan-400" />
                            </div>
                            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-tighter mb-1 relative z-10">IA Insight</p>
                            <p className="text-xs text-cyan-200/70 leading-relaxed relative z-10">
                                La mayor densidad de consultas ocurre entre las 10:00 AM y 2:00 PM. Recomendamos optimizar el prompt para cierres rápidos en ese horario.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "citas" && (
                <div className="glass rounded-2xl p-6 border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Registro de Conversión
                        </h3>
                    </div>
                    <Table>
                        <TableCaption className="text-zinc-600">Historial gestionado por Lysandra.</TableCaption>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableHead className="text-zinc-400">Prospecto</TableHead>
                                <TableHead className="text-zinc-400">Fecha / Hora</TableHead>
                                <TableHead className="text-zinc-400">Servicio</TableHead>
                                <TableHead className="text-zinc-400 text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.map((apt) => (
                                <TableRow key={apt.id} className="border-white/5 hover:bg-white/10 transition-colors group">
                                    <TableCell className="font-bold text-white group-hover:text-cyan-400 transition-colors">{apt.clientName}</TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-xs">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(apt.date).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-zinc-300 bg-white/5 px-2 py-1 rounded-md text-xs">{apt.type}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${apt.status === 'confirmed'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 glow-green'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {activeTab === "métricas" && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Interactions Chart */}
                        <div className="glass rounded-3xl p-8 border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold">Interacciones Diarias</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Volumen de mensajes procesados por Lysandra</p>
                                </div>
                                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                {data.dailyInteractions.map((item, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="relative w-full flex justify-center items-end h-48">
                                            {/* Bar */}
                                            <div
                                                className="w-full bg-gradient-to-t from-cyan-600/20 to-cyan-400 rounded-t-lg transition-all duration-500 group-hover:to-white group-hover:glow-cyan"
                                                style={{ height: `${(item.count / 30) * 100}%` }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.count}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white transition-colors uppercase font-mono">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conversion Breakdown */}
                        <div className="glass rounded-3xl p-8 border-white/5 flex flex-col">
                            <h3 className="text-xl font-bold mb-8">Distribución de Intenciones</h3>
                            <div className="space-y-6 flex-1">
                                {[
                                    { label: "Agendar Cita", value: 45, color: "bg-cyan-500" },
                                    { label: "Consulta de Precios", value: 30, color: "bg-purple-500" },
                                    { label: "Soporte Técnico", value: 15, color: "bg-zinc-500" },
                                    { label: "Otros", value: 10, color: "bg-zinc-800" },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end text-xs">
                                            <span className="text-zinc-400 font-medium">{item.label}</span>
                                            <span className="text-white font-bold">{item.value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5">
                                            <div
                                                className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20">
                                        <Zap className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Eficiencia Óptima</p>
                                        <p className="text-[10px] text-zinc-500">Lysandra resolvió el 88% de las dudas sin intervención humana.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
