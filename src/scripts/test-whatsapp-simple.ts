import fetch from 'node-fetch';

async function testSimpleMessage() {
    console.log('🧪 TEST: Mensaje simple a WhatsApp Webhook\n');

    const webhookUrl = 'http://localhost:3000/api/webhook';

    // Mensaje de prueba simple
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
                        id: `msg_${Date.now()}`,
                        timestamp: Date.now().toString(),
                        text: {
                            body: '¿Qué día es hoy?'
                        },
                        type: 'text'
                    }]
                },
                field: 'messages'
            }]
        }]
    };

    try {
        console.log('📤 Enviando: "¿Qué día es hoy?"');
        console.log('🌐 URL:', webhookUrl);
        console.log('');

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testMessage)
        });

        console.log('📥 Status:', response.status, response.statusText);

        const responseText = await response.text();
        console.log('📄 Respuesta:', responseText.substring(0, 500));

        if (response.ok) {
            console.log('\n✅ Webhook funcionando correctamente');
            console.log('\n💡 Revisa los logs del servidor para ver:');
            console.log('   - 📱 WhatsApp Message recibido');
            console.log('   - 🔧 getCurrentDateTime llamado');
            console.log('   - 🤖 Respuesta de Lysandra');
        } else {
            console.log('\n❌ Error en el webhook');
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
        console.log('   npm run dev');
    }
}

testSimpleMessage();
