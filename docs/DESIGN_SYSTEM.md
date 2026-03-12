# Siddhivinayak Design System

This document outlines the visual identity and design principles used in the Siddhivinayak Collection project.

## 1. Visual Philosophy
- **Style Inspiration:** Aesop, COS, and high-end editorial photography.
- **Aesthetic:** Minimalist, Premium, Modern-Heritage.
- **Key Principles:** 
    - Spaciousness (White space is a luxury).
    - Sharp 90-degree edges (Zero border-radius).
    - Grid-based layouts with strict alignment.
    - Intentional, sparse use of accent colors.

## 2. Typography
- **Primary Font Family:** `Inter` (Sans-serif)
- **Scale:**
    - **Headlines:** Bold, tracking-tight (`-0.025em`), uppercase for a modern luxury feel.
    - **Body:** Regular/Medium, clean, high readability.
    - **Meta/Detail:** Small caps (`text-[10px]`), bold, wide tracking (`0.2em` to `0.4em`) for a "concierge" feel.

## 3. Color Palette (HSL)
The palette is rooted in neutral tones with a single, deep royal accent.

- **Background:** `hsl(60, 14%, 98%)` — A warm, creamy off-white.
- **Primary / Foreground:** `hsl(0, 0%, 0%)` — Pure black for high contrast.
- **Accent:** `hsl(349, 71%, 30%)` — Deep Royal Maroon (used sparingly for highlights).
- **Muted:** `hsl(0, 0%, 90%)` — Light neutral gray for borders and secondary text.
- **Secondary:** `hsl(0, 0%, 95%)` — Very light gray for section backgrounds.

## 4. Shapes & UI Components
- **Border Radius:** `0rem` (Strictly sharp corners).
- **Borders:** `1px` solid, using the `muted` color to define space without clutter.
- **Shadows:** None or extremely subtle (blurred "glass" effects only on navigation).
- **Animations:** 
    - **Entrance:** Smooth fade-ins with custom quint ease-out.
    - **Transitions:** Long durations (`0.6s` to `1.2s`) for a "silky" feel.

## 5. Layout Patterns
- **Navbar:** Transparent on hero sections, transitioning to glassmorphism (blur) on scroll.
- **Sidebar:** Minimalist vertical border-based navigation.
- **Product Cards:** Floating layout with subtle vertical hover lift (`y: -8`).
- **Spacing:** Large padding values (`py-24`, `gap-20`) to create a sense of exclusivity.