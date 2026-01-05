import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase-admin";
import { getModel, tools, executeToolCall } from "@/lib/gemini";
import { Content, Part } from "@google/generative-ai";

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
    try {
        let body = "";
        let phoneNumber = "";
        let isSimulator = false;

        // Detectar si es JSON (WhatsApp/Simulador) o FormData (Twilio)
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            // Formato WhatsApp/Simulador (JSON)
            const jsonData = await req.json();

            // Extraer mensaje del formato de WhatsApp
            const message = jsonData.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            if (!message) {
                return NextResponse.json({ error: "Invalid WhatsApp format" }, { status: 400 });
            }

            body = message.text?.body || "";
            phoneNumber = message.from || "";
            isSimulator = phoneNumber.includes("12345678") || phoneNumber.includes("simulator");

        } else {
            // Formato Twilio (FormData)
            const formData = await req.formData();
            body = formData.get("Body")?.toString() || "";
            const from = formData.get("From")?.toString() || "";

            if (!from) {
                return new NextResponse("Missing From", { status: 400 });
            }

            phoneNumber = from.replace("whatsapp:", "");
            isSimulator = false;
        }

        if (!body || !phoneNumber) {
            return NextResponse.json({ error: "Missing body or phone number" }, { status: 400 });
        }

        console.log("📱 WhatsApp Message:", { phoneNumber, body, isSimulator });

        const conversationRef = db.collection("conversations").doc(phoneNumber);

        // 1. Check conversation status
        const conversationSnap = await conversationRef.get();
        const conversationData = conversationSnap.exists ? conversationSnap.data() : { status: "active" };

        if (conversationData?.status === "human_needed") {
            const twiml = new MessagingResponse();
            // Don't respond automatically or send a "wait" message if already escalated
            // Or maybe check if enough time has passed to reset?
            // For now, let's just avoid AI interference if a human is requested.
            return new NextResponse(twiml.toString(), {
                headers: { "Content-Type": "text/xml" },
            });
        }

        // 2. Save user message to Firestore
        const userMsg = {
            role: "user",
            content: body,
            timestamp: new Date().toISOString(),
        };
        await conversationRef.collection("history").add(userMsg);

        // 3. Retrieve last 10 messages for context
        const historySnapshot = await conversationRef
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
            agentName: string;
            systemPrompt: string;
            aiModel: string;
        }
        const settingsSnap = await db.collection("settings").doc("main").get();
        const settings = (settingsSnap.exists ? settingsSnap.data() : {
            companyName: "CoreAura",
            agentName: "Lysandra",
            systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a agendar citas y resolver dudas sobre tecnología. Usa las herramientas disponibles para consultar disponibilidad y agendar citas.",
            aiModel: "gemini-flash-latest"
        }) as Settings;

        const agentName = settings.agentName || "Lysandra";
        const basePrompt = settings.systemPrompt;
        const dateTimeInstructions = `

MANEJO DE FECHAS Y HORAS:
- SIEMPRE usa 'getCurrentDateTime' ANTES de agendar citas o hablar sobre fechas.
- NO asumas la fecha actual. SIEMPRE consulta primero.
- Cuando el usuario diga "mañana", "próximo lunes", etc., primero obtén la fecha actual.
- Zona horaria: America/Mexico_City.
- Formato: YYYY-MM-DDTHH:mm:ss (ISO 8601).
`;
        const finalPrompt = `Tu nombre es ${agentName}. ${basePrompt}${dateTimeInstructions}`;

        // 4. Call Gemini
        const model = getModel(finalPrompt, settings.aiModel || "gemini-flash-latest");
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
            const toolResult = await executeToolCall(call.functionCall, { phoneNumber });

            // Send result back to Gemini
            const toolResponse = await chat.sendMessage([{
                functionResponse: {
                    name: call.functionCall.name,
                    response: toolResult
                }
            }]);

            responseText = toolResponse.response.text();

            // If it was an escalation, we might want to append a specific note or just use AI text
        } else {
            responseText = result.response.text();
        }

        // 7. Save AI response to Firestore
        const aiMsg = {
            role: "model",
            content: responseText,
            timestamp: new Date().toISOString(),
        };
        await conversationRef.collection("history").add(aiMsg);

        // 7. Responder según el tipo de cliente (simulador o WhatsApp real)
        if (isSimulator) {
            // Respuesta para el simulador (JSON)
            return NextResponse.json({
                success: true,
                reply: responseText,
                phoneNumber: phoneNumber
            });
        } else {
            // Respuesta para WhatsApp/Twilio real (TwiML)
            const twiml = new MessagingResponse();
            twiml.message(responseText);
            return new NextResponse(twiml.toString(), {
                headers: { "Content-Type": "text/xml" },
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("❌ Webhook error:", error);

        // Retornar JSON para facilitar debugging
        return NextResponse.json({
            success: false,
            error: error.message || "Error procesando mensaje",
            reply: "Lo siento, estoy experimentando dificultades técnicas. Por favor intenta más tarde."
        }, { status: 500 });
    }
}

// Webhook verification para Meta/WhatsApp (GET request)
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "lysandra_verify_token";

    console.log("🔍 Webhook Verification Request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully");
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.log("❌ Webhook verification failed");
        return new NextResponse("Forbidden", { status: 403 });
    }
}
