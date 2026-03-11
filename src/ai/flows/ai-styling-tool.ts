'use server';
/**
 * @fileOverview A Genkit flow for the AI Styling & Presentation Tool.
 *
 * - aiStylingTool - A function that provides elegant saree draping styles or optimal display arrangements for silver gifting items.
 * - AiStylingInput - The input type for the aiStylingTool function.
 * - AiStylingOutput - The return type for the aiStylingTool function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Define the input schema
const AiStylingInputSchema = z.object({
  productType: z.enum(['saree', 'silver_item']).describe("The type of product: 'saree' or 'silver_item'."),
  productDescription: z.string().describe('A detailed description of the product, including material, color, and any unique features.'),
  occasion: z.string().describe('The occasion for which the styling is needed (e.g., "wedding", "festival", "casual", "gifting").'),
  photoDataUri:
    z.string()
      .optional()
      .describe(
        "An optional photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
});
export type AiStylingInput = z.infer<typeof AiStylingInputSchema>;

// Define the output schema
const AiStylingOutputSchema = z.object({
  stylingSuggestion: z.string().describe('A textual description of the suggested elegant styling or display arrangement.'),
  stylizedImage: z.string().describe('A data URI of the generated image showcasing the suggested styling or arrangement.'),
});
export type AiStylingOutput = z.infer<typeof AiStylingOutputSchema>;

export async function aiStylingTool(input: AiStylingInput): Promise<AiStylingOutput> {
  return aiStylingToolFlow(input);
}

const aiStylingToolFlow = ai.defineFlow(
  {
    name: 'aiStylingToolFlow',
    inputSchema: AiStylingInputSchema,
    outputSchema: AiStylingOutputSchema,
  },
  async (input) => {
    const textPrompt = `You are an expert fashion stylist and visual merchandiser for Siddhivinayak, a high-end Indian brand specializing in sarees and silver gifting items. Your goal is to provide elegant and premium styling suggestions.\n\nBased on the following product details and occasion, suggest an optimal visual presentation.\n\n**Product Type**: ${input.productType}\n**Product Description**: ${input.productDescription}\n**Occasion**: ${input.occasion}\n\nIf the product is a 'saree', describe an elegant draping style. Consider the material, color, and occasion. The description should be detailed enough to visually imagine the drape.\nIf the product is a 'silver_item', describe an optimal display arrangement that highlights its beauty and suitability for the occasion. The description should detail the setup, background, and any minimal accompanying elements.\n\nEnsure your suggestion reflects the premium, elegant, and minimal aesthetic of the Siddhivinayak brand, similar to Aesop or COS photography. Use neutral backgrounds (cream, off-white, black, white) and perfect lighting in your imagined setup. Focus on sharp lines, spaciousness, and subtle highlights (deep royal maroon, sparingly). No rounded corners, sharp 90-degree edges, clean grid-based layout.\n\nOutput ONLY the textual styling suggestion. Do not include any JSON formatting or additional introductory/concluding text.`

    const promptParts = [
      { text: textPrompt },
    ];

    if (input.photoDataUri) {
      promptParts.unshift({ media: { url: input.photoDataUri } }); // Add reference image first
    }

    const { text, media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!text) {
      throw new Error('No styling suggestion text received from the model.');
    }
    if (!media || !media.url) {
      throw new Error('No stylized image received from the model.');
    }

    return {
      stylingSuggestion: text,
      stylizedImage: media.url,
    };
  }
);
