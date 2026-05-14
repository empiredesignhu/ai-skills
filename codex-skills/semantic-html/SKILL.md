---
name: semantic-html
description: Use this skill when performing semantic HTML authoring, markup cleanup, page structure refactors, template scaffolding, or accessibility-oriented HTML improvements.
---

# Goal
Create clear, semantic, accessible HTML structure that gives browsers, assistive technology, and search engines meaningful document information.

# Instructions
1. Review the content model, user flow, and framework constraints before changing markup.
2. Choose semantic elements first, including landmarks, lists, buttons, forms, tables, and media elements, before adding generic wrappers.
3. Build a logical document outline with consistent headings and section boundaries.
4. Replace non-semantic interactive patterns with native HTML elements whenever possible.
5. Verify labels, alt text, form associations, keyboard behavior, and DOM simplicity after editing.

# Input
A request to create HTML structure, refactor div-heavy markup, scaffold templates, improve page semantics, or make generated frontend output more accessible and maintainable.

# Output
Semantic HTML templates, cleaned markup, component structure, and concise implementation notes when structure affects styling or scripting.

# Best Practices
- Prefer native semantics over ARIA when native elements already solve the problem.
- Keep DOM depth reasonable and remove wrapper noise that adds no meaning.
- Preserve server-rendering and hydration compatibility for framework output.
- Support accessibility, SEO, and maintainable styling through meaningful structure.
