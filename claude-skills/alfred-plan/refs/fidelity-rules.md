# Fidelity Rules — alfred-plan

## When to Choose Each Level

| Signal in $ARGUMENTS or context | Recommend |
|----------------------------------|-----------|
| "quick", "rough", "prototype", "draft" | quick |
| "faithful", "migrate", "rebuild" | structured |
| "pixel-perfect", "Figma handoff", "exact", "match exactly" | high-fidelity |
| Source is a brief only (no design) | quick or structured |
| Source is HTML with CSS | structured |
| Source is a Figma export | high-fidelity |
| Source is a screenshot | structured (high-fidelity rarely achievable from screenshots alone) |
| Multiple pages | structured minimum |

## Quick Fidelity — Decision Rules

**Content extraction:**
- Do NOT extract text content from source (time cost too high, structural output is the goal)
- Set `placeholder: true` on all text blocks
- Use `content.text = null` on all heading, text blocks
- Exception: page title, section labels, and CTA button text may be extracted if trivially obvious

**Token extraction:**
- Extract primary color only (single most prominent brand color)
- Extract background color if obviously not white
- Skip all typography tokens — use defaults from `refs/default-assumptions.json`
- Skip spacing tokens — use defaults

**Asset extraction:**
- List assets by type and zone only (e.g., "hero image", "3 feature icons", "team photos x4")
- Do not attempt to extract sources or dimensions
- All assets → `status: "placeholder"`

**Question handling:**
- Flag only `blocking` questions
- Skip `important` and `minor` — use defaults silently

**Interactivity:**
- Set all blocks to `interactivity.type = "none"`
- Do not flag form plugin questions (use `html` type placeholder)

**Appropriate for:**
- Internal prototypes
- Initial site scaffolding before content is ready
- When the client hasn't approved copy yet
- When you need to validate the structure quickly

---

## Structured Fidelity — Decision Rules

**Content extraction:**
- Extract all text content verbatim from source
- For screenshots: transcribe visible text exactly
- For briefs: use provided content as-is; placeholder where missing
- For HTML: extract innerText of all content elements
- Mark `placeholder: true` only when content is genuinely absent from source

**Token extraction:**
- Extract full color palette (primary, secondary, background, text, accent, border)
- Extract heading and body fonts if identifiable
- Extract section padding Y and container max-width from CSS or visual estimation
- Mark each token with appropriate confidence level

**Asset extraction:**
- List all assets with source URLs or paths where available
- Identify placeholder vs available status per asset
- Record dimensions if available in CSS or HTML attributes
- Flag missing production images as `important` questions

**Question handling:**
- Flag `blocking` questions — these stop the executor
- Flag `important` questions — executor proceeds with default_assumption
- Skip `minor` questions — use defaults silently

**Interactivity:**
- Map all visible links and button targets
- Note anchor links (scroll-to) when identifiable
- Flag forms as `important` questions (plugin unknown)
- Skip hover/animation states — out of scope for structured

**Appropriate for:**
- Standard site rebuilds
- Content migrations
- Client site builds where design is finalized
- The default for most Alfred workflows

---

## High-Fidelity Fidelity — Decision Rules

**Content extraction:**
- All structured rules apply
- Additionally: extract microcopy (tooltips, placeholders, error messages, label text)
- Extract content for all repeating items (all testimonials, all pricing tiers, all accordion items)

**Token extraction:**
- All structured rules apply
- Additionally: extract all color stops for gradients
- Extract all font weight variants used
- Extract per-section spacing values where they differ from global defaults
- Extract border-radius per element if inconsistent
- Extract animation timing if present (transition duration, delay, easing)

**Asset extraction:**
- All structured rules apply
- Missing assets are elevated to `blocking` questions
- Record exact dimensions from Figma or CSS
- Note image focal points if detectable (for responsive cropping)
- Note SVG vs raster per asset

**Custom CSS notation:**
- For each block where standard widget capabilities are insufficient, add `style.custom_css` note
- Examples: clip-path shapes, multi-gradient overlays, pseudo-element decorations, complex grid layouts
- Executor uses this note to decide whether to use HTML block + custom CSS

**Question handling:**
- Flag all three severity levels: `blocking`, `important`, `minor`
- Minor questions include: exact icon set, exact border-radius, exact letter-spacing, hover state details

**Interactivity:**
- Map all interactions: links, anchors, modals, toggles, scroll-triggered animations
- Note expected animation behavior (fade in, slide up, counter animate on scroll)
- Flag modal/lightbox implementations as `important` questions (plugin required)
- Flag AJAX/dynamic behavior as `blocking` questions

**Appropriate for:**
- Figma-to-Elementor pixel-perfect builds
- Agency handoffs to clients
- When the design is a final approved deliverable
- When post-build manual adjustments are not acceptable

---

## Default Assumption Values

See `refs/default-assumptions.json` for the exact values used at each fidelity level when tokens/content are not available.

---

## Complexity Classification

| Criterion | simple | moderate | complex |
|-----------|--------|----------|---------|
| Sections per page | ≤3 | 4–8 | 9+ |
| Block types used | standard only | mostly standard | includes html, custom |
| Pages in plan | 1 | 1–3 | 4+ |
| Blocking questions | 0 | 0–1 | 2+ |
| Custom CSS needed | no | possibly | yes |
| Assets | ≤3 | 4–10 | 11+ |
| Fidelity gaps | none | 1–2 | 3+ |
