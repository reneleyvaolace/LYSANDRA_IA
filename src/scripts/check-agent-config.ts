import { db } from '@/lib/firebase-admin';

async function checkAgentConfig() {
    console.log('🔍 Verificando configuración del agente en Firestore...\n');

    try {
        const settingsDoc = await db.collection('settings').doc('main').get();

        if (!settingsDoc.exists) {
            console.log('❌ No existe el documento settings/main');
            return;
        }

        const data = settingsDoc.data();

        console.log('📋 Configuración actual:');
        console.log('  - Nombre del agente:', data?.agentName || '(no configurado)');
        console.log('  - URL de imagen:', data?.agentImage || '(no configurado)');
        console.log('  - Modelo IA:', data?.aiModel || '(no configurado)');
        console.log('\n✅ Configuración cargada correctamente');

        if (data?.agentImage) {
            console.log('\n🖼️ Probando acceso a la imagen...');
            console.log('   URL:', data.agentImage);

            // Intentar hacer fetch de la imagen
            try {
                const response = await fetch(data.agentImage);
                if (response.ok) {
                    console.log('   ✅ Imagen accesible (HTTP', response.status, ')');
                    console.log('   📦 Tipo:', response.headers.get('content-type'));
                    console.log('   📏 Tamaño:', (parseInt(response.headers.get('content-length') || '0') / 1024).toFixed(2), 'KB');
                } else {
                    console.log('   ❌ Error al acceder a la imagen (HTTP', response.status, ')');
                }
            } catch (error) {
                console.log('   ❌ Error de red:', error);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAgentConfig();
