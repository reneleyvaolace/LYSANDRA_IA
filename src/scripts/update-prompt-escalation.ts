import { db } from "../lib/firebase-admin";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function updateSystemPromptWithEscalation() {
    console.log("--- ACTUALIZANDO PROMPT CON FLUJO DE ESCALACIÓN ---");

    try {
        const settingsRef = db.collection("settings").doc("main");
        const settingsSnap = await settingsRef.get();
        const currentPrompt = settingsSnap.data()?.systemPrompt || "";

        const escalationInstructions = `
FLUJO DE TRANSFERENCIA HUMANA:
- Si el usuario solicita explícitamente hablar con una persona, agente o humano, DEBES usar la herramienta 'escalateToHuman'.
- Si detectas que el usuario está muy frustrado o si no puedes resolver su duda después de 2 o 3 intentos usando la base de conocimiento, sugiere una transferencia humana y usa 'escalateToHuman'.
- Antes de activar la transferencia, confirma al usuario que un agente humano revisará la conversación y se pondrá en contacto pronto.
`;

        if (!currentPrompt.includes("escalateToHuman")) {
            const newPrompt = currentPrompt + "\n" + escalationInstructions;
            await settingsRef.set({ systemPrompt: newPrompt }, { merge: true });
            console.log("✅ System Prompt actualizado con instrucciones de escalación.");
        } else {
            console.log("ℹ️ El Prompt ya contiene instrucciones de escalación.");
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

updateSystemPromptWithEscalation();
