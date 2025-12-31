"use server";

import { db } from "@/lib/firebase-admin";

export interface CompanyKnowledge {
    company: {
        name: string;
        legalName: string;
        tagline: string;
        description: string;
        founded: string;
        website: string;
        industry: string;
        targetMarket: string;
    };
    fiscalInfo: {
        rfc: string;
        regime: string;
        invoicing: string;
        taxStatus: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        socialMedia: {
            linkedin: string;
            twitter: string;
            facebook: string;
        };
    };
    services: Array<{
        id: string;
        name: string;
        description: string;
        features: string[];
        technologies: string[];
        pricing: string;
    }>;
    values: Array<{
        name: string;
        description: string;
    }>;
    technologies: {
        frontend: string[];
        backend: string[];
        databases: string[];
        cloud: string[];
        devops: string[];
        security: string[];
    };
    portfolio: Array<{
        name: string;
        description: string;
        industry: string;
        technologies: string[];
    }>;
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    certifications: string[];
    team: {
        size: string;
        expertise: string[];
    };
}

export async function getKnowledgeBase(): Promise<CompanyKnowledge | null> {
    try {
        const doc = await db.collection("knowledge").doc("company").get();

        if (!doc.exists) {
            // Return default data from JSON file
            const defaultData = require("@/data/knowledge-base/company-info.json");
            return defaultData;
        }

        return doc.data() as CompanyKnowledge;
    } catch (error) {
        console.error("Error getting knowledge base:", error);
        return null;
    }
}

export async function updateKnowledgeBase(data: CompanyKnowledge): Promise<{ success: boolean; message: string }> {
    try {
        await db.collection("knowledge").doc("company").set(data, { merge: true });

        return {
            success: true,
            message: "Base de conocimiento actualizada exitosamente"
        };
    } catch (error: any) {
        console.error("Error updating knowledge base:", error);
        return {
            success: false,
            message: error.message || "Error al actualizar la base de conocimiento"
        };
    }
}

export async function resetKnowledgeBase(): Promise<{ success: boolean; message: string }> {
    try {
        const defaultData = require("@/data/knowledge-base/company-info.json");
        await db.collection("knowledge").doc("company").set(defaultData);

        return {
            success: true,
            message: "Base de conocimiento restablecida a valores por defecto"
        };
    } catch (error: any) {
        console.error("Error resetting knowledge base:", error);
        return {
            success: false,
            message: error.message || "Error al restablecer la base de conocimiento"
        };
    }
}
