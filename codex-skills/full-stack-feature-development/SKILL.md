---
name: full-stack-feature-development
description: Use this skill when performing full-stack feature development that spans frontend, backend, database, API contracts, and end-to-end product behavior.
---

# Goal
Build complete product features that work coherently across the stack instead of shipping disconnected frontend or backend fragments.

# Instructions
1. Trace the feature from user intent through UI, API, persistence, permissions, and side effects before coding.
2. Define the end-to-end contract first, including data shape, validation, loading states, and failure modes.
3. Implement backend and frontend changes in an order that keeps integration understandable and testable.
4. Add migrations, API handlers, UI states, and analytics or logging only where they support the feature's real behavior.
5. Verify the whole flow, not just isolated pieces, before considering the task complete.

# Input
A request to build a new feature, wire frontend and backend together, add end-to-end product functionality, or ship a cross-layer enhancement.

# Output
Integrated frontend and backend code, persistence updates, contract changes, and focused tests or verification steps for the feature flow.

# Best Practices
- Keep contracts explicit between layers so integration does not depend on guesswork.
- Sequence risky schema and API changes safely for live systems.
- Design loading, empty, success, and error states together.
- Leave the feature operable, observable, and maintainable after shipping.
