---
name: tailwind-css-development
description: Use this skill when performing Tailwind CSS development, utility-first styling, Tailwind component implementation, or Tailwind refactors in modern frontend codebases.
---

# Goal
Create maintainable, production-ready Tailwind CSS interfaces that stay expressive without collapsing into unreadable utility noise.

# Instructions
1. Inspect the existing Tailwind configuration, plugin usage, design tokens, and component conventions first.
2. Reuse existing utility patterns and extract repeated combinations into components, variants, or helper abstractions when repetition grows.
3. Implement layout, spacing, typography, and states with deliberate utility composition instead of ad hoc class piles.
4. Prefer semantic component boundaries in the code even when styling is utility-driven.
5. Verify responsive states, dark mode behavior if present, and class readability before finishing.

# Input
A request to build or restyle Tailwind components, convert CSS to Tailwind, improve utility composition, or create responsive UI in a Tailwind project.

# Output
Tailwind-based components, pages, or refactors with clear utility composition and any required config or token updates.

# Best Practices
- Reuse design tokens from `tailwind.config` or theme extensions instead of hardcoding one-off values.
- Collapse repeated class sets into shared abstractions before duplication spreads.
- Keep hover, focus, disabled, and loading states explicit.
- Avoid arbitrary values unless they are justified by the design system or a precise visual need.
