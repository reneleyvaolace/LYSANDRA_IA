"use client";

import { useState, useEffect } from "react";
import {
    BrainCircuit,
    Save,
    RefreshCw,
    Sparkles,
    History,
    Info,
    Plus,
    Trash2,
    CheckCircle2,
    ShieldAlert,
    MessageSquareQuote,
    Settings2,
    ChevronDown,
    ChevronUp,
    LayoutDashboard
} from "lucide-react";

import { getSettings, updateSystemPrompt } from "./actions";

interface InstructionBlock {
    id: string;
    title: string;
    content: string;
}

export default function TrainingPage() {
    const [basePrompt, setBasePrompt] = useState("");
    const [blocks, setBlocks] = useState<InstructionBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [activeTab, setActiveTab] = useState<"personality" | "rules">("personality");

    useEffect(() => {
        async function load() {
            try {
                const settings = await getSettings();
                if (settings?.systemPrompt) {
                    // Try to parse if we saved it as JSON before, otherwise just use as base
                    // For now, let's just use it as base to not break legacy
                    setBasePrompt(settings.systemPrompt);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        }
        load();
    }, []);

    const addBlock = () => {
        const newBlock: InstructionBlock = {
            id: Date.now().toString(),
            title: "Nueva Regla",
            content: ""
        };
        setBlocks([...blocks, newBlock]);
        setActiveTab("rules");
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, field: "title" | "content", value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const buildFinalPrompt = () => {
        let final = basePrompt;
        if (blocks.length > 0) {
            final += "\n\nREGLAS ADICIONALES Y COMPORTAMIENTO:\n";
            blocks.forEach((b, i) => {
                if (b.content.trim()) {
                    final += `${i + 1}. [${b.title}]: ${b.content}\n`;
                }
            });
        }
        return final;
    };

    const handleSave = async () => {
        const finalPrompt = buildFinalPrompt();
        if (!finalPrompt.trim()) return;

        setIsSaving(true);
        try {
            const res = await updateSystemPrompt(finalPrompt);
            if (res.success) {
                setLastSaved(new Date().toLocaleTimeString());
            } else {
                alert("Error al guardar: " + res.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header con Neumorfismo */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass rounded-[2.5rem] p-10 border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <BrainCircuit className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                                Entrenamiento <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Pro</span>
                            </h1>
                        </div>
                        <p className="text-zinc-400 max-w-xl text-lg font-medium">
                            Configura el núcleo cognitivo de tu asistente. Define desde su personalidad hasta reglas lógicas complejas.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-500 ${isSaving
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                                }`}
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            )}
                            {isSaving ? "Guardando..." : "Sincronizar Cerebro"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Panel Central */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Tabs de Navegación */}
                    <div className="flex p-1.5 bg-zinc-950/50 rounded-2xl border border-white/5 w-fit">
                        <button
                            onClick={() => setActiveTab("personality")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "personality"
                                ? "bg-white/10 text-cyan-400 border border-white/10"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Personalidad Base
                        </button>
                        <button
                            onClick={() => setActiveTab("rules")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "rules"
                                ? "bg-white/10 text-purple-400 border border-white/10"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <Settings2 className="w-4 h-4" />
                            Instrucciones Modulares
                        </button>
                    </div>

                    {/* Editor de Personalidad */}
                    {activeTab === "personality" && (
                        <div className="glass rounded-[2rem] border-white/5 overflow-hidden flex flex-col min-h-[1000px] animate-in slide-in-from-left duration-500">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <MessageSquareQuote className="w-5 h-5 text-cyan-500" />
                                        Contexto y Personificación
                                    </h3>
                                    <p className="text-xs text-zinc-500">Describe quién es Lysandra y cómo interactúa con el mundo.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {lastSaved && (
                                        <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            SINCRONIZADO {lastSaved}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 p-8 bg-zinc-950/20">
                                <textarea
                                    value={basePrompt}
                                    onChange={(e) => setBasePrompt(e.target.value)}
                                    className="w-full h-full min-h-[850px] bg-transparent border border-white/10 rounded-3xl p-6 focus:ring-1 focus:ring-cyan-500/50 text-zinc-200 text-xl leading-relaxed resize-none font-medium custom-scrollbar transition-all"
                                    placeholder="Ej: Eres Lysandra, la voz técnica de CoreAura. Tu tono es..."
                                />
                            </div>
                            <div className="p-4 bg-zinc-950/40 border-t border-white/5 flex justify-between items-center px-8">
                                <span className="text-[10px] text-zinc-500 font-mono italic">
                                    Caracteres: {basePrompt.length} | Tokens est. ~{Math.ceil(basePrompt.length / 4)}
                                </span>
                                <button
                                    onClick={() => setBasePrompt("")}
                                    className="text-[10px] text-red-400/50 hover:text-red-400 font-bold transition-colors"
                                >
                                    LIMPIAR TEXTO
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Editor de Reglas Modulares */}
                    {activeTab === "rules" && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white">Instrucciones Específicas</h3>
                                    <p className="text-xs text-zinc-500">Añade bloques de lógica o reglas que Lysandra debe seguir estrictamente.</p>
                                </div>
                                <button
                                    onClick={addBlock}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-sm font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    Añadir Instrucción
                                </button>
                            </div>

                            <div className="space-y-4">
                                {blocks.length === 0 && (
                                    <div className="glass rounded-[2rem] border-dashed border-white/10 p-20 text-center space-y-4">
                                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                                            <Settings2 className="w-8 h-8 text-zinc-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-zinc-300 font-bold">No hay instrucciones modulares</p>
                                            <p className="text-xs text-zinc-500 max-w-xs mx-auto text-pretty">
                                                Las reglas modulares ayudan a segmentar el comportamiento del bot (ej: "Reglas de Precios", "Manejo de Críticas").
                                            </p>
                                        </div>
                                        <button onClick={addBlock} className="text-cyan-400 font-bold text-sm hover:underline">Crear mi primera regla</button>
                                    </div>
                                )}

                                {blocks.map((block) => (
                                    <div key={block.id} className="glass rounded-2xl border-white/5 overflow-hidden group">
                                        <div className="p-4 bg-white/[0.02] flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={block.title}
                                                onChange={(e) => updateBlock(block.id, "title", e.target.value)}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-zinc-300 placeholder:text-zinc-700"
                                                placeholder="Título de la regla..."
                                            />
                                            <button
                                                onClick={() => removeBlock(block.id)}
                                                className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-4 bg-zinc-950/30">
                                            <textarea
                                                value={block.content}
                                                onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-400 leading-relaxed min-h-[100px] resize-none"
                                                placeholder="Define aquí la lógica o instrucción detallada..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Preview Live */}
                    <div className="glass rounded-[2rem] p-8 border-white/5 space-y-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Preview</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-[10px] text-zinc-400 font-bold">TEMPORAL</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 font-mono text-[11px] text-zinc-400 leading-normal max-h-[400px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                {buildFinalPrompt() || <span className="italic text-zinc-700 text-xs font-sans">El cerebro está vacío. Empieza a escribir...</span>}
                            </div>
                            <p className="text-[10px] text-zinc-600 italic">
                                * Este es el prompt final que recibirá Gemini. Los cambios se aplican globalmente al guardar.
                            </p>
                        </div>
                    </div>

                    {/* Guía de Calidad */}
                    <div className="glass rounded-[2rem] p-8 border-white/5 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            Guía de Calidad
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-zinc-300">Ser Específico</p>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Evita instrucciones vagas. En lugar de "Sé amable", usa "Habla con cortesía mexicana, usa frases como 'Es un gusto atenderle'".
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-zinc-300">Jerarquía de Reglas</p>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Coloca las restricciones más críticas al principio de las Instrucciones Modulares.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Historial rápido */}
                    <div className="glass rounded-[2rem] p-8 border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Snapshot History</h3>
                            <button className="text-[10px] text-purple-400 font-bold hover:underline">VER TODO</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { v: "PROD-1.2", date: "Hoy, 10:25 AM", color: "bg-green-500" },
                                { v: "PROD-1.1", date: "Ayer, 4:12 PM", color: "bg-zinc-700" }
                            ].map((h, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-purple-500/30 transition-all cursor-pointer">
                                    <div className={`w-2 h-2 rounded-full ${h.color}`}></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white">{h.v}</p>
                                        <p className="text-[10px] text-zinc-500">{h.date}</p>
                                    </div>
                                    <LayoutDashboard className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
