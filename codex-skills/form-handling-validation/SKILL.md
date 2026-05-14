---
name: form-handling-validation
description: Use this skill when performing form handling, frontend and backend validation wiring, submission flow design, or interactive input state management.
---

# Goal
Build reliable forms that collect valid data, guide users clearly, and submit safely across the full request lifecycle.

# Instructions
1. Define the form's purpose, required fields, validation rules, and submission states before implementation.
2. Keep field state, error state, and submission state explicit so behavior remains predictable.
3. Validate on the client for immediate feedback and on the server for authoritative enforcement.
4. Handle pending, success, retry, and failure states with clear user feedback.
5. Verify accessibility, keyboard flow, autofill behavior, and prevention of duplicate submissions.

# Input
A request to build or improve forms, wire validation, handle submissions, or repair error-prone form flows.

# Output
Form components, validation logic, submission handlers, and any backend wiring needed to make the form fully functional.

# Best Practices
- Keep labels, help text, and validation errors close to the relevant fields.
- Prevent double submission and race conditions on slow networks.
- Preserve user input when validation fails so users can recover quickly.
- Avoid silent failures; every failed submission should produce clear feedback.
