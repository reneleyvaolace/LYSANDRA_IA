import { db } from '@/lib/firebase-admin';

async function initRegionalConfig() {
    console.log('🌍 Inicializando configuración regional en Firestore...\n');

    try {
        const settingsRef = db.collection('settings').doc('main');

        await settingsRef.set({
            timezone: 'America/Mexico_City',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h'
        }, { merge: true });

        console.log('✅ Configuración regional inicializada:');
        console.log('   - Zona Horaria: America/Mexico_City (CST/CDT)');
        console.log('   - Formato de Fecha: DD/MM/YYYY');
        console.log('   - Formato de Hora: 24h');
        console.log('\n💡 Ahora puedes cambiar estos valores desde Settings > General');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

initRegionalConfig();
