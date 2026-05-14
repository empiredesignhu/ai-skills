---
name: react-component-development
description: Use this skill when performing React component development, hook-based UI implementation, component refactors, or React-specific state and rendering work.
---

# Goal
Build modern React components that are readable, resilient, and aligned with the surrounding application architecture.

# Instructions
1. Read the existing React patterns, framework setup, state flow, and compiler guidance before coding.
2. Define the component interface, ownership of state, and event boundaries before writing JSX.
3. Implement with modern React patterns and only add memoization or indirection when the codebase and performance profile justify it.
4. Keep rendering logic, effects, and derived state straightforward and easy to trace.
5. Verify accessibility, suspense or loading behavior, and state transitions after implementation.

# Input
A request to build React components, refactor JSX, add hooks, manage local component state, or improve React rendering behavior.

# Output
React components, hooks, styles, and small supporting tests or examples when they materially improve reliability.

# Best Practices
- Keep data ownership close to where it is needed and lift state only when there is a real shared concern.
- Prefer controlled effects, stable event handling, and predictable render flow.
- Avoid unnecessary `useMemo` and `useCallback` by default unless the repo already relies on them.
- Make component behavior easy to read from top to bottom.
