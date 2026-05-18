import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { BellIcon, SearchIcon, BlobIcon, LogoutIcon, SettingsIcon } from './DashboardIcons';
import { KinefyLogo } from '../auth/AuthIcons';
import api from '../../api/api';

const DashboardLayout = ({ 
    children, 
    navItems = [], 
    user = { name: 'Usuario' },
    searchPlaceholder = 'Buscar...' 
}) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('kinefy_user');
        localStorage.removeItem('kinefy_token');
        navigate('/login');
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Polling cada minuto
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async () => {
        if (notifications.some(n => !n.leida)) {
            try {
                await api.put('/notifications/read');
                setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
            } catch (err) {
                console.error("Error marking read", err);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.leida).length;

    return (
        <section className="layout">
            {/* Header for Mobile only */}
            <header className="mobile-header">
                <KinefyLogo className="mobile-header__logo" />
                <div className="mobile-header__actions">
                    <div style={{ position: 'relative' }}>
                        <button 
                            className="topbar__btn" 
                            aria-label="Notificaciones"
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) markAsRead();
                            }}
                        >
                            <BellIcon className="topbar__icon" />
                            {unreadCount > 0 && (
                                <span style={{ 
                                    position: 'absolute', top: '5px', right: '5px', 
                                    background: '#EF4444', color: 'white', fontSize: '10px', 
                                    width: '16px', height: '16px', borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid white'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <article 
                        className="topbar__user" 
                        style={{ width: '36px', height: '36px', cursor: 'pointer' }}
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNotifications(false);
                        }}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <figure className="topbar__avatar-sketchy" style={{ width: '36px', height: '36px' }}>
                                <BlobIcon className="topbar__avatar-blob" color={user.color || '#E8F5F1'} />
                                <span className="topbar__avatar-initials" style={{ fontSize: '0.8rem' }}>
                                    {user.initials || user.name.charAt(0)}
                                </span>
                            </figure>
                        )}
                    </article>
                </div>
            </header>

            <Sidebar navItems={navItems} />

            <main className="layout__wrapper">
                <header className="topbar">
                    <form className="topbar__search" role="search">
                        <SearchIcon className="topbar__search-icon" aria-hidden="true" />
                        <input 
                            type="search" 
                            className="topbar__search-input"
                            placeholder={searchPlaceholder} 
                            aria-label={searchPlaceholder}
                        />
                    </form>
                    
                    <nav className="topbar__actions" aria-label="Acciones de usuario">
                        <div style={{ position: 'relative' }}>
                            <button 
                                className="topbar__btn" 
                                aria-label="Notificaciones"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowUserMenu(false);
                                    if (!showNotifications) markAsRead();
                                }}
                            >
                                <BellIcon className="topbar__icon" />
                                {unreadCount > 0 && (
                                    <span style={{ 
                                        position: 'absolute', top: '5px', right: '5px', 
                                        background: '#EF4444', color: 'white', fontSize: '10px', 
                                        width: '16px', height: '16px', borderRadius: '50%', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid white'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <article 
                            className="topbar__user" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="topbar__avatar-img" />
                            ) : (
                                <figure className="topbar__avatar-sketchy">
                                    <BlobIcon className="topbar__avatar-blob" color={user.color || '#E8F5F1'} />
                                    <span className="topbar__avatar-initials">
                                        {user.initials || user.name.charAt(0)}
                                    </span>
                                </figure>
                            )}
                        </article>
                    </nav>
                </header>

                {(showNotifications || showUserMenu) && (
                    <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 9999 }} 
                        onClick={() => {
                            setShowNotifications(false);
                            setShowUserMenu(false);
                        }}
                    />
                )}

                {showNotifications && (
                    <div className="notifications-dropdown animate-in" style={{ zIndex: 10000 }}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: '#1A2E35' }}>Notificaciones</h4>
                            <button 
                                onClick={() => setShowNotifications(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#5A6B6D', cursor: 'pointer', padding: '5px' }}
                            >
                                ✕
                            </button>
                        </header>
                        {notifications.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#5A6B6D', textAlign: 'center' }}>No tienes notificaciones</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {notifications.map(n => (
                                    <div key={n._id} style={{ 
                                        padding: '0.75rem', borderRadius: '12px', 
                                        background: n.leida ? 'transparent' : '#F0FAF6',
                                        border: '1px solid #F0F4F4'
                                    }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '700', color: '#1A2E35' }}>{n.titulo}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#5A6B6D' }}>{n.mensaje}</p>
                                        <span style={{ fontSize: '0.65rem', color: '#A0AEC0', marginTop: '4px', display: 'block' }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {showUserMenu && (
                    <div className="notifications-dropdown animate-in" style={{ zIndex: 10000, width: '240px' }}>
                        <div className="dropdown-header">
                            <p className="dropdown-user-name">{user.name}</p>
                            <p className="dropdown-user-role">{user.role || 'Profesional'}</p>
                        </div>
                        <div style={{ padding: '0.4rem 0' }}>
                            <button 
                                className="user-menu-item"
                                onClick={() => setShowUserMenu(false)}
                            >
                                <SettingsIcon size={18} />
                                <span>Configuración</span>
                            </button>
                            <button 
                                className="user-menu-item user-menu-item--danger"
                                onClick={handleLogout}
                            >
                                <LogoutIcon size={18} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                )}

                <article className="layout__content">
                    {/* Background decoration elements */}
                    <aside className="layout__decoration" aria-hidden="true">
                        <span className="layout__blob layout__blob--mint"></span>
                        <span className="layout__blob layout__blob--blue"></span>
                        <span className="layout__blob layout__blob--sky"></span>
                    </aside>
                    {children}
                </article>

                <footer className="footer" aria-hidden="true">
                    <div className="footer__line"></div>
                    <svg className="footer__icon" width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="#98D2C1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M24 44 C22 38 18 30 18 22 C18 14 20 8 24 4"/>
                        <path d="M24 44 C26 38 30 30 30 22 C30 14 28 8 24 4"/>
                        <path d="M18 22 C12 20 8 14 10 8 C14 10 16 18 18 22 Z"/>
                        <path d="M30 22 C36 20 40 14 38 8 C34 10 32 18 30 22 Z"/>
                        <path d="M24 14 C21 10 21 5 24 3 C27 5 27 10 24 14 Z"/>
                    </svg>
                </footer>
            </main>

            {/* Bottom Nav for Mobile only */}
            <nav className="mobile-nav" aria-label="Navegación móvil">
                {navItems.map((item, index) => (
                    <NavLink 
                        key={index} 
                        to={item.to} 
                        end={item.end}
                        className={({ isActive }) => 
                            `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`
                        }
                    >
                        <item.icon className="mobile-nav__icon" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </section>
    );
};

export default DashboardLayout;

