import { GoogleGenerativeAI, Tool } from "@google/generative-ai";
import { db } from "./firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

export function getModel(systemInstruction?: string) {
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
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
        ],
    },
];

// Implementation of tools
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeToolCall(functionCall: { name: string; args: any }) {
    const { name, args } = functionCall;

    switch (name) {
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

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
