---
name: authentication-systems
description: Use this skill when performing authentication system development, login and session flows, token handling, access control, or identity-related backend and frontend integration.
---

# Goal
Implement authentication flows that protect user identity, preserve session integrity, and fit the product's trust model.

# Instructions
1. Determine the auth model in use, such as sessions, JWTs, OAuth, magic links, or SSO, before making changes.
2. Map the full auth lifecycle: registration, login, verification, refresh, logout, and account recovery.
3. Implement identity checks, secret handling, session storage, and route protection with least-privilege assumptions.
4. Ensure frontend and backend auth states stay synchronized during edge cases and expired sessions.
5. Test invalid credentials, expired tokens, replay risks, and logout behavior explicitly.

# Input
A request to build login or signup flows, protect routes, add session handling, integrate identity providers, or repair auth bugs.

# Output
Authentication code, middleware or guards, session and token handling, and supporting UI or API wiring where required.

# Best Practices
- Hash passwords with approved algorithms and never store raw credentials or secrets in source.
- Use secure cookie flags, token expiration, rotation, and CSRF protection where appropriate.
- Separate authentication from authorization so permissions remain clear.
- Minimize sensitive data exposure in logs, client payloads, and error responses.
