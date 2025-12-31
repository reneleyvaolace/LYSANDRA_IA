import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    try {
        console.log("Using API Key:", process.env.GEMINI_API_KEY?.substring(0, 5) + "...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hola, responde con 'OK' si recibes esto.");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (e: any) {
        console.error("FAIL:", e.message);
    }
}

test();
