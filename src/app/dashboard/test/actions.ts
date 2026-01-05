"use server";

import { getModel, tools, executeToolCall } from "@/lib/gemini";
import { db } from "@/lib/firebase-admin";

export async function getTestSettings() {
    try {
        if (!db) throw new Error("Firestore DB not available");
        const settingsDoc = await db.collection("settings").doc("main").get();
        const settings = settingsDoc.data();
        return {
            aiModel: settings?.aiModel || "gemini-flash-latest",
            systemPrompt: settings?.systemPrompt || "Eres Lysandra...",
            agentName: settings?.agentName || "Lysandra",
            agentImage: settings?.agentImage || "/avatars/lysandra.webp"
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { aiModel: "Error", systemPrompt: "Error", agentName: "Lysandra", agentImage: "/avatars/lysandra.webp" };
    }
}

export async function sendMessageToAI(message: string, history: { role: "user" | "model"; content: string }[]) {
    try {
        console.log("Laboratorio IA: Recibiendo mensaje:", message);
        if (!db) throw new Error("Firestore DB not available");

        // 1. Get current system prompt and model
        const settingsDoc = await db.collection("settings").doc("main").get();
        const settings = settingsDoc.data();
        const agentName = settings?.agentName || "Lysandra";
        const basePrompt = settings?.systemPrompt || `Eres ${agentName}, una asistente de CoreAura.`;

        // Inyectar nombre si el prompt no lo menciona explícitamente de forma dinámica
        const systemPrompt = `Tu nombre es ${agentName}. ${basePrompt}`;
        const aiModel = settings?.aiModel || "gemini-flash-latest";

        const enhancedSystemPrompt = `${systemPrompt}

IMPORTANTE: Tienes acceso a una base de conocimiento sobre CoreAura. Cuando el usuario pregunte sobre:
- Servicios de la empresa
- Precios
- Información de contacto
- Tecnologías que usamos
- Proyectos realizados
- Información fiscal
- Cualquier dato sobre CoreAura

Debes usar la función 'searchKnowledgeBase' para obtener información precisa y actualizada.

MANEJO DE FECHAS Y HORAS:
- SIEMPRE usa 'getCurrentDateTime' ANTES de agendar citas o hablar sobre fechas relativas.
- NO asumas la fecha actual. SIEMPRE consulta primero con getCurrentDateTime.
- Cuando el usuario diga "mañana", "la próxima semana", "el lunes", etc., primero obtén la fecha actual.
- Todas las citas deben agendarse en zona horaria de México (America/Mexico_City).
- Formato de fechas para agendar: YYYY-MM-DDTHH:mm:ss (ISO 8601).

Siempre responde en español de manera profesional y amigable.`;

        console.log(`Laboratorio IA: Usando Modelo: ${aiModel}`);
        console.log("Laboratorio IA: Usando System Prompt (truncado):", enhancedSystemPrompt?.substring(0, 50) + "...");

        // 2. Initialize model with system directive and tools
        const model = getModel(enhancedSystemPrompt, aiModel);

        // 3. Format history for Gemini
        const contents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }));

        // 4. Start chat with tools
        const chat = model.startChat({
            history: contents,
            tools: tools,
        });

        let result = await chat.sendMessage(message);
        let response = result.response;

        // 5. Handle function calls if any
        let functionCalls = response.functionCalls();
        while (functionCalls && functionCalls.length > 0) {
            console.log("Laboratorio IA: Ejecutando function calls:", functionCalls.map(fc => fc.name));

            const functionResponses = await Promise.all(
                functionCalls.map(async (fc) => {
                    const toolResult = await executeToolCall(fc, { phoneNumber: "test-user" });
                    return {
                        functionResponse: {
                            name: fc.name,
                            response: toolResult
                        }
                    };
                })
            );

            result = await chat.sendMessage(functionResponses);
            response = result.response;
            functionCalls = response.functionCalls();
        }

        const text = response.text();

        console.log("Laboratorio IA: Respuesta generada exitosamente.");
        return { success: true, text };
    } catch (error: any) {
        console.error("Error in sendMessageToAI:", error);
        return {
            success: false,
            text: error.message || "Error al procesar el mensaje. Revisa la consola o las credenciales."
        };
    }
}
