import React from 'react';

export interface StepFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  saveDraftLabel?: string;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  showPrevious?: boolean;
  showSaveDraft?: boolean;
  nextDisabled?: boolean;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  onPrevious,
  onNext,
  onSaveDraft,
  prevLabel = 'Previous',
  nextLabel = 'Save & Next',
  saveDraftLabel = 'Save Draft',
  isSavingDraft = false,
  isSubmitting = false,
  showPrevious = true,
  showSaveDraft = true,
  nextDisabled = false,
}) => {
  return (
    <div
      style={{
        marginTop: '32px',
        paddingTop: '20px',
        borderTop: '1.5px solid var(--color-border-light, #F0EAE1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>
        {showPrevious && onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            style={{
              minHeight: '48px',
              padding: '12px 22px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              border: '1.5px solid var(--color-border, #E8DFC8)',
              background: '#FFFFFF',
              color: 'var(--color-dark, #242124)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 1px 3px rgba(36, 33, 36, 0.03)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg, #FAF7F2)';
              e.currentTarget.style.borderColor = 'var(--color-secondary, #C59A45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--color-border, #E8DFC8)';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
            </svg>
            {prevLabel}
          </button>
        ) : (
          <div />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {showSaveDraft && onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            style={{
              minHeight: '48px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              border: '1.5px solid var(--color-primary-subtle, #F3DEE5)',
              background: 'var(--color-primary-light, #FAF0F3)',
              color: 'var(--color-primary, #7A1F3D)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isSavingDraft ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              opacity: isSavingDraft ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSavingDraft) {
                e.currentTarget.style.background = '#F3DEE5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSavingDraft) {
                e.currentTarget.style.background = 'var(--color-primary-light, #FAF0F3)';
              }
            }}
          >
            {isSavingDraft ? (
              <>
                <svg
                  style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" opacity="0.75" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {saveDraftLabel}
              </>
            )}
          </button>
        )}

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || isSubmitting}
            style={{
              minHeight: '48px',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'inherit',
              border: 'none',
              background: 'var(--color-primary, #7A1F3D)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: nextDisabled || isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 4px 14px rgba(122, 31, 61, 0.28)',
              opacity: nextDisabled || isSubmitting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!nextDisabled && !isSubmitting) {
                e.currentTarget.style.background = 'var(--color-primary-hover, #60142E)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!nextDisabled && !isSubmitting) {
                e.currentTarget.style.background = 'var(--color-primary, #7A1F3D)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" opacity="0.75" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                {nextLabel}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
