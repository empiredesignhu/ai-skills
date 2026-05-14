---
name: css-layout-systems
description: Use this skill when performing CSS layout work with Flexbox, Grid, alignment, spacing systems, multi-column sections, or layout refactors.
---

# Goal
Build robust CSS layouts using modern layout primitives instead of brittle positioning hacks.

# Instructions
1. Inspect the content structure, container relationships, and current layout constraints.
2. Choose Flexbox for one-dimensional alignment problems and Grid for two-dimensional composition.
3. Define layout primitives first: container width, gap scale, alignment, distribution, and breakpoints.
4. Replace float-based, margin-hack, or absolute-positioned layout code with maintainable modern CSS.
5. Test overflow, wrapping, empty states, and content growth before finalizing the layout.

# Input
A request to build or refactor layouts, align components, create card grids, structure dashboards, or fix inconsistent spacing and alignment.

# Output
CSS layout code, updated component structure when needed, and layout decisions that clarify why Flexbox or Grid was chosen.

# Best Practices
- Use `gap`, `minmax()`, intrinsic sizing, and logical constraints instead of magic numbers.
- Keep layout rules composable so components can move across pages without breaking.
- Avoid unnecessary absolute positioning for structural layout.
- Design for content variability, localization, and responsive resizing from the start.
