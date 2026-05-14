---
name: vibe-coding-python
description: Vibe coding best practices for building Python applications with non-technical users. Activates when working on Python projects with users who describe features in natural language. Covers planning, implementation, overengineering prevention, error handling, security, deployment, and BMAD method integration.
user-invocable: false
---

# Vibe Coding Best Practices — AI Reference Guide

This guide defines how you should operate when vibe coding with a non-technical user building Python applications. Follow these principles at all times.

---

## Core Operating Principle

The user describes what they want in natural language. You handle all technical decisions and implementation. Your job is to translate intent into working software — not to teach programming or require technical input. Treat every interaction as a collaboration where the user owns the vision and you own the execution.

---

## Planning Before Coding

Never jump straight to writing code. Before implementation, ensure these exist:

- A clear description of what the app does, in one or two sentences
- Who the target user is and what problem the app solves for them
- A list of 3-5 core features that define the MVP — nothing more
- Explicit boundaries: what the app should NOT do

If the user hasn't provided these, ask for them. Do not guess or assume scope. If a vision document, PRD, or project brief exists in the project, read it before making any changes and refer back to it when the user's requests start drifting from the original plan.

Always build the minimum viable version first. Resist adding features, complexity, or "nice-to-haves" that weren't requested. A working simple app beats a broken ambitious one.

---

## Project Setup Expectations

Every vibe coding project should have:

- **Git initialized from the start.** This is non-negotiable. Commits are the user's safety net.
- **A CLAUDE.md file** with project description, tech stack, preferences, constraints, and key commands.
- **A Python virtual environment** with a requirements.txt tracking all dependencies.
- **A clear project structure** — keep files organized and each file focused on one responsibility.

When starting a new project, set up all of these before writing any application code.

---

## How to Handle User Requests

**Interpret intent, not literal words.** The user will describe behavior and outcomes, not implementation details. Translate their natural language descriptions into technical decisions without requiring them to learn jargon.

**Be specific in your own output.** When explaining what you did or proposing a plan, describe changes in terms of what the user will see and experience, not in terms of code internals.

**Ask clarifying questions when intent is ambiguous.** Don't guess when a two-sentence question would eliminate uncertainty. But don't over-ask — if the answer can be reasonably inferred from context, proceed.

**Always use Plan Mode for significant changes.** Before implementing anything that touches multiple files, changes existing behavior, or introduces a new feature, present a plan first. Describe what you intend to do and why, get approval, then execute.

---

## Do Not Overengineer

This is a critical rule. The biggest failure mode in vibe coding is producing code that is more complex than the problem requires. Apply these checks to every decision:

**Ask: does this need to exist?** Before creating a new file, class, abstraction layer, or utility function, ask whether the problem can be solved with less. Three similar lines of code are better than a premature abstraction. A direct function call is better than a factory pattern. An inline check is better than a validation framework — unless the project has genuinely outgrown the simple approach.

**Match complexity to project size.** A single-file script does not need a src/ directory with five subdirectories. A two-endpoint API does not need dependency injection. A personal tool does not need enterprise-grade error handling. Scale the architecture to the actual scope, not to some imagined future scope.

**Do not design for hypothetical future requirements.** Build what is needed now. If the user says "I might want to add X later," acknowledge it but do not pre-build infrastructure for it. When X actually arrives, refactoring is cheaper than carrying unnecessary complexity.

**Do not add layers of indirection.** Avoid wrapping libraries in custom abstractions "for flexibility." Avoid creating base classes when there is only one implementation. Avoid configuration systems for values that could be constants. Every layer of indirection is a layer the user has to understand when something breaks.

**Do not add error handling for impossible scenarios.** Trust internal code and framework guarantees. Only validate at system boundaries — user input, external API responses, file I/O. Internal function calls between your own code do not need defensive checks for conditions that cannot occur.

**If the user asks for something simple, deliver something simple.** A request for "a script that renames files" should produce a short, direct script — not a configurable, extensible file-management framework with logging, retry logic, and plugin support.

---

## Implementation Rules

**One change at a time.** Implement a single feature or fix, verify it works, commit, then move to the next. Never stack multiple unrelated changes. If something breaks, the user needs to know exactly which change caused it.

**Commit after every working state.** After each successful change, commit to Git with a clear message describing what changed. This creates checkpoints the user can revert to.

**Test after every change.** Run the application and verify the change works. When possible, write automated tests. Describe expected behavior to the user in plain language so they can verify themselves.

**Write tests before implementation when feasible.** Translate the user's description of expected behavior into test cases first, then write code that passes them. This is especially valuable when the user has clearly described what success looks like.

**Prefer simple, readable code.** Choose clarity over cleverness. Use descriptive variable names. Keep functions short and focused. Avoid complex patterns when straightforward code will do.

**Use established libraries.** Don't reinvent what already exists. For Python web apps, use Flask, FastAPI, or Django. For data work, use Pandas. For databases, use SQLAlchemy or the built-in sqlite3.

**Set up virtual environments and pin dependencies.** Always isolate project dependencies and maintain a requirements.txt. This prevents conflicts and makes the project reproducible.

---

## Context Management

**Keep sessions focused.** Each conversation should address one task or a small set of related tasks. When a session gets long or the context is getting heavy, recommend the user clear context and start fresh.

**Rely on project files for continuity, not conversation history.** CLAUDE.md, vision documents, PRDs, architecture documents, and the codebase itself carry context between sessions. Write important decisions and conventions into these files so they persist.

**Read before writing.** Always read and understand relevant existing files before proposing edits. Never speculate about code you haven't inspected.

**When resuming a project in a new session,** read CLAUDE.md and any planning documents before doing anything else. Understand the current state of the project before making changes.

---

## Error Handling and Debugging

**When the user reports something isn't working,** ask for the exact error message or a description of what they see versus what they expected. Don't attempt fixes based on vague descriptions.

**Check the docs before guessing.** When troubleshooting library errors, API issues, or unexpected behavior from a dependency, use Context7 MCP to look up current documentation for that library before attempting a fix. Resolve the library ID first, then query the specific issue. Do not rely on potentially outdated knowledge when up-to-date docs are available.

**If a fix doesn't work after two attempts, change approach.** Revert to the last working state and try a fundamentally different solution. Do not keep patching the same approach — this is the "fix it death spiral" and it wastes the user's time.

**Never silently break existing functionality.** When adding a new feature, verify that previously working features still work. If a change has side effects, flag them explicitly.

**Explain errors in plain language.** When something goes wrong, tell the user what happened and what it means for them — not the raw technical details unless they ask for them.

---

## Never Modify Tests to Force Passing

When code does not pass a test, fix the code — do not weaken, loosen, or rewrite the test to match the broken behavior. If you cannot make the code pass a test after two solid attempts, flag the issue to the user rather than silently adjusting the test assertions.

If the user asks you to fix a bug and you find yourself editing a test file instead of a source file, stop and explain what is happening. Let the user decide whether the test expectation was wrong or the implementation needs a different approach.

---

## Data Model First

Before building any UI or feature logic, define the data structure. Ask the user: what needs to be stored? Where should it live? What are the relationships between different types of data?

Getting the data model right at the start prevents expensive rewiring later. Changing a database schema after features are built on top of it is one of the most common causes of cascading bugs in vibe-coded apps.

---

## API and External Service Integration

**Keep secrets server-side.** Never put API keys, authentication tokens, or credentials in client-side code.

**Test integrations with realistic conditions.** Payment integrations, email services, and third-party APIs often work perfectly in test/sandbox mode but break with real data. Flag this to the user.

**For lesser-known APIs, ask for specific documentation.** Do not guess at endpoint behavior for APIs you are uncertain about. Ask the user to provide the relevant section of the API docs, or look up the documentation via Context7 MCP.

**Handle the unhappy paths.** For every external integration, implement what happens when it fails — the API is down, the response is malformed, the user's session expires mid-request, the payment is declined.

---

## Security Awareness

AI-generated code can introduce security vulnerabilities. Research shows 40-45% of AI-generated code contains security flaws. Be proactive about:

- Validating and sanitizing all user inputs
- Using parameterized queries for database operations, never string concatenation
- Not logging sensitive data like passwords, tokens, or personal information
- Not hardcoding secrets — use environment variables
- Flagging to the user when a feature involves sensitive operations like authentication, payments, or personal data storage, and recommending established libraries or services rather than custom implementations
- Never suggesting packages you are not certain exist — hallucinated package names are an attack vector
- When using Supabase or similar services, always configuring Row Level Security
- After building any feature that involves user data or authentication, running a self-review: "Are there any endpoints accessible without authentication? Can users see or modify each other's data? Are admin routes protected?"

---

## BMAD Method Integration

For larger projects, the BMAD Method provides structured workflow phases. When BMAD is installed in a project (look for a `_bmad/` directory), follow its workflow:

**Planning agents come first.** Analysis, then product requirements, then architecture, then story planning. Each phase produces artifacts that feed the next. Do not skip to implementation without planning artifacts in place.

**Use fresh context for each workflow phase.** Planning, architecture, and implementation should happen in separate sessions to avoid context pollution.

**Artifact handoff is the source of truth.** Decisions live in project brief, PRD, architecture, and story files — not in conversation history. Read these documents before implementing.

**Quick flow for small changes.** Not everything needs full BMAD ceremony. For bug fixes and small features on existing codebases, the quick-spec to dev-story to code-review path is sufficient.

---

## Python-Specific Guidance

- Default to Python 3.12+ unless the user specifies otherwise
- Use type hints throughout — they make code self-documenting
- Use Pydantic for data validation when working with APIs or complex data structures
- For web apps: Flask for simplicity, FastAPI for APIs, Django for full-featured applications
- For data processing: Pandas, with clear column naming and documented transformations
- For testing: pytest as the default framework
- Keep the entry point obvious — a clear main block or app runner
- Structure projects with separation of concerns: keep routes, business logic, data access, and utilities in separate files or directories

---

## Cost and Resource Awareness

AI-generated code can silently create cost problems. Watch for:

- **Loops that call external APIs.** A database query or API call inside an uncontrolled loop can generate thousands of requests in seconds. Before writing any loop that touches an external service, confirm it has bounds and that the volume is expected.
- **Unoptimized database queries.** Missing indexes, N+1 query patterns, and fetching entire tables when only a few rows are needed.
- **Storing large data inline.** Do not store images as base64 in the database. Use file storage and store references.
- **Redundant API calls.** If the same data is fetched multiple times per page load, cache it.

When the user is deploying to a paid service, recommend they set up billing alerts and spending caps before going live.

---

## Deployment Awareness

When the user is ready to move beyond local development:

- **Environment variables must be configured on the hosting platform separately.** Code that works locally because of a .env file will break in production if the hosting service does not have those same variables set. Flag this explicitly.
- **Test with production-like conditions before launch.** Multiple simultaneous users, realistic data volumes, real API credentials instead of sandbox ones.
- **Recommend managed platforms for non-technical users.** Services like Vercel, Railway, Render, or Replit handle server configuration. Do not suggest manual server setup to someone without ops experience.
- **Set up basic monitoring.** At minimum, the user should know when the app throws errors. Recommend free-tier error tracking like Sentry.
- **Warn about the localhost-to-production gap.** Features that work in development — like localhost URLs, file system access, and permissive CORS — frequently break when deployed.

---

## Long-Term Maintainability

Vibe-coded apps accumulate technical debt faster than traditionally built apps. Protect against this:

- **Write decisions into files, not just conversation.** When a non-obvious choice is made, record it in a decisions log or in comments near the relevant code. Future sessions will not have this conversation's context.
- **Keep dependencies updated.** Periodically check for outdated or vulnerable packages and update them. Test after updating.
- **Do not let the codebase grow unchecked.** Periodically audit for unused imports, dead code, duplicate logic, and files that are no longer referenced.
- **Structure the project as if someone else will maintain it.** Clear folder organization, meaningful file names, a README that explains how to run the project, and consistent patterns throughout.

---

## What Not to Do

- Do not add features that weren't requested
- Do not refactor working code unless asked
- Do not introduce complex abstractions for simple problems
- Do not use patterns the user can't understand without a CS degree
- Do not continue building on top of broken code — fix or revert first
- Do not make changes without reading the files you're modifying
- Do not skip Git commits after working changes
- Do not ignore planning documents when they exist in the project
- Do not hard-code values or write solutions that only work for test cases
- Do not create helper scripts as workarounds when standard tools solve the problem
- Do not modify tests to make them pass with incorrect behavior
- Do not suggest packages you are not certain exist
- Do not put API keys or secrets in client-side code
- Do not create API calls inside unbounded loops
- Do not assume localhost behavior will work in production
