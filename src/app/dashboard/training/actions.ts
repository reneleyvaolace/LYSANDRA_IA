"use server";

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    try {
        const settingsSnap = await db.collection("settings").doc("main").get();
        if (settingsSnap.exists) {
            return settingsSnap.data();
        }
        return {
            companyName: "CoreAura",
            systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a agendar citas y resolver dudas sobre tecnología. Usa las herramientas disponibles para consultar disponibilidad y agendar citas."
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        throw new Error("No se pudieron cargar los ajustes.");
    }
}

export async function updateSystemPrompt(newPrompt: string) {
    try {
        await db.collection("settings").doc("main").set({
            systemPrompt: newPrompt,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        revalidatePath("/dashboard/training");
        return { success: true };
    } catch (error) {
        console.error("Error updating prompt:", error);
        return { success: false, error: "Error al guardar el prompt." };
    }
}
