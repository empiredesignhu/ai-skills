---
name: component-ui-development
description: Use this skill when performing component-based UI development, reusable frontend component design, prop API planning, or shared UI abstraction work.
---

# Goal
Design reusable UI components with clear responsibilities, flexible APIs, and maintainable composition patterns.

# Instructions
1. Identify the component's purpose, state boundaries, and likely reuse contexts.
2. Define a minimal but flexible API using props, slots, children, variants, or composition hooks appropriate to the framework.
3. Separate structure, styling, state, and side effects so the component stays understandable.
4. Build the smallest complete version first, then add variants and edge-case handling.
5. Verify accessibility, empty states, loading states, and composability before finishing.

# Input
A request to build shared components, extract repeated UI, define component APIs, or clean up duplicated frontend implementation.

# Output
Reusable UI components, supporting styles or tests when needed, and clear notes about API decisions or composition constraints.

# Best Practices
- Prefer composition over rigid prop explosions.
- Keep component responsibilities narrow enough to test and reuse confidently.
- Document or encode variant behavior instead of scattering conditional styling.
- Avoid coupling reusable UI directly to page-specific data fetching or business logic.
