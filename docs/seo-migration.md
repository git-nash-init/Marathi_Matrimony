# SEO Migration, Sitemap & Route Preservation Plan

## 1. Overview
The legacy website (`marathalaginsarai.com`) possesses significant domain authority across Mumbai, Thane, Navi Mumbai, and Pune regional Maratha marriage keywords. Every crawled URL from `sitemap.xml` has been mapped to prevent broken links, preserve search rankings, and deliver rich, location-specific matrimonial landing experiences.

---

## 2. Legacy Route Mapping & Redirect Architecture

| Legacy URL Pattern | Canonical React Route | Page Type & Intent | SEO Indexable? |
| :--- | :--- | :--- | :--- |
| `/` | `/` | Homepage | Yes (Index, Follow) |
| `/Registration.aspx` | `/register` | Member Registration | Yes |
| `/Login.aspx` | `/login` | Member Login | No (Noindex) |
| `/success-stories` | `/success-stories` | Success Stories Gallery | Yes (Index, Follow) |
| `/ViewSuccessStories.aspx` | `/success-stories` | Success Stories Redirect | 301 Redirect |
| `/maratha-marriage-bureau-borivali` | `/maratha-marriage-bureau-borivali` | Borivali Location Hub | Yes (Index, Follow) |
| `/maratha-marriage-bureau-lower-parel`| `/maratha-marriage-bureau-lower-parel` | Lower Parel Location Hub | Yes (Index, Follow) |
| `/maratha-vadhu-var-suchak-dadar` | `/maratha-vadhu-var-suchak-dadar` | Dadar Location Hub | Yes (Index, Follow) |
| `/maratha-vivah-mandal-mulund` | `/maratha-vivah-mandal-mulund` | Mulund Location Hub | Yes (Index, Follow) |
| `/maratha-marriage-bureau-vashi` | `/maratha-marriage-bureau-vashi` | Vashi Location Hub | Yes (Index, Follow) |
| `/maratha-matrimony-kharghar` | `/maratha-matrimony-kharghar` | Kharghar Location Hub | Yes (Index, Follow) |
| `/maratha-vadhu-var-suchak-jogeshwari` | `/maratha-vadhu-var-suchak-jogeshwari` | Jogeshwari Location Hub | Yes (Index, Follow) |
| `/maratha-vadhu-var-suchak-ghodbunder-thane` | `/maratha-vadhu-var-suchak-ghodbunder-thane` | Thane Ghodbunder Hub | Yes (Index, Follow) |
| `/maratha-vadhu-var-suchak-dhankawadi-pune` | `/maratha-vadhu-var-suchak-dhankawadi-pune` | Pune Dhankawadi Hub | Yes (Index, Follow) |
| `/maratha-vadhu-var-suchak-pimpri-chinchwad`| `/maratha-vadhu-var-suchak-pimpri-chinchwad` | PCMC Location Hub | Yes (Index, Follow) |
| `/maratha-matrimony/groom/:location` | `/maratha-matrimony/groom/:location` | Groom Location Filter | Yes (Index, Follow) |
| `/maratha-matrimony/bride/:location` | `/maratha-matrimony/bride/:location` | Bride Location Filter | Yes (Index, Follow) |
| `/maratha-matrimony/:caste-groom/:location` | `/maratha-matrimony/:caste-groom/:location` | Sub-caste Groom Search | Yes (Index, Follow) |
| `/maratha-matrimony/:caste-bride/:location` | `/maratha-matrimony/:caste-bride/:location` | Sub-caste Bride Search | Yes (Index, Follow) |
| `/maratha-matrimony/groom/:occupation` | `/maratha-matrimony/groom/:occupation` | Profession Search | Yes (Index, Follow) |
| `/maratha-matrimony/bride/:occupation` | `/maratha-matrimony/bride/:occupation` | Profession Search | Yes (Index, Follow) |
| `/parab-maratha-vadhu-var-suchak` | `/community/parab-maratha` | Sub-community Portal | Yes (Index, Follow) |
| `/tawde-maratha-vivah-mandal` | `/community/tawde-maratha` | Sub-community Portal | Yes (Index, Follow) |
| `/deokar-maratha-vadhu-var-suchak` | `/community/deokar-maratha` | Sub-community Portal | Yes (Index, Follow) |
| `/nimbalkar-maratha-vadhu-var-suchak` | `/community/nimbalkar-maratha` | Sub-community Portal | Yes (Index, Follow) |

---

## 3. Structured Data (JSON-LD) Strategy
Every public marketing and location page embeds Schema.org structured metadata:
- `Organization`: Name: "Maratha Laginsarai (मराठा लगीनसराई)", URL, Logo, ContactPoint (Phone, WhatsApp).
- `LocalBusiness`: Dedicated addresses for Mumbai and Pune service areas.
- `BreadcrumbList`: Accurate navigation breadcrumbs for all location and category sub-pages.
- `WebSite`: Sitelinks SearchBox definition targeting `/search?q={search_term_string}`.
- Sensitive individual member details (exact birthdates, phone numbers, family details) are strictly excluded from JSON-LD to safeguard privacy.
