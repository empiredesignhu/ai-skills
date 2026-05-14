# HTML Parse Heuristics — alfred-plan

Rules for mapping raw HTML (and HTML+CSS) to sections and blocks.

## Section Boundary Detection

A new section starts when ANY of these are true:

1. **Semantic element:** `<section>`, `<header>`, `<footer>`, `<main>`, `<article>`, `<nav>`
2. **Full-width divs with vertical padding:** element has `padding-top >= 40px` AND `padding-bottom >= 40px` AND `width: 100%` or `display: block` at the outermost level
3. **Background change:** element has `background-color`, `background-image`, or `background` different from its parent
4. **Landmark role:** `[role=banner]`, `[role=contentinfo]`, `[role=main]`, `[role=complementary]`
5. **Common class patterns:** `.section`, `.hero`, `.banner`, `.row`, `.block`, `.segment`, `.wrapper > .container` at the top level
6. **Visual rhythm break:** consecutive sibling divs with distinct background colors that span full container width

**Do NOT create a section for:**
- Inner wrappers like `.container`, `.inner`, `.wrap` — these map to section layout properties
- Navigation dropdowns
- Modal dialogs — these are interactivity, not sections
- Sticky headers (detect separately, mark as `menu` block, not a section)

## Column Detection

Once inside a section, detect column structure:

1. **CSS Grid:** `display: grid; grid-template-columns: ...` → count tracks, extract widths as %
2. **Flexbox:** `display: flex` with multiple direct children that have explicit widths → columns
3. **Float layout:** children with `float: left/right` and defined widths → columns
4. **Bootstrap grid:** `.col-md-4` × 3 → 3 columns at 33.33%
5. **Unknown:** default to 1 column, flag as `minor` question

**Column width extraction priority:**
1. Explicit `width: N%` on child elements
2. `grid-template-columns` values converted to %
3. Bootstrap/Tailwind class inference (col-4 = 33.33%, col-6 = 50%, col-8 = 66.67%, col-12 = 100%)
4. Equal distribution: if N children, each gets `100/N %`

## Block Detection Within Columns

Process each column's children in DOM order:

### Headings
```
element: h1, h2, h3, h4, h5, h6
  OR element with class: .heading, .title, .headline, .h1..h6
  OR element with font-size > 24px and font-weight >= 600 (inferred from CSS)
→ type: "heading"
→ style.size: h1/h2 → "xl", h3/h4 → "lg", h5/h6 → "md"
→ content.text: innerText
```

### Text blocks
```
element: p, .text, .body, .description, .excerpt
  OR large div/span with no structural children (only text)
→ type: "text"
→ content.text: innerText or innerHTML (if HTML formatting present)
```

### Images
```
element: img, picture
  OR div/figure with background-image (when NOT the section background)
  AND element does NOT contain other content blocks as children
→ type: "image"
→ content.asset_ref: assign new asset ID
→ assets[]: add entry with src, alt, dimensions from attributes
```

### Buttons
```
element: button, a.btn, a.button, a[role=button], .cta-button
  OR anchor/button with display:block AND explicit width AND text content ≤ 5 words
→ type: "button"
→ content.text: innerText
→ interactivity.type: "link"
→ interactivity.target: href attribute
```

### Forms
```
element: form, .contact-form, .newsletter-form, [data-form]
→ type: "form"
→ Flag as important question: which form plugin?
→ content.items: array of {type: "text|email|tel|textarea|select|checkbox", label: "...", required: bool}
  extracted from input[type], label, textarea, select children
```

### Galleries
```
element with class: .gallery, .grid, .masonry, .photo-grid
  OR 4+ sibling img elements in a flex/grid container
→ type: "gallery"
→ content.items: [{asset_ref: "img-XXX"}, ...] for each image
```

### Sliders / Carousels
```
element with class: .slider, .carousel, .swiper-container, .splide, [data-slick]
  OR element with .owl-carousel, .flickity, .glide
→ type: "slider"
→ content.items: [{type: "slide", content: {...}}] for each slide
```

### Icon lists / Feature cards
```
3+ sibling elements that each contain:
  - an icon (svg, img, i.fa-*) AND
  - a heading AND
  - a text paragraph
→ parent section: 3-column layout
→ each child: type: "icon-list"
→ Note: if only icon+text (no heading), still use "icon-list"
```

### Testimonials
```
element with class: .testimonial, .review, blockquote.testimonial
  OR element containing: quotation text + author name + optional role/company
→ type: "testimonial"
→ content.items: [{quote: "...", author: "...", role: "...", company: "...", asset_ref: "img-XXX"}]
```

### Counters
```
element with class: .counter, .stat, .number-box
  OR element containing: large number (possibly with JS animation) + short label
→ type: "counter"
→ content.items: [{number: "...", label: "..."}]
```

### Pricing tables
```
element with class: .pricing-card, .price-box, .plan, .pricing-plan
  OR element containing: plan name + price + feature list + CTA button
→ type: "pricing-table"
→ content.items: [{name: "...", price: "...", period: "...", features: [...], cta_text: "...", cta_url: "..."}]
```

### Accordion / FAQ
```
element with class: .accordion, .faq, .faq-item
  OR elements using: details/summary HTML
  OR elements with click handlers for expand/collapse (inferred from class patterns)
→ type: "accordion"
→ content.items: [{question: "...", answer: "..."}]
```

### Tabs
```
element with class: .tabs, .tab-panel
  OR [role=tablist] present
→ type: "tabs"
→ content.items: [{label: "...", content: "..."}]
```

### Videos
```
element: video, iframe[src*=youtube], iframe[src*=vimeo], iframe[src*=youtu.be]
→ type: "video"
→ content.text: video URL or src
```

### Maps
```
element: iframe[src*=maps.google], iframe[src*=openstreetmap], .map-embed
→ type: "map"
→ content.text: iframe src URL
```

### Dividers
```
element: hr
  OR empty div with height ≤ 3px and background-color set
→ type: "divider"
```

### Spacers
```
empty div with explicit height > 0 and no content
  OR div with class: .spacer, .gap
→ type: "spacer"
→ style.custom_notes: height value
```

### Social icons
```
element with class: .social-icons, .social-links, .social-media
  OR row of anchors containing icon elements pointing to social domains
→ type: "social-icons"
→ content.items: [{network: "facebook|instagram|twitter|linkedin|...", url: "..."}]
```

### Navigation / Menu
```
element: nav, [role=navigation]
  OR element with class: .nav, .menu, .navigation
→ type: "menu"
→ content.items: [{label: "...", url: "..."}] for first-level items
→ Note: only include in sections if it's a footer nav or an inline nav widget
→ Do NOT create a section for the main site header nav — treat it as site-level context
```

### HTML fallback
```
Anything not matched by the rules above
→ type: "html"
→ content.html: raw outerHTML of the element (truncated to 500 chars in plan, full in notes)
→ Flag as important question
```

## Background Detection

For each section, check for backgrounds in this priority order:

1. `background-image: url(...)` on section element → type: "image", add to assets
2. `background: linear-gradient(...)` → type: "gradient", extract value
3. `background-color: ...` → type: "color", extract value
4. `<video>` or `<iframe>` as first child (not content) → type: "video"
5. No background set → type: "none" (inherits page background)

For image backgrounds: add asset entry with status "available" if URL is absolute, "placeholder" if relative.

## Style Token Extraction from CSS

Priority order (highest confidence first):

1. **CSS custom properties:** `--color-primary`, `--primary`, `--brand-color`, `--main-color` → colors.primary
2. **Repeated hex values:** hex appearing 5+ times across rules → likely a brand color
3. **Font-family on body or :root** → body_font
4. **Font-family on h1, h2, .heading** → heading_font
5. **Max-width on .container, .wrapper, main** → spacing.container_max_width
6. **Padding on section, .section** → spacing.section_padding_y (extract top/bottom value)
7. **Gap or margin on .row, .grid** → spacing.column_gap or spacing.row_gap

## Inline Style Handling

Inline styles are treated as `approx` confidence.
If an inline style conflicts with an extracted CSS rule, prefer the inline style (it has higher specificity).
