import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../lib/firebase-admin";

async function testFirebase() {
    console.log("--- TEST DE FIREBASE (FS) ---");
    try {
        const testDoc = {
            test: true,
            timestamp: new Date().toISOString(),
            message: "Firebase inicializado correctamente para Lysandra"
        };

        console.log("Intentando escribir en la colección 'settings'...");
        await db.collection("settings").doc("test_connection").set(testDoc);

        console.log("Intentando leer el documento...");
        const snap = await db.collection("settings").doc("test_connection").get();

        if (snap.exists) {
            console.log("✅ ÉXITO: Firebase conectado y operando.");
            console.log("Datos:", snap.data());
        } else {
            console.error("❌ ERROR: El documento no existe tras la escritura.");
        }
    } catch (err: any) {
        console.error("❌ ERROR DETECTADO:");
        console.error(err.message || err);
        if (err.message?.includes("Cloud Firestore API has not been used")) {
            console.log("\n💡 SOLUCIÓN: Necesitas activar Firestore en tu consola de Firebase.");
            console.log("1. Ve a: https://console.firebase.google.com/project/lysandra-ai-d24d2/firestore");
            console.log("2. Haz clic en 'Crear base de datos'.");
            console.log("3. Selecciona una ubicación (ej. us-central1) y modo 'Producción' o 'Prueba'.");
        }
    }
}

testFirebase();
