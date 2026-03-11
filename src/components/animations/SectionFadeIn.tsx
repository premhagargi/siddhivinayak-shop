"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionFadeIn({ children, className, delay = 0 }: SectionFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 1.2, // Increased duration for smoother entrance
        delay, 
        ease: [0.22, 1, 0.36, 1] // Custom quint ease-out for elegance
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
