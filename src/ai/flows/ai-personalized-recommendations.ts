'use server';
/**
 * @fileOverview This file implements a Genkit flow for personalized product recommendations.
 *
 * - aiPersonalizedRecommendations - A function that provides product recommendations based on user data.
 * - AiPersonalizedRecommendationsInput - The input type for the recommendation function.
 * - AiPersonalizedRecommendationsOutput - The return type for the recommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPersonalizedRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom recommendations are being generated.'),
  browsingHistory: z.array(z.string()).optional().describe('A list of product IDs or names the user has recently viewed.'),
  wishlist: z.array(z.string()).optional().describe('A list of product IDs or names in the user\'s wishlist.'),
  pastPurchases: z.array(z.string()).optional().describe('A list of product IDs or names the user has previously purchased.'),
  occasionNeeds: z.string().optional().describe('Specific occasion for which recommendations are needed (e.g., "wedding", "festival", "casual").'),
});
export type AiPersonalizedRecommendationsInput = z.infer<typeof AiPersonalizedRecommendationsInputSchema>;

const AiPersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      productName: z.string().describe('The name or description of the recommended product.'),
      category: z.enum(['saree', 'silver gift', 'other']).describe('The category of the recommended product.'),
      reason: z.string().describe('A brief explanation for why this product is recommended based on user preferences and occasion.'),
    })
  ).describe('A list of personalized product recommendations.')
});
export type AiPersonalizedRecommendationsOutput = z.infer<typeof AiPersonalizedRecommendationsOutputSchema>;

export async function aiPersonalizedRecommendations(input: AiPersonalizedRecommendationsInput): Promise<AiPersonalizedRecommendationsOutput> {
  return aiPersonalizedRecommendationsFlow(input);
}

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: { schema: AiPersonalizedRecommendationsInputSchema },
  output: { schema: AiPersonalizedRecommendationsOutputSchema },
  prompt: `You are an AI assistant for Siddhivinayak, an Indian brand specializing in premium sarees and silver gifting items.
Your task is to provide personalized product recommendations to a customer based on their preferences and stated needs.
The recommendations should help the customer discover new sarees or silver gifts that truly match their preferences and occasion.
Focus on recommending items that align with the brand's aesthetic: premium, minimal, modern, and elegant.

Here is the customer's information:

{{#if browsingHistory}}
Browsing History:
{{#each browsingHistory}}- {{this}}
{{/each}}
{{/if}}

{{#if wishlist}}
Wishlist:
{{#each wishlist}}- {{this}}
{{/each}}
{{/if}}

{{#if pastPurchases}}
Past Purchases:
{{#each pastPurchases}}- {{this}}
{{/each}}
{{/if}}

{{#if occasionNeeds}}
Occasion Needs: {{{occasionNeeds}}}
{{/if}}

Please provide 3-5 distinct recommendations. For each recommendation, include the product name/description, its category (saree or silver gift), and a concise reason for the recommendation, linking it back to the customer's preferences or occasion needs.`,
});

const aiPersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiPersonalizedRecommendationsFlow',
    inputSchema: AiPersonalizedRecommendationsInputSchema,
    outputSchema: AiPersonalizedRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);
