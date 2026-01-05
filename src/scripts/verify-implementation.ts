import { db } from '../lib/firebase-admin';

async function verifyImplementation() {
    console.log('🔍 VERIFICACIÓN DE IMPLEMENTACIÓN\n');
    console.log('═'.repeat(60));
    console.log('');

    try {
        // 1. Verificar configuración en Firestore
        console.log('📊 1. CONFIGURACIÓN EN FIRESTORE');
        console.log('─'.repeat(60));

        const settingsSnap = await db.collection('settings').doc('main').get();

        if (!settingsSnap.exists) {
            console.log('❌ No se encontró configuración en Firestore');
            return;
        }

        const settings = settingsSnap.data();

        console.log('✅ Configuración encontrada:');
        console.log(`   • Modelo IA: ${settings?.aiModel || 'No configurado'}`);
        console.log(`   • Nombre del agente: ${settings?.agentName || 'No configurado'}`);
        console.log(`   • Gemini API Key: ${settings?.geminiApiKey ? '✓ Configurada' : '✗ No configurada (usa .env)'}`);
        console.log(`   • OpenAI API Key: ${settings?.openaiApiKey ? '✓ Configurada' : '✗ No configurada'}`);
        console.log('');

        // 2. Verificar que el modelo está en la lista de modelos soportados
        console.log('📋 2. VALIDACIÓN DEL MODELO');
        console.log('─'.repeat(60));

        const supportedModels = [
            'gemini-2.5-flash-lite',
            'gemini-flash-latest',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-pro-latest',
            'gemini-1.5-pro'
        ];

        const currentModel = settings?.aiModel;
        const isSupported = supportedModels.includes(currentModel);

        if (isSupported) {
            console.log(`✅ Modelo "${currentModel}" es válido y soportado`);
        } else {
            console.log(`⚠️ Modelo "${currentModel}" no está en la lista de modelos soportados`);
            console.log('   Modelos soportados:');
            supportedModels.forEach(model => console.log(`   - ${model}`));
        }
        console.log('');

        // 3. Verificar límites del modelo
        console.log('📈 3. LÍMITES DEL MODELO');
        console.log('─'.repeat(60));

        const limits: Record<string, { req: number; tokens: number; desc: string }> = {
            "gemini-flash-latest": { req: 15, tokens: 1000000, desc: "15 RPM, 1M TPM - Estable" },
            "gemini-1.5-flash": { req: 15, tokens: 1000000, desc: "15 RPM, 1M TPM - Estable" },
            "gemini-pro-latest": { req: 2, tokens: 32000, desc: "2 RPM, 32k TPM - Premium" },
            "gemini-1.5-pro": { req: 2, tokens: 32000, desc: "2 RPM, 32k TPM - Premium" },
            "gemini-2.0-flash": { req: 10, tokens: 1000000, desc: "10 RPM, 1M TPM - Experimental" },
            "gemini-2.5-flash-lite": { req: 1000, tokens: 4000000, desc: "1000 req/día, 4M TPM - Gratuito" },
        };

        const modelLimits = limits[currentModel];

        if (modelLimits) {
            console.log(`✅ Límites configurados para "${currentModel}":`);
            console.log(`   • Requests: ${modelLimits.req} ${currentModel === 'gemini-2.5-flash-lite' ? 'por día' : 'por minuto'}`);
            console.log(`   • Tokens: ${modelLimits.tokens.toLocaleString()} por minuto`);
            console.log(`   • Descripción: ${modelLimits.desc}`);
        } else {
            console.log(`⚠️ No hay límites configurados para "${currentModel}"`);
        }
        console.log('');

        // 4. Verificar que el webhook puede usar el modelo
        console.log('🔧 4. VERIFICACIÓN DEL WEBHOOK');
        console.log('─'.repeat(60));

        const hasGeminiKey = process.env.GEMINI_API_KEY || settings?.geminiApiKey;

        if (hasGeminiKey) {
            console.log('✅ API Key de Gemini disponible');
            console.log(`   • Fuente: ${settings?.geminiApiKey ? 'Firestore' : '.env.local'}`);
        } else {
            console.log('❌ No hay API Key de Gemini configurada');
            console.log('   • Configura GEMINI_API_KEY en .env.local O');
            console.log('   • Configura la key en Dashboard > Settings > IA');
        }
        console.log('');

        // 5. Resumen final
        console.log('═'.repeat(60));
        console.log('📊 RESUMEN DE VERIFICACIÓN');
        console.log('═'.repeat(60));
        console.log('');

        const checks = [
            { name: 'Configuración en Firestore', status: settingsSnap.exists },
            { name: 'Modelo válido', status: isSupported },
            { name: 'Límites configurados', status: !!modelLimits },
            { name: 'API Key disponible', status: !!hasGeminiKey }
        ];

        checks.forEach(check => {
            const icon = check.status ? '✅' : '❌';
            console.log(`${icon} ${check.name}`);
        });

        console.log('');
        const allPassed = checks.every(c => c.status);

        if (allPassed) {
            console.log('🎉 ¡TODO ESTÁ CORRECTAMENTE IMPLEMENTADO!');
            console.log('');
            console.log('Puedes probar el sistema con:');
            console.log('  1. Dashboard: http://localhost:3000/dashboard/settings');
            console.log('  2. Simulador: http://localhost:3000/dashboard/whatsapp-simulator');
            console.log('  3. Webhook: npx tsx src/scripts/test-webhook-debug.ts');
        } else {
            console.log('⚠️ Hay algunos problemas que necesitan atención.');
            console.log('   Revisa los puntos marcados con ❌ arriba.');
        }
        console.log('');

    } catch (error: any) {
        console.error('❌ Error durante la verificación:', error.message);
    }
}

verifyImplementation();
