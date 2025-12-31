"use server";

import { db } from "@/lib/firebase-admin";
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
    businessHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
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
    // Para propósitos de este ejercicio y dado que la API de Gemini no expone cuotas directas fácilmente,
    // simularemos los límites del Free Tier.
    const limits: Record<string, { req: number; tokens: number }> = {
        "gemini-flash-latest": { req: 15, tokens: 1000000 },
        "gemini-2.0-flash": { req: 2, tokens: 500000 },
        "gemini-pro-latest": { req: 2, tokens: 32000 },
    };

    const limit = limits[model] || limits["gemini-flash-latest"];

    // Simulación de uso (esto en una app real podría guardarse en Redis/Firestore)
    return {
        modelName: model,
        requestsUsed: model === "gemini-2.0-flash" ? limit.req : Math.floor(limit.req * 0.4),
        requestsLimit: limit.req,
        tokensUsed: Math.floor(limit.tokens * 0.25),
        tokensLimit: limit.tokens,
        resetInSeconds: model === "gemini-2.0-flash" ? 42 : 0,
        status: model === "gemini-2.0-flash" ? "limited" : "active"
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
            }
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
