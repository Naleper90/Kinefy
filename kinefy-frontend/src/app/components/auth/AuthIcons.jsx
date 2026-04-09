import React from 'react';

/**
 * Modern 'K' Brand Icon + Text Label (Purist Version)
 */
export const KinefyLogo = ({ className = "auth__branding" }) => (
    <div className={className}>
        <svg className="auth__logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4v16M17 4l-10 8 10 8" />
        </svg>
        <span className="auth__logo-text">Kinefy</span>
    </div>
);

export const BlobIcon = ({ className = "", color = "var(--color-brand)" }) => (
    <svg className={className} viewBox="0 0 100 100" fill={color}>
        <path d="M90 50 Q 85 85, 50 90 Q 15 85, 10 50 Q 15 15, 50 10 Q 85 15, 90 50" opacity="0.3" />
        <path d="M85 55 Q 75 75, 45 80 Q 20 75, 25 50 Q 20 25, 50 15 Q 80 25, 85 55" />
    </svg>
);

/**
 * Delicada rama de olivo minimalista (Ilustración lineal de autor)
 */
export const OliveBranch = ({ className = "" }) => (
    <svg className={className} viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Tallo central */}
        <path d="M10 30 Q 30 25, 90 10" />
        {/* Hojas */}
        <path d="M25 25 Q 20 15, 30 15 Q 35 20, 30 25" />
        <path d="M45 20 Q 40 10, 50 10 Q 55 15, 50 20" />
        <path d="M65 15 Q 60 5, 70 5 Q 75 10, 70 15" />
        <path d="M85 10 Q 80 0, 95 0 Q 98 5, 90 10" />
        {/* Hojas inferiores */}
        <path d="M35 28 Q 45 35, 30 38 Q 25 33, 35 28" />
        <path d="M55 23 Q 65 30, 50 33 Q 45 28, 55 23" />
        <path d="M75 18 Q 85 25, 70 28 Q 65 23, 75 18" />
    </svg>
);
