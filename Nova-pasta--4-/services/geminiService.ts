
import { GoogleGenAI, Type } from "@google/genai";
import { AIReviewResult } from "../types.ts";

export const performLegalReview = async (formData: any, type: string): Promise<AIReviewResult> => {
  // Always use direct process.env.API_KEY initialization as per SDK guidelines.
  // Assume process.env.API_KEY is pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise os seguintes dados de um formulário jurídico para o contrato tipo "${type}":
  ${JSON.stringify(formData, null, 2)}
  
  Verifique:
  1. Campos não preenchidos essenciais.
  2. Inconsistências (ex: datas no passado onde deveriam ser futuro, CPF inválido, etc).
  3. Recomendações jurídicas para melhorar o documento.
  
  Retorne obrigatoriamente um JSON puro.`;

  try {
    // Fix: Updated model to 'gemini-3-pro-preview' for complex text reasoning and used propertyOrdering in responseSchema
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
            inconsistencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          propertyOrdering: ["missingFields", "inconsistencies", "recommendations"]
        }
      }
    });

    // Access text as a property, not a method.
    const text = response.text;
    if (!text) {
      throw new Error("Model returned no text content");
    }
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Review Error:", error);
    return {
      missingFields: ["Erro na conexão com o serviço de IA"],
      inconsistencies: [],
      recommendations: ["Tente preencher mais campos manualmente e gerar o PDF."]
    };
  }
};
