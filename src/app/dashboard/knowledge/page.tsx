"use client";

import { useState, useEffect } from "react";
import {
    Save,
    RefreshCw,
    Plus,
    Trash2,
    Database,
    Building2,
    FileText,
    DollarSign,
    Users,
    Code,
    Award,
    HelpCircle
} from "lucide-react";
import { getKnowledgeBase, updateKnowledgeBase, resetKnowledgeBase, CompanyKnowledge } from "./actions";

export default function KnowledgePage() {
    const [knowledge, setKnowledge] = useState<CompanyKnowledge | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("company");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadKnowledge();
    }, []);

    const loadKnowledge = async () => {
        setIsLoading(true);
        const data = await getKnowledgeBase();
        setKnowledge(data);
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!knowledge) return;

        setIsSaving(true);
        const result = await updateKnowledgeBase(knowledge);
        setIsSaving(false);

        setMessage({
            type: result.success ? "success" : "error",
            text: result.message
        });

        setTimeout(() => setMessage(null), 3000);
    };

    const handleReset = async () => {
        if (!confirm("¿Estás seguro de restablecer la base de conocimiento a los valores por defecto?")) {
            return;
        }

        setIsLoading(true);
        const result = await resetKnowledgeBase();
        setIsLoading(false);

        if (result.success) {
            await loadKnowledge();
        }

        setMessage({
            type: result.success ? "success" : "error",
            text: result.message
        });

        setTimeout(() => setMessage(null), 3000);
    };

    if (isLoading || !knowledge) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
                    <p className="text-zinc-400">Cargando base de conocimiento...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "company", label: "Empresa", icon: Building2 },
        { id: "services", label: "Servicios", icon: DollarSign },
        { id: "contact", label: "Contacto", icon: FileText },
        { id: "technologies", label: "Tecnologías", icon: Code },
        { id: "portfolio", label: "Portafolio", icon: Award },
        { id: "faqs", label: "FAQs", icon: HelpCircle },
        { id: "team", label: "Equipo", icon: Users },
    ];

    return (
        <div className="flex flex-col h-full p-4 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-cyan-500" />
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text gradient-text">
                        Base de Conocimiento
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 transition-colors duration-200"
                    >
                        <RefreshCw size={16} /> Restablecer
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 disabled:opacity-50"
                    >
                        <Save size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg border ${message.type === "success"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                                    : "bg-zinc-900/50 border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "company" && (
                    <CompanySection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "services" && (
                    <ServicesSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "contact" && (
                    <ContactSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "technologies" && (
                    <TechnologiesSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "portfolio" && (
                    <PortfolioSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "faqs" && (
                    <FAQsSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
                {activeTab === "team" && (
                    <TeamSection knowledge={knowledge} setKnowledge={setKnowledge} />
                )}
            </div>
        </div>
    );
}

// Company Section Component
function CompanySection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    const updateField = (field: keyof CompanyKnowledge["company"], value: string) => {
        setKnowledge({
            ...knowledge,
            company: { ...knowledge.company, [field]: value }
        });
    };

    return (
        <div className="space-y-4">
            <InputField
                label="Nombre de la Empresa"
                value={knowledge.company.name}
                onChange={(v) => updateField("name", v)}
            />
            <InputField
                label="Nombre Legal"
                value={knowledge.company.legalName}
                onChange={(v) => updateField("legalName", v)}
            />
            <InputField
                label="Tagline"
                value={knowledge.company.tagline}
                onChange={(v) => updateField("tagline", v)}
            />
            <TextAreaField
                label="Descripción"
                value={knowledge.company.description}
                onChange={(v) => updateField("description", v)}
            />
            <InputField
                label="Año de Fundación"
                value={knowledge.company.founded}
                onChange={(v) => updateField("founded", v)}
            />
            <InputField
                label="Sitio Web"
                value={knowledge.company.website}
                onChange={(v) => updateField("website", v)}
            />
            <InputField
                label="Industria"
                value={knowledge.company.industry}
                onChange={(v) => updateField("industry", v)}
            />
            <InputField
                label="Mercado Objetivo"
                value={knowledge.company.targetMarket}
                onChange={(v) => updateField("targetMarket", v)}
            />

            {/* Fiscal Info */}
            <div className="mt-8 pt-8 border-t border-zinc-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Información Fiscal</h3>
                <div className="space-y-4">
                    <InputField
                        label="RFC"
                        value={knowledge.fiscalInfo.rfc}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            fiscalInfo: { ...knowledge.fiscalInfo, rfc: v }
                        })}
                    />
                    <InputField
                        label="Régimen"
                        value={knowledge.fiscalInfo.regime}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            fiscalInfo: { ...knowledge.fiscalInfo, regime: v }
                        })}
                    />
                    <InputField
                        label="Facturación"
                        value={knowledge.fiscalInfo.invoicing}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            fiscalInfo: { ...knowledge.fiscalInfo, invoicing: v }
                        })}
                    />
                    <InputField
                        label="Estatus Fiscal"
                        value={knowledge.fiscalInfo.taxStatus}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            fiscalInfo: { ...knowledge.fiscalInfo, taxStatus: v }
                        })}
                    />
                </div>
            </div>
        </div>
    );
}

// Services Section Component
function ServicesSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    const addService = () => {
        setKnowledge({
            ...knowledge,
            services: [
                ...knowledge.services,
                {
                    id: `service-${Date.now()}`,
                    name: "",
                    description: "",
                    features: [],
                    technologies: [],
                    pricing: ""
                }
            ]
        });
    };

    const removeService = (index: number) => {
        setKnowledge({
            ...knowledge,
            services: knowledge.services.filter((_, i) => i !== index)
        });
    };

    const updateService = (index: number, field: string, value: any) => {
        const newServices = [...knowledge.services];
        newServices[index] = { ...newServices[index], [field]: value };
        setKnowledge({ ...knowledge, services: newServices });
    };

    return (
        <div className="space-y-6">
            <button
                onClick={addService}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
                <Plus size={16} /> Agregar Servicio
            </button>

            {knowledge.services.map((service, index) => (
                <div key={index} className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-cyan-400">Servicio #{index + 1}</h3>
                        <button
                            onClick={() => removeService(index)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <InputField
                        label="ID"
                        value={service.id}
                        onChange={(v) => updateService(index, "id", v)}
                    />
                    <InputField
                        label="Nombre"
                        value={service.name}
                        onChange={(v) => updateService(index, "name", v)}
                    />
                    <TextAreaField
                        label="Descripción"
                        value={service.description}
                        onChange={(v) => updateService(index, "description", v)}
                    />
                    <ArrayField
                        label="Características"
                        values={service.features}
                        onChange={(v) => updateService(index, "features", v)}
                    />
                    <ArrayField
                        label="Tecnologías"
                        values={service.technologies}
                        onChange={(v) => updateService(index, "technologies", v)}
                    />
                    <InputField
                        label="Precio"
                        value={service.pricing}
                        onChange={(v) => updateService(index, "pricing", v)}
                    />
                </div>
            ))}
        </div>
    );
}

// Contact Section Component
function ContactSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    return (
        <div className="space-y-4">
            <InputField
                label="Email"
                value={knowledge.contact.email}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    contact: { ...knowledge.contact, email: v }
                })}
            />
            <InputField
                label="Teléfono"
                value={knowledge.contact.phone}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    contact: { ...knowledge.contact, phone: v }
                })}
            />
            <InputField
                label="Dirección"
                value={knowledge.contact.address}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    contact: { ...knowledge.contact, address: v }
                })}
            />

            <div className="mt-8 pt-8 border-t border-zinc-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Redes Sociales</h3>
                <div className="space-y-4">
                    <InputField
                        label="LinkedIn"
                        value={knowledge.contact.socialMedia.linkedin}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            contact: {
                                ...knowledge.contact,
                                socialMedia: { ...knowledge.contact.socialMedia, linkedin: v }
                            }
                        })}
                    />
                    <InputField
                        label="Twitter"
                        value={knowledge.contact.socialMedia.twitter}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            contact: {
                                ...knowledge.contact,
                                socialMedia: { ...knowledge.contact.socialMedia, twitter: v }
                            }
                        })}
                    />
                    <InputField
                        label="Facebook"
                        value={knowledge.contact.socialMedia.facebook}
                        onChange={(v) => setKnowledge({
                            ...knowledge,
                            contact: {
                                ...knowledge.contact,
                                socialMedia: { ...knowledge.contact.socialMedia, facebook: v }
                            }
                        })}
                    />
                </div>
            </div>
        </div>
    );
}

// Technologies Section Component
function TechnologiesSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    return (
        <div className="space-y-6">
            <ArrayField
                label="Frontend"
                values={knowledge.technologies.frontend}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, frontend: v }
                })}
            />
            <ArrayField
                label="Backend"
                values={knowledge.technologies.backend}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, backend: v }
                })}
            />
            <ArrayField
                label="Bases de Datos"
                values={knowledge.technologies.databases}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, databases: v }
                })}
            />
            <ArrayField
                label="Cloud"
                values={knowledge.technologies.cloud}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, cloud: v }
                })}
            />
            <ArrayField
                label="DevOps"
                values={knowledge.technologies.devops}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, devops: v }
                })}
            />
            <ArrayField
                label="Seguridad"
                values={knowledge.technologies.security}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    technologies: { ...knowledge.technologies, security: v }
                })}
            />
        </div>
    );
}

// Portfolio Section Component
function PortfolioSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    const addProject = () => {
        setKnowledge({
            ...knowledge,
            portfolio: [
                ...knowledge.portfolio,
                {
                    name: "",
                    description: "",
                    industry: "",
                    technologies: []
                }
            ]
        });
    };

    const removeProject = (index: number) => {
        setKnowledge({
            ...knowledge,
            portfolio: knowledge.portfolio.filter((_, i) => i !== index)
        });
    };

    const updateProject = (index: number, field: string, value: any) => {
        const newPortfolio = [...knowledge.portfolio];
        newPortfolio[index] = { ...newPortfolio[index], [field]: value };
        setKnowledge({ ...knowledge, portfolio: newPortfolio });
    };

    return (
        <div className="space-y-6">
            <button
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
                <Plus size={16} /> Agregar Proyecto
            </button>

            {knowledge.portfolio.map((project, index) => (
                <div key={index} className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-cyan-400">Proyecto #{index + 1}</h3>
                        <button
                            onClick={() => removeProject(index)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <InputField
                        label="Nombre"
                        value={project.name}
                        onChange={(v) => updateProject(index, "name", v)}
                    />
                    <TextAreaField
                        label="Descripción"
                        value={project.description}
                        onChange={(v) => updateProject(index, "description", v)}
                    />
                    <InputField
                        label="Industria"
                        value={project.industry}
                        onChange={(v) => updateProject(index, "industry", v)}
                    />
                    <ArrayField
                        label="Tecnologías"
                        values={project.technologies}
                        onChange={(v) => updateProject(index, "technologies", v)}
                    />
                </div>
            ))}
        </div>
    );
}

// FAQs Section Component
function FAQsSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    const addFAQ = () => {
        setKnowledge({
            ...knowledge,
            faqs: [
                ...knowledge.faqs,
                { question: "", answer: "" }
            ]
        });
    };

    const removeFAQ = (index: number) => {
        setKnowledge({
            ...knowledge,
            faqs: knowledge.faqs.filter((_, i) => i !== index)
        });
    };

    const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
        const newFAQs = [...knowledge.faqs];
        newFAQs[index] = { ...newFAQs[index], [field]: value };
        setKnowledge({ ...knowledge, faqs: newFAQs });
    };

    return (
        <div className="space-y-6">
            <button
                onClick={addFAQ}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
                <Plus size={16} /> Agregar FAQ
            </button>

            {knowledge.faqs.map((faq, index) => (
                <div key={index} className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-cyan-400">FAQ #{index + 1}</h3>
                        <button
                            onClick={() => removeFAQ(index)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <InputField
                        label="Pregunta"
                        value={faq.question}
                        onChange={(v) => updateFAQ(index, "question", v)}
                    />
                    <TextAreaField
                        label="Respuesta"
                        value={faq.answer}
                        onChange={(v) => updateFAQ(index, "answer", v)}
                    />
                </div>
            ))}
        </div>
    );
}

// Team Section Component
function TeamSection({ knowledge, setKnowledge }: { knowledge: CompanyKnowledge; setKnowledge: (k: CompanyKnowledge) => void }) {
    return (
        <div className="space-y-6">
            <InputField
                label="Tamaño del Equipo"
                value={knowledge.team.size}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    team: { ...knowledge.team, size: v }
                })}
            />
            <ArrayField
                label="Áreas de Expertise"
                values={knowledge.team.expertise}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    team: { ...knowledge.team, expertise: v }
                })}
            />
            <ArrayField
                label="Certificaciones"
                values={knowledge.certifications}
                onChange={(v) => setKnowledge({
                    ...knowledge,
                    certifications: v
                })}
            />
        </div>
    );
}

// Reusable Components
function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
        </div>
    );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
        </div>
    );
}

function ArrayField({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
    const [newItem, setNewItem] = useState("");

    const addItem = () => {
        if (newItem.trim()) {
            onChange([...values, newItem.trim()]);
            setNewItem("");
        }
    };

    const removeItem = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
            <div className="space-y-2">
                {values.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                                const newValues = [...values];
                                newValues[index] = e.target.value;
                                onChange(newValues);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addItem()}
                        placeholder={`Agregar ${label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                        onClick={addItem}
                        className="p-2 text-cyan-400 hover:text-cyan-300"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
