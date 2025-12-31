import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Verificando API Key de Gemini...");

    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY no se encuentra en el entorno.");
        process.exit(1);
    }

    if (apiKey === "your-gemini-api-key") {
        console.error("❌ ERROR: Tienes el valor de ejemplo 'your-gemini-api-key'. Por favor reemplázalo con tu clave real.");
        process.exit(1);
    }

    console.log(`Clave detectada (Longitud: ${apiKey.length}, Inicia con: ${apiKey.substring(0, 4)}...)`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log("Enviando prompt de prueba...");
        const result = await model.generateContent("Hola, responde con un mensaje corto confirmando que funcionas.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ ÉXITO: Gemini respondió correctamente:");
        console.log("-".repeat(20));
        console.log(text);
        console.log("-".repeat(20));
    } catch (error: any) {
        console.error("❌ ERROR al llamar a Gemini:");
        console.error(error.message || error);
    }
}

testGemini();
