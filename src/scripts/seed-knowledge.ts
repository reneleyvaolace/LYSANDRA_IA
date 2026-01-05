import { db } from "../lib/firebase-admin";
import * as companyInfo from "../data/knowledge-base/company-info.json";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seedKnowledgeBase() {
    console.log("--- SINCRONIZANDO BASE DE CONOCIMIENTO (JSON -> FIRESTORE) ---");

    try {
        // Guardar toda la estructura como un único documento 'company' en la colección 'knowledge'
        // Esto es lo que suele esperar el Dashboard para el formulario editable
        const kbRef = db.collection("knowledge").doc("company");

        await kbRef.set({
            ...companyInfo,
            lastSynced: new Date().toISOString()
        });

        console.log(`✅ Base de conocimiento sincronizada en Firestore.`);
        console.log(`   Empresa: ${companyInfo.company.name}`);
        console.log(`   Servicios registrados: ${companyInfo.services.length}`);

    } catch (error: any) {
        console.error("❌ Error al sincronizar KB:", error.message);
    }
}

seedKnowledgeBase();
