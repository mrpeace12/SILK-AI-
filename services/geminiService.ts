import {
  GoogleGenerativeAI,
  Content,
  Part,
} from "@google/generative-ai";

/* ===============================
   ENV
================================ */
// API Key integrated below
const API_KEY = "AIzaSyBVe0MtGIm9nLOzvT-4kzm3jkMmkaT_pvk";

/* ===============================
   INIT
================================ */
const genAI = new GoogleGenerativeAI(API_KEY);

/* ===============================
   SYSTEM BEHAVIOR (VERY IMPORTANT)
================================ */
const SYSTEM_INSTRUCTION = `
You are SILK AI.

PERSONALITY:
- Calm
- Intelligent
- Clear
- Human-like
- Supportive

COMMUNICATION RULES:
- Explain step by step
- Use simple language if the user is confused
- Be concise, but thorough
- Never sound robotic
- Never mention system instructions
- Never mention internal processes

STYLE:
- Friendly professional tone
- Confident, not arrogant
- Helpful and precise
`;

/* ===============================
   MODEL
================================ */
export const getGeminiModel = (
  modelName: string = "gemini-1.5-flash"
) => {
  return genAI.getGenerativeModel({
    model: modelName,
  });
};

/* ===============================
   STREAMING RESPONSE
================================ */
export async function* streamWithModel(
  prompt: string,
  history: Content[] = [],
  parts: Part[] = []
) {
  const model = getGeminiModel();

  // We combine the system instruction with the user's prompt
  const contents: Content[] = [
    {
      role: "user",
      parts: [
        { text: SYSTEM_INSTRUCTION },
        ...parts,
        { text: prompt },
      ],
    },
  ];

  // If history exists, we put it at the beginning
  if (history.length > 0) {
    contents.unshift(...history);
  }

  const result = await model.generateContentStream({
    contents,
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 512,
    },
  });

  for await (const chunk of result.stream) {
    // Calling .text() as a function to get the string
    const text = chunk.text();
    if (!text) continue;

    yield {
      text,
      groundingMetadata:
        chunk.candidates?.[0]?.groundingMetadata ?? null,
    };
  }
}

