---
name: api-error-handling
description: Use this skill when performing API error handling, exception mapping, failure response design, retry-aware backend behavior, or resilience improvements for HTTP services.
---

# Goal
Handle API failures consistently so clients receive actionable responses and operators can diagnose problems quickly.

# Instructions
1. Inspect the current error taxonomy, framework conventions, and logging approach before making changes.
2. Classify failures into validation, authentication, authorization, not found, conflict, dependency, rate limit, and unexpected server errors.
3. Map internal exceptions to stable HTTP responses with consistent shapes and traceability.
4. Preserve useful diagnostics in logs and monitoring while keeping client-facing errors safe and concise.
5. Review retry behavior, idempotency, and downstream failure handling for reliability.

# Input
A request to improve API errors, standardize failure responses, add exception middleware, or debug noisy backend failures.

# Output
Error-handling middleware, typed exceptions, response mappers, and logging or monitoring improvements that make failures easier to understand.

# Best Practices
- Keep error payloads consistent across endpoints.
- Avoid leaking stack traces, secrets, or internal implementation details to clients.
- Use structured logging and correlation identifiers for debugging.
- Distinguish recoverable client errors from operator-actionable server failures.
