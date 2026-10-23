# Asset Licenses & Data Privacy Ledger

## 1. Asset Registry & Licensing Status

| Asset Path | Description | Origin / Source | License Type | Commercial Use Permitted? |
| :--- | :--- | :--- | :--- | :--- |
| `public/images/brand/logo.png` | Official Maratha Laginsarai Brand Crest | Client Brand Identity | Client Owned & Authorized | Yes |
| `public/favicon.svg` | Auspicious Wedding Crest Vector | Custom Crafted SVG | MIT / Proprietary Client | Yes |
| `public/images/stories/story-1.jpg` | Success Story: Vaibhav & Mrunali | Publicly Published Client Story | Client Consented Archive | Yes |
| `public/images/stories/story-2.jpg` | Success Story: Sagar & Ashwini | Publicly Published Client Story | Client Consented Archive | Yes |
| `public/images/stories/story-3.jpg` | Success Story: Parag & Priyanka | Publicly Published Client Story | Client Consented Archive | Yes |
| `public/images/profiles/*.jpg` | Anonymized Development Profile Fixtures | CC0 / Generated Mock Fixtures | CC0 / Permissive Dev Only | Development Only |
| Google Fonts (Bodoni Moda) | English Display Typography | Google Fonts / Owen Earl | SIL Open Font License 1.1 | Yes |
| Google Fonts (Noto Serif Devanagari) | Marathi Display Typography | Google Fonts / Monotype | SIL Open Font License 1.1 | Yes |
| Google Fonts (Noto Sans Devanagari) | Marathi Body & UI Typography | Google Fonts / Monotype | SIL Open Font License 1.1 | Yes |
| Google Fonts (Source Sans 3) | English Body & Data Typography | Google Fonts / Adobe | SIL Open Font License 1.1 | Yes |

---

## 2. Personal Data & Member Privacy Rules
- **No Scraping or Bulk Importing of Live Member PII:** Crawled profile listings from external pages are strictly referenced for field taxonomy and location structure only. No real phone numbers, family relative names, or personal identities have been imported into the active database without explicit member consent.
- **Development Data Isolation:** All profile records utilized in testing and initial development have been anonymized with randomized names, dummy contact markers, and sanitized IDs.
- **Production Data Integrity:** Live customer registrations flow directly to Supabase Auth and the `public.profiles` table with row-level encryption and strict role isolation.
