# Build Strategy Rules — alfred-build

## Strategy Selection Matrix

| Plan fidelity | Page state | Strategy |
|--------------|------------|----------|
| quick | No existing page | Full-page build (build_page) |
| quick | Draft page exists | Full-page build (build_page, overwrite) |
| quick | Live page exists | Duplicate → Full-page build |
| structured | No existing page | Section-by-section injection |
| structured | Draft page exists | Section-by-section injection |
| structured | Live page exists | Duplicate → Section-by-section injection |
| high-fidelity | Any | Section-by-section injection + element-level patching |

## Tool Selection Rules

### respira_build_page
**Use when:**
- Target page is empty (just created) AND fidelity is `quick`
- You have the full page Elementor JSON ready in one pass
- Full page rebuild is explicitly requested

**Do NOT use when:**
- Page already has Elementor content (use inject instead)
- You want to preserve any existing sections
- Fidelity is structured or high-fidelity (too hard to repair section-by-section)

### respira_inject_builder_content
**Use when:**
- Adding a section or set of sections to an existing page structure
- Building page skeleton (empty sections, no content)
- Adding content to a specific section target
- Any structured or high-fidelity build

**Injection target rules:**
- No target = append to page bottom
- Target = section container ID = inject inside that section
- Always verify the target ID exists via respira_find_builder_targets() before injecting

### respira_update_element + respira_update_module
**Use when:**
- Patching a single element's settings (text, color, image, font)
- Fixing a mismatch found during validation
- High-fidelity post-build patching pass

**Use respira_batch_update instead when:**
- Updating 3+ elements on the same page in one logical pass
- Setting font, size, color on multiple heading/text blocks
- Batch-filling content after structure is verified

### respira_batch_update
**Use when:**
- Multiple element updates that logically belong together (e.g., all section headings, all button links)
- Filling text content across multiple blocks after structure verification
- Font/color token application pass

**Limit:** Up to 20 elements per batch call. Split into multiple calls if needed.

### respira_move_element / respira_reorder_elements
**Use when:**
- Validation reveals blocks are in the wrong order
- Section order doesn't match plan

**Do NOT use as primary build tool** — build in the correct order from the start.

### respira_duplicate_element
**Use when:**
- Building repeating structures (testimonial cards, feature cards, pricing tiers)
- Faster than re-injecting identical widget structures

**Strategy for repeating blocks:**
1. Inject first item
2. Duplicate N-1 times
3. Update content per duplicate with batch_update

### respira_remove_element
**Use when:**
- Repair loop: wrong widget type was inserted, needs replacing
- Removing skeleton placeholder elements after content injection
- Cleaning up empty sections

**Safety check:** Always verify element ID still exists via find_element before removing.

---

## Page Creation vs Duplication Decision Tree

```
Does --page-id exist in arguments?
  YES → Read page status
        Published AND no --force-live?
          YES → STOP: refuse live edit
          NO (draft or --force-live) → Snapshot → Edit in place
  NO → Search for page by plan title
       Found?
         YES → Published?
                 YES → Duplicate → work on duplicate
                 NO (draft) → Snapshot → Edit in place
         NO → Create new draft page → work on new page
```

## Asset Resolution Priority

1. `available` + `source_url` → sideload via respira_sideload_image
2. `available` + local path → upload via respira_upload_media
3. `placeholder` → search stock via respira_search_stock_images(description, count=1) → sideload
4. `missing` → skip, use Elementor default placeholder, log issue
5. `needs_replacement` → use source as-is, log warning

**Stock search query construction:**
Use `asset.description` as the search query. Strip technical words (placeholder, image, photo).
Examples:
- "Hero háttérkép — abstract blue gradient" → query: "abstract blue gradient background"
- "Nótárius Péter portré fotó" → query: "professional business portrait man"

**Stock image limit:** Max 3 stock substitutions per page. If more are needed, flag and ask user.

---

## Repair Protocol

When section validation fails, apply repairs in this priority order:

1. **Wrong block count** → Re-inject the section content (not the full page)
2. **Wrong block type** → remove_element(wrong) + inject correct widget
3. **Missing text content** → update_element(element_id, {text: correct_text})
4. **Wrong column count** → update_element(section_id, {columns: N}) — requires section container ID
5. **Missing image** → update_element(element_id, {image_id: media_id})
6. **Wrong order** → reorder_elements([element_ids in correct order])

**Max repair attempts per section:** 3
**After 3 failures:** mark as repair-failed, log details, continue to next section

---

## Elementor Content Structure Reference

### Minimal section skeleton
```json
{
  "elType": "section",
  "settings": {
    "layout": "boxed",
    "content_position": "center"
  },
  "elements": [
    {
      "elType": "column",
      "settings": { "_column_size": 100 },
      "elements": []
    }
  ]
}
```

### Two-column section (50/50)
```json
{
  "elType": "section",
  "settings": { "layout": "boxed" },
  "elements": [
    { "elType": "column", "settings": { "_column_size": 50 }, "elements": [] },
    { "elType": "column", "settings": { "_column_size": 50 }, "elements": [] }
  ]
}
```

### Three-column section (33/33/34)
```json
{
  "elType": "section",
  "settings": { "layout": "boxed" },
  "elements": [
    { "elType": "column", "settings": { "_column_size": 3333 }, "elements": [] },
    { "elType": "column", "settings": { "_column_size": 3333 }, "elements": [] },
    { "elType": "column", "settings": { "_column_size": 3334 }, "elements": [] }
  ]
}
```
Note: Elementor uses basis points (3333 = 33.33%) for column widths internally.

### Full-width section with image background + overlay
```json
{
  "elType": "section",
  "settings": {
    "layout": "full_width",
    "custom_height_type": "min-height",
    "custom_height": { "size": 600, "unit": "px" },
    "content_position": "center",
    "background_background": "classic",
    "background_image": { "url": "<image_url>", "id": <media_id> },
    "background_overlay_background": "classic",
    "background_overlay_color": "#000000",
    "background_overlay_opacity": { "size": 55, "unit": "%" }
  },
  "elements": [...]
}
```

### Widget skeleton
```json
{
  "elType": "widget",
  "widgetType": "<widget_name>",
  "settings": {}
}
```

---

## Validation Checklist (per section)

After injecting each section, extract and verify:

- [ ] Section exists in extracted content
- [ ] Column count matches plan (plan.sections[n].layout.columns)
- [ ] Block count per column matches plan
- [ ] Block types match canonical widget map
- [ ] First text block is not empty
- [ ] Background type matches plan (color/image/gradient)
- [ ] Image blocks have a non-null src (not broken)
- [ ] Button blocks have href set (not empty)

Fail threshold: any single check fails = trigger repair for that element.

---

## Completion Criteria

A page is "review-ready" when:
1. All sections are present and verified (or repair-failed with documented issues)
2. No section is in an unknown state
3. execution-state.json has been written with final status
4. execution-report.md has been written
5. Draft page URL is available and accessible

A page is NOT review-ready if:
- Any section is in status: null (never attempted)
- Page creation or skeleton injection failed entirely
- Builder reports a critical error that left the page in an unknown state
