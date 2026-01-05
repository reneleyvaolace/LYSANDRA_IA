import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase-admin";
import { getModel, tools, executeToolCall } from "@/lib/gemini";
import { Content, Part } from "@google/generative-ai";

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
    let settings: any = null;
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

        // 2. Retrieve history context BEFORE adding the current message
        // This avoids duplication in the AI context and allows us to clean the history
        const historySnapshot = await conversationRef
            .collection("history")
            .orderBy("timestamp", "desc")
            .limit(10)
            .get();

        let rawHistory = historySnapshot.docs
            .map(doc => doc.data())
            .reverse();

        // 3. Ensure history starts with 'user' role and ends with 'model' role (Gemini Requirement)
        // This ensures alternating roles [user, model, user, model] when we send the next 'user' message.
        while (rawHistory.length > 0 && rawHistory[0].role !== "user") {
            rawHistory.shift();
        }
        while (rawHistory.length > 0 && rawHistory[rawHistory.length - 1].role !== "model") {
            rawHistory.pop();
        }

        const history: Content[] = rawHistory.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }] as Part[],
        }));

        // 4. Save the NEW user message to Firestore (for future context)
        const userMsg = {
            role: "user",
            content: body,
            timestamp: new Date().toISOString(),
        };
        await conversationRef.collection("history").add(userMsg);

        // 3. System Prompt & Settings
        try {
            const settingsSnap = await db.collection("settings").doc("main").get();
            settings = (settingsSnap.exists ? settingsSnap.data() : {
                companyName: "CoreAura",
                agentName: "Lysandra",
                systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable. Ayudas a los clientes a agendar citas y resolver dudas sobre tecnología. Usa las herramientas disponibles para consultar disponibilidad y agendar citas.",
                aiModel: "gemini-flash-latest",
                aiProvider: "gemini"
            });
        } catch (error) {
            console.error("Error fetching settings, using defaults:", error);
            settings = {
                companyName: "CoreAura",
                agentName: "Lysandra",
                systemPrompt: "Eres Lysandra, la asistente de IA de CoreAura. Eres profesional, eficiente y amable.",
                aiModel: "gemini-flash-latest",
                aiProvider: "gemini"
            };
        }

        const agentName = settings.agentName || "Lysandra";
        const basePrompt = settings.systemPrompt;
        const dateTimeInstructions = `

MANEJO DE FECHAS Y HORAS:
- SIEMPRE usa 'getCurrentDateTime' ANTES de agendar citas o hablar sobre fechas.
- NO asumas la fecha actual. SIEMPRE consulta primero.
- Cuando el usuario diga "mañana", "próximo lunes", etc., primero obtén la fecha actual con getCurrentDateTime.
- Zona horaria: America/Mexico_City.
- Formato para bookSlot: YYYY-MM-DDTHH:mm:ss (ISO 8601).

AGENDAMIENTO DE CITAS:
- Si el usuario da fecha Y hora (ej: "lunes a las 7pm"), usa bookSlot directamente.
- Si el usuario solo da fecha sin hora, pregunta la hora preferida.
- Si el usuario solo da hora sin fecha, pregunta el día preferido.
- Siempre confirma: nombre, fecha, hora y tipo de servicio antes de agendar.
- Tipos de servicio válidos: Consultoría, Soporte, Demo, Reunión.
`;
        const finalPrompt = `Tu nombre es ${agentName}. ${basePrompt}${dateTimeInstructions}`;

        // 4. Determinar proveedor y llamar a la IA correspondiente
        const provider = settings.aiProvider || 'gemini';
        let responseText = "";

        if (provider !== 'gemini') {
            // ===== OPENAI COMPATIBLE (OpenAI, Grok, DeepSeek, Qwen) =====
            console.log(`🤖 Using OpenAI-Compatible provider: ${provider}`);

            const { getOpenAICompatibleClient, openaiCompatibleTools, executeOpenAICompatibleToolCall } = await import('@/lib/openai-compatible');

            // Determinar la API Key según el proveedor
            let providerApiKey = "";
            if (provider === 'openai') providerApiKey = settings.openaiApiKey || "";
            else if (provider === 'grok') providerApiKey = settings.grokApiKey || "";
            else if (provider === 'deepseek') providerApiKey = settings.deepseekApiKey || "";
            else if (provider === 'qwen') providerApiKey = settings.qwenApiKey || "";

            const openai = getOpenAICompatibleClient(provider as any, providerApiKey);

            // Convertir historial de Gemini a formato OpenAI
            const openaiMessages = [
                { role: "system" as const, content: finalPrompt },
                ...history.map(msg => ({
                    role: msg.role === "user" ? "user" as const : "assistant" as const,
                    content: msg.parts.map(p => p.text).join("")
                })),
                { role: "user" as const, content: body }
            ];

            const completion = await openai.chat.completions.create({
                model: settings.aiModel || "gpt-3.5-turbo",
                messages: openaiMessages,
                tools: openaiCompatibleTools,
                max_tokens: 500,
            });

            const choice = completion.choices[0];

            if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
                console.log(`🔧 Found ${choice.message.tool_calls.length} tool call(s) for ${provider}`);

                const toolResultsMessages = [];

                for (const toolCall of choice.message.tool_calls) {
                    const tc = toolCall as any;
                    const toolResult = await executeOpenAICompatibleToolCall(
                        { name: tc.function.name, arguments: tc.function.arguments },
                        { phoneNumber }
                    );

                    toolResultsMessages.push({
                        role: "tool" as const,
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }

                // Hacer segunda llamada con los resultados
                const secondCompletion = await openai.chat.completions.create({
                    model: settings.aiModel || "gpt-3.5-turbo",
                    messages: [
                        ...openaiMessages,
                        choice.message,
                        ...toolResultsMessages
                    ],
                    max_tokens: 500,
                });

                responseText = secondCompletion.choices[0].message.content || "";
            } else {
                responseText = choice.message.content || "";
            }

        } else {
            // ===== GEMINI (default) =====
            console.log('🤖 Using Gemini provider');

            const geminiApiKey = settings.geminiApiKey && settings.geminiApiKey.trim().length > 0
                ? settings.geminiApiKey
                : undefined;

            const model = getModel(finalPrompt, settings.aiModel || "gemini-flash-latest", geminiApiKey);
            const chat = model.startChat({
                history: history,
                generationConfig: { maxOutputTokens: 500 },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tools: tools as any,
            });

            const result = await chat.sendMessage(body);

            console.log("🤖 Gemini Response Parts:", JSON.stringify(result.response.candidates?.[0].content.parts, null, 2));

            // Handle Tool Calls
            const parts = result.response.candidates?.[0].content.parts || [];
            const functionCalls = parts.filter(p => p.functionCall);

            if (functionCalls.length > 0) {
                console.log(`🔧 Found ${functionCalls.length} function call(s)`);

                for (const call of functionCalls) {
                    if (call.functionCall) {
                        console.log(`🔧 Calling ${call.functionCall.name} with args:`, call.functionCall.args);
                        const toolResult = await executeToolCall(call.functionCall, { phoneNumber });
                        console.log(`✅ Tool result:`, toolResult);

                        const toolResponse = await chat.sendMessage([{
                            functionResponse: {
                                name: call.functionCall.name,
                                response: toolResult
                            }
                        }]);
                        responseText = toolResponse.response.text();
                    }
                }
            } else {
                responseText = result.response.text();
                console.log("💬 Direct response (no tools):", responseText);
            }
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

        const isAuthError = error.message?.includes("API Key") || error.status === 401;
        const errorMessage = isAuthError
            ? `Error de autenticación: Verifica la API Key del proveedor ${settings?.aiProvider || 'configurado'}.`
            : error.message || "Error procesando mensaje";

        return NextResponse.json({
            success: false,
            error: errorMessage,
            reply: `⚠️ Error técnico: ${errorMessage}. Si eres administrador, revisa la configuración en el panel.`
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
