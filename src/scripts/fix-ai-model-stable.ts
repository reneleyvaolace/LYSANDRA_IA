import { db } from '../lib/firebase-admin';

async function fixToStableModel() {
    console.log('🔧 Cambiando a modelo estable...\n');

    try {
        const settingsRef = db.collection('settings').doc('main');

        // Cambiar a gemini-flash-latest (alias de gemini-1.5-flash)
        await settingsRef.set({
            aiModel: 'gemini-flash-latest'
        }, { merge: true });

        console.log('✅ Modelo actualizado a: gemini-flash-latest');
        console.log('');

        // Verificar
        const doc = await settingsRef.get();
        const data = doc.data();

        console.log('📋 Configuración actualizada:');
        console.log(`   - Modelo IA: ${data?.aiModel}`);
        console.log(`   - Nombre del agente: ${data?.agentName}`);
        console.log('');
        console.log('✨ Beneficios de gemini-flash-latest:');
        console.log('   ✅ Estable y probado en producción');
        console.log('   ✅ Soporta function calling completo');
        console.log('   ✅ 15 solicitudes por minuto (gratis)');
        console.log('   ✅ Balance perfecto velocidad/capacidad');
        console.log('');
        console.log('🎉 ¡Listo! Ahora prueba el simulador de WhatsApp.');
        console.log('   http://localhost:3000/dashboard/whatsapp-simulator');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

fixToStableModel();
