import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hola");
        console.log("Respuesta:", result.response.text());
        console.log("✅ MODELO gemini-1.5-flash-latest FUNCIONA!");
    } catch (err: any) {
        console.error("Error con gemini-1.5-flash-latest:", err.message);
    }
}

testGemini();
