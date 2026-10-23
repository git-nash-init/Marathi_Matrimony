import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  className?: string;
}

/**
 * Auspicious Kalash Icon (मंगल कलश)
 * Symbol of sanctity, trust, and divine blessing in Maharashtrian weddings.
 */
export const KalashIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Coconut on top */}
    <ellipse cx="12" cy="5" rx="3.5" ry="3.5" stroke={color} strokeWidth="1.5" />
    <path d="M12 1.5L12 4.5M10 2.5L11.5 4.5M14 2.5L12.5 4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    {/* Mango leaves (आम्रपर्ण) */}
    <path d="M8.5 7C7 5 5 7 7 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M15.5 7C17 5 19 7 17 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    {/* Pot (घट / कलश) */}
    <path
      d="M7 8H17C17 8 19 12 19 16C19 19.5 16 21 12 21C8 21 5 19.5 5 16C5 12 7 8 7 8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Swastika / Auspicious mark on Kalash */}
    <path d="M12 11V17M9 14H15" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/**
 * Verified Heritage Shield (प्रमाणित कवच)
 */
export const VerifiedShieldIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 2L4 5.5V11.5C4 16.5 7.4 21.2 12 22.5C16.6 21.2 20 16.5 20 11.5V5.5L12 2Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M9 12L11 14L15.5 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Auspicious Wedding Union Rings & Mangalsutra Motif (विवाह बंधन)
 */
export const WeddingUnionIcon: React.FC<IconProps> = ({ size = 22, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="9" cy="13" r="5.5" stroke={color} strokeWidth="1.5" />
    <circle cx="15" cy="13" r="5.5" stroke={color} strokeWidth="1.5" />
    <path d="M9 5L9.5 7.5H8.5L9 5Z" fill={color} />
    <circle cx="9" cy="5" r="1.5" stroke={color} strokeWidth="1" />
  </svg>
);

/**
 * Horoscope / Kundli Scroll Icon (कुंडली पत्रिका)
 */
export const HoroscopeScrollIcon: React.FC<IconProps> = ({ size = 22, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M4 3L20 21M20 3L4 21" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <rect x="8" y="7" width="8" height="10" stroke={color} strokeWidth="1.3" />
    <path d="M12 7V17M8 12H16" stroke={color} strokeWidth="1.2" />
  </svg>
);

/**
 * Maratha Community Crest Icon (९६ कुळी मराठा राजमुद्रा प्रतीक)
 */
export const MarathaCrestIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Octagonal Fort/Mudras outline (अष्टकोनी राजमुद्रा) */}
    <polygon
      points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
    {/* Auspicious Sun / Surya Kiran */}
    <circle cx="12" cy="12" r="2.5" fill={color} />
  </svg>
);

/**
 * Sacred Heart / Interest Icon (पसंती)
 */
export const ExpressInterestIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Shortlist Bookmark Icon (शॉर्टलिस्ट)
 */
export const ShortlistBookmarkIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4C5 3.44772 5.44772 3 6 3Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * WhatsApp Direct Assistance Icon
 */
export const WhatsAppCrestIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.39 17.07L2.1 21.9L7.07 20.63C8.52 21.5 10.2 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 9.5C8.5 9.5 9 10.5 9.5 11.5C10 12.5 11.5 14 12.5 14.5C13.5 15 14.5 15.5 14.5 15.5L16 14C16.5 13.5 15.5 12.5 14.5 12C13.5 11.5 13 12 12.5 12C12 12 11.5 11.5 11 11C10.5 10.5 10 9.5 10.5 9C10.5 8.5 10 7.5 9.5 7.5L8.5 9.5Z"
      fill={color}
    />
  </svg>
);

/**
 * Location Pin Icon
 */
export const LocationPinIcon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill={color}
    />
  </svg>
);

/**
 * Search Icon
 */
export const MatrimonySearchIcon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
    <path d="M16.5 16.5L21.5 21.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Protected Privacy Lock (सुरक्षित गोपनीयता)
 */
export const PrivacyLockIcon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill={color} />
  </svg>
);
