-- 018: Phase 6. Marathi community fields, admin-editable lists, Maharashtra districts and talukas.
-- Taluka names were written from general knowledge, not imported from the government directory:
-- check them against the Local Government Directory before relying on them. Admins can correct any row.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rashi text CHECK (char_length(rashi) <= 60),
  ADD COLUMN IF NOT EXISTS nakshatra text CHECK (char_length(nakshatra) <= 60),
  ADD COLUMN IF NOT EXISTS manglik text CHECK (manglik IN ('no', 'yes', 'anshik', 'dont_know')),
  ADD COLUMN IF NOT EXISTS kuldaivat text CHECK (char_length(kuldaivat) <= 100),
  ADD COLUMN IF NOT EXISTS district text CHECK (char_length(district) <= 80),
  ADD COLUMN IF NOT EXISTS taluka text CHECK (char_length(taluka) <= 80),
  ADD COLUMN IF NOT EXISTS native_district text CHECK (char_length(native_district) <= 80),
  ADD COLUMN IF NOT EXISTS native_taluka text CHECK (char_length(native_taluka) <= 80),
  ADD COLUMN IF NOT EXISTS native_place text CHECK (char_length(native_place) <= 100);

-- native_place is deliberately left out: a name plus a village can identify someone, so it is only
-- released by get_my_private_profile (the owner) and get_contact_if_unlocked (after an unlock).
GRANT SELECT (rashi, nakshatra, manglik, kuldaivat, district, taluka, native_district, native_taluka)
  ON public.profiles TO authenticated;

CREATE INDEX IF NOT EXISTS idx_profiles_rashi ON public.profiles (rashi) WHERE profile_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles (district) WHERE profile_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_profiles_native_district ON public.profiles (native_district) WHERE profile_status = 'approved';

-- ─── Editable lists ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lookup_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('rashi', 'nakshatra', 'community', 'gotra', 'kuldaivat')),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 60),
  label_en text NOT NULL CHECK (char_length(label_en) BETWEEN 1 AND 100),
  label_mr text NOT NULL CHECK (char_length(label_mr) BETWEEN 1 AND 100),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, value)
);
ALTER TABLE public.lookup_options ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lookup_options FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.lookup_options TO anon, authenticated;
CREATE POLICY lookup_options_read ON public.lookup_options FOR SELECT TO anon, authenticated USING (is_active);

INSERT INTO public.lookup_options (kind, value, label_en, label_mr, sort_order)
SELECT 'rashi', v.value, v.en, v.mr, v.n FROM (VALUES
  ('mesh','Mesh (Aries)','मेष',1),('vrishabh','Vrishabh (Taurus)','वृषभ',2),('mithun','Mithun (Gemini)','मिथुन',3),
  ('kark','Kark (Cancer)','कर्क',4),('simha','Simha (Leo)','सिंह',5),('kanya','Kanya (Virgo)','कन्या',6),
  ('tula','Tula (Libra)','तूळ',7),('vrishchik','Vrishchik (Scorpio)','वृश्चिक',8),('dhanu','Dhanu (Sagittarius)','धनु',9),
  ('makar','Makar (Capricorn)','मकर',10),('kumbh','Kumbh (Aquarius)','कुंभ',11),('meen','Meen (Pisces)','मीन',12)
) AS v(value, en, mr, n) ON CONFLICT (kind, value) DO NOTHING;

INSERT INTO public.lookup_options (kind, value, label_en, label_mr, sort_order)
SELECT 'nakshatra', v.value, v.en, v.mr, v.n FROM (VALUES
  ('ashwini','Ashwini','अश्विनी',1),('bharani','Bharani','भरणी',2),('krittika','Krittika','कृत्तिका',3),('rohini','Rohini','रोहिणी',4),
  ('mrigashira','Mrigashira','मृगशीर्ष',5),('ardra','Ardra','आर्द्रा',6),('punarvasu','Punarvasu','पुनर्वसू',7),('pushya','Pushya','पुष्य',8),
  ('ashlesha','Ashlesha','आश्लेषा',9),('magha','Magha','मघा',10),('purva_phalguni','Purva Phalguni','पूर्वा फाल्गुनी',11),
  ('uttara_phalguni','Uttara Phalguni','उत्तरा फाल्गुनी',12),('hasta','Hasta','हस्त',13),('chitra','Chitra','चित्रा',14),('swati','Swati','स्वाती',15),
  ('vishakha','Vishakha','विशाखा',16),('anuradha','Anuradha','अनुराधा',17),('jyeshtha','Jyeshtha','ज्येष्ठा',18),('mula','Mula','मूळ',19),
  ('purva_ashadha','Purva Ashadha','पूर्वाषाढा',20),('uttara_ashadha','Uttara Ashadha','उत्तराषाढा',21),('shravana','Shravana','श्रवण',22),
  ('dhanishta','Dhanishta','धनिष्ठा',23),('shatabhisha','Shatabhisha','शततारका',24),('purva_bhadrapada','Purva Bhadrapada','पूर्वा भाद्रपदा',25),
  ('uttara_bhadrapada','Uttara Bhadrapada','उत्तरा भाद्रपदा',26),('revati','Revati','रेवती',27)
) AS v(value, en, mr, n) ON CONFLICT (kind, value) DO NOTHING;

INSERT INTO public.lookup_options (kind, value, label_en, label_mr, sort_order)
SELECT 'community', v.value, v.en, v.mr, v.n FROM (VALUES
  ('maratha_96k','96 Kuli Maratha','९६ कुळी मराठा',1),('maratha','Maratha','मराठा',2),('deshastha_brahmin','Deshastha Brahmin','देशस्थ ब्राह्मण',3),
  ('kokanastha_brahmin','Kokanastha Brahmin','कोकणस्थ ब्राह्मण',4),('karhade_brahmin','Karhade Brahmin','कऱ्हाडे ब्राह्मण',5),
  ('ckp','CKP (Kayastha Prabhu)','चांद्रसेनीय कायस्थ प्रभू',6),('kunbi_maratha','Kunbi Maratha','कुणबी मराठा',7),('mali','Mali','माळी समाज',8),
  ('sonar','Sonar / Daivadnya','सोनार / दैवज्ञ',9),('vanjari','Vanjari','वंजारी',10),('dhangar','Dhangar','धनगर',11),('chambhar','Chambhar','चांभार समाज',12),
  ('matang','Matang','मातंग समाज',13),('agri','Agri','आगरी समाज',14),('bhandari','Bhandari','भंडारी समाज',15),('lingayat','Lingayat','लिंगायत',16),
  ('gurav','Gurav','गुरव',17),('sutar','Sutar / Vishwakarma','सुतार / विश्वकर्मा',18),('teli','Teli','तेली समाज',19),('koshti','Koshti','कोष्टी / देवांग',20),
  ('nhavi','Nhavi','न्हावी / सेना',21),('jain_marathi','Jain (Marathi)','जैन (मराठी)',22),('buddhist','Buddhist','बौद्ध',23),('other','Other Communities','इतर सर्व समाज',24)
) AS v(value, en, mr, n) ON CONFLICT (kind, value) DO NOTHING;

-- ─── Locations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL UNIQUE CHECK (char_length(name_en) BETWEEN 1 AND 80),
  name_mr text
);
CREATE TABLE IF NOT EXISTS public.talukas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.districts (id),
  name_en text NOT NULL CHECK (char_length(name_en) BETWEEN 1 AND 80),
  name_mr text,
  UNIQUE (district_id, name_en)
);
CREATE TABLE IF NOT EXISTS public.villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taluka_id uuid NOT NULL REFERENCES public.talukas (id),
  name_en text NOT NULL CHECK (char_length(name_en) BETWEEN 1 AND 100),
  name_mr text,
  UNIQUE (taluka_id, name_en)
);
CREATE INDEX IF NOT EXISTS idx_villages_lookup ON public.villages (taluka_id, lower(name_en) text_pattern_ops);
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talukas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.districts, public.talukas, public.villages FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.districts, public.talukas, public.villages TO anon, authenticated;
CREATE POLICY districts_read ON public.districts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY talukas_read ON public.talukas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY villages_read ON public.villages FOR SELECT TO anon, authenticated USING (true);

DO $seed$
DECLARE
  v_data jsonb := $json${
    "Mumbai City":{"mr":"मुंबई शहर","t":["Mumbai City"]},
    "Mumbai Suburban":{"mr":"मुंबई उपनगर","t":["Andheri","Borivali","Kurla"]},
    "Thane":{"mr":"ठाणे","t":["Thane","Bhiwandi","Kalyan","Ulhasnagar","Ambarnath","Murbad","Shahapur"]},
    "Palghar":{"mr":"पालघर","t":["Palghar","Vasai","Dahanu","Talasari","Jawhar","Mokhada","Vada","Vikramgad"]},
    "Raigad":{"mr":"रायगड","t":["Alibag","Pen","Panvel","Uran","Karjat","Khalapur","Mangaon","Tala","Roha","Sudhagad","Mahad","Mhasla","Murud","Shrivardhan","Poladpur"]},
    "Ratnagiri":{"mr":"रत्नागिरी","t":["Ratnagiri","Sangameshwar","Lanja","Chiplun","Guhagar","Dapoli","Mandangad","Khed","Rajapur"]},
    "Sindhudurg":{"mr":"सिंधुदुर्ग","t":["Kudal","Kankavli","Vengurla","Malvan","Sawantwadi","Dodamarg","Devgad","Vaibhavwadi"]},
    "Pune":{"mr":"पुणे","t":["Pune City","Haveli","Khed","Ambegaon","Junnar","Shirur","Daund","Indapur","Baramati","Purandar","Bhor","Velhe","Mulshi","Maval"]},
    "Satara":{"mr":"सातारा","t":["Satara","Karad","Wai","Mahabaleshwar","Phaltan","Man","Khatav","Koregaon","Patan","Jaoli","Khandala"]},
    "Sangli":{"mr":"सांगली","t":["Miraj","Kavathe Mahankal","Tasgaon","Jat","Walwa","Shirala","Khanapur","Atpadi","Palus","Kadegaon"]},
    "Kolhapur":{"mr":"कोल्हापूर","t":["Karvir","Panhala","Shahuwadi","Kagal","Hatkanangale","Shirol","Radhanagari","Gaganbawada","Bhudargad","Gadhinglaj","Chandgad","Ajra"]},
    "Solapur":{"mr":"सोलापूर","t":["North Solapur","South Solapur","Akkalkot","Barshi","Mangalvedhe","Pandharpur","Sangola","Malshiras","Mohol","Madha","Karmala"]},
    "Nashik":{"mr":"नाशिक","t":["Nashik","Igatpuri","Dindori","Peth","Trimbakeshwar","Kalwan","Deola","Surgana","Baglan","Malegaon","Nandgaon","Chandwad","Niphad","Sinnar","Yeola"]},
    "Dhule":{"mr":"धुळे","t":["Dhule","Sakri","Sindkheda","Shirpur"]},
    "Nandurbar":{"mr":"नंदुरबार","t":["Nandurbar","Navapur","Shahada","Taloda","Akkalkuwa","Akrani"]},
    "Jalgaon":{"mr":"जळगाव","t":["Jalgaon","Jamner","Erandol","Dharangaon","Bhusawal","Bodwad","Yawal","Raver","Muktainagar","Amalner","Chopda","Parola","Pachora","Bhadgaon","Chalisgaon"]},
    "Ahilyanagar":{"mr":"अहिल्यानगर","t":["Nagar","Shevgaon","Pathardi","Parner","Sangamner","Kopargaon","Akole","Shrirampur","Nevasa","Rahata","Rahuri","Shrigonda","Karjat","Jamkhed"]},
    "Chhatrapati Sambhajinagar":{"mr":"छत्रपती संभाजीनगर","t":["Chhatrapati Sambhajinagar","Kannad","Soegaon","Sillod","Phulambri","Khuldabad","Vaijapur","Gangapur","Paithan"]},
    "Jalna":{"mr":"जालना","t":["Jalna","Badnapur","Bhokardan","Jafrabad","Ambad","Ghansawangi","Partur","Mantha"]},
    "Beed":{"mr":"बीड","t":["Beed","Georai","Shirur Kasar","Ashti","Patoda","Majalgaon","Wadwani","Dharur","Parli","Ambajogai","Kaij"]},
    "Latur":{"mr":"लातूर","t":["Latur","Renapur","Ausa","Ahmedpur","Jalkot","Chakur","Shirur Anantpal","Nilanga","Deoni","Udgir"]},
    "Dharashiv":{"mr":"धाराशिव","t":["Dharashiv","Tuljapur","Bhum","Paranda","Washi","Kalamb","Lohara","Umarga"]},
    "Nanded":{"mr":"नांदेड","t":["Nanded","Ardhapur","Mudkhed","Bhokar","Umri","Loha","Kandhar","Kinwat","Himayatnagar","Hadgaon","Mahur","Deglur","Mukhed","Dharmabad","Biloli","Naigaon"]},
    "Parbhani":{"mr":"परभणी","t":["Parbhani","Gangakhed","Sonpeth","Pathri","Manwath","Palam","Selu","Jintur","Purna"]},
    "Hingoli":{"mr":"हिंगोली","t":["Hingoli","Kalamnuri","Basmath","Sengaon","Aundha Nagnath"]},
    "Buldhana":{"mr":"बुलढाणा","t":["Buldhana","Chikhli","Deulgaon Raja","Jalgaon Jamod","Sangrampur","Malkapur","Motala","Nandura","Khamgaon","Shegaon","Mehkar","Sindkhed Raja","Lonar"]},
    "Akola":{"mr":"अकोला","t":["Akola","Akot","Telhara","Balapur","Patur","Murtizapur","Barshitakli"]},
    "Washim":{"mr":"वाशिम","t":["Washim","Malegaon","Risod","Mangrulpir","Karanja","Manora"]},
    "Amravati":{"mr":"अमरावती","t":["Amravati","Bhatkuli","Nandgaon Khandeshwar","Dharni","Chikhaldara","Achalpur","Chandurbazar","Morshi","Warud","Daryapur","Anjangaon Surji","Chandur Railway","Dhamangaon Railway","Teosa"]},
    "Yavatmal":{"mr":"यवतमाळ","t":["Yavatmal","Arni","Babhulgaon","Kalamb","Darwha","Digras","Ner","Pusad","Umarkhed","Mahagaon","Kelapur","Ralegaon","Ghatanji","Wani","Maregaon","Zari Jamani"]},
    "Wardha":{"mr":"वर्धा","t":["Wardha","Deoli","Seloo","Arvi","Ashti","Karanja","Hinganghat","Samudrapur"]},
    "Nagpur":{"mr":"नागपूर","t":["Nagpur Urban","Nagpur Rural","Kamptee","Hingna","Katol","Narkhed","Savner","Kalameshwar","Ramtek","Mouda","Parseoni","Umred","Kuhi","Bhiwapur"]},
    "Bhandara":{"mr":"भंडारा","t":["Bhandara","Tumsar","Mohadi","Pauni","Sakoli","Lakhani","Lakhandur"]},
    "Gondia":{"mr":"गोंदिया","t":["Gondia","Tirora","Goregaon","Arjuni Morgaon","Amgaon","Salekasa","Sadak Arjuni","Deori"]},
    "Chandrapur":{"mr":"चंद्रपूर","t":["Chandrapur","Saoli","Mul","Ballarpur","Pombhurna","Gondpimpri","Warora","Chimur","Bhadravati","Bramhapuri","Nagbhid","Sindewahi","Rajura","Korpana","Jivati"]},
    "Gadchiroli":{"mr":"गडचिरोली","t":["Gadchiroli","Dhanora","Chamorshi","Mulchera","Desaiganj","Armori","Kurkheda","Korchi","Aheri","Etapalli","Bhamragad","Sironcha"]}
  }$json$::jsonb;
  v_name text; v_row jsonb; v_id uuid;
BEGIN
  FOR v_name, v_row IN SELECT * FROM jsonb_each(v_data) LOOP
    INSERT INTO public.districts (name_en, name_mr) VALUES (v_name, v_row ->> 'mr')
    ON CONFLICT (name_en) DO UPDATE SET name_mr = EXCLUDED.name_mr RETURNING id INTO v_id;
    INSERT INTO public.talukas (district_id, name_en)
    SELECT v_id, t FROM jsonb_array_elements_text(v_row -> 't') AS t ON CONFLICT (district_id, name_en) DO NOTHING;
  END LOOP;
END;
$seed$;

-- ─── Member functions ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_private_profile()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('last_name', p.last_name, 'aadhaar_last4', p.aadhaar_last4, 'native_place', p.native_place)
  FROM public.profiles p WHERE p.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_contact_if_unlocked(p_target uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_t public.profiles%ROWTYPE;
  v_c public.profile_contacts%ROWTYPE;
BEGIN
  IF v_me IS NULL OR NOT public.has_feature('unlock_contact') THEN RETURN jsonb_build_object('unlocked', false); END IF;
  IF v_me <> p_target AND public.is_blocked_with(p_target) THEN RETURN jsonb_build_object('unlocked', false); END IF;
  IF v_me <> p_target AND NOT EXISTS (SELECT 1 FROM public.contact_unlocks WHERE unlocker_profile_id = v_me AND unlocked_profile_id = p_target) THEN
    RETURN jsonb_build_object('unlocked', false);
  END IF;
  SELECT * INTO v_t FROM public.profiles WHERE id = p_target;
  SELECT * INTO v_c FROM public.profile_contacts WHERE profile_id = p_target;
  RETURN jsonb_build_object('unlocked', true, 'last_name', v_t.last_name, 'email', v_c.email, 'phone_number', v_c.phone_number,
    'whatsapp_number', v_c.whatsapp_number, 'address_line', v_c.address_line, 'native_place', v_t.native_place);
END;
$$;

CREATE OR REPLACE FUNCTION public.like_prefix(p_text text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $
  SELECT regexp_replace(COALESCE(p_text, ''), '([%_\\])', '\\\1', 'g') || '%';
$;

CREATE OR REPLACE FUNCTION public.search_villages(p_taluka uuid, p_q text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name_en', v.name_en, 'name_mr', v.name_mr)), '[]'::jsonb)
  FROM (SELECT name_en, name_mr FROM public.villages
        WHERE taluka_id = p_taluka
          AND lower(name_en) LIKE public.like_prefix(lower(left(btrim(COALESCE(p_q, '')), 60)))
        ORDER BY name_en LIMIT 20) v;
$$;

-- ─── Admin functions ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_list_lookups(p_kind text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.sort_order, l.label_en) FROM public.lookup_options l WHERE l.kind = p_kind), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_lookup(
  p_id uuid, p_kind text, p_value text, p_label_en text, p_label_mr text, p_sort int DEFAULT 0, p_active boolean DEFAULT true)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_en text := btrim(COALESCE(p_label_en, ''));
  v_mr text := btrim(COALESCE(p_label_mr, ''));
BEGIN
  PERFORM public.require_admin_role('admin');
  IF v_en = '' OR v_mr = '' THEN RAISE EXCEPTION 'Please give both the English and Marathi names.' USING ERRCODE = '22023'; END IF;

  IF p_id IS NULL THEN
    IF p_kind NOT IN ('rashi', 'nakshatra', 'community', 'gotra', 'kuldaivat') THEN
      RAISE EXCEPTION 'Unknown list.' USING ERRCODE = '22023';
    END IF;
    -- The stored value never changes afterwards, so profiles keep pointing at the same entry when a label is edited.
    INSERT INTO public.lookup_options (kind, value, label_en, label_mr, sort_order, is_active)
    VALUES (p_kind, COALESCE(NULLIF(btrim(p_value), ''), lower(regexp_replace(v_en, '[^a-zA-Z0-9]+', '_', 'g'))), v_en, v_mr, COALESCE(p_sort, 0), COALESCE(p_active, true))
    ON CONFLICT (kind, value) DO NOTHING
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'This entry is already on the list.' USING ERRCODE = '22023'; END IF;
  ELSE
    UPDATE public.lookup_options
    SET label_en = v_en, label_mr = v_mr, sort_order = COALESCE(p_sort, sort_order), is_active = COALESCE(p_active, is_active), updated_at = now()
    WHERE id = p_id RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Entry not found.' USING ERRCODE = 'P0002'; END IF;
  END IF;
  PERFORM public.admin_log('lookup_saved', 'lookup_options', v_id::text, jsonb_build_object('kind', p_kind, 'label_en', v_en, 'active', p_active));
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_location_summary()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');
  RETURN jsonb_build_object(
    'districts', (SELECT count(*) FROM public.districts),
    'talukas', (SELECT count(*) FROM public.talukas),
    'villages', (SELECT count(*) FROM public.villages));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_location(p_level text, p_id uuid, p_parent uuid, p_name_en text, p_name_mr text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_en text := btrim(COALESCE(p_name_en, ''));
  v_mr text := NULLIF(btrim(COALESCE(p_name_mr, '')), '');
BEGIN
  PERFORM public.require_admin_role('admin');
  IF v_en = '' THEN RAISE EXCEPTION 'Please give the English name.' USING ERRCODE = '22023'; END IF;
  BEGIN
    IF p_level = 'district' THEN
      IF p_id IS NULL THEN INSERT INTO public.districts (name_en, name_mr) VALUES (v_en, v_mr) RETURNING id INTO v_id;
      ELSE UPDATE public.districts SET name_en = v_en, name_mr = v_mr WHERE id = p_id RETURNING id INTO v_id; END IF;
    ELSIF p_level = 'taluka' THEN
      IF p_id IS NULL THEN INSERT INTO public.talukas (district_id, name_en, name_mr) VALUES (p_parent, v_en, v_mr) RETURNING id INTO v_id;
      ELSE UPDATE public.talukas SET name_en = v_en, name_mr = v_mr WHERE id = p_id RETURNING id INTO v_id; END IF;
    ELSIF p_level = 'village' THEN
      IF p_id IS NULL THEN INSERT INTO public.villages (taluka_id, name_en, name_mr) VALUES (p_parent, v_en, v_mr) RETURNING id INTO v_id;
      ELSE UPDATE public.villages SET name_en = v_en, name_mr = v_mr WHERE id = p_id RETURNING id INTO v_id; END IF;
    ELSE
      RAISE EXCEPTION 'Unknown level.' USING ERRCODE = '22023';
    END IF;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'This name is already on the list.' USING ERRCODE = '22023';
  END;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Entry not found.' USING ERRCODE = 'P0002'; END IF;
  PERFORM public.admin_log('location_saved', p_level, v_id::text, jsonb_build_object('name_en', v_en));
  RETURN v_id;
END;
$$;

-- Bulk import for the village list. Rows: {district, taluka, village, village_mr}. Unknown districts are
-- reported, never created, so a spelling mistake cannot add a false district.
CREATE OR REPLACE FUNCTION public.admin_import_villages(p_rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row jsonb; v_district uuid; v_taluka uuid; v_name text; v_done int := 0; v_added int := 0; v_n int;
  v_unknown text[] := '{}';
BEGIN
  PERFORM public.require_admin_role('admin');
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) > 2000 THEN
    RAISE EXCEPTION 'Send at most 2000 rows at a time.' USING ERRCODE = '22023';
  END IF;
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    v_name := NULLIF(btrim(v_row ->> 'village'), '');
    SELECT id INTO v_district FROM public.districts WHERE lower(name_en) = lower(btrim(COALESCE(v_row ->> 'district', '')));
    IF v_district IS NULL OR v_name IS NULL OR NULLIF(btrim(v_row ->> 'taluka'), '') IS NULL THEN
      v_unknown := v_unknown || COALESCE(v_row ->> 'district', '(blank)');
      CONTINUE;
    END IF;
    INSERT INTO public.talukas (district_id, name_en) VALUES (v_district, btrim(v_row ->> 'taluka'))
    ON CONFLICT (district_id, name_en) DO UPDATE SET name_en = EXCLUDED.name_en RETURNING id INTO v_taluka;
    INSERT INTO public.villages (taluka_id, name_en, name_mr) VALUES (v_taluka, v_name, NULLIF(btrim(v_row ->> 'village_mr'), ''))
    ON CONFLICT (taluka_id, name_en) DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_added := v_added + v_n;
    v_done := v_done + 1;
  END LOOP;
  PERFORM public.admin_log('villages_imported', 'villages', 'bulk', jsonb_build_object('rows', jsonb_array_length(p_rows), 'added', v_added));
  RETURN jsonb_build_object('read', v_done, 'added', v_added, 'skipped', jsonb_array_length(p_rows) - v_done,
    'unknown', (SELECT COALESCE(jsonb_agg(DISTINCT u), '[]'::jsonb) FROM unnest(v_unknown) AS u));
END;
$$;

REVOKE ALL ON FUNCTION public.search_villages(uuid, text), public.admin_list_lookups(text),
  public.admin_save_lookup(uuid, text, text, text, text, int, boolean), public.admin_location_summary(),
  public.admin_save_location(text, uuid, uuid, text, text), public.admin_import_villages(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_villages(uuid, text), public.admin_list_lookups(text),
  public.admin_save_lookup(uuid, text, text, text, text, int, boolean), public.admin_location_summary(),
  public.admin_save_location(text, uuid, uuid, text, text), public.admin_import_villages(jsonb) TO authenticated, service_role;

-- Also applied here: admin_update_profile accepts the nine new fields (native_place masked in the log),
-- and search_profiles accepts the filters rashi, manglik, district and native_district.
