import { GoogleGenerativeAI, Tool } from "@google/generative-ai";
import { db } from "./firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const DEFAULT_MODEL = "gemini-flash-latest";

export function getModel(systemInstruction?: string, modelName: string = DEFAULT_MODEL) {
    return genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
    });
}


// Definition of tools (Function Calling)
export const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "checkAvailability",
                description: "Checks if a specific date and time is available for an appointment.",
                parameters: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            description: "The date and time in ISO 8601 format (e.g., 2023-10-25T10:00:00Z).",
                        },
                    },
                    required: ["date"],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
            },
            {
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
                            description: "The date and time in ISO 8601 format.",
                        },
                        type: {
                            type: "string",
                            description: "The type of appointment (e.g., Consultoría, Soporte, Demo).",
                        },
                    },
                    required: ["name", "date", "type"],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
            },
            {
                name: "searchKnowledgeBase",
                description: "Searches the company knowledge base for information about CoreAura's services, pricing, contact info, technologies, and more. Use this when the user asks about the company, services, pricing, or any business-related information.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query to find relevant information in the knowledge base.",
                        },
                    },
                    required: ["query"],
                } as any,
            },
            {
                name: "escalateToHuman",
                description: "Escalates the conversation to a human agent. Use this when the user explicitly asks to speak with a human, or when you cannot resolve their request after several attempts, or when you detect frustration.",
                parameters: {
                    type: "object",
                    properties: {
                        reason: {
                            type: "string",
                            description: "The reason for escalation (e.g., 'User asked for human', 'Query too complex', 'Technical issue').",
                        },
                    },
                    required: ["reason"],
                } as any,
            },
            {
                name: "getCurrentDateTime",
                description: "Gets the current date and time. Use this ALWAYS before scheduling appointments or when the user asks about dates/times. Returns current date/time in ISO 8601 format with Mexico City timezone.",
                parameters: {
                    type: "object",
                    properties: {},
                    required: [],
                } as any,
            },
        ],
    },
];

// Implementation of tools
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeToolCall(functionCall: { name: string; args: any }, context?: { phoneNumber?: string }) {
    const { name, args } = functionCall;

    switch (name) {
        case "getCurrentDateTime": {
            // Obtener configuración de zona horaria y formatos desde Firestore
            const settingsDoc = await db.collection("settings").doc("main").get();
            const settings = settingsDoc.data();
            const timezone = settings?.timezone || 'America/Mexico_City';
            const dateFormat = settings?.dateFormat || 'DD/MM/YYYY';
            const timeFormat = settings?.timeFormat || '24h';

            const now = new Date();

            // Formato legible con la zona horaria configurada
            const formattedTime = new Intl.DateTimeFormat('es-MX', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: timeFormat === '12h',
                weekday: 'long'
            }).format(now);

            // ISO format para uso interno
            const isoTime = now.toLocaleString('sv-SE', { timeZone: timezone });

            return {
                currentDateTime: isoTime,
                formatted: formattedTime,
                timezone: timezone,
                dateFormat: dateFormat,
                timeFormat: timeFormat,
                timestamp: now.getTime()
            };
        }
        case "checkAvailability": {
            const { date } = args;
            const snapshot = await db.collection("appointments")
                .where("date", "==", date)
                .where("status", "==", "confirmed")
                .get();

            const isAvailable = snapshot.empty;
            return { available: isAvailable, message: isAvailable ? "Slot is available." : "Slot is already taken." };
        }

        case "bookSlot": {
            const { name, date, type } = args;
            const docRef = await db.collection("appointments").add({
                clientName: name,
                date: date,
                type: type,
                status: "confirmed",
                createdAt: new Date().toISOString(),
            });
            return { success: true, appointmentId: docRef.id, message: `Appointment booked for ${name} on ${date}.` };
        }

        case "searchKnowledgeBase": {
            const { query } = args;
            const KnowledgeBase = (await import("./knowledge-base")).default;
            const kb = await KnowledgeBase.getInstance();
            const results = kb.search(query);

            if (results.length === 0) {
                return {
                    found: false,
                    message: "No encontré información específica sobre eso en mi base de conocimiento."
                };
            }

            // Return top 3 most relevant results
            const topResults = results.slice(0, 3);
            return {
                found: true,
                results: topResults.map(r => ({
                    category: r.category,
                    content: r.content
                })),
                message: `Encontré ${results.length} resultado(s) relevante(s).`
            };
        }

        case "escalateToHuman": {
            const { reason } = args;
            const { phoneNumber } = context || {};

            if (phoneNumber) {
                await db.collection("conversations").doc(phoneNumber).set({
                    status: "human_needed",
                    escalationReason: reason,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }

            return {
                success: true,
                message: "Conversation escalated to human agent. A representative will contact you shortly.",
                transferring: true
            };
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
