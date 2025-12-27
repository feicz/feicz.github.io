import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types.ts";

/**
 * Gemini AI Clinical Analysis Service
 */
export async function analyzeRespiratoryStatus(
  etCO2: number,
  rr: number,
  fiCO2: number,
  unit: string
): Promise<AIAnalysis> {
  // 从环境变量获取密钥
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === '') {
    console.warn("Gemini API Key is missing. Using static clinical rules.");
    return fallbackAnalysis(etCO2, rr, fiCO2);
  }

  try {
    // 每次请求时初始化以确保使用最新的环境参数
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-pro-preview';

    const prompt = `Analyze patient vitals: EtCO2=${etCO2}${unit}, RR=${rr}bpm, FiCO2=${fiCO2}${unit}. 
    Consider normal ranges (EtCO2: 35-45mmHg, RR: 12-20bpm).`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior respiratory therapist. Analyze the metrics and return a structured JSON assessment with 'assessment' (string), 'suggestions' (string array, 3 items), and 'severity' ('normal', 'caution', or 'critical').",
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
              enum: ['normal', 'caution', 'critical'] 
            }
          },
          required: ["assessment", "suggestions", "severity"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return fallbackAnalysis(etCO2, rr, fiCO2);
  }
}

/**
 * 备选本地分析逻辑，当 API 不可用时触发
 */
function fallbackAnalysis(etCO2: number, rr: number, fiCO2: number): AIAnalysis {
  let severity: 'normal' | 'caution' | 'critical' = 'normal';
  const suggestions: string[] = ["Ensure sensor is properly placed", "Check patient airway"];

  if (etCO2 > 50 || etCO2 < 20 || rr > 30 || rr < 6) {
    severity = 'critical';
    suggestions.push("Notify clinical staff immediately");
  } else if (etCO2 > 45 || etCO2 < 30) {
    severity = 'caution';
    suggestions.push("Monitor for trends in ventilation");
  } else {
    suggestions.push("Continue routine monitoring");
  }

  return {
    assessment: `Clinical assessment based on threshold rules. EtCO2: ${etCO2}, RR: ${rr}.`,
    suggestions: suggestions.slice(0, 3),
    severity
  };
}