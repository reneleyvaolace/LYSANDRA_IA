"use client";

import { useState, useEffect } from "react";
import {
    BrainCircuit,
    Save,
    RefreshCw,
    Sparkles,
    History,
    Info
} from "lucide-react";

import { getSettings, updateSystemPrompt } from "./actions";

export default function TrainingPage() {
    const [prompt, setPrompt] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const settings = await getSettings();
                if (settings?.systemPrompt) {
                    setPrompt(settings.systemPrompt);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        }
        load();
    }, []);

    const handleSave = async () => {
        if (!prompt.trim()) return;
        setIsSaving(true);
        try {
            const res = await updateSystemPrompt(prompt);
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                    <BrainCircuit className="w-10 h-10 text-cyan-400" />
                    Entrenamiento de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Lysandra</span>
                </h1>
                <p className="text-zinc-500 max-w-2xl text-lg">
                    Define la personalidad, el tono y las reglas de comportamiento de tu asistente.
                    Cualquier cambio aquí afectará inmediatamente a todas las conversaciones activas.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-3xl border-white/5 overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">System Instruction</span>
                            </div>
                            {lastSaved && (
                                <span className="text-[10px] text-zinc-500 font-mono">Último guardado: {lastSaved}</span>
                            )}
                        </div>

                        <div className="flex-1 p-6 relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-zinc-200 text-lg leading-relaxed resize-none font-mono"
                                placeholder="Escribe aquí las instrucciones para el modelo..."
                            />
                        </div>

                        <div className="p-6 border-t border-white/5 bg-zinc-950/20 flex items-center justify-between">
                            <button
                                onClick={() => setPrompt("")}
                                className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Restablecer valores predeterminados
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Guardar Conocimiento
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar de Ayuda/Tips */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Info className="w-5 h-5 text-cyan-400" />
                            Guía de Estilo
                        </h3>
                        <div className="space-y-4 text-sm text-zinc-400">
                            <p>Para mejores resultados, sigue esta estructura:</p>
                            <ul className="space-y-3 list-disc list-inside">
                                <li><span className="text-zinc-200 font-medium">Rol:</span> "Eres un experto en desarrollo de software..."</li>
                                <li><span className="text-zinc-200 font-medium">Tono:</span> "Directo, técnico pero accesible."</li>
                                <li><span className="text-zinc-200 font-medium">Restricciones:</span> "No prometas precios finales sin una consulta."</li>
                                <li><span className="text-zinc-200 font-medium">Herramientas:</span> "Siempre verifica la agenda antes de confirmar una cita."</li>
                            </ul>
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6 border-white/5">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-purple-400" />
                            Versiones Anteriores
                        </h3>
                        <div className="space-y-3">
                            {[
                                { date: "30 Dic, 2025", version: "v1.1", user: "Rene" },
                                { date: "28 Dic, 2025", version: "v1.0", user: "Rene" },
                            ].map((v, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-300">{v.version}</span>
                                        <span className="text-[10px] text-zinc-600">{v.date}</span>
                                    </div>
                                    <button className="text-[10px] text-cyan-500 font-bold hover:underline uppercase">Restaurar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
