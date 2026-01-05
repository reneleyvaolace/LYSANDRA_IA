import fetch from 'node-fetch';

async function testWhatsAppWebhook() {
    console.log('📱 SIMULACIÓN DE MENSAJE DE WHATSAPP\n');
    console.log('='.repeat(60));

    const webhookUrl = 'http://localhost:3000/api/webhook';

    // Simular mensaje de WhatsApp
    const testMessage = {
        object: 'whatsapp_business_account',
        entry: [{
            id: 'test_entry',
            changes: [{
                value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                        display_phone_number: '1234567890',
                        phone_number_id: 'test_phone_id'
                    },
                    contacts: [{
                        profile: {
                            name: 'Usuario de Prueba'
                        },
                        wa_id: '5215512345678'
                    }],
                    messages: [{
                        from: '5215512345678',
                        id: 'test_message_id',
                        timestamp: Date.now().toString(),
                        text: {
                            body: 'Quiero una cita para el próximo lunes'
                        },
                        type: 'text'
                    }]
                },
                field: 'messages'
            }]
        }]
    };

    try {
        console.log('\n📤 Enviando mensaje de prueba al webhook...');
        console.log('   URL:', webhookUrl);
        console.log('   Mensaje:', testMessage.entry[0].changes[0].value.messages[0].text.body);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testMessage)
        });

        console.log('\n📥 Respuesta del webhook:');
        console.log('   Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('   Data:', JSON.stringify(data, null, 2));
            console.log('\n✅ Webhook respondió correctamente');
        } else {
            const error = await response.text();
            console.log('   Error:', error);
            console.log('\n❌ Webhook falló');
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 Próximos pasos:');
        console.log('   1. Verifica los logs del servidor (terminal donde corre npm run dev)');
        console.log('   2. Busca mensajes como "📱 WhatsApp Message" y "🔧 Calling getCurrentDateTime"');
        console.log('   3. Verifica en Firestore > conversations que se haya guardado el mensaje');
        console.log('   4. Si todo funciona, despliega a producción y configura el webhook real');

    } catch (error) {
        console.error('\n❌ Error al conectar con el webhook:', error);
        console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
        console.log('   npm run dev');
    }
}

testWhatsAppWebhook();
