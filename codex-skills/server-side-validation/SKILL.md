---
name: server-side-validation
description: Use this skill when performing server-side validation, request schema enforcement, input sanitization, or backend data integrity checks.
---

# Goal
Ensure only valid, safe, well-shaped data reaches business logic and persistence layers.

# Instructions
1. Identify which inputs enter the server and what invariants must hold for each field and payload.
2. Define validation close to the request boundary using the project's schema or validation library.
3. Separate format validation, business-rule validation, and sanitization so failures remain understandable.
4. Return structured validation errors that help clients recover without leaking internal details.
5. Keep server-side checks authoritative even when the frontend also validates inputs.

# Input
A request to validate API payloads, protect backend routes, sanitize form submissions, or strengthen server-side data checks.

# Output
Validation schemas, request guards, sanitized parsing logic, and error responses aligned with the application's API conventions.

# Best Practices
- Treat all client input as untrusted, even from first-party interfaces.
- Validate nested objects, arrays, file metadata, and enums explicitly.
- Normalize and sanitize data before storage when appropriate.
- Keep validation rules versioned with the contract they enforce.
