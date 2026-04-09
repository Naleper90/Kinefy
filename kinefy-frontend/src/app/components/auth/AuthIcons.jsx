import React from 'react';

/**
 * Modern 'K' Brand Icon + Text Label (Purist Version)
 */
export const KinefyLogo = ({ className = "auth__branding" }) => (
    <div className={className}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width: '26px', height: '26px', color: 'var(--color-brand)'}}>
            <path d="M7 4v16M17 4l-10 8 10 8" />
        </svg>
        <span style={{
            fontSize: '1.2rem', 
            fontWeight: '600', 
            color: 'var(--color-text-dark)', 
            fontFamily: 'var(--font-main)'
        }}>Kinefy</span>
    </div>
);

/**
 * Botanical Decoration (Olive Branch) - Fixed Typo in Class
 */
export const BotanicalDecoration = ({ className = "auth__ornament-svg" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20C12 20 18 14 24 12C30 10 36 4 44 4" opacity="0.3" />
        <path d="M12 16L9 13M36 8L39 11M16 13L14 11M32 11L34 13" />
        <path d="M20 12C20 12 18 10 18 8C18 6 20 6 20 6C20 6 22 6 22 8C22 10 20 12 20 12Z" />
        <path d="M28 10C28 10 26 8 26 6C26 4 28 4 28 4C28 4 30 4 30 6C30 8 28 10 28 10Z" />
    </svg>
);
