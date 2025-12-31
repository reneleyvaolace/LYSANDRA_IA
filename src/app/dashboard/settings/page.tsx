"use client";

import { useState, useEffect } from "react";
import {
    getCompanySettings,
    updateCompanySettings,
    getAIModelMetrics,
    CompanySettings,
    AIModelMetrics
} from "./actions";
import {
    Building2,
    Mail,
    Phone,
    Globe,
    FileText,
    Clock,
    Save,
    CheckCircle2,
    Briefcase,
    ShieldCheck,
    Smartphone,
    Cpu,
    Zap,
    AlertTriangle,
    RefreshCw
} from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [metrics, setMetrics] = useState<AIModelMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "fiscal" | "horarios" | "ia">("general");

    const loadSettings = async () => {
        const data = await getCompanySettings();
        setSettings(data);
        if (data.aiModel) {
            const metricsData = await getAIModelMetrics(data.aiModel);
            setMetrics(metricsData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        const result = await updateCompanySettings(settings);
        setIsSaving(false);
        if (result.success) {
            setSaveSuccess(true);
            const metricsData = await getAIModelMetrics(settings.aiModel);
            setMetrics(metricsData);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General", icon: Building2 },
        { id: "ia", label: "IA & Modelos", icon: Cpu },
        { id: "fiscal", label: "Datos Fiscales", icon: FileText },
        { id: "horarios", label: "Horarios", icon: Clock },
    ];

    const availableModels = [
        { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", desc: "Modelo ligero y eficiente. 1000 solicitudes/día GRATIS. Ideal para uso intensivo.", tier: "Gratuito" },
        { id: "gemini-flash-latest", name: "Gemini 1.5 Flash", desc: "Equilibrio perfecto entre velocidad y capacidad. Recomendado para producción.", tier: "Estable" },
        { id: "gemini-2.0-flash", name: "Gemini-2.0-Flash", desc: "Última generación. Respuestas ultra-rápidas, cuotas experimentales.", tier: "Experimental" },
        { id: "gemini-pro-latest", name: "Gemini 1.5 Pro", desc: "Máxima inteligencia y razonamiento. Ideal para tareas complejas.", tier: "Premium" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Panel de Control Operativo
                    </h1>
                    <p className="text-zinc-500 mt-2">Configura el comportamiento, identidad e inteligencia de Lysandra.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${saveSuccess
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 glow-green"
                        : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:opacity-90 active:scale-95 shadow-lg shadow-cyan-500/10"
                        }`}
                >
                    {isSaving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : saveSuccess ? (
                        <CheckCircle2 className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saveSuccess ? "Ajustes Guardados" : "Guardar Cambios"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            //@ts-ignore
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                ? "bg-white/10 text-cyan-400 border border-white/5"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="glass rounded-3xl border-white/5 p-8 relative overflow-hidden">
                        {activeTab === "general" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-cyan-500" />
                                        Identidad Corporativa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Nombre Comercial</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={settings.companyName}
                                                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Email de Soporte</label>
                                            <div className="relative">
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                                <input
                                                    type="email"
                                                    value={settings.supportEmail}
                                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-cyan-500" />
                                        Canales de IA
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">WhatsApp Business</label>
                                            <div className="relative">
                                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                                <input
                                                    type="text"
                                                    value={settings.whatsappNumber}
                                                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Zona Horaria</label>
                                            <div className="relative">
                                                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                                <input
                                                    type="text"
                                                    value={settings.timezone}
                                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "ia" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-purple-500" />
                                            Selección de Inteligencia
                                        </h3>
                                        <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase border border-purple-500/20">
                                            Google Gemini API
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mb-10">
                                        {availableModels.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setSettings({ ...settings, aiModel: model.id })}
                                                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${settings.aiModel === model.id
                                                    ? "bg-purple-500/5 border-purple-500/50 glow-purple"
                                                    : "bg-zinc-950/30 border-white/5 hover:border-white/10"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.aiModel === model.id ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-white text-sm">{model.name}</h4>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${model.tier === 'Experimental' ? 'bg-amber-500/20 text-amber-400' :
                                                                model.tier === 'Premium' ? 'bg-cyan-500/20 text-cyan-400' :
                                                                    model.tier === 'Gratuito' ? 'bg-green-500/20 text-green-400' :
                                                                        'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {model.tier}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{model.desc}</p>
                                                </div>
                                                {settings.aiModel === model.id && (
                                                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-zinc-400">Consumo y Cuotas</h3>
                                            {metrics?.status === "limited" && (
                                                <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 text-[10px] font-bold animate-pulse">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    CUOTA AGOTADA
                                                </div>
                                            )}
                                        </div>

                                        {metrics && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Requests Usage */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs text-zinc-500 font-medium">Llamadas por Minuto (RPM)</span>
                                                        <span className={`text-xs font-bold font-mono ${metrics.status === 'limited' ? 'text-red-400' : 'text-zinc-300'}`}>
                                                            {metrics.requestsUsed} / {metrics.requestsLimit}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${metrics.status === 'limited' ? 'bg-red-500 glow-red' : 'bg-cyan-500 glow-cyan'}`}
                                                            style={{ width: `${(metrics.requestsUsed / metrics.requestsLimit) * 100}%` }}
                                                        />
                                                    </div>
                                                    {metrics.resetInSeconds > 0 && (
                                                        <p className="text-[10px] text-zinc-600 font-medium italic">
                                                            * Se reinicia en aprox. {metrics.resetInSeconds} segundos
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Tokens Usage */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs text-zinc-500 font-medium">Tokens por Minuto (TPM)</span>
                                                        <span className="text-xs text-zinc-300 font-bold font-mono">
                                                            {(metrics.tokensUsed / 1000).toFixed(1)}k / {(metrics.tokensLimit / 1000).toFixed(1)}k
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-purple-500 transition-all duration-1000 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                                            style={{ width: `${(metrics.tokensUsed / metrics.tokensLimit) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "fiscal" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-cyan-500" />
                                        Información Legal
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Razón Social</label>
                                            <input
                                                type="text"
                                                value={settings.fiscalName}
                                                onChange={(e) => setSettings({ ...settings, fiscalName: e.target.value })}
                                                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-400 px-1 italic">RFC</label>
                                                <input
                                                    type="text"
                                                    value={settings.rfc}
                                                    onChange={(e) => setSettings({ ...settings, rfc: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Domicilio Fiscal Completo</label>
                                            <textarea
                                                rows={3}
                                                value={settings.fiscalAddress}
                                                onChange={(e) => setSettings({ ...settings, fiscalAddress: e.target.value })}
                                                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium resize-none"
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] text-zinc-600 italic">
                                        * Esta información es utilizada por Lysandra para resolver dudas sobre facturación y contratos.
                                    </p>
                                </section>
                            </div>
                        )}

                        {activeTab === "horarios" && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-cyan-500" />
                                        Horarios de Atención
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(settings.businessHours).map(([day, hours]) => (
                                            <div key={day} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/30 border border-white/5">
                                                <span className="text-sm font-medium text-zinc-400 capitalize">{day}</span>
                                                <input
                                                    type="text"
                                                    //@ts-ignore
                                                    value={hours}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        businessHours: {
                                                            ...settings.businessHours,
                                                            [day]: e.target.value
                                                        }
                                                    })}
                                                    className="bg-transparent border-none text-right text-sm text-white focus:ring-0 p-0 w-32 font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
