import React from 'react';
import styles from './BrandLogo.module.css';

interface BrandLogoProps {
  size?: number;
  variant?: 'mark' | 'horizontal' | 'vertical';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Professional, simple, and culturally authentic logo for Sanaibandh (सनईबंध).
 * Features:
 * - Royal Maratha octagonal crest (अष्टकोनी राजमुद्रा)
 * - Twin auspicious Sanai (सनई / Shehnai) in heraldic symmetry
 * - Central Reshimgath / Sacred Marital Knot (रेशीमगाठ - विवाह बंधन)
 * - Golden Surya / Mangal Tilak at the zenith
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 44,
  variant = 'mark',
  theme = 'auto',
  className = '',
  showSubtitle = true,
}) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.logoSvg}
      aria-label="Sanaibandh Logo"
    >
      <defs>
        {/* Regal Oxblood Gradient */}
        <linearGradient id="sbCrestBg" x1="15" y1="10" x2="105" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A1E24" />
          <stop offset="50%" stopColor="#6C1419" />
          <stop offset="100%" stopColor="#4A0B0E" />
        </linearGradient>

        {/* Master Gold Gradient */}
        <linearGradient id="sbGoldSheen" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9E8B2" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B38928" />
          <stop offset="100%" stopColor="#DFBF6C" />
        </linearGradient>

        {/* Lighter Gold Accent */}
        <linearGradient id="sbGoldLight" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#FFF2CE" />
          <stop offset="100%" stopColor="#C99B2D" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id="sbShadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#260406" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Royal Maratha Octagonal Crest */}
      <polygon
        points="35,10 85,10 110,35 110,85 85,110 35,110 10,85 10,35"
        fill="url(#sbCrestBg)"
        stroke="url(#sbGoldSheen)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#sbShadow)"
      />

      {/* Inner Decorative Golden Border */}
      <polygon
        points="38,16 82,16 104,38 104,82 82,104 38,104 16,82 16,38"
        fill="none"
        stroke="url(#sbGoldLight)"
        strokeWidth="1"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Tiny Corner Star Embellishments */}
      <circle cx="60" cy="16" r="1.5" fill="url(#sbGoldLight)" />
      <circle cx="60" cy="104" r="1.5" fill="url(#sbGoldLight)" />
      <circle cx="16" cy="60" r="1.5" fill="url(#sbGoldLight)" />
      <circle cx="104" cy="60" r="1.5" fill="url(#sbGoldLight)" />

      {/* Zenith Auspicious Surya / Mangal Tilak */}
      <circle cx="60" cy="27" r="4.5" fill="url(#sbGoldLight)" />
      <path
        d="M60 19 L61.5 24 L60 25.5 L58.5 24 Z"
        fill="url(#sbGoldLight)"
      />

      {/* Left Auspicious Sanai (सनई - Shehnai) */}
      {/* Bell at top-left, body angling down-right */}
      <path
        d="M32 36 C35 34 40 37 42 41 L67 76 C68 77.5 67 80 65 80 L62 80 C60 80 59 78.5 58 77 L33 42 C30 38 30 37 32 36 Z"
        fill="url(#sbGoldSheen)"
      />
      {/* Left Sanai Bell Opening Rim */}
      <ellipse cx="34" cy="37" rx="5.5" ry="3" transform="rotate(-35 34 37)" fill="#58111A" stroke="url(#sbGoldLight)" strokeWidth="1.2" />
      {/* Left Sanai Sound Holes */}
      <circle cx="46" cy="51" r="1.2" fill="#58111A" />
      <circle cx="51" cy="58" r="1.2" fill="#58111A" />
      <circle cx="56" cy="65" r="1.2" fill="#58111A" />

      {/* Right Auspicious Sanai (सनई - Shehnai) */}
      {/* Bell at top-right, body angling down-left */}
      <path
        d="M88 36 C85 34 80 37 78 41 L53 76 C52 77.5 53 80 55 80 L58 80 C60 80 61 78.5 62 77 L87 42 C90 38 90 37 88 36 Z"
        fill="url(#sbGoldSheen)"
      />
      {/* Right Sanai Bell Opening Rim */}
      <ellipse cx="86" cy="37" rx="5.5" ry="3" transform="rotate(35 86 37)" fill="#58111A" stroke="url(#sbGoldLight)" strokeWidth="1.2" />
      {/* Right Sanai Sound Holes */}
      <circle cx="74" cy="51" r="1.2" fill="#58111A" />
      <circle cx="69" cy="58" r="1.2" fill="#58111A" />
      <circle cx="64" cy="65" r="1.2" fill="#58111A" />

      {/* Central Sacred Marital Knot / Reshimgath (रेशीमगाठ - विवाह बंधन) */}
      {/* An interlocking infinity-style golden marriage union knot */}
      <path
        d="M52 64 C48 59 44 65 48 70 C53 76 67 76 72 70 C76 65 72 59 68 64 C64 69 56 69 52 64 Z"
        fill="none"
        stroke="url(#sbGoldLight)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="66" r="3.2" fill="url(#sbGoldLight)" />

      {/* Lower Flourish / Sacred Kalash Base */}
      <path
        d="M48 91 C54 94 66 94 72 91"
        stroke="url(#sbGoldSheen)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="60" cy="94" r="1.8" fill="url(#sbGoldLight)" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`${styles.logoMarkWrapper} ${className}`}>{mark}</div>;
  }

  return (
    <div className={`${styles.logoLockup} ${styles[variant]} ${styles[theme]} ${className}`}>
      {mark}
      <div className={styles.textGroup}>
        <span className={styles.brandNameDevanagari}>सनईबंध</span>
        <span className={styles.brandNameEnglish}>SANAIBANDH</span>
        {showSubtitle && (
          <span className={styles.brandSubText}>९६ कुळी मराठा विवाह संस्था</span>
        )}
      </div>
    </div>
  );
};
