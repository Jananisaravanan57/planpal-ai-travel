// AIModal.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY; // keep in .env
if (!apiKey) {
  throw new Error("Gemini API key missing! Please set VITE_GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Create a chat session instance
export const chatSession = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // or "gemini-2.0-flash" if you want the latest
}).startChat({
  history: [],
});
