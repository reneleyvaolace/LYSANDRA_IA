import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("--- TEST DE GEMINI ---");

    if (!apiKey) {
        console.error("No se encontró la API Key.");
        return;
    }

    console.log(`Clave detectada: ${apiKey.substring(0, 10)}... (Longitud: ${apiKey.length})`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Di 'HOLA MUNDO'");
        const text = result.response.text();
        console.log("Respuesta de Gemini:", text);
        console.log("--- TEST FINALIZADO OK ---");
    } catch (err: any) {
        console.error("Error en el test:", err.message);
    }
}

testGemini();
