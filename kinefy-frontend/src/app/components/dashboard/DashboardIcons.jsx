import React from 'react';

// Icono de Casa / Inicio
export const HomeIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

// Icono de Pacientes / Usuarios
export const PatientsIcon = ({ className = "dashboard__icon", size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

// Icono de Citas / Agenda
export const AppointmentsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

// Icono de Ejercicios / Rutinas
export const ExercisesIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12M6 12h12M6 17h12" />
        <path d="M4 7h1l1 1-1 1H4" />
        <path d="M4 12h1l1 1-1 1H4" />
        <path d="M4 17h1l1 1-1 1H4" />
    </svg>
);

// Icono de Informes / Documentos
export const ReportsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

// Icono de Búsqueda
export const SearchIcon = ({ className = "dashboard__icon", size = 18, strokeWidth = 1.2 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Icono de Campana / Notificaciones
export const BellIcon = ({ className = "header__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

// Icono Anatómico de Rodilla
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

// Icono de Hoja / Salud
export const LeafIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98D2C1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20L7 14.8C7 14.8 6 13.8 6 12C6 10.2 7 9.2 7 9.2L11 4M13 20L17 14.8C17 14.8 18 13.8 18 12C18 10.2 17 9.2 17 9.2L13 4M12 20V4" />
    </svg>
);

// Icono de Cerrar Sesión
export const LogoutIcon = ({ className = "dashboard__icon", size = 20 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

// Icono de Evolución / Pulso
export const EvolutionIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);

// Icono de Documentos / PDFs
export const DocsIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
);

// Icono de Usuario (Estilo Sketch)
export const SketchUserIcon = ({ className = "dashboard__icon" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7c-2.2 0-3.8 1.5-3.8 3.5s1.5 4 3.8 4 4.1-1.5 4.1-3.5S14.2 7 12 7z" />
        <path d="M6 19c0-2.5 3-4 6-4s6 1.5 6 4" />
        <path d="M10.5 7.2c-1.5 0.2-2.3 0.8-2.3 1.8" opacity="0.4" />
    </svg>
);

// Icono de Mancha / Avatar Decorativo
export const BlobIcon = ({ className = "", color = "#EBF5F1" }) => (
    <svg className={className} viewBox="0 0 100 100" fill={color}>
        <path d="M90 50 Q 85 85, 50 90 Q 15 85, 10 50 Q 15 15, 50 10 Q 85 15, 90 50" opacity="0.4" />
        <path d="M85 55 Q 75 75, 45 80 Q 20 75, 25 50 Q 20 25, 50 15 Q 80 25, 85 55" />
    </svg>
);

// Icono de Carpeta Estándar
export const FolderIcon = ({ className = "dashboard__icon", size = 20 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

// Icono de Carpeta Clínica (Plus)
export const ClinicalFolderIcon = ({ size = 24, color = "#55A98A" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H9L11 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 11V15M10 13H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="10" y="8" width="4" height="1" rx="0.5" fill={color}/>
    </svg>
);

// Icono de Sumar / Añadir
export const PlusIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

// Icono de Papelera / Borrar
export const TrashIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

// Icono de Ojo / Ver
export const ViewIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

// Icono de Advertencia / Peligro
export const WarningIcon = ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

// Icono de Usuario Estándar
export const UserIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

// Icono de Subida / Carga
export const UploadIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

// Icono de Flecha / Chevron (Multidireccional)
export const ChevronIcon = ({ size = 16, direction = "down" }) => {
    const getPoints = () => {
        switch(direction) {
            case 'up': return "18 15 12 9 6 15";
            case 'left': return "15 18 9 12 15 6";
            case 'right': return "9 18 15 12 9 6";
            default: return "6 9 12 15 18 9"; // abajo
        }
    };

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s' }}>
            <polyline points={getPoints()}></polyline>
        </svg>
    );
};

// Icono de Flecha Izquierda / Atrás
export const ArrowLeftIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// Icono de Descarga
export const DownloadIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

// Icono de Edición / Lápiz
export const EditIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

// Icono de Check / Confirmación
export const CheckIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

// Icono de Guardar / Disco
export const SaveIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

// Icono de Archivo PDF
export const FilePdfIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);


// Icono de Configuración / Engranaje
export const SettingsIcon = ({ className = "dashboard__icon", size = 20 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

