---
name: debugging-issue-diagnosis
description: Use this skill when performing debugging, issue diagnosis, reproduction work, root-cause analysis, or fixing unclear failures in application code.
---

# Goal
Find the real cause of a problem quickly and fix it with evidence instead of guesswork.

# Instructions
1. Reproduce the issue or narrow the failure surface before changing code.
2. Gather logs, stack traces, inputs, environment differences, and recent code context that could explain the behavior.
3. Form a small set of hypotheses and test them systematically, ruling out false leads quickly.
4. Fix the root cause, not just the visible symptom, and add protection against recurrence when practical.
5. Verify the fix in the scenario that failed and nearby edge cases that share the same path.

# Input
A request to debug an error, investigate flaky behavior, diagnose regressions, or explain why a feature is broken or inconsistent.

# Output
Root-cause findings, code fixes, and supporting checks or tests that confirm the issue has been addressed.

# Best Practices
- Instrument first when the failure path is ambiguous.
- Keep debugging changes temporary unless they improve long-term observability.
- Separate environment issues, data issues, and code defects clearly.
- Favor evidence and reproducibility over intuition alone.
