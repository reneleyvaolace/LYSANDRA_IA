import { db } from "../lib/firebase-admin";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function setCorrectModel() {
    console.log("--- AJUSTANDO MODELO A GEMINI 2.0 FLASH (GRATUITO) ---");

    try {
        const settingsRef = db.collection("settings").doc("main");

        const newConfig = {
            aiModel: "gemini-2.0-flash", // Modelo validado en el listado
            updatedAt: new Date().toISOString()
        };

        await settingsRef.set(newConfig, { merge: true });
        console.log("✅ Firestore actualizado: Modelo cambiado a 'gemini-2.0-flash'");

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

setCorrectModel();
