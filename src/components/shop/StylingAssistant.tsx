
"use client";

import { useState } from "react";
import { aiStylingTool, type AiStylingOutput } from "@/ai/flows/ai-styling-tool";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

interface StylingAssistantProps {
  productType: 'saree' | 'silver_item';
  description: string;
}

export default function StylingAssistant({ productType, description }: StylingAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiStylingOutput | null>(null);

  const handleStyling = async () => {
    setLoading(true);
    try {
      const output = await aiStylingTool({
        productType,
        productDescription: description,
        occasion: "Wedding Gala"
      });
      setResult(output);
    } catch (error) {
      console.error("Styling tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-accent/20 bg-accent/5 p-6 mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Styling Assistant
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Get personalized draping and presentation suggestions.
          </p>
        </div>
        <Button 
          onClick={handleStyling} 
          disabled={loading}
          className="bg-accent text-white hover:bg-accent/90 rounded-none h-10 px-6 font-bold uppercase text-[10px] tracking-widest"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
          {result ? "Regenerate Style" : "Generate Style"}
        </Button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image 
              src={result.stylizedImage} 
              alt="Styling visualization" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3">Our Recommendation</h4>
            <p className="text-sm text-primary leading-relaxed font-medium">
              {result.stylingSuggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
