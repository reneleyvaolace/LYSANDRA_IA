import fetch from 'node-fetch';

async function testWebhookDebug() {
    console.log('🧪 TEST: Webhook con logging detallado\n');

    const webhookUrl = 'http://localhost:3000/api/webhook';

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
        console.log('');

        const responseText = await response.text();

        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Respuesta exitosa:');
                console.log(JSON.stringify(data, null, 2));
            } catch {
                console.log('📄 Respuesta (texto):', responseText);
            }
        } else {
            console.log('❌ Error del servidor:');
            try {
                const errorData = JSON.parse(responseText);
                console.log(JSON.stringify(errorData, null, 2));
            } catch {
                console.log(responseText);
            }
        }

        console.log('\n💡 Revisa los logs del servidor (terminal donde corre npm run dev)');
        console.log('   Busca mensajes con emojis: 📱 🤖 🔧 ✅ ❌');

    } catch (error: any) {
        console.error('\n❌ Error de conexión:', error.message);
        console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
        console.log('   npm run dev');
    }
}

testWebhookDebug();
