import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types.ts";

export async function analyzeRespiratoryStatus(
  etCO2: number,
  rr: number,
  fiCO2: number,
  unit: string
): Promise<AIAnalysis> {
  // Defensive check for API key
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      assessment: "AI Analysis is unavailable because no API Key was provided in the environment.",
      suggestions: [
        "Check environment configuration for API_KEY",
        "Verify network connectivity to Google services",
        "Ensure the respiratory sensor is properly calibrated"
      ],
      severity: "caution"
    };
  }

  // Initialize AI client inside the function scope
  const ai = new GoogleGenAI({ apiKey });
  
  // Use gemini-3-pro-preview for complex reasoning tasks
  const modelName = 'gemini-3-pro-preview';
  
  const prompt = `
    Analyze the following respiratory parameters:
    - EtCO2: ${etCO2} ${unit}
    - Respiratory Rate (RR): ${rr} bpm
    - FiCO2: ${fiCO2} ${unit}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class clinical respiratory specialist. Provide a professional clinical assessment and 3 actionable suggestions based on the provided parameters. The output must be valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessment: { 
              type: Type.STRING,
              description: "A detailed clinical assessment of the patient's current respiratory state."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of exactly 3 professional recommendations."
            },
            severity: { 
              type: Type.STRING,
              description: "Clinical priority level: 'normal', 'caution', or 'critical'."
            }
          },
          required: ["assessment", "suggestions", "severity"],
          propertyOrdering: ["assessment", "suggestions", "severity"],
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text received from Gemini API.");
    }
    
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      assessment: "The clinical analysis service encountered an error. Please review the raw vitals.",
      suggestions: [
        "Confirm sensor placement on the patient's airway",
        "Check for circuit leaks or obstructions",
        "Manually verify respiration rate and EtCO2 trends"
      ],
      severity: "caution"
    };
  }
}