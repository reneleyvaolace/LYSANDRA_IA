import { db } from "../lib/firebase-admin";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function fixConfiguration() {
    console.log("--- CORRIGIENDO CONFIGURACIÓN PARA API GRATUITA ---");

    try {
        const settingsRef = db.collection("settings").doc("main");

        // Modelo recomendado para Tier Gratuito: gemini-1.5-flash
        // O gemini-2.0-flash (que actualmente está en preview gratuito)
        const newConfig = {
            companyName: "CoreAura AI",
            systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a conocer nuestros servicios de tecnología y agendar citas. Usa la base de conocimiento para dar respuestas precisas.",
            aiModel: "gemini-1.5-flash", // Forzamos el modelo gratuito más estable
            updatedAt: new Date().toISOString(),
            status: "active"
        };

        await settingsRef.set(newConfig, { merge: true });
        console.log("✅ Firestore actualizado: Modelo cambiado a 'gemini-1.5-flash'");

    } catch (error: any) {
        console.error("❌ Error al actualizar Firestore:", error.message);
    }
}

fixConfiguration();
