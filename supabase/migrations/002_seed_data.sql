-- ============================================================================
-- SUPABASE POSTGRESQL SEED DATA: MARATHI MATRIMONIAL
-- MIGRATION: 002_seed_data.sql
-- ============================================================================

-- 1. SUBSCRIPTION PLANS INITIAL SEED
INSERT INTO public.subscription_plans (
    id,
    name_en,
    name_mr,
    description_en,
    description_mr,
    duration_days,
    price,
    currency,
    max_interests,
    can_view_contact,
    can_send_unlimited_interest,
    can_view_profile_views,
    can_use_advanced_search,
    can_send_messages,
    is_active,
    sort_order
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Free',
    'मोफत',
    'Basic free profile registration and profile browsing.',
    'मोफत प्रोफाइल नोंदणी आणि प्राथमिक स्थळे शोध.',
    0,
    0,
    'INR',
    5,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Silver',
    'सिल्व्हर',
    'Unlock 20 verified contacts for 3 months with advanced filters.',
    '३ महिने वैधता, २० पडताळणी केलेले संपर्क आणि प्रगत शोध.',
    90,
    499,
    'INR',
    20,
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    2
),
(
    '00000000-0000-0000-0000-000000000003',
    'Gold',
    'गोल्ड',
    'Our most popular 6-month plan with unlimited interests, profile views, and messaging.',
    'सर्वाधिक लोकप्रिय ६ महिन्यांची योजना, अमर्यादित पसंती व थेट संपर्क.',
    180,
    999,
    'INR',
    60,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    3
),
(
    '00000000-0000-0000-0000-000000000004',
    'Premium',
    'प्रीमियम',
    '1 Full year VIP priority matchmaking with maximum contact views.',
    '१ वर्ष पूर्ण वैधता, व्हीआयपी प्राधान्य आणि सर्वोच्च संपर्क मर्यादा.',
    365,
    1499,
    'INR',
    150,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    4
)
ON CONFLICT (id) DO NOTHING;

-- 2. COMMUNITY OPTIONS (MARATHI COMMUNITIES / CASTES)
INSERT INTO public.community_options (name_en, name_mr, is_active, sort_order) VALUES
('Maratha (96 Kuli)', 'मराठा (९६ कुळी)', TRUE, 1),
('Deshastha Brahmin', 'देशस्थ ब्राह्मण', TRUE, 2),
('Kokanastha Brahmin', 'कोकणस्थ ब्राह्मण', TRUE, 3),
('CKP (Chandraseniya Kayastha Prabhu)', 'चांद्रसेनीय कायस्थ प्रभू (CKP)', TRUE, 4),
('Kunbi Maratha', 'कुणबी मराठा', TRUE, 5),
('Mali', 'माळी समाज', TRUE, 6),
('Sonar / Daivadnya', 'सोनार / दैवज्ञ ब्राह्मण', TRUE, 7),
('Agri', 'आगरी समाज', TRUE, 8),
('Vanjari', 'वंजारी समाज', TRUE, 9),
('Dhangar', 'धनगर समाज', TRUE, 10),
('Teli', 'तेली समाज', TRUE, 11),
('Bhandari', 'भंडारी समाज', TRUE, 12),
('Chambhar', 'चांभार समाज', TRUE, 13),
('Matang', 'मातंग समाज', TRUE, 14),
('Buddhist / Neo-Buddhist', 'बौद्ध समाज', TRUE, 15),
('Jain (Digambar / Shwetambar)', 'जैन (दिगंबर / श्वेतांबर)', TRUE, 16),
('Lingayat', 'लिंगायत समाज', TRUE, 17),
('Koli', 'कोळी समाज', TRUE, 18),
('Gurav', 'गुरव समाज', TRUE, 19),
('Other Communities', 'इतर सर्व समाज', TRUE, 20)
ON CONFLICT DO NOTHING;

-- 3. EDUCATION OPTIONS
INSERT INTO public.education_options (name_en, name_mr, is_active, sort_order) VALUES
('B.E / B.Tech', 'बी.ई / बी.टेक (इंजिनिअरिंग)', TRUE, 1),
('M.E / M.Tech', 'एम.ई / एम.टेक', TRUE, 2),
('MCA / MCS / BCA / BCS', 'एमसीए / एमएससी / बीसीए', TRUE, 3),
('MBBS / MD / MS', 'एमबीबीएस / एमडी / एमएस (डॉक्टर)', TRUE, 4),
('BAMS / BHMS / BDS', 'बीएएमएस / बीएचएमएस / बीडीएस', TRUE, 5),
('MBA / PGDM', 'एमबीए / पीजीडीएम (मॅनेजमेंट)', TRUE, 6),
('CA / CS / ICWA / CFA', 'सीए / सीएस / आयसीडब्ल्यूए / सीएफए', TRUE, 7),
('B.Com / M.Com', 'बी.कॉम / एम.कॉम', TRUE, 8),
('B.Sc / M.Sc', 'बी.एस्सी / एम.एस्सी', TRUE, 9),
('B.A / M.A', 'बी.ए / एम.ए', TRUE, 10),
('B.Arch / M.Arch', 'बी.आर्क / एम.आर्क (आर्किटेक्ट)', TRUE, 11),
('LL.B / LL.M', 'एलएलबी / एलएलएम (वकील)', TRUE, 12),
('Diploma / Polytechnic', 'डिप्लोमा / पॉलिटेक्निक', TRUE, 13),
('PhD / Doctorate', 'पीएचडी / डॉक्टरेट', TRUE, 14)
ON CONFLICT DO NOTHING;

-- 4. OCCUPATION OPTIONS
INSERT INTO public.occupation_options (name_en, name_mr, is_active, sort_order) VALUES
('Software Engineer / IT Professional', 'सॉफ्टवेअर इंजिनिअर / आयटी व्यावसायिक', TRUE, 1),
('Doctor / Healthcare Professional', 'डॉक्टर / वैद्यकीय व्यावसायिक', TRUE, 2),
('Civil / Mechanical / Electrical Engineer', 'इंजिनिअर (सिव्हिल / मेकॅनिकल / इतर)', TRUE, 3),
('Government Officer (Class 1 / Class 2)', 'शासकीय राजपत्रित अधिकारी (MPSC / UPSC)', TRUE, 4),
('Bank Officer / Financial Analyst / CA', 'बँक अधिकारी / फायनान्स / सीए', TRUE, 5),
('Business Owner / Entrepreneur', 'उद्योगपती / व्यावसायिक / उद्योजक', TRUE, 6),
('Professor / Lecturer / Teacher', 'प्राध्यापक / शिक्षक', TRUE, 7),
('Lawyer / Legal Advisor', 'वकील / कायदेशीर सल्लागार', TRUE, 8),
('Defence / Police Services', 'संरक्षण दल / पोलीस सेवा', TRUE, 9),
('Architect / Interior Designer', 'आर्किटेक्ट / इंटीरियर डिझायनर', TRUE, 10),
('Agriculture / Farm Owner', 'शेतकरी / कृषी व्यावसायिक', TRUE, 11),
('Corporate Management / HR / Marketing', 'कॉर्पोरेट व्यवस्थापन / एचआर', TRUE, 12)
ON CONFLICT DO NOTHING;

-- 5. LOCATION OPTIONS (MAJOR MAHARASHTRA DISTRICTS & CITIES)
INSERT INTO public.location_options (country, state, district, city, name_en, name_mr, is_active) VALUES
('India', 'Maharashtra', 'Pune', 'Pune', 'Pune', 'पुणे', TRUE),
('India', 'Maharashtra', 'Pune', 'Pimpri-Chinchwad', 'Pimpri-Chinchwad', 'पिंपरी-चिंचवड', TRUE),
('India', 'Maharashtra', 'Mumbai', 'Mumbai', 'Mumbai', 'मुंबई', TRUE),
('India', 'Maharashtra', 'Thane', 'Thane', 'Thane', 'ठाणे', TRUE),
('India', 'Maharashtra', 'Thane', 'Navi Mumbai', 'Navi Mumbai', 'नवी मुंबई', TRUE),
('India', 'Maharashtra', 'Nashik', 'Nashik', 'Nashik', 'नाशिक', TRUE),
('India', 'Maharashtra', 'Nagpur', 'Nagpur', 'Nagpur', 'नागपूर', TRUE),
('India', 'Maharashtra', 'Kolhapur', 'Kolhapur', 'Kolhapur', 'कोल्हापूर', TRUE),
('India', 'Maharashtra', 'Chhatrapati Sambhajinagar', 'Chhatrapati Sambhajinagar', 'Chhatrapati Sambhajinagar', 'छत्रपती संभाजीनगर', TRUE),
('India', 'Maharashtra', 'Satara', 'Satara', 'Satara', 'सातारा', TRUE),
('India', 'Maharashtra', 'Sangli', 'Sangli', 'Sangli', 'सांगली', TRUE),
('India', 'Maharashtra', 'Solapur', 'Solapur', 'Solapur', 'सोलापूर', TRUE),
('India', 'Maharashtra', 'Ahilyanagar', 'Ahilyanagar', 'Ahilyanagar (Ahmednagar)', 'अहिल्यानगर (अहमदनगर)', TRUE),
('India', 'Maharashtra', 'Amravati', 'Amravati', 'Amravati', 'अमरावती', TRUE),
('India', 'Maharashtra', 'Ratnagiri', 'Ratnagiri', 'Ratnagiri', 'रत्नागिरी', TRUE),
('India', 'Maharashtra', 'Sindhudurg', 'Sindhudurg', 'Sindhudurg', 'सिंधुदुर्ग', TRUE)
ON CONFLICT DO NOTHING;
