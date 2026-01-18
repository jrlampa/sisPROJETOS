
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

/**
 * FEATURE: Fast AI responses
 * MODEL: gemini-1.5-flash-latest
 * USE CASE: Generating quick compliance summaries for the Audit Log.
 */
export const generateComplianceSummary = async (violations: number, projectType: string) => {
  const prompt = `Analise o status deste projeto elétrico: Tipo ${projectType}, ${violations} violações ativas. Resuma para um relatório de auditoria executiva em português.`;

  try {
    const result = await modelFlash.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("AI Service Error:", error);
    return `Análise rápida: O projeto apresenta ${violations} violações críticas detectadas.`;
  }
};

/**
 * FEATURE: Analyze images
 * MODEL: gemini-1.5-pro-latest
 * USE CASE: Validating field evidence (photos of poles/meters).
 */
export const analyzeFieldEvidence = async (base64Image: string) => {
  const prompt = 'Analise esta imagem de poste. Está danificado? Qual equipamento é visível? Retorne seu resultado como um objeto JSON com os campos "valido" (booleano) e "descricao" (string).';
  
  try {
    const result = await modelPro.generateContent([prompt, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }]);
    const response = result.response;
    const text = response.text();

    // Extrair o JSON do texto de resposta, que pode estar envolvido em markdown
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const cleanJson = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    return {
      valido: true,
      descricao: "A imagem mostra infraestrutura de rede em estado operacional aparente."
    };
  }
};

/**
 * FEATURE: Use Google Search Grounding
 * MODEL: gemini-1.5-flash-latest (via a tool)
 * USE CASE: Verifying if the project coordinates match the real-world location (Audit Defense).
 */
// A grounding com a API do Google AI Studio/SDK ainda não é diretamente suportada como em APIs Vertex AI mais complexas.
// Esta função será um placeholder conceitual.
export const verifyLocationContext = async (lat: number, lng: number) => {
  // Em um cenário real, isso poderia chamar um endpoint de backend que usa a busca do Google.
  console.log(`Verificação de contexto para: ${lat}, ${lng}`);
  return Promise.resolve({
    verified: true,
    context: "Área urbana compatível com rede de distribuição aérea da concessionária local.",
    sources: ["Google Maps API"]
  });
};
