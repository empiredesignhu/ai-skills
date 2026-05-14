---
name: performance-optimization
description: Use this skill when performing performance optimization, rendering and query tuning, bundle reduction, slow-path analysis, or latency and throughput improvements.
---

# Goal
Improve performance by addressing the actual bottlenecks that affect user experience, resource usage, or system throughput.

# Instructions
1. Determine whether the problem is frontend rendering, network, server latency, database access, or build and bundle cost.
2. Measure or inspect the relevant hot path before proposing optimizations.
3. Optimize the dominant bottleneck first, using profiling evidence or concrete traces where available.
4. Trade complexity for performance only when the gain is meaningful and maintainable.
5. Re-check correctness, regression risk, and real-world impact after changes.

# Input
A request to speed up pages, APIs, queries, builds, renders, or application workflows that feel slow or resource-heavy.

# Output
Targeted performance improvements, instrumentation or profiling changes when useful, and brief notes about the bottleneck addressed.

# Best Practices
- Prefer measurement-backed improvements over speculative micro-optimizations.
- Reduce work, memory churn, and payload size before adding caching layers.
- Keep optimizations understandable so future changes do not silently undo them.
- Watch for accessibility, correctness, and cache invalidation regressions while tuning.
