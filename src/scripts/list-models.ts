import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    try {
        // We can't easily list models with the SDK alone without a specific endpoint call
        // but we can try common names
        const genAI = new GoogleGenerativeAI(apiKey);
        const models = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro"
        ];

        console.log("--- PROBANDO DISPONIBILIDAD DE MODELOS ---");
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("ping");
                console.log(`✅ ${modelName}: DISPONIBLE`);
            } catch (err: any) {
                console.log(`❌ ${modelName}: ERROR - ${err.message}`);
            }
        }
    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
