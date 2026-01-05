import { executeToolCall } from '@/lib/gemini';

async function testDateTimeTool() {
    console.log('🧪 Probando herramienta getCurrentDateTime...\n');

    try {
        const result = await executeToolCall({
            name: 'getCurrentDateTime',
            args: {}
        });

        console.log('✅ Resultado de la herramienta:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\n📅 Fecha y hora actual en México:');
        console.log('   ISO:', result.currentDateTime);
        console.log('   Formato legible:', result.formatted);
        console.log('   Zona horaria:', result.timezone);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDateTimeTool();
