import { db } from '@/lib/firebase-admin';

async function updatePromptWithDateTime() {
    console.log('🔄 Actualizando prompt del sistema con instrucciones de fecha/hora...\n');

    try {
        const settingsRef = db.collection('settings').doc('main');
        const doc = await settingsRef.get();
        const currentPrompt = doc.data()?.systemPrompt || '';

        // Agregar instrucciones sobre el uso de getCurrentDateTime
        const dateTimeInstructions = `

IMPORTANTE - MANEJO DE FECHAS Y HORAS:
- SIEMPRE usa la herramienta 'getCurrentDateTime' ANTES de agendar citas o hablar sobre fechas.
- NO asumas la fecha actual. SIEMPRE consulta primero.
- Cuando el usuario diga "mañana", "la próxima semana", "el lunes", etc., primero obtén la fecha actual.
- Todas las citas deben agendarse en zona horaria de México (America/Mexico_City).
- Formato de fechas para agendar: YYYY-MM-DDTHH:mm:ss (ISO 8601).
`;

        // Solo agregar si no existe ya
        if (!currentPrompt.includes('getCurrentDateTime')) {
            const newPrompt = currentPrompt + dateTimeInstructions;

            await settingsRef.set({
                systemPrompt: newPrompt,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            console.log('✅ Prompt actualizado exitosamente');
            console.log('\n📝 Instrucciones agregadas:');
            console.log(dateTimeInstructions);
        } else {
            console.log('ℹ️  El prompt ya contiene instrucciones de fecha/hora');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updatePromptWithDateTime();
