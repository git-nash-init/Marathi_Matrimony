import React from 'react';
import { Check, Clock, Save, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';

interface StepperHeaderProps {
  currentStep: number;
  totalSteps?: number;
  completionPercentage: number;
  onSelectStep?: (step: number) => void;
  onStepClick?: (step: number) => void;
  onSaveDraft: () => void;
  isSavingDraft?: boolean;
  isSaving?: boolean;
  lastSavedTime?: Date | null;
  lastSaved?: Date | null;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  totalSteps = 10,
  completionPercentage,
  onSelectStep,
  onStepClick,
  onSaveDraft,
  isSavingDraft,
  isSaving,
  lastSavedTime,
  lastSaved,
}) => {
  const handleStepClick = onSelectStep || onStepClick || (() => {});
  const savingState = isSavingDraft ?? isSaving ?? false;
  const savedTimeState = lastSavedTime ?? lastSaved ?? null;
  const { t, language } = useLanguage();

  const stepTitles = [
    t.profileBuilder.step1,
    t.profileBuilder.step2,
    t.profileBuilder.step3,
    t.profileBuilder.step4,
    t.profileBuilder.step5,
    t.profileBuilder.step6,
    t.profileBuilder.step7,
    t.profileBuilder.step8,
    t.profileBuilder.step9,
    t.profileBuilder.step10,
  ];

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return language === 'mr' ? 'अद्याप नाही' : 'Not yet';
    const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSecs < 10) return t.profileBuilder.justNow;
    if (diffSecs < 60) return language === 'mr' ? `${diffSecs} सेकंदांपूर्वी` : `${diffSecs}s ago`;
    const mins = Math.floor(diffSecs / 60);
    return language === 'mr' ? `${mins} मिनिटांपूर्वी` : `${mins}m ago`;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      border: '1px solid var(--color-border)',
      marginBottom: '28px'
    }}>
      {/* Top Bar: Title, Completion Badge & Save Draft Action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
              {t.profileBuilder.builderTitle}
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {t.profileBuilder.builderSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Last saved status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            backgroundColor: '#F8FAFC',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border-light)'
          }}>
            <Clock size={14} />
            <span>{t.profileBuilder.lastSaved}</span>
            <strong style={{ color: 'var(--color-dark)' }}>{formatLastSaved(savedTimeState)}</strong>
          </div>

          {/* Save Draft Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={savingState}
          >
            <Save size={15} style={{ marginRight: '6px' }} />
            {savingState ? t.profileBuilder.savingDraft : t.profileBuilder.saveDraft}
          </Button>
        </div>
      </div>

      {/* Progress Bar & Completion % */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.86rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-dark)' }}>
            {t.profileBuilder.completionTitle} <span style={{ color: 'var(--color-primary)' }}>{completionPercentage}%</span>
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {language === 'mr' ? `टप्पा ${currentStep} पैकी ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#E2E8F0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completionPercentage}%`,
            backgroundColor: 'var(--color-primary)',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Stepper Navigation Pills */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '8px',
        paddingBottom: '4px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin'
      }}>
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => handleStepClick(stepNum)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: isActive
                  ? '1.5px solid var(--color-primary)'
                  : isCompleted
                  ? '1px solid #86EFAC'
                  : '1px solid var(--color-border)',
                backgroundColor: isActive
                  ? 'var(--color-primary-light)'
                  : isCompleted
                  ? '#F0FDF4'
                  : '#FAFAF9',
                color: isActive
                  ? 'var(--color-primary)'
                  : isCompleted
                  ? '#15803D'
                  : 'var(--color-text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 600,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--color-primary)' : isCompleted ? '#22C55E' : '#E2E8F0',
                color: isActive || isCompleted ? '#ffffff' : '#64748B',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                flexShrink: 0
              }}>
                {isCompleted ? <Check size={11} strokeWidth={3} /> : stepNum}
              </span>
              <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {title.split('.')[1]?.trim() || title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
