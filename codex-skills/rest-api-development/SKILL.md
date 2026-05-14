---
name: rest-api-development
description: Use this skill when performing REST API development, endpoint design, resource modeling, HTTP contract implementation, or API route refactoring.
---

# Goal
Design and implement REST APIs that are predictable, versionable, and easy for clients to consume and maintain.

# Instructions
1. Identify the domain resources, client needs, and existing API conventions before defining endpoints.
2. Model resources, routes, methods, status codes, and payload shapes around clear HTTP semantics.
3. Implement request parsing, validation, authorization checks, business logic boundaries, and response serialization cleanly.
4. Keep controllers thin by pushing domain logic into dedicated services or modules.
5. Verify happy paths, failure modes, and backward-compatibility expectations before finishing.

# Input
A request to create or refactor API endpoints, design REST resources, add route handlers, or improve an existing HTTP interface.

# Output
REST API routes, handlers, request and response contracts, and supporting service or test code when needed.

# Best Practices
- Use consistent naming, pagination, filtering, and status code rules across the API.
- Keep API contracts explicit and stable to reduce client breakage.
- Validate and sanitize all input before it reaches business logic.
- Log and test error cases as carefully as successful responses.
