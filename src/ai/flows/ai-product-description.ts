'use server';
/**
 * @fileOverview A Genkit flow for generating rich, detailed, and elegant product descriptions for sarees and silver items.
 *
 * - aiProductDescriptionGenerator - A function that generates product descriptions based on product attributes.
 * - AiProductDescriptionGeneratorInput - The input type for the aiProductDescriptionGenerator function.
 * - AiProductDescriptionGeneratorOutput - The return type for the aiProductDescriptionGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema Definitions
const SareeDetailsSchema = z.object({
  material: z.string().describe('The material of the saree (e.g., "Pure Silk", "Chiffon", "Georgette").'),
  color: z.string().describe('The primary color of the saree (e.g., "Royal Blue", "Crimson Red", "Emerald Green").'),
  occasion: z.string().describe('The occasion for which the saree is suitable (e.g., "Wedding", "Festival", "Party Wear", "Everyday Elegance").'),
  craftsmanship: z.string().describe('Details about the craftsmanship (e.g., "Handloom Weave", "Zari Work", "Embroidery", "Digital Print").'),
  style: z.string().describe('The style of the saree (e.g., "Traditional", "Contemporary", "Minimalist").'),
  length: z.string().optional().describe('The length of the saree, including blouse piece (e.g., "6.2 meters with blouse piece").')
});

const SilverItemDetailsSchema = z.object({
  itemCategory: z.string().describe('The category of the silver item (e.g., "Idol", "Coin", "Gift Set", "Jewellery").'),
  design: z.string().describe('Description of the design on the silver item (e.g., "Intricate Floral", "Geometric", "Traditional Deity Figure").'),
  purity: z.string().describe('The purity of the silver (e.g., "925 Sterling Silver", "999 Pure Silver").'),
  weight: z.string().optional().describe('The weight of the silver item (e.g., "10 grams", "50 grams").'),
  finish: z.string().describe('The finish of the silver item (e.g., "Polished", "Antique", "Matte").'),
  occasion: z.string().optional().describe('The occasion for which the silver item is suitable (e.g., "Diwali Gifting", "Wedding Favor", "Housewarming").')
});

const AiProductDescriptionGeneratorInputSchema = z.object({
  productName: z.string().describe('The name of the product (e.g., "Banarasi Silk Saree", "Silver Lakshmi Idol").'),
  sareeDetails: SareeDetailsSchema.optional().describe('Details specific to a saree product. Present if the product is a saree.'),
  silverItemDetails: SilverItemDetailsSchema.optional().describe('Details specific to a silver item product. Present if the product is a silver item.')
}).superRefine((data, ctx) => {
  if (!data.sareeDetails && !data.silverItemDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either sareeDetails or silverItemDetails must be provided.',
      path: ['sareeDetails', 'silverItemDetails']
    });
  }
  if (data.sareeDetails && data.silverItemDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only one of sareeDetails or silverItemDetails should be provided.',
      path: ['sareeDetails', 'silverItemDetails']
    });
  }
});

export type AiProductDescriptionGeneratorInput = z.infer<typeof AiProductDescriptionGeneratorInputSchema>;

// Output Schema Definition
const AiProductDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('A rich, detailed, and elegant product description for the given product.')
});

export type AiProductDescriptionGeneratorOutput = z.infer<typeof AiProductDescriptionGeneratorOutputSchema>;

// Prompt Definition
const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: AiProductDescriptionGeneratorInputSchema},
  output: {schema: AiProductDescriptionGeneratorOutputSchema},
  prompt: `You are an expert copywriter for "Siddhivinayak", a premium Indian brand specializing in elegant sarees and meaningful silver gifting items. Your task is to craft a rich, detailed, and elegant product description that reflects the brand's premium, minimal, modern, and sophisticated aesthetic. The description should highlight craftsmanship, quality, and suitability for special occasions, while avoiding overly traditional or ornate language. The generated description should be concise yet evocative, appealing to a discerning customer seeking quality and understated luxury.

Product Name: {{{productName}}}
Brand: Siddhivinayak

---

{{#if sareeDetails}}
  Product Type: Saree
  Material: {{{sareeDetails.material}}}
  Color: {{{sareeDetails.color}}}
  Occasion: {{{sareeDetails.occasion}}}
  Craftsmanship: {{{sareeDetails.craftsmanship}}}
  Style: {{{sareeDetails.style}}}
  {{#if sareeDetails.length}}Length: {{{sareeDetails.length}}}{{/if}}

  Based on the above details, write a compelling product description for this exquisite saree. Emphasize its luxurious texture, the artistry of its craftsmanship, and how it drapes to elevate the wearer's elegance for the specified occasion. Focus on sophistication, timeless appeal, and the subtle blend of tradition with modern aesthetics that "Siddhivinayak" embodies.
{{/if}}

{{#if silverItemDetails}}
  Product Type: Silver Gifting Item
  Category: {{{silverItemDetails.itemCategory}}}
  Design: {{{silverItemDetails.design}}}
  Purity: {{{silverItemDetails.purity}}}
  Finish: {{{silverItemDetails.finish}}}
  {{#if silverItemDetails.weight}}Weight: {{{silverItemDetails.weight}}}{{/if}}
  {{#if silverItemDetails.occasion}}Occasion: {{{silverItemDetails.occasion}}}{{/if}}

  Based on the above details, write an inspiring product description for this distinguished silver item. Highlight its symbolic meaning, impeccable design, and the lasting value it represents as a cherished gift. Focus on its inherent elegance, pristine purity, and its significance for the occasion, reflecting "Siddhivinayak"'s commitment to meaningful luxury.
{{/if}}`
});

// Flow Definition
const aiProductDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionGeneratorFlow',
    inputSchema: AiProductDescriptionGeneratorInputSchema,
    outputSchema: AiProductDescriptionGeneratorOutputSchema
  },
  async (input) => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);

// Wrapper function for external calls
export async function aiProductDescriptionGenerator(
  input: AiProductDescriptionGeneratorInput
): Promise<AiProductDescriptionGeneratorOutput> {
  return aiProductDescriptionGeneratorFlow(input);
}
