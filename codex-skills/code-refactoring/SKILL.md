---
name: code-refactoring
description: Use this skill when performing code refactoring, structural cleanup, duplication removal, legacy code improvement, or maintainability-focused code reorganization.
---

# Goal
Improve code structure without changing intended behavior, leaving the system easier to understand, extend, and test.

# Instructions
1. Read the current implementation and identify duplication, tangled responsibilities, and hidden coupling before changing structure.
2. Protect behavior first with existing tests, targeted checks, or careful comparison of code paths.
3. Refactor in small, understandable steps that preserve behavior while improving naming, boundaries, and reuse.
4. Remove dead code, reduce branching complexity, and isolate side effects where possible.
5. Re-run validation and review the result for readability, not just functional correctness.

# Input
A request to clean up code, simplify architecture, remove duplication, modernize old implementations, or make a module easier to maintain.

# Output
Refactored code, adjusted tests when needed, and concise notes about the structural improvements and preserved behavior.

# Best Practices
- Prefer incremental refactors over risky rewrites unless a rewrite is clearly justified.
- Keep observable behavior stable while improving internal structure.
- Use clearer names and boundaries to replace comments that explain confusion.
- Leave the code easier for the next engineer to modify safely.
