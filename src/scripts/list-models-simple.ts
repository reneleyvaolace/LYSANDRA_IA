import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data: any = await response.json();

        if (data.models) {
            const names = data.models.map((m: any) => m.name.replace('models/', ''));
            console.log("MODELOS DISPONIBLES:");
            names.forEach((name: string) => {
                if (name.includes('gemini')) {
                    console.log(`- ${name}`);
                }
            });
        }
    } catch (err: any) {
        console.error(err);
    }
}

listAllModels();
