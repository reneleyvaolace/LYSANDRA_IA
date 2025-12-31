import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase-admin";
import { getModel, tools, executeToolCall } from "@/lib/gemini";
import { Content, Part } from "@google/generative-ai";

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const body = formData.get("Body")?.toString() || "";
        const from = formData.get("From")?.toString() || ""; // whatsapp:+phoneNumber

        if (!from) {
            return new NextResponse("Missing From", { status: 400 });
        }

        const phoneNumber = from.replace("whatsapp:", "");

        // 1. Save user message to Firestore
        const userMsg = {
            role: "user",
            content: body,
            timestamp: new Date().toISOString(),
        };
        await db.collection("conversations").doc(phoneNumber).collection("history").add(userMsg);

        // 2. Retrieve last 10 messages for context
        const historySnapshot = await db.collection("conversations")
            .doc(phoneNumber)
            .collection("history")
            .orderBy("timestamp", "desc")
            .limit(10)
            .get();

        const history: Content[] = historySnapshot.docs
            .reverse()
            .map(doc => ({
                role: doc.data().role === "user" ? "user" : "model",
                parts: [{ text: doc.data().content }] as Part[],
            }));

        // 3. System Prompt & Settings
        interface Settings {
            companyName: string;
            systemPrompt: string;
            aiModel: string;
        }
        const settingsSnap = await db.collection("settings").doc("main").get();
        const settings = (settingsSnap.exists ? settingsSnap.data() : {
            companyName: "CoreAura",
            systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a agendar citas y resolver dudas sobre tecnología. Usa las herramientas disponibles para consultar disponibilidad y agendar citas.",
            aiModel: "gemini-flash-latest"
        }) as Settings;

        // 4. Call Gemini
        const model = getModel(settings.systemPrompt, settings.aiModel || "gemini-flash-latest");
        const chat = model.startChat({
            history: history,
            generationConfig: { maxOutputTokens: 500 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: tools as any, // Cast due to library type definitions sometimes being strict
        });

        const result = await chat.sendMessage(body);
        let responseText = "";

        // 5. Handle Tool Calls
        const call = result.response.candidates?.[0].content.parts.find(p => p.functionCall);

        if (call && call.functionCall) {
            const toolResult = await executeToolCall(call.functionCall);

            // Send result back to Gemini
            const toolResponse = await chat.sendMessage([{
                functionResponse: {
                    name: call.functionCall.name,
                    response: toolResult
                }
            }]);

            responseText = toolResponse.response.text();
        } else {
            responseText = result.response.text();
        }

        // 6. Save AI response to Firestore
        const aiMsg = {
            role: "model",
            content: responseText,
            timestamp: new Date().toISOString(),
        };
        await db.collection("conversations").doc(phoneNumber).collection("history").add(aiMsg);

        // 7. Respond to Twilio
        const twiml = new MessagingResponse();
        twiml.message(responseText);

        return new NextResponse(twiml.toString(), {
            headers: { "Content-Type": "text/xml" },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Webhook error:", error);
        const twiml = new MessagingResponse();
        twiml.message("Lo siento, Lysandra está experimentando dificultades técnicas. Por favor intenta más tarde.");
        return new NextResponse(twiml.toString(), {
            headers: { "Content-Type": "text/xml" },
        });
    }
}
