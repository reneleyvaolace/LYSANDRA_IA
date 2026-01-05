import fetch from 'node-fetch';

async function wait(seconds: number) {
    console.log(`⏳ Esperando ${seconds} segundos para que se resetee la cuota...`);
    for (let i = seconds; i > 0; i--) {
        process.stdout.write(`\r   ${i} segundos restantes...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\r   ✅ ¡Listo!                    \n');
}

async function testAfterWait() {
    console.log('🧪 TEST: Webhook con espera automática\n');

    // Esperar 60 segundos
    await wait(60);

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

                if (data.reply && data.reply.length > 0) {
                    console.log('\n🎉 ¡ÉXITO! Lysandra respondió correctamente.');
                    console.log('\n💬 Respuesta de Lysandra:');
                    console.log(`   "${data.reply}"`);
                    console.log('\n🚀 Ahora puedes probar en el simulador:');
                    console.log('   http://localhost:3000/dashboard/whatsapp-simulator');
                } else {
                    console.log('\n⚠️ La respuesta está vacía. Puede que necesites esperar más tiempo.');
                }
            } catch {
                console.log('📄 Respuesta (texto):', responseText);
            }
        } else {
            console.log('❌ Error del servidor:');
            try {
                const errorData = JSON.parse(responseText);
                console.log(JSON.stringify(errorData, null, 2));

                if (errorData.error && errorData.error.includes('quota')) {
                    console.log('\n⚠️ Aún hay problemas de cuota. Espera un poco más y vuelve a intentar.');
                }
            } catch {
                console.log(responseText);
            }
        }

    } catch (error: any) {
        console.error('\n❌ Error de conexión:', error.message);
    }
}

testAfterWait();
