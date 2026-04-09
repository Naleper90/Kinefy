import React from 'react';

export const HomeIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

export const PatientsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export const AppointmentsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export const ExercisesIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12M6 12h12M6 17h12" />
        <path d="M4 7h1l1 1-1 1H4" />
        <path d="M4 12h1l1 1-1 1H4" />
        <path d="M4 17h1l1 1-1 1H4" />
    </svg>
);

export const ReportsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

export const SearchIcon = ({ className = "header__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export const BellIcon = ({ className = "header__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

export const KneeIcon = ({ size = 28, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 40 56"
        fill="none" stroke="#1A2E35" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16,2 C14,2 12,4 13,8 L15,22" />
        <path d="M24,2 C26,2 28,4 27,8 L25,22" />
        <path d="M13,8 C11,10 10,13 10,16 C10,19 11,21 13,22 L15,22" />
        <path d="M27,8 C29,10 30,13 30,16 C30,19 29,21 27,22 L25,22" />
        <ellipse cx="20" cy="24" rx="5" ry="4" strokeWidth="1.2"/>
        <path d="M15,28 C14,30 14,35 15,40 L17,52" />
        <path d="M25,28 C26,30 26,35 25,40 L23,52" />
        <path d="M15,22 L25,28" strokeWidth="0.9" opacity="0.6"/>
        <path d="M25,22 L15,28" strokeWidth="0.9" opacity="0.6"/>
        <path d="M15,52 C15,54 18,55 20,55 C22,55 25,54 25,52 L23,52" />
    </svg>
);

export const LeafIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98D2C1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20L7 14.8C7 14.8 6 13.8 6 12C6 10.2 7 9.2 7 9.2L11 4M13 20L17 14.8C17 14.8 18 13.8 18 12C18 10.2 17 9.2 17 9.2L13 4M12 20V4" />
    </svg>
);

export const LogoutIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const EvolutionIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);

export const DocsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
);

export const SketchUserIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7c-2.2 0-3.8 1.5-3.8 3.5s1.5 4 3.8 4 4.1-1.5 4.1-3.5S14.2 7 12 7z" />
        <path d="M6 19c0-2.5 3-4 6-4s6 1.5 6 4" />
        <path d="M10.5 7.2c-1.5 0.2-2.3 0.8-2.3 1.8" opacity="0.4" />
    </svg>
);

export const BlobIcon = ({ className = "", color = "#EBF5F1" }) => (
    <svg className={className} viewBox="0 0 100 100" fill={color}>
        <path d="M90 50 Q 85 85, 50 90 Q 15 85, 10 50 Q 15 15, 50 10 Q 85 15, 90 50" opacity="0.4" />
        <path d="M85 55 Q 75 75, 45 80 Q 20 75, 25 50 Q 20 25, 50 15 Q 80 25, 85 55" />
    </svg>
);
