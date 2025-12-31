import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("Modelos disponibles:");
            data.models.forEach((m: any) => console.log(`- ${m.name}`));
        } else {
            console.log("No se encontraron modelos o error:", data);
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

checkModels();
