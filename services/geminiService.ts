
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeRespiratoryStatus(
  etCO2: number,
  rr: number,
  fiCO2: number,
  unit: string
): Promise<AIAnalysis> {
  const prompt = `
    Analyze the following respiratory parameters for a patient in a clinical setting:
    - EtCO2: ${etCO2} ${unit}
    - Respiratory Rate (RR): ${rr} bpm
    - FiCO2: ${fiCO2} ${unit}

    Provide a professional clinical assessment and 3 actionable suggestions.
    Output must be in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessment: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            severity: { 
              type: Type.STRING,
              description: "Must be 'normal', 'caution', or 'critical'"
            }
          },
          required: ["assessment", "suggestions", "severity"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      assessment: "Unable to perform AI analysis at this time. Monitor vital signs manually.",
      suggestions: ["Check sensor connection", "Ensure patient airway is clear", "Re-calibrate sensor if necessary"],
      severity: "caution"
    };
  }
}
