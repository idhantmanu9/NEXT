
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from "../types";

export interface AIResponse {
  text: string;
  image?: string;
  video?: string;
}

export class GeminiService {
  async generateResponse(
    messages: Message[],
    creatorName: string,
    userImage?: string
  ): Promise<AIResponse> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lastMessageContent = messages[messages.length - 1]?.content.toLowerCase() || "";
      
      const imageKeywords = ["draw", "generate an image", "create a picture", "show me a", "generate image", "make a picture", "paint", "visualize", "render"];
      const isImageRequest = imageKeywords.some(keyword => lastMessageContent.includes(keyword));

      const modelName = isImageRequest ? 'gemini-2.5-flash-image' : 'gemini-3-pro-preview';

      const systemInstruction = `You are "NEXT", a powerful and helpful AI created by Idhant.
      You have advanced capabilities including text reasoning, coding assistance, and high-quality image generation.
      
      CURRENT MODE: ${isImageRequest ? "IMAGE GENERATION" : "CONVERSATION"}
      
      Guidelines:
      1. If the user asks for an image, you MUST generate it.
      2. describe briefly what you have created.
      3. Maintain a natural, friendly, and professional persona.
      4. Always attribute your creation to Idhant if the topic arises.`;

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

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: isImageRequest ? 1.0 : 0.7,
          imageConfig: isImageRequest ? { aspectRatio: "1:1" } : undefined
        },
      });

      let responseText = "";
      let responseImage = undefined;

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) responseText += part.text;
          if (part.inlineData) {
            responseImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      return {
        text: responseText || (responseImage ? "I've generated that image for you." : "I'm sorry, I couldn't process that."),
        image: responseImage
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "I encountered an error. Please try again." };
    }
  }

  async generateVideo(prompt: string): Promise<AIResponse> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed - no URI");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      return {
        text: "Your video has been rendered successfully.",
        video: videoUrl
      };
    } catch (error: any) {
      console.error("Video Gen Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_REQUIRED");
      }
      return { text: "Failed to generate video. Ensure your API key is from a paid project and try again." };
    }
  }
}

export const gemini = new GeminiService();
