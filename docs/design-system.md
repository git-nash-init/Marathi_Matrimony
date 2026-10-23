# Visual Design System: Maratha Laginsarai (मराठा लगीनसराई)

## 1. Cultural Identity & Philosophy
The visual design embodies the dignity, heritage, and auspicious sanctity of Maharashtrian Maratha wedding traditions (*शुभ विवाह*). It pairs royal Maratha oxblood, vermilion, antique gold, and warm parchment surfaces with clean editorial typography, tactile borders, and generous whitespace.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex Code | Purpose | Contrast vs Background |
| :--- | :--- | :--- | :--- |
| `--color-oxblood` | `#7B191E` | Primary brand accent, main headlines, primary CTAs | 7.8:1 (AAA) |
| `--color-oxblood-dark`| `#5A1216` | Active buttons, deep contrast borders | 11.2:1 (AAA) |
| `--color-vermilion` | `#C63828` | Auspicious accents, highlighted actions, badges | 4.9:1 (AA) |
| `--color-antique-gold` | `#B6873D` | Regal borders, subtle crests, premium tier highlights | 3.2:1 (Graphical) |
| `--color-gold-light` | `#F4EBD9` | Subtle gold tint for badges and table headers | Neutral surface |
| `--color-parchment` | `#F5EBDD` | Main page background canvas, editorial backdrops | Canvas root |
| `--color-ivory` | `#FBF5EB` | Cards, input fields, elevated content panels | 1.1:1 vs canvas |
| `--color-surface-pure`| `#FFFFFF` | Isolated high-contrast form backgrounds | Controlled use |
| `--color-ink` | `#30241F` | Primary body typography, high-contrast text | 11.6:1 (AAA) |
| `--color-ink-muted` | `#63534B` | Secondary captions, helper text, labels | 5.2:1 (AA) |
| `--color-border-subtle`| `#E5D8C5` | Structural borders, dividers, subtle card outlines | Architectural |
| `--color-border-focus` | `#7B191E` | Accessible 2px keyboard focus ring | Clear indicator |
| `--color-forest-olive` | `#596A42` | Success states, verification checkmarks | 5.1:1 (AA) |

---

## 3. Typography Architecture
To avoid generic SaaS typography (strictly no Inter, Geist, or Space Grotesk):

### Display & Headlines
- **English Display:** `Bodoni Moda`, `Cormorant Garamond`, serif fallback
- **Marathi Display:** `Noto Serif Devanagari`, `Mukta`, serif fallback
- **Characteristics:** High contrast letterforms, traditional elegance, stately authority.

### Body, Navigation & Data
- **Body & Forms:** `Noto Sans Devanagari`, `Source Sans 3`, system-ui fallback
- **Line Heights:** `1.6` for long-form reading, `1.25` for titles, `1.4` for card metadata.
- **Numbers & Digits:** Dynamic dual-support for Marathi Devanagari digits (`०, १, २, ३...`) and International numerals (`0, 1, 2, 3...`).

---

## 4. Spacing, Geometry & Shadows
- **Base Grid:** 8px modular spacing (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Radii:** Controlled, non-bubbly corners:
  - Small elements (Badges, tags): `4px`
  - Cards & Panels: `8px`
  - Modal dialogues: `10px`
  - Pills / Filters: `24px`
- **Depth & Elevation:** Depth is achieved via **1px subtle borders** (`#E5D8C5`) and tinted ivory surfaces rather than heavy blurred drop shadows. Subtle ambient shadow (`0 2px 8px rgba(48, 36, 31, 0.05)`) only when elevated on scroll.

---

## 5. Reusable Component Specifications

### A. Buttons (`<Button />`)
- **Primary:** Background `#7B191E`, text `#FFFFFF`, border `1px solid #5A1216`. Hover: `#5A1216`.
- **Secondary / Gold:** Background `#B6873D`, text `#FFFFFF`, border `1px solid #946B2C`.
- **Outline Parchment:** Background transparent, border `1px solid #7B191E`, text `#7B191E`.
- **WhatsApp Direct:** Background `#25D366`, text `#FFFFFF`, direct chat launcher.
- **States:** Focus-visible ring `2px solid #B6873D`, offset `2px`. Disabled opacity `0.5`, `cursor: not-allowed`.

### B. Profile Discovery Card (`<ProfileCard />`)
- Visual hierarchy: Verified Badge -> Photo with aspect-ratio 4:5 -> Full Name (Marathi/English) -> Age, Height, Sub-caste, Location -> Education & Occupation -> Two explicit CTAs (View Profile, Express Interest).
- No unapproved member photos; clean silhouette fallback with auspicious motif if photo pending approval.

### C. Search & Filter Bar
- Sticky or prominent console on homepage and `/search`.
- Segmented switches for Gender (Bride / Groom).
- Dropdowns with native keyboard support for Caste (96 Kuli Maratha, Kokanastha, Deshashtha), Age range, City/District, and Education.

### D. Skeleton Loaders (`<ProfileCardSkeleton />`, `<DetailSkeleton />`)
- Shimmer pulse utilizing `#EADECF` to `#F5EBDD` gradient.
- Exact geometric match to content cards to eliminate layout shifts (CLS < 0.05).
