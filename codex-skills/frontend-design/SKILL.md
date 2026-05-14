---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when Codex needs to build or restyle web components, pages, landing pages, dashboards, posters, HTML/CSS layouts, React or Vue interfaces, or beautify any frontend UI while avoiding generic AI aesthetics.
---

# Frontend Design

Build real working frontend code with a strong point of view. Favor memorable, context-aware design over safe defaults, and preserve an existing product language when one already exists.

## Workflow

1. Read the product and code context first.
2. Commit to one aesthetic direction before writing substantial UI code.
3. Translate that direction into production-grade implementation.
4. Keep accessibility, responsiveness, and usability intact.
5. Polish the result until it feels intentionally art-directed, not merely styled.

## Inspect Context

- Inspect the existing stack, component patterns, design tokens, routing, and constraints before editing.
- Preserve established patterns when working inside an existing app or design system.
- When starting from scratch, choose a specific concept first instead of assembling generic sections.

## Choose A Direction

- Decide the audience, tone, and the one memorable detail that will make the interface feel designed rather than generated.
- Pick a clear palette, typography pairing, motion language, and spatial rhythm that support the concept.
- Avoid generic defaults: timid gradients, purple-on-white palettes, interchangeable cards, and safe dashboard boilerplate.

## Implement With Taste

- Use production-grade code, not mock markup.
- Define reusable tokens with CSS variables or theme objects before styling large surfaces.
- Prefer expressive typography; use distinctive display and body fonts that match the concept.
- Do not introduce Inter, Arial, Roboto, or system-default stacks unless the product already uses them.
- Build atmosphere with layered backgrounds, textures, shapes, borders, shadows, or patterns instead of flat filler color.
- Use deliberate motion: page-load choreography, reveal timing, hover states, and scroll effects that feel cohesive rather than noisy.
- Keep layouts responsive from the start so the mobile version feels intentionally designed, not compressed desktop UI.

## Protect Usability

- Maintain semantic HTML, keyboard accessibility, and sufficient contrast.
- Reduce or disable non-essential motion when `prefers-reduced-motion` applies.
- Make bold choices without sacrificing readability, tap targets, or interaction clarity.
- Let primary actions stay obvious even when the visual style is unconventional.

## Frontend Rules

- Start with the codebase's current framework and tooling. Do not introduce a new framework for a small UI task.
- Use CSS variables for core colors, spacing, radii, shadows, and typography when styling is substantial.
- Prefer a few strong motifs repeated consistently over many unrelated visual tricks.
- Let hero sections, navigation, and primary CTAs carry the strongest personality; keep secondary UI disciplined.
- Use asymmetry, overlap, dense editorial layouts, or stark minimal spacing when they serve the concept.
- If animation libraries already exist, use them. In React, prefer the repo's modern patterns and avoid adding memoization boilerplate by default.
- If the user only asks to "make it look better," improve structure, copy hierarchy, spacing, states, and visual identity together; do not stop at color swaps.

## Finish Well

- Tighten spacing, alignment, type scale, empty states, hover states, loading states, and edge-case wrapping.
- Remove decorative elements that weaken the concept instead of strengthening it.
- Verify the result in the running app or with available local checks, and inspect screenshots when possible.
- Ship code that is production-grade, responsive, cohesive, and visually distinctive without breaking the product.
