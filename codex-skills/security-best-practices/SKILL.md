---
name: security-best-practices
description: Use this skill when performing secure coding work, vulnerability reduction, data protection improvements, threat-aware implementation, or security review of web application code.
---

# Goal
Reduce security risk by applying secure defaults to frontend, backend, authentication, data handling, and infrastructure-facing code.

# Instructions
1. Identify sensitive data, trust boundaries, user-controlled input, and privileged operations in the affected flow.
2. Apply least privilege, strong validation, output encoding, secret protection, and safe dependency usage as appropriate to the stack.
3. Review authentication, authorization, session handling, and data exposure risks alongside the primary code change.
4. Fix insecure patterns directly and add guardrails that make future mistakes less likely.
5. Verify that security improvements do not silently break legitimate product behavior.

# Input
A request to secure code, review web application risk, harden endpoints or forms, protect secrets, or apply general security best practices.

# Output
Security-focused code changes, configuration improvements, and concise notes about the risk addressed and any remaining assumptions.

# Best Practices
- Treat all external input as untrusted and all secrets as sensitive.
- Enforce authorization close to protected operations, not only in the UI.
- Minimize data retention, logging exposure, and broad permission scopes.
- Prefer proven framework security features over custom crypto or homegrown protection mechanisms.
