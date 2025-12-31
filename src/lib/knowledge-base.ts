// eslint-disable-next-line @typescript-eslint/no-var-requires
const companyInfo = require('../data/knowledge-base/company-info.json');


export interface KnowledgeBaseEntry {
    category: string;
    content: string;
    keywords: string[];
}

export class KnowledgeBase {
    private static instance: KnowledgeBase | null = null;
    private static initPromise: Promise<KnowledgeBase> | null = null;
    private knowledgeEntries: KnowledgeBaseEntry[];
    private companyData: any;

    private constructor(companyData: any) {
        this.companyData = companyData;
        this.knowledgeEntries = this.buildKnowledgeBase();
    }

    public static async getInstance(): Promise<KnowledgeBase> {
        if (KnowledgeBase.instance) {
            return KnowledgeBase.instance;
        }

        if (KnowledgeBase.initPromise) {
            return KnowledgeBase.initPromise;
        }

        KnowledgeBase.initPromise = (async () => {
            try {
                // Try to get from Firestore first
                const { db } = await import('./firebase-admin');
                const doc = await db.collection("knowledge").doc("company").get();

                let companyData;
                if (doc.exists) {
                    companyData = doc.data();
                } else {
                    // Fallback to local JSON
                    companyData = require('../data/knowledge-base/company-info.json');
                }

                KnowledgeBase.instance = new KnowledgeBase(companyData);
                return KnowledgeBase.instance;
            } catch (error) {
                console.error("Error initializing KnowledgeBase:", error);
                // Fallback to local JSON on error
                const companyData = require('../data/knowledge-base/company-info.json');
                KnowledgeBase.instance = new KnowledgeBase(companyData);
                return KnowledgeBase.instance;
            }
        })();

        return KnowledgeBase.initPromise;
    }

    private buildKnowledgeBase(): KnowledgeBaseEntry[] {
        const entries: KnowledgeBaseEntry[] = [];
        const companyInfo = this.companyData;


        // Company Information
        entries.push({
            category: 'company',
            content: `${companyInfo.company.name} (${companyInfo.company.legalName}) es ${companyInfo.company.description}. 
      Fundada en ${companyInfo.company.founded}, nos especializamos en ${companyInfo.company.industry} para ${companyInfo.company.targetMarket}.
      Nuestro sitio web es ${companyInfo.company.website}.`,
            keywords: ['empresa', 'coreaura', 'quienes somos', 'about', 'información']
        });

        // Fiscal Information
        entries.push({
            category: 'fiscal',
            content: `Información Fiscal: ${companyInfo.fiscalInfo.rfc}. 
      Régimen: ${companyInfo.fiscalInfo.regime}. 
      ${companyInfo.fiscalInfo.invoicing}. 
      Estatus: ${companyInfo.fiscalInfo.taxStatus}.`,
            keywords: ['fiscal', 'factura', 'rfc', 'régimen', 'cfdi', 'deducible', 'impuestos']
        });

        // Contact Information
        entries.push({
            category: 'contact',
            content: `Puedes contactarnos en:
      - Email: ${companyInfo.contact.email}
      - Teléfono: ${companyInfo.contact.phone}
      - Dirección: ${companyInfo.contact.address}
      - LinkedIn: ${companyInfo.contact.socialMedia.linkedin}
      - Twitter: ${companyInfo.contact.socialMedia.twitter}
      - Facebook: ${companyInfo.contact.socialMedia.facebook}`,
            keywords: ['contacto', 'email', 'teléfono', 'dirección', 'ubicación', 'redes sociales']
        });

        // Services
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companyInfo.services.forEach((service: any) => {
            entries.push({
                category: 'service',
                content: `**${service.name}**: ${service.description}
        
        Características:
        ${service.features.map((f: any) => `- ${f}`).join('\n')}
        
        Tecnologías: ${service.technologies.join(', ')}
        Precio: ${service.pricing}`,
                keywords: [
                    service.id,
                    service.name.toLowerCase(),
                    ...service.technologies.map((t: any) => t.toLowerCase()),
                    'servicio',
                    'precio',
                    'características'
                ]
            });
        });

        // Values
        entries.push({
            category: 'values',
            content: `Nuestros valores son:
      ${companyInfo.values.map((v: any) => `- **${v.name}**: ${v.description}`).join('\n')}`,
            keywords: ['valores', 'misión', 'visión', 'cultura', 'principios']
        });

        // Technologies
        entries.push({
            category: 'technologies',
            content: `Trabajamos con las siguientes tecnologías:
      
      **Frontend**: ${companyInfo.technologies.frontend.join(', ')}
      **Backend**: ${companyInfo.technologies.backend.join(', ')}
      **Bases de Datos**: ${companyInfo.technologies.databases.join(', ')}
      **Cloud**: ${companyInfo.technologies.cloud.join(', ')}
      **DevOps**: ${companyInfo.technologies.devops.join(', ')}
      **Seguridad**: ${companyInfo.technologies.security.join(', ')}`,
            keywords: ['tecnologías', 'stack', 'herramientas', 'frameworks', 'lenguajes']
        });

        // Portfolio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companyInfo.portfolio.forEach((project: any) => {
            entries.push({
                category: 'portfolio',
                content: `**${project.name}** (${project.industry}): ${project.description}
        Tecnologías utilizadas: ${project.technologies.join(', ')}`,
                keywords: ['portafolio', 'proyectos', 'casos de éxito', project.industry.toLowerCase()]
            });
        });

        // FAQs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companyInfo.faqs.forEach((faq: any) => {
            entries.push({
                category: 'faq',
                content: `**${faq.question}**\n${faq.answer}`,
                keywords: ['faq', 'pregunta', 'frecuente', ...faq.question.toLowerCase().split(' ')]
            });
        });

        // Team & Certifications
        entries.push({
            category: 'team',
            content: `Nuestro equipo cuenta con ${companyInfo.team.size} profesionales especializados en:
      ${companyInfo.team.expertise.join(', ')}.
      
      Certificaciones: ${companyInfo.certifications.join(', ')}.`,
            keywords: ['equipo', 'certificaciones', 'experiencia', 'expertise']
        });

        return entries;
    }

    public search(query: string): KnowledgeBaseEntry[] {
        const queryLower = query.toLowerCase();
        const words = queryLower.split(' ').filter(w => w.length > 2);

        return this.knowledgeEntries
            .map(entry => {
                let score = 0;

                // Check if any keyword matches
                entry.keywords.forEach(keyword => {
                    if (words.some(word => keyword.includes(word) || word.includes(keyword))) {
                        score += 2;
                    }
                });

                // Check content for matches
                words.forEach(word => {
                    if (entry.content.toLowerCase().includes(word)) {
                        score += 1;
                    }
                });

                return { entry, score };
            })
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(result => result.entry);
    }

    public getByCategory(category: string): KnowledgeBaseEntry[] {
        return this.knowledgeEntries.filter(entry => entry.category === category);
    }

    public getAllEntries(): KnowledgeBaseEntry[] {
        return this.knowledgeEntries;
    }

    public getCompanyInfo() {
        return companyInfo;
    }
}

export default KnowledgeBase;
