import { db } from "../lib/firebase-admin";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkConfig() {
    console.log("--- REVISIÓN DE CONFIGURACIÓN Y BASE DE DATOS ---");

    try {
        // 1. Verificar Configuración en Firestore
        const settingsSnap = await db.collection("settings").doc("main").get();
        if (settingsSnap.exists) {
            console.log("\n⚙️ Configuración en Firestore (Colección 'settings/main'):");
            console.log(JSON.stringify(settingsSnap.data(), null, 2));
        } else {
            console.log("\n⚠️ No se encontró configuración 'main' en Firestore. Usando defaults del código.");
        }

        // 2. Verificar Base de Conocimiento en Firestore
        const kbSnap = await db.collection("knowledge").get();
        console.log(`\n📚 Base de Conocimiento en Firestore: ${kbSnap.size} documentos encontrados.`);

        // 3. Verificar Archivo Local como Respaldo
        const companyInfo = require('../data/knowledge-base/company-info.json');
        console.log("\n📄 Base de Conocimiento Local (company-info.json):");
        console.log(`   - Empresa: ${companyInfo.company.name}`);
        console.log(`   - Servicios: ${companyInfo.services.length}`);
        console.log(`   - FAQs: ${companyInfo.faqs.length}`);

    } catch (error: any) {
        console.error("❌ Error al revisar configuración:", error.message);
    }
}

checkConfig();
