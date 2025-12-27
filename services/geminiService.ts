import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types.ts";

export async function analyzeRespiratoryStatus(
  etCO2: number,
  rr: number,
  fiCO2: number,
  unit: string
): Promise<AIAnalysis> {
  // Initialize AI client with a fallback to avoid crash if API_KEY is missing in public deployment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Use gemini-3-pro-preview for complex reasoning tasks such as clinical assessments.
  const modelName = 'gemini-3-pro-preview';
  
  const prompt = `
    Analyze the following respiratory parameters:
    - EtCO2: ${etCO2} ${unit}
    - Respiratory Rate (RR): ${rr} bpm
    - FiCO2: ${fiCO2} ${unit}
  `;

  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key missing. Please configure environment variables.");
    }

    // Generate content using the specified model and structured prompt.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        // Use systemInstruction to define the persona and formatting rules.
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

    // Directly access the .text property from the GenerateContentResponse object.
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text received from Gemini API.");
    }
    
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      assessment: "Unable to perform AI analysis at this time. Please ensure a valid Gemini API Key is configured.",
      suggestions: [
        "Verify the physical connection and alignment of the CO2 sensor",
        "Assess patient airway patency and ventilation quality",
        "Perform a sensor zeroing or calibration procedure"
      ],
      severity: "caution"
    };
  }
}