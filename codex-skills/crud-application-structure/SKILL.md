---
name: crud-application-structure
description: Use this skill when performing CRUD application development, resource lifecycle implementation, admin tool creation, or structuring create-read-update-delete workflows.
---

# Goal
Create clean CRUD flows that keep data management predictable for both users and developers.

# Instructions
1. Identify the managed resource, lifecycle states, required permissions, and list versus detail workflows.
2. Define the CRUD contract across database, API, and UI before writing scattered handlers.
3. Implement create, read, update, and delete paths with consistent naming, validation, and feedback.
4. Handle empty states, optimistic updates or refresh behavior, and destructive action confirmation explicitly.
5. Verify filtering, pagination, editing, and deletion behavior across both success and failure cases.

# Input
A request to build or restructure CRUD features, admin screens, resource management pages, or record lifecycle workflows.

# Output
CRUD-oriented routes, services, forms, tables, views, and supporting tests or structure that make the workflow complete.

# Best Practices
- Keep resource operations symmetrical and predictable across the stack.
- Protect destructive actions with authorization and clear confirmation UX.
- Make list and detail views consistent with the underlying API contract.
- Avoid burying CRUD logic inside overly generic abstractions too early.
