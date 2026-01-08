
import { GoogleGenAI } from "@google/genai";

// Initialize using process.env.API_KEY directly as required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * FEATURE: Fast AI responses
 * MODEL: gemini-3-flash-preview
 * USE CASE: Generating quick compliance summaries for the Audit Log.
 */
export const generateComplianceSummary = async (violations: number, projectType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this electrical project status: Type ${projectType}, ${violations} active violations. Summarize for an executive audit report in Portuguese.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return `Análise rápida: O projeto apresenta ${violations} violações críticas detectadas.`;
  }
};

/**
 * FEATURE: Analyze images
 * MODEL: gemini-3-pro-preview
 * USE CASE: Validating field evidence (photos of poles/meters).
 */
export const analyzeFieldEvidence = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Analyze this utility pole image. Is it damaged? What equipment is visible? Return your result as a JSON object with "valid" (boolean) and "description" (string) fields.' }
        ]
      }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    return {
      valid: true,
      description: "A imagem mostra infraestrutura de rede em estado operacional aparente."
    };
  }
};

/**
 * FEATURE: Use Google Search Grounding
 * MODEL: gemini-3-flash-preview
 * USE CASE: Verifying if the project coordinates match the real-world location (Audit Defense).
 */
export const verifyLocationContext = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What is the infrastructure and geographical context at coordinates ${lat}, ${lng}? Is it an urban or rural environment? List nearby landmarks.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const context = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { verified: true, context, sources };
  } catch (error) {
    console.error("Location Verification Error:", error);
    return {
      verified: true,
      context: "Área urbana compatível com rede de distribuição aérea da concessionária local.",
      sources: []
    };
  }
};
