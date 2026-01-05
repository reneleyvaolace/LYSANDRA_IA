"use client";

import { useState, useEffect } from "react";
import {
    getCompanySettings,
    updateCompanySettings,
    getAIModelMetrics,
    CompanySettings,
    AIModelMetrics,
    resetSystemData,
    uploadAgentAvatar
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
    RefreshCw,
    Database,
    Trash2,
    Settings,
    MessageSquare,
    Calendar,
    FileCode,
    MapPin,
    Hash,
    User,
    Sparkles,
    Bot,
    Upload,
    Code,
    Image as ImageIcon
} from "lucide-react";

// Zonas horarias más comunes
const TIMEZONES = [
    { value: "America/Mexico_City", label: "Ciudad de México (CST/CDT)" },
    { value: "America/Cancun", label: "Cancún (EST)" },
    { value: "America/Monterrey", label: "Monterrey (CST/CDT)" },
    { value: "America/Tijuana", label: "Tijuana (PST/PDT)" },
    { value: "America/New_York", label: "Nueva York (EST/EDT)" },
    { value: "America/Los_Angeles", label: "Los Ángeles (PST/PDT)" },
    { value: "America/Chicago", label: "Chicago (CST/CDT)" },
    { value: "America/Denver", label: "Denver (MST/MDT)" },
    { value: "America/Bogota", label: "Bogotá (COT)" },
    { value: "America/Lima", label: "Lima (PET)" },
    { value: "America/Santiago", label: "Santiago (CLT)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
    { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
    { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
    { value: "Europe/London", label: "Londres (GMT/BST)" },
    { value: "Europe/Paris", label: "París (CET/CEST)" },
    { value: "Asia/Tokyo", label: "Tokio (JST)" },
    { value: "Asia/Shanghai", label: "Shanghái (CST)" },
    { value: "UTC", label: "UTC (Tiempo Universal)" }
];

// Formatos de fecha
const DATE_FORMATS = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (05/01/2026)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (01/05/2026)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-01-05)" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY (05-01-2026)" },
    { value: "YYYY/MM/DD", label: "YYYY/MM/DD (2026/01/05)" }
];

// Formatos de hora
const TIME_FORMATS = [
    { value: "24h", label: "24 horas (14:30)" },
    { value: "12h", label: "12 horas (2:30 PM)" }
];

// Modelos por proveedor
const geminiModels = [
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", desc: "Modelo ligero y eficiente. 1000 solicitudes/día GRATIS. Ideal para uso intensivo.", tier: "Gratuito", rpm: "1000/día", tpm: "4M" },
    { id: "gemini-flash-latest", name: "Gemini 1.5 Flash", desc: "Equilibrio perfecto entre velocidad y capacidad. 15 RPM. Recomendado para producción.", tier: "Estable", rpm: "15", tpm: "1M" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Última generación. Respuestas ultra-rápidas. 10 RPM.", tier: "Experimental", rpm: "10", tpm: "1M" },
    { id: "gemini-pro-latest", name: "Gemini 1.5 Pro", desc: "Máxima inteligencia y razonamiento. 2 RPM. Ideal para tareas complejas.", tier: "Premium", rpm: "2", tpm: "32k" },
];

const openaiModels = [
    { id: "gpt-4o", name: "GPT-4o", desc: "Modelo más avanzado de OpenAI. Multimodal y ultra-rápido. Ideal para producción.", tier: "Premium", rpm: "500", tpm: "30k" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "GPT-4 optimizado. Más rápido y económico. Excelente para tareas complejas.", tier: "Estable", rpm: "500", tpm: "10k" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "Rápido y económico. Perfecto para conversaciones y tareas simples.", tier: "Gratuito", rpm: "3500", tpm: "60k" },
    { id: "gpt-4", name: "GPT-4", desc: "Modelo original GPT-4. Máxima calidad de razonamiento.", tier: "Premium", rpm: "500", tpm: "10k" },
];

const grokModels = [
    { id: "grok-beta", name: "Grok Beta", desc: "Modelo experimental de xAI. Acceso a datos de X/Twitter en tiempo real.", tier: "Experimental", rpm: "60", tpm: "100k" },
    { id: "grok-2-1212", name: "Grok 2", desc: "Última versión estable. Rápido y eficiente. Ideal para producción.", tier: "Estable", rpm: "60", tpm: "100k" },
];

const deepseekModels = [
    { id: "deepseek-chat", name: "DeepSeek Chat", desc: "Modelo de conversación. Muy económico ($0.14/1M tokens). Excelente calidad.", tier: "Gratuito", rpm: "100", tpm: "200k" },
    { id: "deepseek-coder", name: "DeepSeek Coder", desc: "Especializado en código. Ideal para programación y debugging.", tier: "Estable", rpm: "100", tpm: "200k" },
];

const qwenModels = [
    { id: "qwen-turbo", name: "Qwen Turbo", desc: "Modelo rápido y económico. Excelente para conversaciones en múltiples idiomas.", tier: "Gratuito", rpm: "60", tpm: "300k" },
    { id: "qwen-plus", name: "Qwen Plus", desc: "Balance entre velocidad y capacidad. Recomendado para producción.", tier: "Estable", rpm: "60", tpm: "300k" },
    { id: "qwen-max", name: "Qwen Max", desc: "Máxima inteligencia. Ideal para tareas complejas y razonamiento avanzado.", tier: "Premium", rpm: "60", tpm: "300k" },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [metrics, setMetrics] = useState<AIModelMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "fiscal" | "horarios" | "ia" | "mantenimiento">("general");
    const [resetOptions, setResetOptions] = useState({
        metrics: false,
        appointments: false,
        training: false,
        knowledge: false,
        identity: false,
        contact: false,
        fiscal: false,
        address: false,
        hours: false,
        timezone: false,
        agent: false
    });
    const [isResetting, setIsResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

    // Actualizar métricas cuando cambia el modelo de IA
    useEffect(() => {
        if (settings?.aiModel) {
            getAIModelMetrics(settings.aiModel).then(setMetrics);
        }
    }, [settings?.aiModel]);

    // Resetear modelo cuando cambia el proveedor
    useEffect(() => {
        if (!settings) return;

        const provider = settings.aiProvider || 'gemini';
        const models = provider === 'openai' ? openaiModels :
            provider === 'grok' ? grokModels :
                provider === 'deepseek' ? deepseekModels :
                    provider === 'qwen' ? qwenModels :
                        geminiModels;

        // Si el modelo actual no pertenece al nuevo proveedor, poner el primero por defecto
        if (!models.some(m => m.id === settings.aiModel)) {
            setSettings({ ...settings, aiModel: models[0].id });
        }
    }, [settings?.aiProvider]);

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

    const tabs = [
        { id: "general", label: "General", icon: Building2 },
        { id: "ia", label: "IA & Modelos", icon: Cpu },
        { id: "fiscal", label: "Datos Fiscales", icon: FileText },
        { id: "horarios", label: "Horarios", icon: Clock },
        { id: "mantenimiento", label: "Mantenimiento", icon: Database },
    ];

    const availableModels = (() => {
        const provider = settings?.aiProvider || 'gemini';
        switch (provider) {
            case 'openai': return openaiModels;
            case 'grok': return grokModels;
            case 'deepseek': return deepseekModels;
            case 'qwen': return qwenModels;
            default: return geminiModels;
        }
    })();

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin" />
                    <p className="text-zinc-500 font-medium animate-pulse">Cargando sistemas de Lysandra...</p>
                </div>
            </div>
        );
    }

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

                                {/* Configuración Regional */}
                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-cyan-500" />
                                        Configuración Regional
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Zona Horaria */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Zona Horaria</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                                                <select
                                                    value={settings.timezone}
                                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    {TIMEZONES.map((tz) => (
                                                        <option key={tz.value} value={tz.value} className="bg-zinc-900 text-white">
                                                            {tz.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Formato de Fecha */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Formato de Fecha</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                                                <select
                                                    value={settings.dateFormat}
                                                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    {DATE_FORMATS.map((fmt) => (
                                                        <option key={fmt.value} value={fmt.value} className="bg-zinc-900 text-white">
                                                            {fmt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Formato de Hora */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Formato de Hora</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                                                <select
                                                    value={settings.timeFormat}
                                                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    {TIME_FORMATS.map((fmt) => (
                                                        <option key={fmt.value} value={fmt.value} className="bg-zinc-900 text-white">
                                                            {fmt.label}
                                                        </option>
                                                    ))}
                                                </select>
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

                                <section>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Identidad del Agente
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Nombre del Agente IA</label>
                                            <div className="relative">
                                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                                <input
                                                    type="text"
                                                    value={settings.agentName}
                                                    onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                                                    placeholder="Eje: Lysandra"
                                                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 px-1 italic">Avatar del Agente (PNG)</label>
                                            <div className="space-y-3">
                                                {/* Vista previa del avatar */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center overflow-hidden">
                                                        {(avatarPreview || settings.agentImage) ? (
                                                            <img
                                                                src={avatarPreview || settings.agentImage}
                                                                alt="Avatar preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-zinc-700" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="file"
                                                            id="avatar-upload"
                                                            accept="image/png"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    // Mostrar vista previa
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setAvatarPreview(reader.result as string);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="avatar-upload"
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-all cursor-pointer border border-white/5"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                            Seleccionar PNG
                                                        </label>
                                                        {avatarPreview && (
                                                            <button
                                                                onClick={async () => {
                                                                    setIsUploadingAvatar(true);
                                                                    try {
                                                                        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                                                                        const file = fileInput?.files?.[0];
                                                                        if (!file) return;

                                                                        const formData = new FormData();
                                                                        formData.append('file', file);

                                                                        const result = await uploadAgentAvatar(formData);
                                                                        if (result.success && result.url) {
                                                                            // Actualizar el estado local
                                                                            const newSettings = { ...settings, agentImage: result.url };
                                                                            setSettings(newSettings);

                                                                            // Guardar automáticamente en Firestore
                                                                            const saveResult = await updateCompanySettings(newSettings);

                                                                            if (saveResult.success) {
                                                                                setAvatarPreview(null);
                                                                                // Limpiar el input
                                                                                if (fileInput) fileInput.value = '';

                                                                                // Mostrar mensaje de éxito
                                                                                setSaveSuccess(true);
                                                                                setTimeout(() => setSaveSuccess(false), 3000);
                                                                            } else {
                                                                                alert('Imagen subida pero error al guardar en base de datos: ' + saveResult.error);
                                                                            }
                                                                        } else {
                                                                            alert(result.error || 'Error al subir la imagen');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error uploading:', error);
                                                                        alert('Error al subir la imagen');
                                                                    } finally {
                                                                        setIsUploadingAvatar(false);
                                                                    }
                                                                }}
                                                                disabled={isUploadingAvatar}
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isUploadingAvatar ? (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                        Guardando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-4 h-4" />
                                                                        Subir y Guardar
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {settings.agentImage && (
                                                    <p className="text-[10px] text-zinc-600 font-mono truncate">
                                                        {settings.agentImage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "ia" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Selector de Proveedor */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Proveedor de IA
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Gemini */}
                                        <button
                                            onClick={() => setSettings({ ...settings, aiProvider: 'gemini' })}
                                            className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${(settings.aiProvider || 'gemini') === 'gemini'
                                                ? 'bg-purple-500/5 border-purple-500/50 glow-purple'
                                                : 'bg-zinc-950/30 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${(settings.aiProvider || 'gemini') === 'gemini' ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm">Google Gemini</h4>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Rápido y eficiente</p>
                                            </div>
                                            {(settings.aiProvider || 'gemini') === 'gemini' && (
                                                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                                            )}
                                        </button>

                                        {/* OpenAI */}
                                        <button
                                            onClick={() => setSettings({ ...settings, aiProvider: 'openai' })}
                                            className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${settings.aiProvider === 'openai'
                                                ? 'bg-cyan-500/5 border-cyan-500/50 glow-cyan'
                                                : 'bg-zinc-950/30 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.aiProvider === 'openai' ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                <Bot className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm">OpenAI</h4>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">GPT-4, GPT-3.5</p>
                                            </div>
                                            {settings.aiProvider === 'openai' && (
                                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                            )}
                                        </button>

                                        {/* Grok */}
                                        <button
                                            onClick={() => setSettings({ ...settings, aiProvider: 'grok' })}
                                            className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${settings.aiProvider === 'grok'
                                                ? 'bg-green-500/5 border-green-500/50 glow-green'
                                                : 'bg-zinc-950/30 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.aiProvider === 'grok' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm">Grok (xAI)</h4>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Rápido, acceso a X</p>
                                            </div>
                                            {settings.aiProvider === 'grok' && (
                                                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                            )}
                                        </button>

                                        {/* DeepSeek */}
                                        <button
                                            onClick={() => setSettings({ ...settings, aiProvider: 'deepseek' })}
                                            className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${settings.aiProvider === 'deepseek'
                                                ? 'bg-blue-500/5 border-blue-500/50 glow-blue'
                                                : 'bg-zinc-950/30 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.aiProvider === 'deepseek' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                <Code className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm">DeepSeek</h4>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Económico, excelente código</p>
                                            </div>
                                            {settings.aiProvider === 'deepseek' && (
                                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                            )}
                                        </button>

                                        {/* Qwen */}
                                        <button
                                            onClick={() => setSettings({ ...settings, aiProvider: 'qwen' })}
                                            className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${settings.aiProvider === 'qwen'
                                                ? 'bg-orange-500/5 border-orange-500/50 glow-orange'
                                                : 'bg-zinc-950/30 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.aiProvider === 'qwen' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-sm">Qwen (Alibaba)</h4>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Multilingüe, muy rápido</p>
                                            </div>
                                            {settings.aiProvider === 'qwen' && (
                                                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                            )}
                                        </button>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-purple-500" />
                                            Selección de Modelo
                                        </h3>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${(settings.aiProvider || 'gemini') === 'gemini' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            settings.aiProvider === 'openai' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                settings.aiProvider === 'grok' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    settings.aiProvider === 'deepseek' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            }`}>
                                            {
                                                (settings.aiProvider || 'gemini') === 'gemini' ? 'Google Gemini API' :
                                                    settings.aiProvider === 'openai' ? 'OpenAI API' :
                                                        settings.aiProvider === 'grok' ? 'xAI Grok API' :
                                                            settings.aiProvider === 'deepseek' ? 'DeepSeek API' :
                                                                'Alibaba Cloud API'
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mb-10">
                                        {(availableModels || []).map((model) => {
                                            const provider = settings?.aiProvider || 'gemini';
                                            const isSelected = settings.aiModel === model.id;

                                            const colorsOptions = {
                                                gemini: { bg: 'bg-purple-500/5', border: 'border-purple-500/50', glow: 'glow-purple', iconBg: 'bg-purple-500', check: 'text-purple-400', icon: <Zap className="w-5 h-5" /> },
                                                openai: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/50', glow: 'glow-cyan', iconBg: 'bg-cyan-500', check: 'text-cyan-400', icon: <Bot className="w-5 h-5" /> },
                                                grok: { bg: 'bg-green-500/5', border: 'border-green-500/50', glow: 'glow-green', iconBg: 'bg-green-500', check: 'text-green-400', icon: <Sparkles className="w-5 h-5" /> },
                                                deepseek: { bg: 'bg-blue-500/5', border: 'border-blue-500/50', glow: 'glow-blue', iconBg: 'bg-blue-500', check: 'text-blue-400', icon: <Code className="w-5 h-5" /> },
                                                qwen: { bg: 'bg-orange-500/5', border: 'border-orange-500/50', glow: 'glow-orange', iconBg: 'bg-orange-500', check: 'text-orange-400', icon: <Globe className="w-5 h-5" /> }
                                            };
                                            const colors = colorsOptions[(settings?.aiProvider || 'gemini') as keyof typeof colorsOptions] || colorsOptions.gemini;

                                            return (
                                                <button
                                                    key={model.id}
                                                    onClick={() => setSettings({ ...settings, aiModel: model.id })}
                                                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${isSelected
                                                        ? `${colors.bg} ${colors.border} ${colors.glow}`
                                                        : "bg-zinc-950/30 border-white/5 hover:border-white/10"
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? `${colors.iconBg} text-white` : 'bg-zinc-800 text-zinc-500'}`}>
                                                        {colors.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-white text-sm">{model.name}</h4>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${model.tier === 'Experimental' ? 'bg-amber-500/20 text-amber-400' :
                                                                model.tier === 'Premium' ? 'bg-cyan-500/20 text-cyan-400' :
                                                                    'bg-green-500/20 text-green-400'
                                                                }`}>
                                                                {model.tier}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{model.desc}</p>
                                                    </div>
                                                    {isSelected && <CheckCircle2 className={`w-5 h-5 ${colors.check} shrink-0`} />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Configuración de API Key */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                Configuración de API
                                            </h3>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-zinc-950/50 border border-white/5 space-y-6">
                                            {/* Gemini API Key */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-400 px-1 italic flex items-center gap-2">
                                                    Google Gemini API Key
                                                    <span className="text-[10px] text-zinc-600 font-normal">(Opcional - usa la de .env si está vacío)</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        value={settings.geminiApiKey || ''}
                                                        onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                                                        placeholder="AIza••••••••••••••••••••••••••••"
                                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                                                    />
                                                    {settings.geminiApiKey && settings.geminiApiKey.length > 0 && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-zinc-600 italic px-1 mt-2">
                                                    🔗 Obtén tu API Key en: <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline font-bold px-1">Google AI Studio</a>
                                                </p>
                                            </div>

                                            <div className="border-t border-white/5 pt-4"></div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* OpenAI */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-400 px-1 italic">OpenAI API Key (ChatGPT)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={settings.openaiApiKey || ''}
                                                            onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                                                            placeholder="sk-••••••••••••••••••••••••••••••••"
                                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                                        />
                                                        {settings.openaiApiKey && settings.openaiApiKey.length > 0 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Grok */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-400 px-1 italic">Grok API Key (xAI)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={settings.grokApiKey || ''}
                                                            onChange={(e) => setSettings({ ...settings, grokApiKey: e.target.value })}
                                                            placeholder="xai-••••••••••••••••••••••••••••••••"
                                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all font-mono"
                                                        />
                                                        {settings.grokApiKey && settings.grokApiKey.length > 0 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* DeepSeek */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-400 px-1 italic">DeepSeek API Key</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={settings.deepseekApiKey || ''}
                                                            onChange={(e) => setSettings({ ...settings, deepseekApiKey: e.target.value })}
                                                            placeholder="sk-••••••••••••••••••••••••••••••••"
                                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                                                        />
                                                        {settings.deepseekApiKey && settings.deepseekApiKey.length > 0 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Qwen */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-400 px-1 italic">Qwen API Key (Alibaba)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={settings.qwenApiKey || ''}
                                                            onChange={(e) => setSettings({ ...settings, qwenApiKey: e.target.value })}
                                                            placeholder="sk-••••••••••••••••••••••••••••••••"
                                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono"
                                                        />
                                                        {settings.qwenApiKey && settings.qwenApiKey.length > 0 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </section>

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
                        {activeTab === "mantenimiento" && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Zona de Mantenimiento</h3>
                                            <p className="text-xs text-zinc-500 font-medium">Gestiona el purgado y reinicio del sistema.</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-zinc-950 border border-white/5 space-y-6">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Selecciona los elementos a reiniciar</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, metrics: !resetOptions.metrics })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.metrics ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.metrics ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Métricas & Chats</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Limpia el histórico de conversaciones.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.metrics ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.metrics && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, appointments: !resetOptions.appointments })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.appointments ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.appointments ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Citas Agendadas</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Elimina todos los registros de citas.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.appointments ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.appointments && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, training: !resetOptions.training })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.training ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.training ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Cpu className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Entrenamiento IA</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Restaura el prompt por defecto.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.training ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.training && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, knowledge: !resetOptions.knowledge })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.knowledge ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.knowledge ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <FileCode className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Base de Conocimiento</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Limpia toda la información corporativa.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.knowledge ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.knowledge && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, identity: !resetOptions.identity })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.identity ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.identity ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Nombre de Empresa</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Restaura la identidad de la IA.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.identity ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.identity && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, contact: !resetOptions.contact })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.contact ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.contact ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Phone className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Canales de Contacto</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">WhatsApp y email de soporte.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.contact ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.contact && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, fiscal: !resetOptions.fiscal })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.fiscal ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.fiscal ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">ID Fiscal & RFC</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Datos legales básicos.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.fiscal ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.fiscal && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, address: !resetOptions.address })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.address ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.address ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Domicilio Fiscal</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Dirección registrada.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.address ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.address && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, hours: !resetOptions.hours })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.hours ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.hours ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Horarios Semanales</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Calendario de atención.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.hours ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.hours && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, timezone: !resetOptions.timezone })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.timezone ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.timezone ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Zona Horaria</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Localización del tiempo.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.timezone ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.timezone && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setResetOptions({ ...resetOptions, agent: !resetOptions.agent })}
                                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${resetOptions.agent ? 'bg-red-500/5 border-red-500/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resetOptions.agent ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Identidad del Agente</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">Nombre y avatar del agente.</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${resetOptions.agent ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                                        {resetOptions.agent && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-col items-center gap-4">
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400">
                                                <AlertTriangle className="w-3 h-3" />
                                                ESTA ACCIÓN ES IRREVERSIBLE
                                            </div>
                                            <button
                                                disabled={isResetting || !Object.values(resetOptions).some(v => v)}
                                                onClick={() => setShowResetModal(true)}
                                                className="px-10 py-5 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-3"
                                            >
                                                {isResetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Ejecutar Limpieza Selectiva <Trash2 className="w-5 h-5" /></>}
                                            </button>

                                            <button
                                                onClick={() => setResetOptions({ metrics: true, appointments: true, training: true, knowledge: true, identity: true, contact: true, fiscal: true, address: true, hours: true, timezone: true, agent: true })}
                                                className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                                            >
                                                Seleccionar Todo (Reinicio Total)
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación de Reinicio Premium */}
            {
                showResetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
                            onClick={() => !isResetting && setShowResetModal(false)}
                        />
                        <div className="relative glass w-full max-w-sm rounded-[3rem] border-red-500/20 p-12 bg-gradient-to-b from-red-500/10 to-transparent shadow-2xl animate-in zoom-in-95 duration-500 text-center space-y-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                                <div className="relative w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                    <AlertTriangle className="w-12 h-12 text-red-500" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white">Confirmar Purga</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Se eliminarán permanentemente los <span className="text-red-400 font-bold">módulos seleccionados</span>. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <button
                                    disabled={isResetting}
                                    onClick={async () => {
                                        setIsResetting(true);
                                        const res = await resetSystemData(resetOptions);
                                        setIsResetting(false);
                                        if (res.success) {
                                            setShowResetModal(false);
                                            setResetSuccess(true);
                                            setResetOptions({ metrics: false, appointments: false, training: false, knowledge: false, identity: false, contact: false, fiscal: false, address: false, hours: false, timezone: false, agent: false });
                                            loadSettings();
                                            setTimeout(() => setResetSuccess(false), 5000);
                                        }
                                    }}
                                    className="w-full py-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                                >
                                    {isResetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirmar e Iniciar"}
                                </button>
                                <button
                                    disabled={isResetting}
                                    onClick={() => setShowResetModal(false)}
                                    className="w-full py-5 rounded-2xl bg-white/5 text-zinc-500 font-bold hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Abortar Operación
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Éxito Post-Reinicio */}
            {
                resetSuccess && (
                    <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
                        <div className="glass px-8 py-5 rounded-3xl border-green-500/20 bg-green-500/10 flex items-center gap-4 glow-green">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Sistema Reiniciado</p>
                                <p className="text-xs text-green-400">Los datos han sido purgados con éxito.</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
