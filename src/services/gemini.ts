import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  faceShape: string;
  detailedReport: string;
  metrics: {
    far: string;
    thirds: string;
    foreheadRatio: string;
    jawRatio: string;
    angularity: string;
  };
  recommendations: {
    name: string;
    description: string;
    why: string;
    barberInstructions: string;
  }[];
  confidence: number;
}

export async function analyzeFace(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Ты — эксперт-стилист и барбер с научным подходом. Твоя задача — проанализировать фронтальное фото лица мужчины и составить подробный отчет и рекомендации по стрижке.

    Основывайся на следующих параметрах из "научно-обоснованного гайдлайна":
    1. FAR (Face Aspect Ratio): отношение высоты лица к ширине скул. (Низкий FAR = круглое/квадратное, Высокий FAR = вытянутое).
    2. Трети лица (Верхняя, Средняя, Нижняя): баланс пропорций. Высокая верхняя треть требует челки.
    3. Forehead ratio: ширина лба к ширине скул.
    4. Jaw ratio: ширина челюсти к ширине скул.
    5. Угловатость челюсти (Jaw angularity): определяет необходимость текстурирования.
    6. Линия роста волос: наличие залысин (M-hairline).

    В поле "detailedReport" напиши подробный текст (на русском языке), который:
    - Описывает ключевые анализируемые черты (форму лица, скулы, челюсть).
    - Объясняет, как эти параметры влияют на выбор прически (например: "Так как ваше лицо имеет высокий FAR, мы рекомендуем стрижки с челкой, чтобы визуально уменьшить вертикаль").
    - Использует терминологию из гайдлайна (визуальная коррекция, баланс пропорций).

    Верни результат строго в формате JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Проанализируй это лицо. Составь подробный отчет (detailedReport) и дай 3 рекомендации по стрижке в формате JSON." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faceShape: { type: Type.STRING },
          detailedReport: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              far: { type: Type.STRING },
              thirds: { type: Type.STRING },
              foreheadRatio: { type: Type.STRING },
              jawRatio: { type: Type.STRING },
              angularity: { type: Type.STRING },
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                why: { type: Type.STRING },
                barberInstructions: { type: Type.STRING },
              },
            },
          },
          confidence: { type: Type.NUMBER },
        },
        required: ["faceShape", "detailedReport", "metrics", "recommendations", "confidence"],
      },
    },
  });

  const jsonStr = response.text.trim();
  const cleanJson = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  
  try {
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response:", jsonStr);
    throw new Error("Не удалось обработать ответ от ИИ. Попробуйте еще раз.");
  }
}

export async function generateHairstylePreview(base64Image: string, hairstyleName: string, description: string): Promise<string> {
  const model = "gemini-2.5-flash-image";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
        {
          text: `Modify this person's hair to have a "${hairstyleName}". Description: ${description}. Keep the person's facial features, skin tone, and background identical. Only change the hair. Return the modified image.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
}
