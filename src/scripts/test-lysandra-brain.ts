import { getModel, tools, executeToolCall } from "../lib/gemini";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testLysandraBrain() {
    console.log("--- TEST DEL CEREBRO DE LYSANDRA (GEMINI + TOOLS) ---");

    const systemPrompt = "Eres Lysandra, la asistente de IA de CoreAura. Tienes acceso a la base de conocimiento de la empresa. Responde de forma amable y profesional.";
    const model = getModel(systemPrompt, "gemini-2.0-flash");

    const chat = model.startChat({
        tools: tools as any,
    });

    const userMessage = "¿Me puedes decir qué servicios ofrecen en CoreAura y si emiten factura?";
    console.log(`\n👤 Usuario: ${userMessage}`);

    try {
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const candidate = response.candidates?.[0].content.parts;

        const toolCall = candidate?.find(p => p.functionCall);

        if (toolCall && toolCall.functionCall) {
            console.log(`\n🤖 Lysandra decidió usar la herramienta: ${toolCall.functionCall.name}`);
            console.log(`📊 Argumentos: ${JSON.stringify(toolCall.functionCall.args)}`);

            const toolResult = await executeToolCall(toolCall.functionCall);
            console.log(`✅ Resultado de la herramienta obtenido.`);

            const finalResult = await chat.sendMessage([{
                functionResponse: {
                    name: toolCall.functionCall.name,
                    response: toolResult
                }
            }]);

            console.log(`\n🤖 Lysandra responde: ${finalResult.response.text()}`);
        } else {
            console.log(`\n🤖 Lysandra responde directamente: ${response.text()}`);
        }

    } catch (error: any) {
        console.error("❌ Error en el test del cerebro:", error.message);
    }
}

testLysandraBrain();
