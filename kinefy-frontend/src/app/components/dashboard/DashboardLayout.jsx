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

    const handleNotificationClick = (n) => {
        setShowNotifications(false);
        const localUser = JSON.parse(localStorage.getItem('kinefy_user')) || {};
        const role = localUser.role || localUser.rol;
        
        let targetDate = null;
        if (n.metadata && n.metadata.fecha) {
            targetDate = typeof n.metadata.fecha === 'string' ? n.metadata.fecha.split('T')[0] : new Date(n.metadata.fecha).toISOString().split('T')[0];
        }
        
        const appointmentId = n.metadata?.appointmentId || null;
        if (role === 'paciente') {
            navigate('/dashboard/patient/appointments', { state: { selectedDate: targetDate, appointmentId } });
        } else {
            navigate('/dashboard/physio/appointments', { state: { selectedDate: targetDate, appointmentId } });
        }
    };

    const unreadCount = notifications.filter(n => !n.leida).length;

    const renderNotificationsDropdown = () => (
        <div className="notifications-dropdown animate-in">
            <header className="notifications-dropdown__header">
                <h4 className="notifications-dropdown__title">Notificaciones</h4>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                    className="notifications-dropdown__close-btn"
                >
                    ✕
                </button>
            </header>
            {notifications.length === 0 ? (
                <p className="notifications-dropdown__empty-text">No tienes notificaciones</p>
            ) : (
                <div className="notifications-dropdown__list">
                    {notifications.map(n => (
                        <div 
                            key={n._id} 
                            onClick={() => handleNotificationClick(n)}
                            className={`notifications-dropdown__item ${n.leida ? '' : 'notifications-dropdown__item--unread'}`}
                        >
                            <p className="notifications-dropdown__item-title">{n.titulo}</p>
                            <p className="notifications-dropdown__item-message">{n.mensaje}</p>
                            <span className="notifications-dropdown__item-date">
                                {new Date(n.createdAt).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUserMenuDropdown = () => (
        <div className="notifications-dropdown notifications-dropdown--user-menu animate-in">
            <div className="dropdown-header">
                <p className="dropdown-user-name">{user.name}</p>
                <p className="dropdown-user-role">{user.role || 'Profesional'}</p>
            </div>
            <div className="notifications-dropdown__menu-list">
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
    );

    return (
        <section className="layout">
            {/* Header for Mobile only */}
            <header className="mobile-header">
                <KinefyLogo className="mobile-header__logo" />
                <div className="mobile-header__actions">
                    <div className="topbar__action-wrapper">
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
                                <span className="topbar__notification-badge">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && renderNotificationsDropdown()}
                    </div>

                    <div className="topbar__action-wrapper">
                        <article 
                            className="topbar__user topbar__user--mobile topbar__user--clickable" 
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="topbar__avatar-img topbar__avatar-img--mobile" />
                            ) : (
                                <figure className="topbar__avatar-sketchy topbar__avatar-sketchy--mobile">
                                    <BlobIcon className="topbar__avatar-blob" color={user.color || '#E8F5F1'} />
                                    <span className="topbar__avatar-initials topbar__avatar-initials--mobile">
                                        {user.initials || user.name.charAt(0)}
                                    </span>
                                </figure>
                            )}
                        </article>
                        {showUserMenu && renderUserMenuDropdown()}
                    </div>
                </div>
            </header>

            <Sidebar navItems={navItems} />

            <main className="layout__wrapper">
                <aside className="layout__decoration" aria-hidden="true" />
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
                        <div className="topbar__action-wrapper">
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
                                    <span className="topbar__notification-badge">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && renderNotificationsDropdown()}
                        </div>

                        <div className="topbar__action-wrapper">
                            <article 
                                className="topbar__user topbar__user--clickable" 
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
                            {showUserMenu && renderUserMenuDropdown()}
                        </div>
                    </nav>
                </header>

                {(showNotifications || showUserMenu) && (
                    <div 
                        className="layout__overlay-click-trap" 
                        onClick={() => {
                            setShowNotifications(false);
                            setShowUserMenu(false);
                        }}
                    />
                )}

                <article className="layout__content">
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

