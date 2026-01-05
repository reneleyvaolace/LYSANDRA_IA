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
    RefreshCw,
    Pencil,
    CalendarClock,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { format, addMonths, startOfMonth, addDays, getDay } from "date-fns";
import { es } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getDashboardData, DashboardMetrics, deleteAppointment, updateAppointment } from "./actions";

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
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [isDeletingApt, setIsDeletingApt] = useState<Appointment | null>(null);
    const [newDateInput, setNewDateInput] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [calendarView, setCalendarView] = useState(new Date());

    const loadData = async () => {
        setIsLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);

        if (dashboardData.appointments) {
            setAppointments(dashboardData.appointments);
        }
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
                                <TableHead className="text-zinc-400">Estado</TableHead>
                                <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
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
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${apt.status === 'confirmed'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 glow-green'
                                            : apt.status === 'cancelled'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                title="Reagendar"
                                                onClick={() => {
                                                    setSelectedApt(apt);
                                                    setNewDateInput(new Date(apt.date).toISOString().slice(0, 16));
                                                }}
                                                className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                                            >
                                                <CalendarClock className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="Marcar como Confirmada"
                                                onClick={() => updateAppointment(apt.id, { status: "confirmed" }).then(() => loadData())}
                                                className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="Eliminar"
                                                onClick={() => setIsDeletingApt(apt)}
                                                className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
            {/* Modal de Reagendado con Calendario Visual */}
            {selectedApt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setSelectedApt(null)}
                    />
                    <div className="relative glass w-full max-w-2xl rounded-[3rem] border-white/10 p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg glow-cyan">
                                        <CalendarClock className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight text-white">Reagendar Cita</h3>
                                        <p className="text-zinc-500 font-medium text-sm">Ajusta la fecha para {selectedApt.clientName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedApt(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all group"
                                >
                                    <XCircle className="w-8 h-8 text-zinc-700 group-hover:text-red-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Selector Visual de Calendario */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="font-bold text-zinc-200 capitalize">
                                            {format(calendarView, 'MMMM yyyy', { locale: es })}
                                        </h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCalendarView(addMonths(calendarView, -1))} className="p-1.5 hover:bg-white/10 rounded-lg border border-white/5 text-zinc-400">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setCalendarView(addMonths(calendarView, 1))} className="p-1.5 hover:bg-white/10 rounded-lg border border-white/5 text-zinc-400">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                                            <span key={d} className="text-[10px] font-bold text-zinc-600 uppercase">{d}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: 35 }).map((_, i) => {
                                            const monthStart = startOfMonth(calendarView);
                                            const day = addDays(monthStart, i - (getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1));
                                            const isSelected = newDateInput.startsWith(format(day, 'yyyy-MM-dd'));
                                            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                            const isCurrentMonth = format(day, 'MM') === format(calendarView, 'MM');

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const currentTime = newDateInput.includes('T') ? newDateInput.split('T')[1] : "10:00";
                                                        setNewDateInput(`${format(day, 'yyyy-MM-dd')}T${currentTime}`);
                                                    }}
                                                    className={`aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${isSelected
                                                            ? "bg-cyan-500 text-white border-cyan-400 shadow-lg"
                                                            : isToday
                                                                ? "bg-white/5 text-cyan-400 border-white/10"
                                                                : !isCurrentMonth
                                                                    ? "text-zinc-800 border-transparent pointer-events-none"
                                                                    : "hover:bg-white/5 text-zinc-500 border-transparent"
                                                        }`}
                                                >
                                                    {format(day, 'd')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selector de Hora y Resumen */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block px-1">Seleccionar Hora</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(h => (
                                                <button
                                                    key={h}
                                                    onClick={() => {
                                                        const currentDate = newDateInput.includes('T') ? newDateInput.split('T')[1] : format(new Date(), 'yyyy-MM-dd');
                                                        setNewDateInput(`${newDateInput.split('T')[0]}T${h}`);
                                                    }}
                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${newDateInput.includes(h)
                                                            ? "bg-purple-600 text-white border-purple-400 glow-purple"
                                                            : "bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/20"
                                                        }`}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-zinc-950 border border-white/5 space-y-3 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Resumen del Cambio</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                        </div>
                                        <div className="space-y-1 relative z-10">
                                            <p className="text-sm font-bold text-zinc-200 capitalize">
                                                {newDateInput ? format(new Date(newDateInput.replace(' ', 'T')), "EEEE dd 'de' MMMM", { locale: es }) : '---'}
                                            </p>
                                            <p className="text-3xl font-black text-cyan-400">
                                                {newDateInput.includes('T') ? newDateInput.split('T')[1] : '00:00'}
                                                <span className="text-[10px] text-zinc-600 font-bold ml-2 tracking-widest uppercase">hrs</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 relative z-10">
                                <button
                                    onClick={() => setSelectedApt(null)}
                                    className="flex-1 px-8 py-5 rounded-2xl bg-zinc-900 text-zinc-400 font-bold hover:bg-zinc-800 transition-all border border-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={isUpdating || !newDateInput}
                                    onClick={async () => {
                                        setIsUpdating(true);
                                        const res = await updateAppointment(selectedApt.id, { date: new Date(newDateInput).toISOString() });
                                        if (res.success) {
                                            await loadData();
                                            setSelectedApt(null);
                                        }
                                        setIsUpdating(false);
                                    }}
                                    className="flex-1 px-8 py-5 rounded-2xl bg-white text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Confirmar Reagendado <Zap className="w-5 h-5 fill-black" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación Premium */}
            {isDeletingApt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setIsDeletingApt(null)}
                    />
                    <div className="relative glass w-full max-w-sm rounded-[3rem] border-red-500/20 p-12 bg-gradient-to-b from-red-500/10 to-transparent shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in slide-in-from-bottom-12 duration-500 text-center space-y-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <Trash2 className="w-12 h-12 text-red-500" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-white">¿Destruir Registro?</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Estás eliminando la cita de <span className="text-red-400 font-bold">{isDeletingApt.clientName}</span>. Esta acción es irreversible en el núcleo de Lysandra.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={async () => {
                                    const res = await deleteAppointment(isDeletingApt.id);
                                    if (res.success) {
                                        await loadData();
                                        setIsDeletingApt(null);
                                    }
                                }}
                                className="w-full py-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20"
                            >
                                Sí, Eliminar de Firestore
                            </button>
                            <button
                                onClick={() => setIsDeletingApt(null)}
                                className="w-full py-5 rounded-2xl bg-white/5 text-zinc-500 font-bold hover:bg-white/10 transition-all border border-white/5"
                            >
                                No, Conservar Cita
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
