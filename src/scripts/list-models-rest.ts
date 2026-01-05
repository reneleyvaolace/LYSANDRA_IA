import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("--- LISTADO COMPLETO DE MODELOS VIA REST ---");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log(`Encontrados ${data.models.length} modelos.`);
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } else {
            console.log("No se pudieron listar los modelos:", data);
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

listAllModels();
