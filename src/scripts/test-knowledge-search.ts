import KnowledgeBase from "../lib/knowledge-base";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testKnowledgeSearch() {
    console.log("--- TEST DE BÚSQUEDA EN BASE DE CONOCIMIENTO ---");

    try {
        const kb = await KnowledgeBase.getInstance();

        const queries = [
            "¿Qué servicios ofrecen?",
            "¿Cuál es el RFC de CoreAura?",
            "¿Cuánto cuesta el desarrollo web?",
            "¿Quiénes son el equipo?",
            "¿Tienen oficinas?"
        ];

        for (const query of queries) {
            console.log(`\n🔍 Buscando: "${query}"`);
            const results = kb.search(query);

            if (results.length > 0) {
                console.log(`✅ Encontrados ${results.length} resultados.`);
                results.slice(0, 2).forEach((r, i) => {
                    console.log(`  [${i + 1}] Categoría: ${r.category}`);
                    console.log(`      Resumen: ${r.content.substring(0, 100)}...`);
                });
            } else {
                console.log("❌ No se encontraron resultados.");
            }
        }

    } catch (error: any) {
        console.error("Error en el test de KB:", error.message);
    }
}

testKnowledgeSearch();
