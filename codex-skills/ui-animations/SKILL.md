---
name: ui-animations
description: Use this skill when performing UI animation work, motion design, micro-interactions, transitions, hover effects, or scroll and entrance animation implementation.
---

# Goal
Add motion that improves clarity, feedback, and delight without harming performance or accessibility.

# Instructions
1. Identify which interactions truly benefit from motion and what user feedback the motion should communicate.
2. Choose the lightest implementation that fits the stack, such as CSS transitions, keyframes, or an existing motion library.
3. Coordinate duration, easing, delay, and stagger so motion feels deliberate rather than noisy.
4. Apply motion to hierarchy, focus, and state changes instead of decorating every element.
5. Honor reduced-motion preferences and test performance on lower-powered devices.

# Input
A request to animate UI, create micro-interactions, improve transitions, add hover states, or orchestrate page or component reveals.

# Output
Animation code, motion timing decisions, and any supporting state changes needed to make transitions feel polished and reliable.

# Best Practices
- Use transform and opacity whenever possible for smooth, GPU-friendly motion.
- Keep motion tied to meaning: state change, hierarchy, orientation, or affordance.
- Avoid long, blocking, or distracting animation sequences.
- Respect `prefers-reduced-motion` and provide usable non-animated fallbacks.
