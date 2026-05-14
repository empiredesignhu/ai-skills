# Figma Parse Rules — alfred-plan

Rules for translating Figma frame descriptions and exports to alfred-plan sections/blocks.

## Input Forms

The planner may receive Figma input as:
1. **Figma JSON export** — structured frame/node tree (from Figma API or plugin export)
2. **Figma description** — Claude's visual analysis of a Figma screenshot or screen capture
3. **Structured component list** — user-provided component hierarchy

## Frame → Section Mapping

Figma frames map to alfred-plan sections:

| Figma structure | Plan structure |
|-----------------|---------------|
| Top-level frame (page-level component) | One page |
| Direct children of top-level frame that span full width | Sections |
| Auto-layout frame (horizontal, wrapping) with N children | Column layout |
| Auto-layout frame (vertical) | Single-column block list |
| Component instance | Block of inferred type |
| Group | Treat as containing element; map children individually |

**Section label:** Use the Figma frame/layer name if it is meaningful (e.g., "Hero", "Features", "CTA"). If it is generic ("Frame 12", "Group 4"), infer label from content.

## Auto-Layout → Column Translation

| Auto-layout direction | Children count | Resulting layout |
|----------------------|---------------|-----------------|
| Horizontal | 1 | 1-column section |
| Horizontal | 2 | 2-column (infer widths from frame sizes) |
| Horizontal | 3 | 3-column (infer widths) |
| Horizontal | 4+ | N-column (infer widths) |
| Vertical | any | Single column, blocks stacked |
| Wrap/grid | any | Gallery or equal-width N-column |

**Width inference:** Divide each child frame's width by parent frame's width × 100 → percentage.

## Component Name → Block Type

Map Figma component names (or layer names) to canonical block types:

| Figma name pattern (case-insensitive) | Block type |
|---------------------------------------|-----------|
| Heading, Title, H1, H2, H3, Headline | `heading` |
| Body, Paragraph, Text, Description, Copy | `text` |
| Image, Photo, Thumbnail, Picture, Illustration | `image` |
| Button, CTA, Call to Action, Action | `button` |
| Form, Contact Form, Newsletter, Input | `form` |
| Gallery, Photo Grid, Image Grid | `gallery` |
| Slider, Carousel, Swipe | `slider` |
| Video, Player, Embed | `video` |
| Map, Location | `map` |
| FAQ, Accordion, Expandable | `accordion` |
| Tabs, Tab Panel | `tabs` |
| Testimonial, Quote, Review | `testimonial` |
| Feature, Icon Box, Icon Card, Benefit | `icon-list` |
| Icon, Pictogram | `icon` |
| Counter, Stat, Number, Achievement | `counter` |
| Progress, Skill Bar | `progress-bar` |
| Divider, Separator, Rule | `divider` |
| Spacer, Gap | `spacer` |
| Social, Social Icons | `social-icons` |
| Pricing, Plan, Tier | `pricing-table` |
| Alert, Notice, Banner, Callout | `alert` |
| Search, Search Bar | `search` |
| Nav, Menu, Navigation | `menu` |
| Footer Nav, Secondary Nav | `menu` |
| Sidebar | `sidebar` |
| Anything not matched | `html` |

## Figma Color Styles → Style Tokens

| Figma style type | Maps to |
|-----------------|---------|
| Color style named "Primary", "Brand", "Main" | `colors.primary` |
| Color style named "Secondary", "Accent" | `colors.secondary` or `colors.accent` |
| Color style named "Background", "BG", "Surface" | `colors.background` |
| Color style named "Text", "Body Text", "Foreground" | `colors.text` |
| Color style named "Border", "Stroke", "Outline" | `colors.border` |
| Fill used on >50% of primary buttons | `colors.primary` |
| Fill used on body text elements | `colors.text` |

Confidence: `exact` if extracted from Figma color style. `approx` if inferred from fill usage. `inferred` if guessed from visual analysis.

## Figma Text Styles → Typography Tokens

| Figma text style | Maps to |
|-----------------|---------|
| Style named "H1", "Heading 1", "Display" | heading font, h1 size |
| Style named "H2", "Heading 2" | h2 size |
| Style named "Body", "Regular", "Default" | body font, base size |
| Font family on largest heading text | `typography.heading_font` |
| Font family on body text | `typography.body_font` |
| Font size on body text | `typography.base_size` |
| Line height on body text | `typography.line_height` |

## Figma Spacing → Spacing Tokens

| Figma measurement | Maps to |
|------------------|---------|
| Padding of section-level frames (top+bottom) | `spacing.section_padding_y` |
| Auto-layout gap between columns | `spacing.column_gap` |
| Auto-layout gap between block rows | `spacing.row_gap` |
| Max width of content container frame | `spacing.container_max_width` |

## Figma Effects → Effects Tokens

| Figma effect | Maps to |
|-------------|---------|
| Drop shadow on cards | `effects.card_shadow` (convert to CSS box-shadow) |
| Corner radius on cards/buttons | `effects.border_radius` |
| Corner radius on buttons specifically | `effects.button_border_radius` |

## Figma Asset Extraction

For each image fill or image layer:
1. Assign asset ID
2. Record Figma frame dimensions as `dimensions`
3. Use Figma layer name as `description`
4. Set `status: "placeholder"` (Figma images are design-time only, not production assets)
5. Flag as `important` question: "Provide production image for [description]"

For SVG / vector layers:
- Set `type: "svg"`
- Set `status: "available"` if SVG can be exported from Figma
- Set `status: "placeholder"` if it's a complex illustration that needs export

## Figma Prototype Interactions → Interactivity

| Figma prototype connection | Maps to |
|---------------------------|---------|
| Navigate to frame on click | `interactivity.type: "link"` |
| Scroll to section | `interactivity.type: "anchor"` |
| Open overlay | `interactivity.type: "modal"`, flag as `important` |
| Hover state variants | Note in `style.custom_notes`, high-fidelity only |
| Scroll animation | Note in `style.custom_notes`, high-fidelity only |

## Ambiguity Handling (Figma-specific)

| Situation | Action |
|-----------|--------|
| Frame name is generic ("Frame 12") | Infer label from dominant child content |
| Component not in canonical list | Use `html` type, flag as `important` |
| Multiple fills on same layer | Use topmost/most prominent fill |
| Nested Figma components more than 3 levels deep | Flatten to nearest canonical type |
| Variable/token reference (not resolved) | Mark as `missing` confidence |
| Prototype interaction uses unsupported pattern | Flag as `blocking` question |
