# MASTERPLAN: MARATHA LAGINSARAI PREMIUM MATRIMONIAL PLATFORM
**Document Version:** 1.0.0  
**Target Release:** Production 1.0  
**Repository:** [https://github.com/git-nash-init/Marathi_Matrimony](https://github.com/git-nash-init/Marathi_Matrimony)  
**Primary Brand:** Maratha Laginsarai (मराठा लगीनसराई) — Premier 96 Kuli Maratha Matrimonial & Marriage Bureau  

---

## 1. Executive Summary & Product Mission
Maratha Laginsarai is the premier digital matrimonial platform dedicated to the 96 Kuli Maratha community (including Kokanastha Maratha and Deshashtha Maratha) across Maharashtra (Mumbai, Pune, Thane, Navi Mumbai, Kolhapur, Satara, Sangli, Ratnagiri, Sindhudurg, Nashik, Solapur, Nagar, Dhule) and international NRI centers.

The objective is to deliver an exceptional, culturally rooted, secure, performant, and accessible platform that honors the traditional sanctity of Maratha matchmaking while providing contemporary digital UX, verified profiles, strict privacy controls, and end-to-end Supabase PostgreSQL integration.

---

## 2. Anti-Vibecoding Guardrails Compliance Ledger
The design strictly adheres to the 30 anti-vibecoding rules:
1. **No harsh gradients:** Subdued, organic paper and antique gold accents only.
2. **No generic Lucide icon spam:** Bespoke SVG cultural icons and tailored semantic SVGs.
3. **No pure-white page blankets:** Canvas utilizes Warm Parchment (`#F5EBDD`) and Soft Ivory (`#FBF5EB`).
4. **No rainbow styling:** Cohesive heritage palette centered around Primary Oxblood (`#7B191E`), Antique Gold (`#B6873D`), Vermilion (`#C63828`), and Deep Ink (`#30241F`).
5. **No heavy box-shadow dependency:** Clean structural borders (`1px solid #E8DFC8`), intentional whitespace, and typographic contrast.
6. **No repeated 3-card grid formula:** Asymmetrical editorial layouts, horizontal list discovery, split narrative sections.
7. **No emojis as UI icons:** Purpose-built, accessible inline SVG iconography.
8. **No liquid-glass/glassmorphism gimmicks:** Solid, accessible tactile surfaces with high contrast.
9. **No em dashes in interface copy:** Clean punctuation and natural Marathi/English phrasing.
10. **No Inter / Geist / Space Grotesk default fonts:** Bodoni Moda / Cormorant serif for display, Noto Serif Devanagari, and Noto Sans Devanagari / Source Sans 3 for body/forms.
11. **No decorative vertical card stripes:** Subtle gold crests and understated border dividers.
12. **No fabricated success stories:** Strictly authentic, consented couples from Maratha Laginsarai's official archive.
13. **No generic bento grids:** Purposeful matchmaking discovery architecture.
14. **No decorative terminal windows:** Real matrimonial user journeys only.
15. **No purple-and-black styling:** Authentic Maharashtrian cultural heritage hues.
16. **No checkmark marketing bullet clutter:** Clear typography and structured feature comparison matrices.
17. **No generic 3-tier SaaS pricing:** Culturally adapted membership tiers (Free, Silver, Gold, Premium VIP) with direct contact unlock counters.
18. **No fake product mockups:** Real interactive forms, search filters, and profile viewports.
19. **No pill-shaped over-rounded cards:** Refined, architectural radii (4px - 10px).
20. **No missing skeleton loading states:** Tailored skeleton loaders for discovery search, profile cards, and dashboard.
21. **No decorative radial orbs:** Editorial texture and authentic floral motif borders.
22. **No repetitive dot-grid backgrounds:** Traditional paisley/crest motifs.
23. **No sparkle AI decoration:** Meaningful trust badges (Government ID Verified, Horoscope Verified).
24. **No animated arrow movement loops:** Subtle, purposeful micro-interactions respecting `prefers-reduced-motion`.
25. **Complete Terms of Service:** Present, localized, and contextually accurate.
26. **Complete Privacy Policy:** Present, adhering to DPDP Act (India) principles and privacy-by-default.
27. **No indiscriminate hover animations:** Predictable, accessible interactive feedback.
28. **No neon accents:** Muted, regal gold, oxblood, and forest olive tones.
29. **No basic pastel washes:** Rich cultural depth with contrast ratios exceeding WCAG AAA (7:1).
30. **No client-side-only security borders:** Full Supabase Row Level Security (RLS) enforcement.

---

## 3. Implementation Phases & Milestones

### Phase 1: Audit, Baseline & Foundation Documentation (COMPLETED)
- Repository structure, dependencies, and build pipeline audited.
- Supabase live database connection verified (`https://hgucqabzlaxelkfiavvm.supabase.co`).
- Crawled data parsed for real location mappings, couples, and contact information.
- Complete documentation suite initialized in `docs/`.

### Phase 2: Design System, Heritage Tokens & Cultural Typography (IN PROGRESS)
- Implement CSS custom properties for palette (`#7B191E`, `#C63828`, `#B6873D`, `#F5EBDD`, `#FBF5EB`, `#30241F`).
- Configure Google Fonts typography imports: Bodoni Moda, Noto Serif Devanagari, Noto Sans Devanagari, Source Sans 3.
- Build reusable bespoke SVG cultural icon suite (Replacing Lucide default icons).
- Implement accessible skeleton loaders and form control components.

### Phase 3: Seven Design Inspirations Architecture
1. **Scrolltide:** Narrative hero-to-discovery transition, Maharashtrian matchmaking introduction.
2. **Navbar Gallery:** Heritage sticky header, clear dual-language switch, profile search access, member auth triggers.
3. **Footer Design:** Comprehensive sitemap with location clusters, community directories, support, and legal notices.
4. **CTA Gallery:** Dedicated visual hierarchy for Register Free, Express Interest, Shortlist, and WhatsApp assistance.
5. **Refero Styles:** Information-dense, calm, and readable profile specification sheets.
6. **Supahero:** Impactful photography-driven hero banner with immediate search console.
7. **3Dicons:** Restrained, elegant 3D/embossed visual accents for matrimonial milestones.

### Phase 4: Public Marketing, Discovery & Location SEO Engine
- Homepage editorial overhaul with verified marketing figures (3,000+ marriages, 10+ years).
- Dynamic Location Landing Page engine supporting all 36+ sitemap locations (Borivali, Dadar, Lower Parel, Mulund, Pune, Dhankawadi, Pimpri-Chinchwad, etc.).
- Authentic Success Stories gallery with pagination and date sorting.
- Contact and Wedding Services showcase (Photography, Catering, Halls, Makeup Artists).

### Phase 5: Search, Profiles & Privacy-First Discovery
- Database-backed search with query debounce, URL synchronization, and server pagination.
- Privacy-by-default profile view (contact info protected behind RLS and mutual interest/unlocks).
- Full shortlisting and express interest workflows.
- Member reporting and blocking features.

### Phase 6: Member & Admin Experiences
- Member Dashboard: Profile completion tracker, photo gallery manager, preferences editor.
- Admin Portal: Profile review/verification queue, photo moderation, inquiry management, and audit log.

### Phase 7: Security Hardening (20-Point Audit) & Verification
- Full RLS validation on all 26 tables.
- Input sanitation, CSP headers, rate-limiting guidelines, and auth token hygiene.

### Phase 8: Testing, Build Optimization & Release
- Vitest unit & integration test suite.
- Type check & lint verification.
- GitHub feature commit and release checklist completion.
