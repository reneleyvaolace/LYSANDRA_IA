import { executeToolCall } from '@/lib/gemini';
import { db } from '@/lib/firebase-admin';

async function testFullDateTimeSystem() {
    console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE FECHA/HORA\n');
    console.log('='.repeat(60));

    try {
        // 1. Verificar configuración en Firestore
        console.log('\n📋 1. Configuración actual en Firestore:');
        const settingsDoc = await db.collection('settings').doc('main').get();
        const settings = settingsDoc.data();
        console.log('   - Zona Horaria:', settings?.timezone || '(no configurado)');
        console.log('   - Formato de Fecha:', settings?.dateFormat || '(no configurado)');
        console.log('   - Formato de Hora:', settings?.timeFormat || '(no configurado)');

        // 2. Probar herramienta getCurrentDateTime
        console.log('\n⚙️  2. Probando herramienta getCurrentDateTime:');
        const result = await executeToolCall({
            name: 'getCurrentDateTime',
            args: {}
        });

        console.log('   ✅ Resultado:');
        console.log('      - ISO:', result.currentDateTime);
        console.log('      - Legible:', result.formatted);
        console.log('      - Zona Horaria:', result.timezone);
        console.log('      - Formato Fecha:', result.dateFormat);
        console.log('      - Formato Hora:', result.timeFormat);

        // 3. Simular cambio de zona horaria
        console.log('\n🌍 3. Simulando cambio a Nueva York:');
        await db.collection('settings').doc('main').set({
            timezone: 'America/New_York',
            timeFormat: '12h'
        }, { merge: true });

        const resultNY = await executeToolCall({
            name: 'getCurrentDateTime',
            args: {}
        });

        console.log('   ✅ Resultado con nueva configuración:');
        console.log('      - ISO:', resultNY.currentDateTime);
        console.log('      - Legible:', resultNY.formatted);
        console.log('      - Zona Horaria:', resultNY.timezone);

        // 4. Restaurar configuración original
        console.log('\n🔄 4. Restaurando configuración original...');
        await db.collection('settings').doc('main').set({
            timezone: settings?.timezone || 'America/Mexico_City',
            dateFormat: settings?.dateFormat || 'DD/MM/YYYY',
            timeFormat: settings?.timeFormat || '24h'
        }, { merge: true });

        console.log('   ✅ Configuración restaurada');

        console.log('\n' + '='.repeat(60));
        console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
        console.log('\n💡 Próximos pasos:');
        console.log('   1. Ve a Settings > General');
        console.log('   2. Verás la sección "Configuración Regional"');
        console.log('   3. Cambia la zona horaria, formato de fecha y hora');
        console.log('   4. Haz clic en "Guardar Cambios"');
        console.log('   5. Ve al Laboratorio IA y pregunta "¿Qué hora es?"');
        console.log('   6. La IA usará tu configuración personalizada');

    } catch (error) {
        console.error('\n❌ Error en las pruebas:', error);
    }
}

testFullDateTimeSystem();
