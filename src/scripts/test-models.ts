import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // In some versions of the SDK, you can't easily list models without a specific client.
        // Let's just try 'gemini-1.5-flash-latest'
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hola");
        console.log(result.response.text());
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

listModels();
