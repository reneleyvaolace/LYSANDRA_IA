import { db } from "../lib/firebase-admin";

async function createTestData() {
    console.log("--- CREANDO DATOS DE PRUEBA ---");
    try {
        // 1. Crear una cita de prueba
        const appointment = {
            clientName: "Juan Pérez",
            date: new Date(Date.now() + 86400000).toISOString(), // Mañana
            type: "Consultoría Tecnológica",
            status: "confirmed",
            createdAt: new Date().toISOString(),
        };

        const aptRef = await db.collection("appointments").add(appointment);
        console.log(`✅ Cita de prueba creada con ID: ${aptRef.id}`);

        // 2. Crear configuración inicial (Settings)
        const settings = {
            companyName: "CoreAura AI",
            systemPrompt: "Eres Lysandra, la asistente de IA experimentada de CoreAura. Eres elegante, precisa y eficiente. Tu objetivo es ayudar a los clientes con sus necesidades tecnológicas y agendar citas usando las herramientas disponibles."
        };

        await db.collection("settings").doc("main").set(settings);
        console.log("✅ Configuración de Lysandra inicializada en Firestore.");

        process.exit(0);
    } catch (error: any) {
        console.error("❌ ERROR al crear datos:", error.message);
        process.exit(1);
    }
}

createTestData();
