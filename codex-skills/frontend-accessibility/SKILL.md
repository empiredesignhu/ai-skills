---
name: frontend-accessibility
description: Use this skill when performing frontend accessibility work, WCAG improvements, keyboard support, focus management, or accessible component and page development.
---

# Goal
Build and repair frontend experiences so they are perceivable, operable, understandable, and robust for a wide range of users.

# Instructions
1. Identify the affected user journeys, interaction patterns, and likely accessibility risks.
2. Fix semantic structure, labels, roles, states, focus order, and keyboard behavior before adding ARIA patches.
3. Review color contrast, motion, announcements, error messaging, and form guidance.
4. Test interactive flows with keyboard-first usage and assistive-technology-friendly markup.
5. Document remaining constraints or tradeoffs when full compliance depends on broader product changes.

# Input
A request to improve accessibility, meet WCAG expectations, audit component behavior, or repair keyboard and screen-reader issues.

# Output
Accessible frontend code, updated markup and interactions, and concise notes describing important accessibility decisions or residual issues.

# Best Practices
- Prefer native HTML semantics over custom controls whenever possible.
- Preserve visible focus states and logical tab order.
- Ensure forms expose labels, instructions, and error feedback programmatically.
- Treat accessibility as core product quality, not a cosmetic follow-up.
