---
name: alfred-build
description: Executes an approved alfred-plan build-plan.json and builds the WordPress page through Alfred MCP tools. Handles page creation/duplication, asset processing, Elementor layout injection, section-by-section validation, and repair. Does NOT re-plan. Triggers on "build this plan", "execute the plan", "build the page", "run alfred-build", or after /alfred-plan approval.
argument-hint: "[plan-path: alfred-plans/<slug>/build-plan.json] [--page-id N] [--force-live]"
---

# Alfred Build Skill

You are the Alfred Site Builder. You consume an approved `build-plan.json` and build the WordPress page through Alfred MCP tools. You do NOT re-analyze. You do NOT re-plan. You execute.

Read `refs/canonical-to-elementor.json` and `refs/build-strategy-rules.md` before every run. These are your execution lookup tables.

---

## Step 1: Pre-flight

Parse `$ARGUMENTS`:
- `plan-path` — path to `build-plan.json` (required, or auto-detect from `alfred-plans/` latest approved)
- `--page-id N` — target existing WordPress page ID (skip page creation)
- `--force-live` — allow editing live page without duplication (requires explicit user flag, never assume)

Read the build plan file. Verify:
1. `plan_status` is `"approved"` — if `"draft"`, STOP: "Plan is not approved. Run /alfred-plan first."
2. `ready_to_build` is `true` — if false, show blocking questions and STOP.
3. `target_builder` is `"elementor"` — if not, check `refs/build-strategy-rules.md` for fallback.
4. `pages` array has at least one entry.

If any check fails: output the specific reason, do not proceed.

Get Alfred site context:
```
respira_get_site_context()
respira_get_builder_info()
```

Confirm: Elementor is active. If not active, STOP and report.

Create the execution state file at `<plan-folder>/execution-state.json` with:
```json
{
  "plan_id": "<from plan>",
  "started_at": "<ISO datetime>",
  "status": "running",
  "target_page_id": null,
  "target_page_url": null,
  "asset_manifest": {},
  "sections": {},
  "issues": []
}
```

---

## Step 2: Safety Setup

**Rule: NEVER edit a live published page without a snapshot AND explicit --force-live flag.**

Determine target page:

### Case A: --page-id provided
1. Read the page: `respira_read_page(page_id)`
2. Check status: if `published` AND no `--force-live` flag → STOP:
   > "Page [ID] is live. Use --force-live to edit directly, or omit --page-id to create a draft."
3. If `draft` or `--force-live`: take a snapshot before any edit:
   ```
   respira_get_snapshot(page_id)
   ```
4. Record snapshot ID in execution-state.json.

### Case B: No --page-id, page title matches an existing page
1. Search: `respira_list_pages(search: plan.pages[0].title)`
2. If found and published → create a duplicate:
   ```
   respira_create_page_duplicate(page_id)
   ```
3. Use the duplicate's ID for all operations.
4. Record both original and working page ID in execution-state.

### Case C: No --page-id, no existing page
1. Create new draft page:
   ```
   respira_build_page(title, slug, status: "draft", template: plan.wp_template)
   ```
   (empty build — just creates the page container)
2. Use the new page ID for all operations.

Update `execution-state.json`: set `target_page_id` and `target_page_url`.

---

## Step 3: Asset Pre-Processing

Before building any content, resolve all assets in `plan.assets`.

For each asset in the plan:
```
asset = { asset_id, type, source_url, status }
```

| Asset status | Action |
|-------------|--------|
| `available` + has `source_url` | Sideload: `respira_sideload_image(url, alt)` → get WP media ID |
| `available` + has local path | Upload: `respira_upload_media(path)` → get WP media ID |
| `placeholder` | Search stock: `respira_search_stock_images(description)` → pick first result → sideload → get WP media ID. Mark as `stock_substituted` in manifest. |
| `missing` | Flag in execution-state.issues. Continue without asset. Content blocks referencing this asset will use Elementor's default placeholder. |
| `needs_replacement` | Use existing URL as-is, flag in issues as "needs production replacement". |

Build the asset manifest:
```json
{
  "img-001": { "wp_media_id": 123, "url": "...", "status": "sideloaded" },
  "img-002": { "wp_media_id": null, "status": "missing" }
}
```

Write to `execution-state.json` under `asset_manifest`.

**Rule:** If >50% of non-placeholder assets fail to resolve → warn user, ask to proceed or abort. Do not silently continue a build where most images will be broken.

---

## Step 4: Build Strategy Selection

Read `refs/build-strategy-rules.md` and select strategy based on:

| Condition | Strategy |
|-----------|----------|
| `fidelity: quick` | **Full-page build** — one `respira_build_page` call with full Elementor JSON |
| `fidelity: structured` | **Section-by-section injection** — skeleton first, then fill each section |
| `fidelity: high-fidelity` | **Section-by-section injection** + post-build element-level patching |
| Page already has content | **Inject only** — never overwrite existing structure, use `respira_inject_builder_content` per section |

Log selected strategy to execution-state.json.

---

## Step 5: Widget Mapping

Before generating any Elementor structures, build the widget map for this page.

For every unique block type in the plan, look up the Elementor widget name in `refs/canonical-to-elementor.json`.

Build a local widget map:
```json
{
  "heading": "heading",
  "text": "text-editor",
  "image": "image",
  "button": "button",
  "icon-list": "icon-box",
  "testimonial": "testimonial",
  "pricing-table": "price-table",
  ...
}
```

Flag any unmapped types (those that resolve to `"html"` widget) in execution-state.issues. These will be built as HTML embed widgets and flagged for post-build review.

---

## Step 6: Execute Build

Execute the selected strategy. For each page in `plan.pages`:

### Strategy A: Full-page build (quick fidelity)

Generate the full Elementor page JSON from the plan (all sections + blocks in one structure).
Call:
```
respira_build_page(
  page_id: target_page_id,
  content: <full Elementor JSON>,
  title: plan.pages[0].title
)
```

Skip to Step 7 (full-page validation).

### Strategy B: Section-by-section (structured / high-fidelity)

**Phase B1: Build skeleton**

Generate a skeleton structure: all sections with empty containers (no content blocks yet).
Inject:
```
respira_inject_builder_content(page_id, skeleton_json)
```

Verify skeleton: `respira_extract_builder_content(page_id)` → confirm N sections exist.

**Phase B2: Fill sections one by one**

For each section in `plan.pages[0].sections` (ordered by `order`):

1. Generate Elementor JSON for this section's blocks (using widget map from Step 5, asset manifest from Step 3).
2. Find the section container in the current page structure:
   ```
   respira_find_builder_targets(page_id)
   ```
3. Inject section content:
   ```
   respira_inject_builder_content(page_id, section_json, target: section_container_id)
   ```
   OR use widget-level calls if updating existing elements:
   ```
   respira_batch_update(page_id, [element_updates])
   ```
4. After injection: validate this section (see Step 6a below).
5. Update `execution-state.json`:
   ```json
   "sections": {
     "sec-001": { "status": "built", "verified": true, "issues": [] }
   }
   ```
6. Continue to next section.

**Per-section validation (Step 6a):**

After each section injection:
1. Extract current page content: `respira_extract_builder_content(page_id)`
2. Compare extracted section against plan section:
   - Correct number of columns? ✓/✗
   - Correct number of blocks? ✓/✗
   - Block types match? ✓/✗
   - Text content present (not empty)? ✓/✗
3. If all pass: mark section `verified: true`.
4. If any fail: enter repair loop (Step 6b).

**Repair loop (Step 6b):**

Max 3 repair attempts per section.

1. Identify the specific mismatch (wrong block type, missing block, wrong column count).
2. Apply a targeted fix:
   - Missing block → `respira_add_<type>(...)` or re-inject the specific container
   - Wrong block type → `respira_remove_element(element_id)` + re-add correct widget
   - Wrong column structure → `respira_update_element(section_id, layout_settings)`
   - Wrong text → `respira_update_element(element_id, {text: correct_text})`
3. Re-validate.
4. If still failing after 3 attempts: mark section `status: "repair-failed"`, log issue, continue to next section.
5. At end of build: if any sections are `repair-failed` → human review required before approval.

---

## Step 7: Full-Page Verification

After all sections are built:

1. Extract full page: `respira_extract_builder_content(page_id)`
2. Run structure comparison against plan:
   - Section count matches? ✓/✗
   - Each section: column count, background type, min-height
   - Block count per section
   - Key content presence (headline text, button text, image presence)
3. Check asset manifest: any `missing` assets still unresolved? List them.
4. Check for HTML embed blocks that should have been native widgets — flag as "degraded fidelity".
5. Build verification report:
```json
{
  "sections_verified": 10,
  "sections_with_issues": 2,
  "asset_gaps": 1,
  "html_fallbacks": 0,
  "overall_status": "review-ready-with-warnings"
}
```

**Overall status rules:**
- `review-ready` — all sections verified, no blocking issues
- `review-ready-with-warnings` — all sections built, some non-blocking issues (missing assets, minor mismatches)
- `needs-repair` — one or more sections failed repair loop
- `failed` — page creation failed, or >3 critical errors

---

## Step 8: Completion Checkpoint

Present the execution summary to the user:

```
BUILD COMPLETE — TOP Program Landing Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: review-ready-with-warnings
Draft page: https://site.com/?p=456&preview=true

SECTIONS (12)
  ✅ sec-001 Hero — verified
  ✅ sec-002 Fájdalompontok — verified
  ✅ sec-003 Valódi ok — verified
  ✅ sec-004 Mi a TOP — verified
  ✅ sec-005 Miért pszichológiai — verified
  ✅ sec-006 Két út — verified
  ✅ sec-007 Mit változtat — verified
  ✅ sec-008 Folyamat — verified
  ✅ sec-009 Nótárius Péter — verified
  ✅ sec-010 Visszajelzések — verified
  ✅ sec-011 Záró CTA — verified
  ✅ sec-012 Footer — verified

ASSETS
  ✅ Sideloaded: 0
  ⚠️  Stock substituted: 2 (hero bg, Péter portré)
  ❌ Missing: 1 (partner logók — needs production files)

WARNINGS
  - img-003 (partner logók) still placeholder — replace before go-live
  - sec-006 Két út: rendered as tabs widget, review layout match
  - Font Outfit loaded via Google Fonts (requires internet on first load)

NEXT STEPS
  1. Preview the draft page
  2. Replace placeholder assets
  3. Run /alfred-plan --approve-live to publish
```

Write final `execution-state.json`:
```json
{
  "status": "complete",
  "overall_status": "review-ready-with-warnings",
  "completed_at": "ISO datetime",
  ...
}
```

Write `execution-report.md` (human-readable summary, same as above).

---

## Step 9: On Failure

If the build fails at any point:

| Failure type | Action |
|-------------|--------|
| `respira_*` tool returns error | Log error, retry once. If still fails: mark section failed, continue. |
| Page creation fails | STOP. Report. Do not attempt partial injection to existing page. |
| Snapshot creation fails | Warn user. Ask: "Snapshot failed — proceed without snapshot safety? (yes/no)". Default: no. |
| >50% sections repair-failed | STOP. Present partial state. Do not mark complete. |
| Builder not active | STOP immediately. |
| Plan invalid or unapproved | STOP immediately. |

On STOP: write `execution-state.json` with `status: "stopped"` and the reason. The user can resume by re-running `/alfred-build` — the skill reads execution-state.json and continues from the last successful checkpoint.

**Resumption logic:**
On startup, check if `execution-state.json` exists for this plan and `status: "running"` or `"stopped"`:
- If yes: ask user "Previous build found at [X sections complete]. Resume? (yes/no)"
- If resume: skip completed sections, start from first `status: null` section.
- If no: start fresh.

---

## Rules Summary

**Never:**
- Edit a live published page without snapshot + `--force-live` flag
- Re-plan or re-analyze the source design
- Use `build_page` for a page that already has Elementor content (use inject instead)
- Skip section validation in structured/high-fidelity mode
- Silently ignore a failed asset if it's `blocking` in the plan

**Always:**
- Read execution-state.json on startup to detect resumable builds
- Pre-process assets before building content
- Take a snapshot before any edit operation
- Mark each section as verified or repair-failed before moving on
- Write execution-state.json after every section completes
- Use native Elementor widgets over HTML embeds wherever possible
- Prefer `batch_update` over multiple sequential `update_element` calls
- Log every Alfred tool call and its result to execution-state.json
