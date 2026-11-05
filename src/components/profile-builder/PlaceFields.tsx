import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { lookupsService, Place, useTalukas } from '../../services/lookups.service';

const placeLabel = (p: Place, mr: boolean) => (mr && p.name_mr ? p.name_mr : p.name_en);

/** Keeps a saved value selectable even if it is not on the list (older profiles, or outside Maharashtra). */
const withCurrent = (options: { value: string; label: string }[], current: string | undefined) =>
  current && !options.some((o) => o.value === current) ? [...options, { value: current, label: current }] : options;

export const DistrictTalukaFields: React.FC<{
  idPrefix: string;
  districts: Place[];
  district: string | undefined;
  taluka: string | undefined;
  onDistrict: (value: string) => void;
  onTaluka: (value: string) => void;
  districtLabel: string;
}> = ({ idPrefix, districts, district, taluka, onDistrict, onTaluka, districtLabel }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const talukas = useTalukas(district, districts);

  return (
    <>
      <FormSelect
        id={`${idPrefix}-district`}
        label={districtLabel}
        value={district || ''}
        placeholder={mr ? '-- जिल्हा निवडा --' : '-- Select district --'}
        onChange={(e) => { onDistrict(e.target.value); onTaluka(''); }}
        options={withCurrent(districts.map((d) => ({ value: d.name_en, label: placeLabel(d, mr) })), district)}
      />
      <FormSelect
        id={`${idPrefix}-taluka`}
        label={mr ? 'तालुका' : 'Taluka'}
        value={taluka || ''}
        disabled={!district}
        placeholder={district ? (mr ? '-- तालुका निवडा --' : '-- Select taluka --') : (mr ? 'आधी जिल्हा निवडा' : 'Choose a district first')}
        onChange={(e) => onTaluka(e.target.value)}
        options={withCurrent(talukas.map((t) => ({ value: t.name_en, label: placeLabel(t, mr) })), taluka)}
      />
    </>
  );
};

/**
 * Village or town, typed freely. Suggestions appear when the village list has been imported; without
 * it the field still works, so nobody is stuck because their village is missing.
 */
export const VillageField: React.FC<{
  district: string | undefined;
  taluka: string | undefined;
  districts: Place[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  prefix?: React.ReactNode;
}> = ({ district, taluka, districts, value, onChange, label, placeholder, required, error, prefix }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const talukas = useTalukas(district, districts);
  const talukaId = talukas.find((t) => t.name_en === taluka)?.id;
  const [suggestions, setSuggestions] = useState<{ name_en: string; name_mr: string | null }[]>([]);

  useEffect(() => {
    if (!talukaId) { setSuggestions([]); return; }
    let active = true;
    const timer = setTimeout(() => {
      lookupsService.searchVillages(talukaId, value).then((rows) => { if (active) setSuggestions(rows); }).catch(() => undefined);
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [talukaId, value]);

  return (
    <div>
      <FormInput
        id="native-place"
        label={label}
        required={required}
        list="native-place-options"
        value={value}
        error={error}
        placeholder={placeholder}
        prefix={prefix}
        maxLength={100}
        helperText={mr ? 'हे फक्त संपर्क उघडलेल्या सदस्यांना दिसते.' : 'Only members who have unlocked your contact details can see this.'}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id="native-place-options">
        {suggestions.map((s) => <option key={s.name_en} value={mr && s.name_mr ? s.name_mr : s.name_en} />)}
      </datalist>
    </div>
  );
};
