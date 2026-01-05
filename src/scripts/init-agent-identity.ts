import { db } from '@/lib/firebase-admin';

async function initAgentIdentity() {
    console.log('🚀 Inicializando identidad del agente en Firestore...\n');

    try {
        const settingsRef = db.collection('settings').doc('main');

        await settingsRef.set({
            agentName: 'Lysandra',
            agentImage: '/avatars/lysandra.webp'
        }, { merge: true });

        console.log('✅ Identidad del agente inicializada:');
        console.log('   - Nombre: Lysandra');
        console.log('   - Imagen: /avatars/lysandra.webp');
        console.log('\n💡 Ahora puedes cambiar estos valores desde el panel de Settings');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

initAgentIdentity();
