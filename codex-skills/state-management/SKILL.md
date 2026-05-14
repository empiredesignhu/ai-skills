---
name: state-management
description: Use this skill when performing frontend state management, shared state design, store refactors, async data flow handling, or state synchronization work.
---

# Goal
Manage application state in a way that stays predictable, debuggable, and proportional to the complexity of the product.

# Instructions
1. Identify what state exists, who owns it, how long it lives, and which components or routes depend on it.
2. Keep local state local, shared state shared, and server state separate from purely UI state.
3. Choose the simplest state model that fits the problem before introducing global stores or complex abstractions.
4. Make async transitions, loading flags, cache invalidation, and optimistic updates explicit.
5. Review how state changes are triggered, observed, and cleaned up to prevent stale or duplicated data.

# Input
A request to add shared state, refactor state flow, adopt or repair a store pattern, or simplify tangled frontend state logic.

# Output
State containers, hooks, reducers, store logic, and integration updates that make state flow easier to reason about.

# Best Practices
- Avoid duplicating the same source of truth across multiple layers.
- Separate server cache concerns from ephemeral UI state.
- Keep actions and reducers or mutations understandable and traceable.
- Optimize for debuggability and correctness before premature abstraction.
