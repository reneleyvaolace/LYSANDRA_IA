import { db } from '../lib/firebase-admin';

async function updateAIModel() {
    console.log('🔧 Actualizando modelo de IA en Firestore...\n');

    try {
        const settingsRef = db.collection('settings').doc('main');

        // Actualizar a un modelo válido
        await settingsRef.set({
            aiModel: 'gemini-2.0-flash'
        }, { merge: true });

        console.log('✅ Modelo actualizado a: gemini-2.0-flash');
        console.log('');

        // Verificar
        const doc = await settingsRef.get();
        const data = doc.data();

        console.log('📋 Configuración actualizada:');
        console.log(`   - Modelo IA: ${data?.aiModel}`);
        console.log(`   - Nombre del agente: ${data?.agentName}`);
        console.log('');
        console.log('🎉 ¡Listo! Ahora prueba el simulador de WhatsApp.');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

updateAIModel();
