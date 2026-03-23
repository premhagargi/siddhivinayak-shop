"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MobilePageHeaderProps {
  title: string;
  showBackButton?: boolean;
  className?: string;
}

export default function MobilePageHeader({ 
  title, 
  showBackButton = true,
  className = "" 
}: MobilePageHeaderProps) {
  const router = useRouter();

  return (
    <div className={`flex items-center gap-2 py-3 ${className}`}>
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
}
