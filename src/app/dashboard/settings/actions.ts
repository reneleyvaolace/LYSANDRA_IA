"use server";

import { db, storage } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export interface CompanySettings {
    companyName: string;
    whatsappNumber: string;
    supportEmail: string;
    fiscalName: string;
    rfc: string;
    fiscalAddress: string;
    timezone: string;
    aiModel: string;
    aiProvider?: string; // "gemini", "openai", "grok", "deepseek", "qwen", "anthropic"
    geminiApiKey?: string; // API Key de Gemini (opcional, usa la de .env si no está configurada)
    openaiApiKey?: string; // API Key de OpenAI (opcional, para ChatGPT)
    grokApiKey?: string; // API Key de Grok/xAI
    deepseekApiKey?: string; // API Key de DeepSeek
    qwenApiKey?: string; // API Key de Qwen/Alibaba
    anthropicApiKey?: string; // API Key de Anthropic Claude
    businessHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    agentName: string;
    agentImage: string;
    dateFormat: string; // e.g., "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"
    timeFormat: string; // e.g., "12h", "24h"
}

export interface AIModelMetrics {
    modelName: string;
    requestsUsed: number;
    requestsLimit: number;
    tokensUsed: number;
    tokensLimit: number;
    resetInSeconds: number;
    status: "active" | "limited" | "error";
}


export async function getAIModelMetrics(model: string): Promise<AIModelMetrics> {
    // Límites del Free Tier de Gemini (actualizados a 2026)
    // Fuente: https://ai.google.dev/pricing
    const limits: Record<string, { req: number; tokens: number }> = {
        // Modelos estables
        "gemini-flash-latest": { req: 15, tokens: 1000000 },      // 15 RPM, 1M TPM
        "gemini-1.5-flash": { req: 15, tokens: 1000000 },         // Alias de flash-latest
        "gemini-pro-latest": { req: 2, tokens: 32000 },           // 2 RPM, 32k TPM
        "gemini-1.5-pro": { req: 2, tokens: 32000 },              // Alias de pro-latest

        // Modelos experimentales
        "gemini-2.0-flash": { req: 10, tokens: 1000000 },         // 10 RPM, 1M TPM
        "gemini-2.5-flash-lite": { req: 1000, tokens: 4000000 },  // 1000 req/día, 4M TPM

        // Grok (xAI)
        "grok-2": { req: 60, tokens: 100000 },
        "grok-beta": { req: 60, tokens: 100000 },

        // DeepSeek
        "deepseek-chat": { req: 100, tokens: 200000 },
        "deepseek-coder": { req: 100, tokens: 200000 },

        // Qwen (Alibaba)
        "qwen-turbo": { req: 60, tokens: 300000 },
        "qwen-plus": { req: 60, tokens: 300000 },
        "qwen-max": { req: 60, tokens: 300000 }
    };

    const limit = limits[model] || limits["gemini-flash-latest"];

    // Simulación de uso más realista
    // En producción, esto debería leerse de un sistema de tracking real
    const isLimited = false; // Cambiar según el estado real de la API
    const usagePercentage = isLimited ? 1.0 : Math.random() * 0.6; // 0-60% de uso

    return {
        modelName: model,
        requestsUsed: Math.floor(limit.req * usagePercentage),
        requestsLimit: limit.req,
        tokensUsed: Math.floor(limit.tokens * usagePercentage),
        tokensLimit: limit.tokens,
        resetInSeconds: isLimited ? 45 : 0,
        status: isLimited ? "limited" : "active"
    };
}

export async function getCompanySettings(): Promise<CompanySettings> {
    try {
        const settingsSnap = await db.collection("settings").doc("main").get();
        const defaultSettings: CompanySettings = {
            companyName: "CoreAura",
            whatsappNumber: "+52 1 55 1234 5678",
            supportEmail: "hola@coreaura.com.mx",
            fiscalName: "COREAURA S.A.S. DE C.V.",
            rfc: "COR230101XYZ",
            fiscalAddress: "Av. Reforma 222, CDMX, México",
            timezone: "America/Mexico_City",
            aiModel: "gemini-1.5-flash",
            businessHours: {
                monday: "09:00 - 18:00",
                tuesday: "09:00 - 18:00",
                wednesday: "09:00 - 18:00",
                thursday: "09:00 - 18:00",
                friday: "09:00 - 18:00",
                saturday: "10:00 - 14:00",
                sunday: "Cerrado"
            },
            agentName: "Lysandra",
            agentImage: "/images/lysandra-avatar.png",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h"
        };

        if (settingsSnap.exists) {
            const data = settingsSnap.data() as any;
            return {
                ...defaultSettings,
                ...data
            };
        }
        return defaultSettings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        throw new Error("Error al cargar los ajustes.");
    }
}

export async function updateCompanySettings(data: Partial<CompanySettings>) {
    try {
        await db.collection("settings").doc("main").set({
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, error: "Error al guardar los ajustes." };
    }
}

export async function uploadAgentAvatar(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No hay archivo");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const bucket = storage.bucket();
        const fileName = `avatars/agent-${Date.now()}.png`;
        const storageFile = bucket.file(fileName);

        await storageFile.save(buffer, {
            metadata: {
                contentType: 'image/png',
                cacheControl: 'public, max-age=31536000',
            }
        });

        // Hacer el archivo público para que sea accesible vía URL directa
        await storageFile.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return { success: false, error: "Error al subir la imagen a Storage." };
    }
}
export async function resetSystemData(options: {
    metrics: boolean;
    appointments: boolean;
    training: boolean;
    knowledge: boolean;
    identity: boolean;
    contact: boolean;
    fiscal: boolean;
    address: boolean;
    hours: boolean;
    timezone: boolean;
    agent: boolean;
}) {
    try {
        const batch = db.batch();

        if (options.metrics) {
            const conversations = await db.collection("conversations").get();
            conversations.docs.forEach(doc => batch.delete(doc.ref));
        }

        if (options.appointments) {
            const appointments = await db.collection("appointments").get();
            appointments.docs.forEach(doc => batch.delete(doc.ref));
        }

        if (options.training) {
            const settingsRef = db.collection("settings").doc("main");
            batch.update(settingsRef, {
                systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a agendar citas y resolver dudas sobre tecnología.",
                instructionBlocks: [],
                updatedAt: new Date().toISOString()
            });
        }

        if (options.knowledge) {
            const knowledge = await db.collection("knowledge").get();
            knowledge.docs.forEach(doc => batch.delete(doc.ref));
        }

        const settingsRef = db.collection("settings").doc("main");
        const updateData: any = { updatedAt: new Date().toISOString() };

        if (options.identity) {
            updateData.companyName = "CoreAura";
        }

        if (options.contact) {
            updateData.whatsappNumber = "+52 1 55 1234 5678";
            updateData.supportEmail = "hola@coreaura.com.mx";
        }

        if (options.fiscal) {
            updateData.fiscalName = "COREAURA S.A.S. DE C.V.";
            updateData.rfc = "COR230101XYZ";
        }

        if (options.address) {
            updateData.fiscalAddress = "Av. Reforma 222, CDMX, México";
        }

        if (options.hours) {
            updateData.businessHours = {
                monday: "09:00 - 18:00",
                tuesday: "09:00 - 18:00",
                wednesday: "09:00 - 18:00",
                thursday: "09:00 - 18:00",
                friday: "09:00 - 18:00",
                saturday: "10:00 - 14:00",
                sunday: "Cerrado"
            };
        }

        if (options.timezone) {
            updateData.timezone = "America/Mexico_City";
        }

        if (options.agent) {
            updateData.agentName = "Lysandra";
            updateData.agentImage = "/avatars/lysandra.webp";
        }

        if (Object.keys(updateData).length > 1) {
            batch.update(settingsRef, updateData);
        }

        await batch.commit();
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Error resetting system data:", error);
        return { success: false, error: "Error al reiniciar los datos." };
    }
}
