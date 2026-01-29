import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
// Note: In a real environment, process.env.API_KEY would be populated.
// Since we cannot prompt for it, this service is set up to work once the key is present.
const apiKey = process.env.API_KEY || 'DEMO_KEY_PLACEHOLDER'; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes a script to extract assets using Gemini 3 Flash.
 */
export const analyzeScriptAndExtractAssets = async (script: string): Promise<string> => {
  if (apiKey === 'DEMO_KEY_PLACEHOLDER') {
    console.warn("API Key missing, returning mock data");
    return JSON.stringify([
      { name: "赛博朋克城市", type: "SCENE", description: "霓虹闪烁的雨夜街道" },
      { name: "侦探罗伊", type: "CHARACTER", description: "身穿风衣的硬汉派侦探" },
      { name: "激光手枪", type: "PROP", description: "旧型号的军用激光手枪" }
    ]);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下剧本并提取关键资产（角色 Character、场景 Scene、道具 Prop）。请用中文返回 JSON。\n\n剧本: ${script}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["CHARACTER", "SCENE", "PROP", "WORLD"] },
              description: { type: Type.STRING }
            }
          }
        }
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates a prompt for an asset description using Gemini 3 Pro (Thinking model).
 */
export const generateImagePrompt = async (assetDescription: string): Promise<string> => {
   if (apiKey === 'DEMO_KEY_PLACEHOLDER') return `High fidelity render of ${assetDescription}, 8k, cinematic lighting`;

   try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning on prompt construction
      contents: `为以下描述创建详细的图像生成提示词（英文 Prompt）: ${assetDescription}`,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Utilizing thinking for better prompt engineering
      }
    });
    return response.text || "";
   } catch (error) {
     console.error("Gemini API Error:", error);
     return assetDescription;
   }
};