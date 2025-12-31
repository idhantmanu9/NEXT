
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from "../types";

export interface AIResponse {
  text: string;
  image?: string;
}

export class GeminiService {
  /**
   * Generates a response from the Gemini model based on chat history and optional image input.
   * Dynamically switches to image generation model if requested.
   */
  async generateResponse(
    messages: Message[],
    creatorName: string,
    userImage?: string
  ): Promise<AIResponse> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lastMessageContent = messages[messages.length - 1]?.content.toLowerCase() || "";
      
      // Expanded keywords to trigger image generation
      const imageKeywords = ["draw", "generate an image", "create a picture", "show me a", "generate image", "make a picture", "paint", "visualize", "render"];
      const isImageRequest = imageKeywords.some(keyword => lastMessageContent.includes(keyword));

      // Use gemini-2.5-flash-image for generation/editing, gemini-3-pro-preview for advanced text reasoning
      const modelName = isImageRequest ? 'gemini-2.5-flash-image' : 'gemini-3-pro-preview';

      const systemInstruction = `You are "NEXT", a powerful and helpful AI created by Idhant.
      You have advanced capabilities including text reasoning, coding assistance, and high-quality image generation.
      
      CURRENT MODE: ${isImageRequest ? "IMAGE GENERATION" : "CONVERSATION"}
      
      Guidelines:
      1. If the user asks for an image, you MUST generate it. Use your visual synthesis capabilities.
      2. If you are generating an image, describe briefly what you have created in the text part of your response.
      3. Maintain a natural, friendly, and professional persona.
      4. Always attribute your creation to Idhant if the topic arises.
      5. You can also analyze images if the user provides them.`;

      const contents = messages.map((m, index) => {
        const parts: any[] = [{ text: m.content }];
        
        const isLastMessage = index === messages.length - 1;
        if (isLastMessage && m.role === MessageRole.USER && userImage) {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: userImage.split(',')[1]
            }
          });
        }

        return {
          role: m.role === MessageRole.USER ? 'user' : 'model',
          parts
        };
      });

      const config: any = {
        systemInstruction,
        temperature: isImageRequest ? 1.0 : 0.7,
        topP: 0.95,
      };

      // Set image configuration if generating
      if (isImageRequest) {
        config.imageConfig = {
          aspectRatio: "1:1"
        };
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      let responseText = "";
      let responseImage = undefined;

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            responseText += part.text;
          }
          if (part.inlineData) {
            responseImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      // Fallback text if model only returns image
      if (!responseText && responseImage) {
        responseText = "I've generated that image for you.";
      }

      return {
        text: responseText || "I'm sorry, I couldn't process that request properly.",
        image: responseImage
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "I encountered an error while trying to fulfill your request. Please try again." };
    }
  }
}

export const gemini = new GeminiService();
