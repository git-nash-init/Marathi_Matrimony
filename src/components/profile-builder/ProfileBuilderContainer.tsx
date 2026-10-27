import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import {
  ProfileFormData,
  INITIAL_PROFILE_FORM_DATA,
  calculateProfileCompletion,
} from '../../types/profileBuilder.types';
import { StepperHeader } from './StepperHeader';
import { Step1BasicDetails } from './Step1BasicDetails';
import { Step2EducationCareer } from './Step2EducationCareer';
import { Step3FamilyDetails } from './Step3FamilyDetails';
import { Step4Lifestyle } from './Step4Lifestyle';
import { Step5Location } from './Step5Location';
import { Step6AboutMe } from './Step6AboutMe';
import { Step7PartnerPreferences } from './Step7PartnerPreferences';
import { Step8ReviewSubmit } from './Step8ReviewSubmit';
import { Step9IdentityVerification } from './Step9IdentityVerification';
import { Step10ProfileSubmitted } from './Step10ProfileSubmitted';
import { StepFooter } from '../common/StepFooter';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ProfileBuilderProps {
  mode?: 'create' | 'edit';
}

export const ProfileBuilderContainer: React.FC<ProfileBuilderProps> = ({ mode: _mode = 'create' }) => {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_PROFILE_FORM_DATA);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // 1. Fetch existing profile and preferences on load
  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Load profile
        const { data: profile, error: profileErr } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileErr && profileErr.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileErr);
        }

        if (profile && isMounted) {
          setProfileId(profile.id);

          // Load partner preferences if profile exists
          const { data: prefData } = await (supabase.from('partner_preferences') as any)
            .select('*')
            .eq('profile_id', profile.id)
            .maybeSingle();

          setFormData({
            // Basic
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            avatar_url: profile.avatar_url || '',
            photos: profile.photos || [],
            photos_hidden: Boolean(profile.photos_hidden),
            id_type: 'aadhaar',
            id_number: profile.aadhaar_number || '',
            self_attested: Boolean(profile.aadhaar_number),
            profile_for: profile.profile_for || 'self',
            gender: profile.gender || 'male',
            date_of_birth: profile.date_of_birth || '',
            height_cm: profile.height_cm || 165,
            marital_status: profile.marital_status || 'never_married',
            mother_tongue: profile.mother_tongue || 'Marathi',
            religion: profile.religion || 'Hindu',
            community: profile.community || '',
            sub_community: profile.sub_community || '',
            gothra: profile.gothra || '',
            manglik: profile.manglik || 'no',
            horoscope_match_required: profile.horoscope_match_required ?? true,

            // Education & Career
            highest_education: profile.highest_education || '',
            education_detail: profile.education_detail || '',
            college_institution: profile.college_institution || '',
            occupation: profile.occupation || '',
            occupation_detail: profile.occupation_detail || '',
            employed_in: profile.employed_in || '',
            organization_name: profile.organization_name || '',
            annual_income: profile.annual_income || '',
            work_location: (profile as any).work_location || '',

            // Family
            father_occupation: profile.father_occupation || '',
            mother_occupation: profile.mother_occupation || '',
            family_type: profile.family_type || 'nuclear',
            family_values: profile.family_values || 'traditional',
            family_status: profile.family_status || 'middle_class',
            brothers_count: (profile as any).brothers_count ?? 0,
            brothers_married: profile.brothers_married ?? 0,
            sisters_count: (profile as any).sisters_count ?? 0,
            sisters_married: profile.sisters_married ?? 0,

            // Lifestyle & Location
            diet: profile.diet || 'vegetarian',
            smoking: profile.smoking || 'no',
            drinking: profile.drinking || 'no',
            hobbies: (profile as any).hobbies || [],
            personality: (profile as any).personality || '',
            current_city: profile.current_city || '',
            current_district: profile.current_district || '',
            current_state: profile.current_state || 'Maharashtra',
            current_country: profile.current_country || 'India',
            citizenship: profile.citizenship || 'Indian',
            native_place: (profile as any).native_place || '',
            native_district: (profile as any).native_district || '',

            // About Me
            about_me: profile.about_me || '',

            // Partner Preferences
            partner_min_age: prefData?.min_age || 21,
            partner_max_age: prefData?.max_age || 32,
            partner_min_height: prefData?.min_height_cm || 150,
            partner_max_height: prefData?.max_height_cm || 185,
            partner_marital_status: prefData?.marital_status || ['any'],
            partner_religion: prefData?.religion || ['Hindu'],
            partner_communities: prefData?.communities || ['any'],
            partner_manglik: prefData?.manglik || 'does_not_matter',
            partner_education: prefData?.education_levels || ['any'],
            partner_occupation: prefData?.occupations || ['any'],
            partner_min_income: prefData?.min_income || 'any',
            partner_diet: prefData?.diet || ['any'],
            partner_location: prefData?.preferred_cities?.join(', ') || '',
            partner_notes: prefData?.notes || '',
          });
        } else if (isMounted) {
          try {
            const savedDraft = localStorage.getItem(`profile_draft_${user.id}`);
            if (savedDraft) {
              const parsed = JSON.parse(savedDraft);
              setFormData((prev) => ({ ...prev, ...parsed }));
            }
          } catch (e) {
            // ignore JSON error
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          // Mark initial mount complete after state sync
          setTimeout(() => {
            isInitialMount.current = false;
          }, 500);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Field Change
  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (user) {
        try {
          localStorage.setItem(`profile_draft_${user.id}`, JSON.stringify(next));
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Debounced Autosave (saves draft every 2.5 seconds when form changes)
  useEffect(() => {
    if (isInitialMount.current || !user || isLoading) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      saveProfileToSupabase('draft', false);
    }, 2500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [formData, user, isLoading]);

  // Core Save / Upsert Function
  const saveProfileToSupabase = async (
    status: 'draft' | 'pending_review' = 'draft',
    showNotifications: boolean = true
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsSaving(true);
      setSaveErrorMessage(null);

      // Map profile_status enum safely
      const profileStatusEnum = status === 'pending_review' ? 'pending_approval' : 'draft';
      const verificationStatusEnum = formData.self_attested ? 'pending' : 'unverified';

      // Parse height as integer
      const heightInt = Number(formData.height_cm) || 165;
      const incomeStr = formData.annual_income ? String(formData.annual_income) : null;

      const profilePayload: Record<string, any> = {
        user_id: user.id,
        first_name: formData.first_name || 'Member',
        last_name: formData.last_name || '',
        gender: formData.gender || 'male',
        date_of_birth: formData.date_of_birth || null,
        height: heightInt,
        marital_status: formData.marital_status || 'never_married',
        mother_tongue: formData.mother_tongue || 'Marathi',
        religion: formData.religion || 'Hindu',
        community: formData.community || null,
        sub_community: formData.sub_community || null,
        gothra: formData.gothra || null,

        education: formData.highest_education || null,
        education_detail: formData.education_detail || null,
        college: formData.college_institution || null,
        occupation: formData.occupation || null,
        employed_in: formData.employed_in || 'Private Sector',
        company: formData.organization_name || null,
        income: incomeStr,
        work_location: formData.work_location || null,

        father_occupation: formData.father_occupation || null,
        mother_occupation: formData.mother_occupation || null,
        family_type: formData.family_type || 'Nuclear',
        family_status: formData.family_status || 'Middle Class',
        brothers_count: Number(formData.brothers_count) || 0,
        sisters_count: Number(formData.sisters_count) || 0,
        married_brothers_count: Number(formData.brothers_married) || 0,
        married_sisters_count: Number(formData.sisters_married) || 0,

        diet: formData.diet || 'Vegetarian',
        smoking: formData.smoking || 'No',
        drinking: formData.drinking || 'No',

        city: formData.current_city || null,
        state: formData.current_state || 'Maharashtra',
        country: formData.current_country || 'India',

        about_me: formData.about_me || null,
        avatar_url: formData.avatar_url || null,
        photos: formData.photos || [],
        photos_hidden: Boolean(formData.photos_hidden),
        aadhaar_number: formData.id_number || null,
        profile_status: profileStatusEnum,
        verification_status: verificationStatusEnum,
        profile_visibility: 'registered_only',
        created_by: 'Self',
        completion_percentage: calculateProfileCompletion(formData),
        updated_at: new Date().toISOString()
      };

      let savedProfileId = profileId;

      if (!savedProfileId) {
        // First check if profile was already created by the auth trigger
        const { data: existingProf } = await (supabase.from('profiles') as any)
          .select('id, profile_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProf?.id) {
          savedProfileId = existingProf.id;
          setProfileId(existingProf.id);
          const { error: updateErr } = await (supabase.from('profiles') as any)
            .update(profilePayload)
            .eq('id', existingProf.id);
          if (updateErr) throw updateErr;
        } else {
          // Insert new profile
          const { data: inserted, error: insertErr } = await (supabase.from('profiles') as any)
            .insert(profilePayload)
            .select('id, profile_id')
            .single();

          if (insertErr) throw insertErr;
          if (inserted) {
            savedProfileId = inserted.id;
            setProfileId(inserted.id);
          }
        }
      } else {
        // Update existing profile
        const { error: updateErr } = await (supabase.from('profiles') as any)
          .update(profilePayload)
          .eq('id', savedProfileId)
          .eq('user_id', user.id);

        if (updateErr) throw updateErr;
      }

      if (refreshProfile) {
        refreshProfile();
      }

      // Save partner preferences if profile id is available
      if (savedProfileId) {
        const prefCities = formData.partner_location
          ? formData.partner_location.split(',').map((c) => c.trim()).filter(Boolean)
          : [];
        const prefEdu = Array.isArray(formData.partner_education)
          ? formData.partner_education.filter((e) => e && e !== 'any')
          : [];
        const prefOcc = Array.isArray(formData.partner_occupation)
          ? formData.partner_occupation.filter((o) => o && o !== 'any')
          : [];
        const prefRel = Array.isArray(formData.partner_religion)
          ? formData.partner_religion
          : [formData.partner_religion || 'Hindu'];
        const prefComm = Array.isArray(formData.partner_communities)
          ? formData.partner_communities.filter((c) => c && c !== 'any')
          : [];
        const prefMarital = Array.isArray(formData.partner_marital_status)
          ? formData.partner_marital_status.filter((m) => m && m !== 'any')
          : ['never_married'];

        const prefPayload: Record<string, any> = {
          profile_id: savedProfileId,
          min_age: Number(formData.partner_min_age) || 18,
          max_age: Number(formData.partner_max_age) || 60,
          min_height: Number(formData.partner_min_height) || 140,
          max_height: Number(formData.partner_max_height) || 210,
          preferred_cities: prefCities,
          preferred_states: ['Maharashtra'],
          preferred_education: prefEdu,
          preferred_occupation: prefOcc,
          preferred_religion: prefRel,
          preferred_community: prefComm,
          preferred_marital_status: prefMarital.length ? prefMarital : ['never_married'],
          other_preferences: formData.partner_notes || null,
          updated_at: new Date().toISOString()
        };

        const { error: prefErr } = await (supabase.from('partner_preferences') as any)
          .upsert(prefPayload, { onConflict: 'profile_id' });

        if (prefErr) {
          console.warn('Partner preferences upsert note:', prefErr.message);
        }
      }

      setLastSaved(new Date());

      if (showNotifications) {
        setSaveSuccessMessage(
          status === 'pending_review'
            ? (language === 'mr' ? 'आपले प्रोफाइल पुनरावलोकनासाठी यशस्वीरीत्या सादर झाले आहे.' : 'Profile submitted for review successfully.')
            : t.profileBuilder.draftSaved
        );
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }

      return true;
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      if (showNotifications) {
        setSaveErrorMessage(err.message || 'Error saving profile.');
        setTimeout(() => setSaveErrorMessage(null), 5000);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Step Validation Logic
  const validateCurrentStep = (stepNumber: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.first_name.trim()) errs.first_name = t('profileBuilder.errFirstNameReq');
      if (!formData.date_of_birth) errs.date_of_birth = t('profileBuilder.errDobReq');
      if (!formData.community) errs.community = t('profileBuilder.errCommunityReq');
    } else if (stepNumber === 2) {
      if (!formData.highest_education) errs.highest_education = t('profileBuilder.errEducationReq');
      if (!formData.occupation) errs.occupation = t('profileBuilder.errOccupationReq');
      if (!formData.annual_income) errs.annual_income = t('profileBuilder.errIncomeReq');
    } else if (stepNumber === 3) {
      if (!formData.father_occupation.trim()) errs.father_occupation = t('profileBuilder.errFatherOccupationReq');
      if (!formData.mother_occupation.trim()) errs.mother_occupation = t('profileBuilder.errMotherOccupationReq');
      if (!formData.family_type) errs.family_type = t('profileBuilder.errFamilyTypeReq');
      if (!formData.family_values) errs.family_values = t('profileBuilder.errFamilyValuesReq');
    } else if (stepNumber === 4) {
      if (!formData.diet) errs.diet = t('profileBuilder.errDietReq');
      if (!formData.smoking) errs.smoking = t('profileBuilder.errSmokingReq');
      if (!formData.drinking) errs.drinking = t('profileBuilder.errDrinkingReq');
    } else if (stepNumber === 5) {
      if (!formData.current_city.trim()) errs.current_city = t('profileBuilder.errCityReq');
      if (!formData.current_state.trim()) errs.current_state = t('profileBuilder.errStateReq');
      if (!formData.native_place.trim()) errs.native_place = t('profileBuilder.errNativePlaceReq');
    } else if (stepNumber === 6) {
      if (!formData.about_me || formData.about_me.trim().length < 50) {
        errs.about_me = t('profileBuilder.errAboutMeMin');
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (validateCurrentStep(currentStep)) {
      await saveProfileToSupabase('draft', false);
      if (currentStep < 9) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && currentStep < 10) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: number) => {
    if (currentStep !== 10) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    await saveProfileToSupabase('draft', true);
  };

  const handleFinalSubmit = async () => {
    // Validate all required steps before final submit
    let hasError = false;
    for (let s = 1; s <= 6; s++) {
      if (!validateCurrentStep(s)) {
        setCurrentStep(s);
        hasError = true;
        setSaveErrorMessage(t('profileBuilder.fillRequiredErrors'));
        setTimeout(() => setSaveErrorMessage(null), 5000);
        break;
      }
    }

    if (hasError) return;

    try {
      setIsSubmitting(true);
      const success = await saveProfileToSupabase('pending_review', true);
      if (success) {
        setCurrentStep(10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = calculateProfileCompletion(formData);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-marathi-red animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-700">
          {t('profileBuilder.loadingProfile')}...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notifications */}
      {saveSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--color-success, #1E824C)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} />
          {saveSuccessMessage}
        </div>
      )}

      {saveErrorMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--color-danger, #C0392B)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={18} />
          {saveErrorMessage}
        </div>
      )}

      {/* Stepper Header */}
      <StepperHeader
        currentStep={currentStep}
        totalSteps={10}
        completionPercentage={currentStep === 10 ? 100 : completionPercentage}
        onStepClick={handleJumpToStep}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onSaveDraft={handleSaveDraft}
      />

      {/* Step Content Container */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid var(--color-border, #E8DFC8)',
          boxShadow: '0 4px 20px rgba(122, 31, 61, 0.05)',
          padding: '32px 36px',
        }}
      >
        {currentStep === 1 && (
          <Step1BasicDetails
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2EducationCareer
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3FamilyDetails
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Lifestyle
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <Step5Location
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 6 && (
          <Step6AboutMe
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 7 && (
          <Step7PartnerPreferences
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 8 && (
          <Step8ReviewSubmit
            data={formData}
            onJumpToStep={handleJumpToStep}
            completionPercentage={completionPercentage}
          />
        )}
        {currentStep === 9 && (
          <Step9IdentityVerification
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 10 && (
          <Step10ProfileSubmitted
            profileId={profileId}
            firstName={formData.first_name}
          />
        )}

        {/* Navigation Footer (hidden on confirmation screen Step 10) */}
        {currentStep < 10 && (
          <StepFooter
            onPrevious={currentStep > 1 ? handlePrevious : undefined}
            onNext={currentStep === 9 ? handleFinalSubmit : handleNext}
            onSaveDraft={handleSaveDraft}
            prevLabel={t('profileBuilder.previous')}
            nextLabel={
              currentStep === 8
                ? language === 'mr'
                  ? 'पडताळणीकडे जा'
                  : 'Proceed to Verification'
                : currentStep === 9
                ? t('profileBuilder.finalSubmit')
                : t('profileBuilder.next')
            }
            saveDraftLabel={t('profileBuilder.saveDraft')}
            isSavingDraft={isSaving}
            isSubmitting={isSubmitting}
            showPrevious={currentStep > 1}
            showSaveDraft={true}
          />
        )}
      </div>
    </div>
  );
};
