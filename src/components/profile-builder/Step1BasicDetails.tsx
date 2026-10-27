import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import { storageService } from '../../services/storage.service';
import {
  COMMUNITY_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MANGLIK_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  RELIGION_OPTIONS,
  calculateAgeFromDob,
  cmToFeetInches,
  OptionItem,
} from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { SegmentedControl } from '../common/SegmentedControl';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import {
  User,
  Calendar,
  Ruler,
  Award,
  Heart,
  Camera,
  Image as ImageIcon,
  Trash2,
  Upload,
  Lock,
  Eye,
  Loader2,
} from 'lucide-react';

interface Step1Props {
  data?: ProfileFormData;
  formData?: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export const Step1BasicDetails: React.FC<Step1Props> = ({
  data,
  formData: propFormData,
  onChange,
  errors = {},
}) => {
  const formData = data || propFormData || ({} as ProfileFormData);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const calculatedAge = calculateAgeFromDob(formData.date_of_birth);

  const [uploadingSlot, setUploadingSlot] = useState<'avatar' | 'photo1' | 'photo2' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const photo1InputRef = useRef<HTMLInputElement | null>(null);
  const photo2InputRef = useRef<HTMLInputElement | null>(null);

  const gallery = formData.photos || [];
  const photo1Url = gallery[0] || '';
  const photo2Url = gallery[1] || '';

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'avatar' | 'photo1' | 'photo2'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingSlot(slot);

    const userId = user?.id || 'anonymous_user';

    try {
      const publicUrl = await storageService.uploadProfilePhoto(
        userId,
        file,
        slot === 'avatar' ? 'avatar' : slot === 'photo1' ? 'photo_1' : 'photo_2'
      );

      if (publicUrl) {
        if (slot === 'avatar') {
          onChange('avatar_url', publicUrl);
        } else if (slot === 'photo1') {
          const nextGallery = [publicUrl, photo2Url].filter(Boolean);
          onChange('photos', nextGallery);
        } else if (slot === 'photo2') {
          const nextGallery = [photo1Url, publicUrl].filter(Boolean);
          onChange('photos', nextGallery);
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Photo upload failed. Please try again.');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (slot: 'avatar' | 'photo1' | 'photo2') => {
    if (slot === 'avatar') {
      onChange('avatar_url', '');
    } else if (slot === 'photo1') {
      const nextGallery = ['', photo2Url].filter(Boolean);
      onChange('photos', nextGallery);
    } else if (slot === 'photo2') {
      const nextGallery = [photo1Url, ''].filter(Boolean);
      onChange('photos', nextGallery);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={1}
        totalSteps={10}
        title={t('profileBuilder.step1Title')}
        subtitle={t('profileBuilder.step1Subtitle')}
        icon={<User size={22} />}
      />

      {/* SECTION 1: Basic Information / प्राथमिक माहिती */}
      <SectionCard
        title={language === 'mr' ? 'प्राथमिक माहिती' : 'Basic Information'}
        subtitle={language === 'mr' ? 'प्रोफाइल धारकाची मूलभूत ओळख' : 'Profile ownership & personal identity'}
        icon={<User size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile For */}
          <SegmentedControl
            label={t('profileBuilder.profileFor')}
            required
            value={formData.profile_for || 'self'}
            onChange={(val) => onChange('profile_for', val)}
            options={[
              { value: 'self', label: t('auth.myself') },
              { value: 'son', label: t('auth.son') },
              { value: 'daughter', label: t('auth.daughter') },
              { value: 'brother', label: t('auth.brother') },
              { value: 'sister', label: t('auth.sister') },
              { value: 'relative', label: t('auth.relative') },
            ]}
          />

          {/* Gender Selection Cards */}
          <SegmentedControl
            label={t('profileBuilder.gender')}
            required
            size="lg"
            columns={2}
            value={formData.gender || 'female'}
            onChange={(val) => onChange('gender', val)}
            options={[
              {
                value: 'female',
                label: t('auth.bride'),
                sublabel: language === 'mr' ? 'वधू (स्त्री)' : 'Female (Bride)',
              },
              {
                value: 'male',
                label: t('auth.groom'),
                sublabel: language === 'mr' ? 'वर (पुरुष)' : 'Male (Groom)',
              },
            ]}
          />

          {/* First Name & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              label={t('profileBuilder.firstName')}
              required
              value={formData.first_name || ''}
              onChange={(e) => onChange('first_name', e.target.value)}
              error={errors.first_name}
              placeholder={language === 'mr' ? 'उदा. राहुल / प्राजक्ता' : 'e.g. Rahul / Prajakta'}
              maxLength={60}
            />

            <FormInput
              label={t('profileBuilder.lastName')}
              value={formData.last_name || ''}
              onChange={(e) => onChange('last_name', e.target.value)}
              placeholder={language === 'mr' ? 'उदा. जोशी / कदम / पाटील' : 'e.g. Joshi / Kadam / Patil'}
              maxLength={60}
            />
          </div>

          {/* ── PHOTO UPLOAD & VISIBILITY CARD ── */}
          <div
            style={{
              marginTop: '10px',
              padding: '20px',
              backgroundColor: '#FAF7F0',
              border: '1.5px dashed #D4AF37',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Camera size={18} color="var(--color-primary, #800020)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary, #800020)', margin: 0 }}>
                  {language === 'mr' ? 'प्रोफाइल छायाचित्रे जोडा (Photos)' : 'Add Profile Photos'}
                </h4>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  {language === 'mr' ? '३ फोटो पर्यंत' : 'Up to 3 Photos'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                {language === 'mr'
                  ? 'मुख्य प्रोफाइल फोटो नेव्हिगेशन बार व शोध परिणामांमध्ये दिसेल. आपण २ अतिरिक्त गॅलरी फोटो देखील जोडू शकता.'
                  : 'Your main profile picture will appear in the navigation bar & search results. You can also add 2 additional gallery photos.'}
              </p>
            </div>

            {uploadError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  color: '#B91C1C',
                  fontSize: '0.82rem',
                }}
              >
                {uploadError}
              </div>
            )}

            {/* Photos Grid: 1 Primary Avatar + 2 Gallery Slots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {/* 1. Main Avatar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: formData.avatar_url ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '10px' }}>
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Profile Avatar"
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #C59A45',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        backgroundColor: '#F1E5D1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#800020',
                      }}
                    >
                      <Camera size={32} />
                    </div>
                  )}

                  {uploadingSlot === 'avatar' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Loader2 size={24} className="animate-spin text-amber-700" />
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  {language === 'mr' ? 'मुख्य फोटो' : 'Profile Picture'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '10px' }}>
                  {language === 'mr' ? 'हेडर व कार्डवर दिसेल' : 'Shown in header'}
                </span>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoUpload(e, 'avatar')}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingSlot === 'avatar'}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-primary, #800020)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>{formData.avatar_url ? (language === 'mr' ? 'बदला' : 'Change') : (language === 'mr' ? 'अपलोड' : 'Upload')}</span>
                  </button>

                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto('avatar')}
                      title={language === 'mr' ? 'काढून टाका' : 'Remove'}
                      style={{
                        padding: '5px 8px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Gallery Photo 2 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: photo1Url ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '10px' }}>
                  {photo1Url ? (
                    <img
                      src={photo1Url}
                      alt="Gallery Photo 2"
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1.5px solid #E2E8F0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '10px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px dashed #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <ImageIcon size={28} />
                    </div>
                  )}

                  {uploadingSlot === 'photo1' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Loader2 size={24} className="animate-spin text-amber-700" />
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  {language === 'mr' ? 'फोटो २' : 'Photo 2'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '10px' }}>
                  {language === 'mr' ? 'अतिरिक्त गॅलरी फोटो' : 'Additional gallery'}
                </span>

                <input
                  ref={photo1InputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoUpload(e, 'photo1')}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => photo1InputRef.current?.click()}
                    disabled={uploadingSlot === 'photo1'}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: photo1Url ? '#475569' : 'var(--color-primary, #800020)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>{photo1Url ? (language === 'mr' ? 'बदला' : 'Change') : (language === 'mr' ? 'जोडा' : 'Add')}</span>
                  </button>

                  {photo1Url && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto('photo1')}
                      title={language === 'mr' ? 'काढून टाका' : 'Remove'}
                      style={{
                        padding: '5px 8px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Gallery Photo 3 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: photo2Url ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '10px' }}>
                  {photo2Url ? (
                    <img
                      src={photo2Url}
                      alt="Gallery Photo 3"
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1.5px solid #E2E8F0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '10px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px dashed #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <ImageIcon size={28} />
                    </div>
                  )}

                  {uploadingSlot === 'photo2' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Loader2 size={24} className="animate-spin text-amber-700" />
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  {language === 'mr' ? 'फोटो ३' : 'Photo 3'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '10px' }}>
                  {language === 'mr' ? 'अतिरिक्त गॅलरी फोटो' : 'Additional gallery'}
                </span>

                <input
                  ref={photo2InputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoUpload(e, 'photo2')}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => photo2InputRef.current?.click()}
                    disabled={uploadingSlot === 'photo2'}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: photo2Url ? '#475569' : 'var(--color-primary, #800020)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>{photo2Url ? (language === 'mr' ? 'बदला' : 'Change') : (language === 'mr' ? 'जोडा' : 'Add')}</span>
                  </button>

                  {photo2Url && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto('photo2')}
                      title={language === 'mr' ? 'काढून टाका' : 'Remove'}
                      style={{
                        padding: '5px 8px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy Toggle: Hide photos from public view */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: formData.photos_hidden ? '#EFF6FF' : '#FFFFFF',
                borderRadius: '8px',
                border: formData.photos_hidden ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
              onClick={() => onChange('photos_hidden', !formData.photos_hidden)}
            >
              <input
                type="checkbox"
                id="photos_hidden_toggle"
                checked={Boolean(formData.photos_hidden)}
                onChange={(e) => onChange('photos_hidden', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary, #800020)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label
                  htmlFor="photos_hidden_toggle"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: formData.photos_hidden ? '#1D4ED8' : '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {formData.photos_hidden ? <Lock size={15} color="#1D4ED8" /> : <Eye size={15} color="#64748B" />}
                  <span>{language === 'mr' ? 'माझे फोटो सार्वजनिक दृश्यापासून लपवा' : 'Hide my photos from public view'}</span>
                </label>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  {language === 'mr'
                    ? 'सक्रिय केल्यास, आपले फोटो केवळ पडताळणी झालेले सदस्यच पाहू शकतील.'
                    : 'When checked, your photos will only be visible to verified members. Others see a protected lock placeholder.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: Birth & Physical Details / जन्म व शारीरिक तपशील */}
      <SectionCard
        title={language === 'mr' ? 'जन्म व शारीरिक तपशील' : 'Birth & Physical Details'}
        subtitle={language === 'mr' ? 'जन्मतारीख, वय, उंची व वैवाहिक स्थिती' : 'Date of birth, age, height & marital status'}
        icon={<Calendar size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: DOB & Height */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              type="date"
              label={t('profileBuilder.dob')}
              required
              value={formData.date_of_birth || ''}
              onChange={(e) => onChange('date_of_birth', e.target.value)}
              error={errors.date_of_birth}
              prefix={<Calendar size={16} />}
              badge={
                calculatedAge !== null ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: calculatedAge >= 18 ? '#15803D' : '#DC2626',
                      background: calculatedAge >= 18 ? '#DCFCE7' : '#FEE2E2',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {t('profileBuilder.ageLabel')} {calculatedAge} {language === 'mr' ? 'वर्षे' : 'years'}
                  </span>
                ) : null
              }
            />

            <FormInput
              type="number"
              min={120}
              max={230}
              label={t('profileBuilder.heightCm')}
              required
              value={formData.height_cm || ''}
              onChange={(e) => onChange('height_cm', e.target.value ? parseInt(e.target.value, 10) : null)}
              error={errors.height_cm}
              placeholder="165"
              prefix={<Ruler size={16} />}
              badge={
                formData.height_cm && formData.height_cm > 0 ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-primary, #7A1F3D)',
                      background: 'var(--color-primary-light, #FAF0F3)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {cmToFeetInches(formData.height_cm)}
                  </span>
                ) : null
              }
            />
          </div>

          {/* Row 2: Marital Status & Mother Tongue */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.maritalStatus')}
              required
              value={formData.marital_status || 'never_married'}
              onChange={(e) => onChange('marital_status', e.target.value)}
              prefix={<Heart size={16} />}
              options={MARITAL_STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />

            <FormSelect
              label={t('profileBuilder.motherTongue')}
              required
              value={formData.mother_tongue || 'Marathi'}
              onChange={(e) => onChange('mother_tongue', e.target.value)}
              options={MOTHER_TONGUE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 3: Religion, Community & Horoscope / धर्म, जात व जन्मपत्रिका */}
      <SectionCard
        title={language === 'mr' ? 'धर्म, जात व जन्मपत्रिका' : 'Religion, Community & Horoscope'}
        subtitle={language === 'mr' ? 'जात, गोत्र, मांगलिक स्थिती व पत्रिका' : 'Community, sub-caste, manglik & horoscope details'}
        icon={<Award size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: Religion & Community */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.religion')}
              value={formData.religion || 'Hindu'}
              onChange={(e) => onChange('religion', e.target.value)}
              options={RELIGION_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />

            <FormSelect
              label={t('profileBuilder.community')}
              required
              value={formData.community || ''}
              onChange={(e) => onChange('community', e.target.value)}
              error={errors.community}
              placeholder={`-- ${language === 'mr' ? 'जात निवडा' : 'Select Community'} --`}
              options={COMMUNITY_OPTIONS.map((opt: OptionItem) => ({
                value: opt.id,
                label: language === 'mr' ? opt.mr : opt.en,
              }))}
            />
          </div>

          {/* Row 2: Sub-Community & Manglik Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              label={t('profileBuilder.subCommunity')}
              value={formData.sub_community || ''}
              onChange={(e) => onChange('sub_community', e.target.value)}
              placeholder={language === 'mr' ? 'उदा. ९६ कुळी / कौशिक गोत्र / शाखा' : 'e.g. 96 Kuli / Kaushik Gotra'}
              maxLength={80}
            />

            <FormSelect
              label={t('profileBuilder.manglik')}
              value={formData.manglik || 'no'}
              onChange={(e) => onChange('manglik', e.target.value)}
              options={MANGLIK_OPTIONS.map((opt: OptionItem) => ({
                value: opt.id,
                label: language === 'mr' ? opt.mr : opt.en,
              }))}
            />
          </div>

          {/* Horoscope Available Toggle Card */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--color-secondary-light, #FAF5E8)',
              border: '1.5px solid rgba(197, 154, 69, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
            onClick={() => onChange('horoscope_match_required', !formData.horoscope_match_required)}
          >
            <input
              type="checkbox"
              id="horoscope_toggle"
              checked={formData.horoscope_match_required !== false}
              onChange={(e) => onChange('horoscope_match_required', e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--color-primary, #7A1F3D)',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="horoscope_toggle"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--color-secondary-hover, #AA8232)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} />
              {t('profileBuilder.horoscopeAvailable')}
            </label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
