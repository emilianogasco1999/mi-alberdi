---
name: Mi Alberdi
source: Penpot file "MiAlberdi" (pages: Vistas, Componentes)
colors:
  primary: '#114B33'
  primary-dark: '#0B3322'
  primary-light: '#1B6B4A'
  cream: '#F2E5C9'
  cream-light: '#FAF6EE'
  canvas: '#FFFFFF'
  ink: '#0F172A'
  ink-soft: '#1E293B'
  muted: '#64748B'
  outline: '#CBD5E1'
  hairline: '#E2E8F0'
  surface-soft: '#F1F5F9'
  surface-faint: '#F8FAFC'
  on-primary: '#FFFFFF'
  on-dark-cream: '#F2E5C9'
  success: '#059669'
  highlight: '#FBBF24'
  rubro-gastronomia: '#D94E3B'
  rubro-servicios: '#2563EB'
  rubro-salud: '#0D9488'
  rubro-comercios: '#C27803'
  rubro-profesionales: '#6D28D9'
typography:
  display-hero: { family: Oswald, size: 60px, weight: 700, lineHeight: 1.2 }
  title-section: { family: Oswald, size: 30px, weight: 700, lineHeight: 1.2 }
  title-lg: { family: Oswald, size: 20px, weight: 600, lineHeight: 1.2 }
  title-card: { family: Oswald, size: 18px, weight: 600, lineHeight: 1.2 }
  title-sm: { family: Oswald, size: 16px, weight: 500, lineHeight: 1.2 }
  body-lg: { family: Poppins, size: 18px, weight: 400, lineHeight: 1.2 }
  body: { family: Poppins, size: 16px, weight: 400, lineHeight: 1.2 }
  body-medium: { family: Poppins, size: 14px, weight: 500, lineHeight: 1.2 }
  small: { family: Poppins, size: 12px, weight: 500, lineHeight: 1.2 }
  caption: { family: Poppins, size: 11px, weight: 600, lineHeight: 1.2 }
rounded:
  chip: 6px
  banner: 14px
  input: 12px
  card: 12px
  panel: 18px
  pill: 9999px
---

## Overview

Mi Alberdi is the digital commercial guide of **Juan Bautista Alberdi (Tucumán)**: neighbours find local shops, trades and services, see opening hours and contact them **directly by WhatsApp**. The interface is warm, local and trustworthy — a deep forest green (`{colors.primary}` — #114B33) on white and a soft cream (`{colors.cream-light}` — #FAF6EE), with slate neutrals for text and borders.

Type voice splits into two roles: **Oswald** (condensed display face — headings, business names, prices) and **Poppins** (everything else — body, buttons, labels, metadata). Oswald gives the guide its "town signage" character; Poppins keeps dense listings readable.

The system is **flat and outline-driven**. Components rely on 1px slate borders and colour blocks rather than shadows — none of the 71 library components carries a shadow. Rounding is the main shape signal: **pill** buttons for primary actions, **12px** cards and inputs, **6px** badges.

**Key Characteristics:**
- Primary CTAs are green pills (`{colors.primary}`, radius `{rounded.pill}`) with white Poppins 14/500 labels.
- Cream (`{colors.cream}` — #F2E5C9) is the secondary brand colour: it is the CTA on green backgrounds and the "Más elegido" badge fill.
- Five **rubro (category) accent colours** appear only on category badges and their icons — never on primary CTAs.
- WhatsApp is a first-class action: it has its own green button (`{colors.success}`) and a dedicated outlined variant.
- Icons come from **Phosphor** (every `IconTile` wraps a `ph-*` glyph on a transparent base rectangle).
- The footer is the only dark surface on light pages (`{colors.primary-dark}` — #0B3322).
- Real content is Argentine Spanish with voseo ("Tenés un negocio…", "Sumate…"); UI copy in the product stays in Spanish.

## Colors

### Brand
- **Primary** (`{colors.primary}` — #114B33): primary CTAs, logo badge, brand panels (login), CTA banner background, text accents ("Cupón Activo", "Sobre: …").
- **Primary Dark** (`{colors.primary-dark}` — #0B3322): footer background.
- **Primary Light** (`{colors.primary-light}` — #1B6B4A): defined in tokens as `brand-light`; not used by any library component yet.
- **Cream** (`{colors.cream}` — #F2E5C9): CTA fill on green surfaces, "Más elegido" badge, logo "MA" lettering, footer text.
- **Cream Light** (`{colors.cream-light}` — #FAF6EE): hero band, coupon card, promo / farmacia-de-turno banners.

### Neutrals (slate)
- **Canvas** (`{colors.canvas}` — #FFFFFF): page floor, cards, inputs, navbar.
- **Ink** (`{colors.ink}` — #0F172A): headlines, business names, icons, dark emergency button.
- **Ink Soft** (`{colors.ink-soft}` — #1E293B): secondary-button and review-quote text.
- **Muted** (`{colors.muted}` — #64748B): addresses, field labels, placeholders, inactive tabs, nav links.
- **Outline** (`{colors.outline}` — #CBD5E1): borders of secondary / social / icon buttons.
- **Hairline** (`{colors.hairline}` — #E2E8F0): card borders, input borders, image placeholders.
- **Surface Soft** (`{colors.surface-soft}` — #F1F5F9): tab-switch track, icon boxes, inner dividers.
- **Surface Faint** (`{colors.surface-faint}` — #F8FAFC): "Emergencias" band and ROI banner background.

### Semantic
- **Success / Open** (`{colors.success}` — #059669): "Abierto" status and the WhatsApp action.
- **Highlight** (`{colors.highlight}` — #FBBF24): defined as `amber-400`; reserved for rating stars (see Known Gaps).

### Rubro accents
| Token | Hex | Used by badge |
|---|---|---|
| `{colors.rubro-gastronomia}` | #D94E3B | Gastronomía |
| `{colors.rubro-servicios}` | #2563EB | Servicios |
| `{colors.rubro-salud}` | #0D9488 | Veterinaria / Salud |
| `{colors.rubro-comercios}` | #C27803 | Comercios, Indumentaria, Barbería |
| `{colors.rubro-profesionales}` | #6D28D9 | Profesionales |

`#2563EB` is also used for the Facebook glyph on the social button.

## Typography

### Font Family
**Oswald** for display and names, **Poppins** for body and UI. Both are Google Fonts.

### Hierarchy

| Token | Font | Size | Weight | Line Height | Use |
|---|---|---|---|---|---|
| `{typography.display-hero}` | Oswald | 60px | 700 | 1.2 | Home hero headline |
| `{typography.title-section}` | Oswald | 30px | 700 | 1.2 | Section titles, prices ("$0"), CTA banner headline |
| `{typography.title-lg}` | Oswald | 20px | 600 | 1.2 | Plan names, coupon title, banner titles, logo wordmark |
| `{typography.title-card}` | Oswald | 18px | 600 | 1.2 | Emergency card titles, "MA" logo mark |
| `{typography.title-sm}` | Oswald | 16px | 500 | 1.2 | Business name in cards, footer column headings |
| `{typography.body-lg}` | Poppins | 18px | 400 | 1.2 | Lead paragraphs |
| `{typography.body}` | Poppins | 16px | 400 | 1.2 | Input values, placeholders, banner body |
| `{typography.body-medium}` | Poppins | 14px | 500 | 1.2 | **Button labels**, nav links, review quotes |
| `{typography.small}` | Poppins | 12px | 500 | 1.2 | Field labels, addresses, descriptions, footer text |
| `{typography.caption}` | Poppins | 11px | 600 | 1.2 | Badges, eyebrows, metadata ("Hace 15 min") |

Letter-spacing is `0` throughout and line-height is `1.2` for every token in the Penpot library.

### Principles
Headings and business names are Oswald; everything functional is Poppins. Never set body copy in Oswald and never set a display headline in Poppins. Button labels are always `{typography.body-medium}`.

## Layout

### Spacing
Spacing is not tokenised for this system; the values below are the paddings and gaps **observed in the components**. Use them as the scale:

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 48 · 56 · 80`

- **Card padding:** 16px (business cards), 20px (coupon, review, emergency), 28px (pricing plan), 32px (banners).
- **Button padding:** 12px × 24px (pill buttons), 12px × 20px (outlined 6px-radius and social buttons).
- **Input padding:** 11px × 14px, label-to-field gap 6px.
- **Page gutter:** 80px on the 1440 desktop layout, 16px on the 390 mobile navbar.
- **Footer:** padding 56 / 80 / 32 / 80.

### Grid & Container
- Desktop artboards are **1440px** wide; content sits inside 80px gutters (1280px usable). Banners are 960px wide.
- Mobile artboard is **390px**.
- All layouts are Penpot **flex layouts** (row / column with gap and padding) — translate them directly to CSS flex.

### Views (pages in the Penpot file)
| Board | Size | Structure |
|---|---|---|
| 01 - Home | 1440×3665 | Navbar → Hero (#FAF6EE) → Carrusel de Destacados → Grilla Explorar Negocios → Emergencias (#F8FAFC) → Farmacia de Turno → Contáctanos → Testimonios → CTA Final → Footer |
| 02 - Login y Registro | 1440×791 | Two 720px panels: brand panel (#114B33) + form panel (white) |
| 03 - Local Individual (Plan Emprendedor) | 1440×1796 | Banner → ActionsRow → MainGrid |
| 04 - Local Individual (Plan Gratis) | 1440×1235 | Banner → ActionsRow → MainGrid |
| 05 - Precios y Planes | 1440×1326 | Navbar → Content → Footer |

### Whitespace Philosophy
Bands alternate white → soft slate → white → cream, with the dark-green footer closing the page. Cards stay compact (16–20px padding) so listings feel dense and scannable; banners and plan cards use 28–48px to feel like featured moments.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No border, no shadow | Navbar, bands, footer |
| Outlined | 1px `{colors.hairline}` border | Cards, inputs, banners |
| Outlined strong | 1px `{colors.outline}` border | Secondary / social / icon buttons |
| Accent outline | 1px accent border | Rubro badges, WhatsApp-Tel button (`{colors.success}`), coupon card (`{colors.primary}`) |
| Colour block | Solid fill | Primary CTA, CTA banner, footer |

**No component uses a drop shadow.** The Penpot file also contains a legacy `Shadow` token set (`shadow.xs/md/panel/nav`) but none of the components reference it.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.chip}` | 6px | Badges, 42px social buttons, emergency button, icon boxes, tabs |
| `{rounded.banner}` | 14px | Promo banner, icon wrap in farmacia banner |
| `{rounded.input}` / `{rounded.card}` | 12px | Inputs, business cards, coupon, review, emergency cards, tab-switch track |
| `{rounded.panel}` | 18px | Plan cards, banners (CTA final, ROI, Farmacia de turno) |
| `{rounded.pill}` | 9999px | Primary / secondary / WhatsApp / icon buttons, search capsule |

Logo badge uses 8px radius. Image placeholders in business cards are flat `{colors.hairline}` rectangles.

## Components

Component names are the **exact Penpot library names** (Atomic Design: Atom / Molecule / Organism). Keep them when mapping to code.

### Buttons (Atom)

| Penpot name | Size | Fill | Border | Radius | Label |
|---|---|---|---|---|---|
| `Button/Primario` | 97×41 | `{colors.primary}` | — | pill | white, body-medium |
| `Button/Secundario` | 116×41 | transparent | 1px `{colors.outline}` | pill | `{colors.ink-soft}` |
| `Button/CremaMarca` | 168×41 | `{colors.cream}` | — | pill | `{colors.primary}` — for green backgrounds |
| `Button/WhatsApp` | 138×41 | `{colors.success}` | — | pill | white + 16px WhatsApp icon, gap 8 |
| `Button/SocialTel` | 175×42 | white | 1px `{colors.success}` | 6px | `{colors.success}` + icon, "WhatsApp / Tel" |
| `Button/SocialGoogle` / `SocialApple` / `SocialFacebook` | ~108–135×42 | white | 1px `{colors.outline}` | 6px | `{colors.ink-soft}` + 18px brand icon |
| `Button/OscuroEmergencia` | 116×41 | `{colors.ink}` | — | 6px | white, phone icon, "911 / 101" |
| `Button/IconoCarrusel` | 38×38 | white | 1px `{colors.outline}` | pill | caret icon 18px |
| `Button/IconoFavorito` | 38×38 | white | 1px `{colors.outline}` | pill | heart icon 18px |

Pill buttons: padding 12×24. Rectangular 6px buttons: padding 12×20. Label is always Poppins 14/500.

### Navigation (Organism)

**`Navbar/Desktop1440`** — 1440×64, white, padding 0 / 80. Left: logo lockup (36px green badge with cream "MA" in Oswald, wordmark "Mi Alberdi" Oswald 20/600 `{colors.primary}`, tagline "Guía Comercial" Poppins 12/500 `{colors.muted}`). Centre: links *Rubros, Farmacias, Emergencias, Planes* in `{colors.muted}`, gap 28. Right: `Ingresar` (secondary pill) + `Sumar mi negocio` (primary pill), gap 10.

**`Navbar/Mobile390`** — 390×64, padding 0 / 16, 32px logo badge and Oswald 16/500 wordmark, with only the `Sumar mi negocio` primary pill on the right.

**`Footer`** — 1440×261, `{colors.primary-dark}`, padding 56/80/32/80. Top row: brand column (mini logo + description in cream at 70% opacity) and three link columns (*Explorar, Para negocios, Comunidad*) with white Oswald 16/500 headings and 8px-gap link lists. A 1px white divider at 10% opacity separates the bottom row (© and "Hecho para Juan Bautista Alberdi, Tucumán" in cream at 50%).

### Inputs (Molecule)

All inputs share the same anatomy: column, gap 6, **label** Poppins 12/500 `{colors.muted}`, then a **Campo** (radius 12, white, 1px `{colors.hairline}`, padding 11×14) holding Poppins 16/400 `{colors.muted}` placeholder text.

- **`Input/TextoEstandar`** — 260×65, single line.
- **`Input/Textarea`** — 260×97, multi-line, same Campo.
- **`Input/SelectDesplegable`** — Campo uses `space-between` with a caret icon on the right.
- **`Input/SwitchPestanas`** — 260×40 track (`{colors.surface-soft}`, radius 12, padding 4) with two tabs. Active tab: white, radius 6, `{colors.ink}` text. Inactive: no fill, `{colors.muted}` text. Used for "Iniciar sesión / Crear cuenta".
- **`Input/BuscadorCapsula`** — 900×57 pill search bar (white, 1px `{colors.hairline}`, padding 8) with four fields separated by 1×28 dividers — *negocio, rubro, ubicación/zona, fecha/hora* — each with an 18px icon, plus a primary "Buscar" pill at the end.

### Badges (Molecule)

All badges: radius 6, padding 6×10, Poppins 11/600.

| Name | Style |
|---|---|
| `Badge/Rubro-*` (Gastronomia, Servicios, VeterinariaSalud, Comercios, Indumentaria, Barberia, Profesionales) | White fill, 1px accent border, accent text and 16px icon (see rubro table) |
| `Badge/Destacado` | White fill, `{colors.ink}` text — sits over card media |
| `Badge/Cupon15` | `{colors.primary}` fill, white text — "15% OFF Cupón" |
| `Badge/MasElegido` | `{colors.cream}` fill, `{colors.primary}` text |
| `Badge/Abierto` | No fill, `{colors.success}` text |
| `Badge/AbreHora` | No fill, `{colors.muted}` text ("Abre 19:30") |
| `Badge/Verificado` | 18px `SealCheck` icon in `{colors.primary}` |

### Cards (Molecule)

- **`Card/NegocioEstandar`** — 260×257, radius 12, white, 1px hairline. 260×144 media placeholder, then content (padding 16, gap 10): name Oswald 16/500, address Poppins 12/500 muted, 1px `{colors.surface-soft}` divider, meta row (rubro badge left, "Abierto" right).
- **`Card/NegocioDestacado`** — 300×297, same anatomy with a 176px media area carrying `Destacado` and `Cupon15` badges, a name row with verified seal, and a rating at right.
- **`Card/CuponDescuento`** — 280×196, `{colors.cream-light}` fill, 1px `{colors.primary}` border, padding 20. Eyebrow "Cupón Activo" + expiry, Oswald 20/600 offer title, description, full-width primary "Canjear cupón".
- **`Card/PlanPrecios`** — 300×450, radius 18, 1px hairline, padding 28. Optional `MasElegido` badge, plan name Oswald 20/600, price Oswald 30/700 + "/ mes", feature list (check icon + Poppins 12/500, gap 12), secondary pill CTA.
- **`Card/ResenaVecino`** — 280×181, radius 12, padding 20. Stars + relative time, quote Poppins 14/500 `{colors.ink-soft}`, divider, author (`{colors.ink}`) and business reference ("Sobre: …" in `{colors.primary}`).
- **`Card/Emergencia`** — 380×84, radius 12, padding 20. 44px icon box (`{colors.surface-soft}`, radius 6), service name Oswald 18/600, subtitle muted, dark "911 / 101" button on the right.

### Banners (Organism)

All banners are 960px wide.

- **`Banner/CTAFinal`** — 960×352, `{colors.primary}`, radius 18, padding 48. Cream eyebrow, white Oswald 30/700 headline, cream body, `Button/CremaMarca`, large decorative SVG on the left.
- **`Banner/FarmaciaTurno`** — 960×127, `{colors.cream-light}`, 1px hairline, radius 18, padding 32. 48px green icon wrap (radius 14), eyebrow in `{colors.primary}`, pharmacy name Oswald 20/600, address, plus "Cómo llegar" (secondary) and "Llamar / WhatsApp" (primary).
- **`Banner/PromoLanzamiento`** — 960×57, `{colors.cream-light}`, radius 14, padding 20. One line of copy and a `{colors.primary}` text link.
- **`Banner/ROI`** — 960×158, `{colors.surface-faint}`, radius 18, padding 32. Oswald 20/600 question + Poppins 16/400 explanation.

### Icons

`IconTile/*` are **Phosphor** glyphs in 48×48 tiles (resized to 14–32px in use). Available: ArrowLeft, ArrowRight, AppleLogo, Basket, Briefcase, CaretLeft, CaretRight, Check, Clock, FacebookLogo, FireExtinguisher, FirstAidKit, ForkKnife, GoogleLogo, Heart, Hospital, InstagramLogo, MagnifyingGlass, MapPin, PawPrint, Phone, QrCode, Scissors, SealCheck, ShieldCheck, Star, TShirt, WhatsappLogo, Wrench. Icon colour follows its context (`{colors.ink}` by default, accent colour inside rubro badges).

## Do's and Don'ts

### Do
- Use `{colors.primary}` pills for the single main action in a view.
- Use `Button/CremaMarca` (cream) when the CTA sits on a green surface.
- Keep headings, business names and prices in Oswald; everything else in Poppins.
- Express emphasis with outline and colour blocks, not shadows.
- Colour category badges strictly from the rubro table.
- Use `{colors.success}` for open status and WhatsApp only.
- Keep the 12px radius for cards/inputs, 6px for badges, pill for buttons.
- End light pages with the dark-green footer.

### Don't
- Don't use rubro accent colours on primary CTAs or large surfaces.
- Don't add drop shadows to cards or buttons.
- Don't mix Oswald into body copy or Poppins into display headlines.
- Don't use 6px radius on primary CTAs or pill radius on cards.
- Don't introduce a second dark surface besides the footer and the dark emergency button.
- Don't invent new greys; use the slate set above.

## Responsive Behavior

Only two breakpoints exist in the Penpot file: **Desktop 1440** and **Mobile 390**.

| Breakpoint | Evidence in design |
|---|---|
| Desktop (1440) | Navbar with full link row and two buttons; 80px gutters; 960px banners |
| Mobile (390) | Navbar collapses to logo + `Sumar mi negocio` only (links hidden); 16px gutters, 32px logo badge, 16px Oswald wordmark |

Everything else (tablet, card grid column counts, stacking of the login panels, footer collapse) is **not specified** in the design file.

### Touch Targets
Buttons are 41–42px tall; carousel and favourite icon buttons are 38×38 (below the 44px WCAG guideline — consider enlarging the hit area in code).

## Iteration Guide

1. Reference components by their Penpot name (`Card/NegocioEstandar`, `Button/Primario`) so design and code stay aligned.
2. Variants (`Button/*`, `Badge/*`) are separate library components, not props — map them to variant props in code.
3. Use the token names from the front matter instead of inline hex values.
4. Never document or add hover/focus styles that are not in Penpot; add them to the design file first.
5. When in doubt about emphasis: move to the primary green pill before adding colour or weight.

## Known Gaps

- **Two token systems coexist in Penpot.** The library has an editorial set (`Color` ink/cream scales, `Typography` with Newsreader + Inter, `Spacing`, `Radius`, `Shadow`) and the **Mi Alberdi** set used by all 71 components. This document follows the Mi Alberdi set only; the editorial set is unused by components and should be removed or reconciled in Penpot.
- Library **colors and typographies (styles) are empty**; everything lives as design tokens, and no token themes are defined.
- `brand-light` (#1B6B4A), `slate-50/100` aliases and the spacing/radius token sets are defined but largely unused by components.
- The **rating star** colour could not be read from the components; `amber-400` (#FBBF24) is the only unused-by-name candidate and is documented as a likely match, not a verified one.
- Hover, focus, disabled and error states for buttons and inputs are **not designed**.
- Tablet breakpoint, grid column counts and mobile layouts for views 01–05 are not specified; only the mobile navbar exists.
- Carousel behaviour, the contact form submission flow and map/location UI are not in the file.
- Font files are Google Fonts (Oswald, Poppins) and must be loaded by the web app (not verified in `apps/web`).
