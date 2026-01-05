import OpenAI from "openai";
import { db } from "./firebase-admin";

// Inicializar OpenAI con la key de .env (si existe)
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export function getOpenAIClient(apiKey?: string): OpenAI {
    // Si se proporciona una API Key, crear una nueva instancia
    // Si no, usar la instancia global con la key de .env
    if (apiKey) {
        return new OpenAI({ apiKey });
    }

    if (!openai) {
        throw new Error("OpenAI API Key no configurada. Configúrala en .env.local o en el dashboard.");
    }

    return openai;
}

// Definición de herramientas para OpenAI (formato OpenAI)
export const openaiTools = [
    {
        type: "function" as const,
        function: {
            name: "getCurrentDateTime",
            description: "Gets the current date and time. Use this ALWAYS before scheduling appointments or when the user asks about dates/times. Returns current date/time in ISO 8601 format with Mexico City timezone.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "bookSlot",
            description: "Books an appointment for a client.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The client's name.",
                    },
                    date: {
                        type: "string",
                        description: "The date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss).",
                    },
                    type: {
                        type: "string",
                        description: "The type of appointment (e.g., Consultoría, Soporte, Demo, Reunión).",
                    },
                },
                required: ["name", "date", "type"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "escalateToHuman",
            description: "Escalates the conversation to a human agent when the user requests it or when the AI cannot help.",
            parameters: {
                type: "object",
                properties: {
                    reason: {
                        type: "string",
                        description: "The reason for escalation.",
                    },
                },
                required: ["reason"],
            },
        },
    },
];

// Función para ejecutar tool calls (igual que en Gemini)
export async function executeOpenAIToolCall(
    toolCall: { name: string; arguments: string },
    context: { phoneNumber: string }
) {
    const { name, arguments: argsString } = toolCall;
    const args = JSON.parse(argsString);

    console.log(`🔧 [OpenAI] Calling ${name} with args:`, args);

    switch (name) {
        case "getCurrentDateTime": {
            // Obtener configuración regional del usuario
            const settingsSnap = await db.collection("settings").doc("main").get();
            const settings = settingsSnap.data();
            const timezone = settings?.timezone || "America/Mexico_City";
            const dateFormat = settings?.dateFormat || "DD/MM/YYYY";
            const timeFormat = settings?.timeFormat || "24h";

            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: timeFormat === "12h",
            };

            const formatter = new Intl.DateTimeFormat("es-MX", options);
            const parts = formatter.formatToParts(now);

            const year = parts.find((p) => p.type === "year")?.value;
            const month = parts.find((p) => p.type === "month")?.value;
            const day = parts.find((p) => p.type === "day")?.value;
            const hour = parts.find((p) => p.type === "hour")?.value;
            const minute = parts.find((p) => p.type === "minute")?.value;
            const second = parts.find((p) => p.type === "second")?.value;

            const isoDateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

            let formattedDate = "";
            if (dateFormat === "DD/MM/YYYY") {
                formattedDate = `${day}/${month}/${year}`;
            } else if (dateFormat === "MM/DD/YYYY") {
                formattedDate = `${month}/${day}/${year}`;
            } else {
                formattedDate = `${year}-${month}-${day}`;
            }

            const formattedTime = timeFormat === "12h"
                ? `${hour}:${minute} ${parseInt(hour!) >= 12 ? 'PM' : 'AM'}`
                : `${hour}:${minute}`;

            return {
                currentDateTime: isoDateTime,
                timezone,
                formattedDate,
                formattedTime,
                dayOfWeek: now.toLocaleDateString("es-MX", { weekday: "long", timeZone: timezone }),
            };
        }

        case "bookSlot": {
            const { name: clientName, date, type } = args;

            await db.collection("appointments").add({
                phoneNumber: context.phoneNumber,
                clientName,
                date,
                type,
                status: "pending",
                createdAt: new Date().toISOString(),
            });

            return {
                success: true,
                message: `Cita agendada para ${clientName} el ${date} (${type})`,
                appointmentDetails: { clientName, date, type },
            };
        }

        case "escalateToHuman": {
            const { reason } = args;

            await db.collection("escalations").add({
                phoneNumber: context.phoneNumber,
                reason,
                status: "pending",
                createdAt: new Date().toISOString(),
            });

            return {
                success: true,
                message: "Solicitud de escalación registrada. Un agente humano te contactará pronto.",
            };
        }

        default:
            return { error: `Unknown tool: ${name}` };
    }
}
