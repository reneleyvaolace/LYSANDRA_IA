// Script para probar la verificación del webhook de Meta/WhatsApp
// Simula la petición GET que Meta envía para verificar el webhook

const WEBHOOK_URL = 'http://localhost:3001/api/webhook';
const VERIFY_TOKEN = 'lysandra_verify_token'; // Debe coincidir con .env.local

async function testWebhookVerification() {
    console.log('🔍 PRUEBA DE VERIFICACIÓN DE WEBHOOK\n');
    console.log('='.repeat(60));

    try {
        // Simular petición de verificación de Meta
        const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test_challenge_12345`;

        console.log('\n📤 Enviando petición GET de verificación...');
        console.log('   URL:', url);

        const response = await fetch(url, {
            method: 'GET'
        });

        console.log('\n📥 Respuesta del webhook:');
        console.log('   Status:', response.status, response.statusText);

        if (response.status === 200) {
            const challenge = await response.text();
            console.log('   Challenge devuelto:', challenge);

            if (challenge === 'test_challenge_12345') {
                console.log('\n✅ VERIFICACIÓN EXITOSA');
                console.log('   El webhook está listo para Meta/WhatsApp');
            } else {
                console.log('\n❌ ERROR: Challenge incorrecto');
            }
        } else {
            const error = await response.text();
            console.log('   Error:', error);
            console.log('\n❌ VERIFICACIÓN FALLIDA');
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 Próximos pasos:');
        console.log('   1. Si la verificación fue exitosa, el webhook está listo');
        console.log('   2. Configura Ngrok o Vercel para exponer el webhook');
        console.log('   3. En Meta Developer Console, configura el webhook con:');
        console.log('      - URL: https://tu-dominio/api/webhook');
        console.log('      - Verify Token: ' + VERIFY_TOKEN);
        console.log('   4. Meta verificará automáticamente y verás un ✅');

    } catch (error) {
        console.error('\n❌ Error al conectar con el webhook:', error);
        console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
        console.log('   npm run dev');
    }
}

testWebhookVerification();
