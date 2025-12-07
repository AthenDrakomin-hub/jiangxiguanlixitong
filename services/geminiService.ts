import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface GeneratedDishDetails {
  description: string;
  suggestedPrice: number;
  category: string;
  spiciness: number;
}

export const generateDishDetails = async (dishName: string): Promise<GeneratedDishDetails | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `为名为"${dishName}"的江西菜生成菜单详情。
      提供一段令人垂涎的描述（30字以内），建议价格（RMB，仅数字），分类，以及辣度（0-3）。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
            category: { 
              type: Type.STRING, 
              enum: Object.values(Category)
            },
            spiciness: { type: Type.NUMBER }
          },
          required: ["description", "suggestedPrice", "category", "spiciness"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedDishDetails;
    }
    return null;

  } catch (error) {
    console.error("Error generating dish details:", error);
    return null;
  }
};