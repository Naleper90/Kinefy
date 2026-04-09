import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import { BellIcon, SearchIcon, BlobIcon } from './DashboardIcons';
import { KinefyLogo } from '../auth/AuthIcons';

const DashboardLayout = ({ 
    children, 
    navItems = [], 
    user = { name: 'Usuario' },
    searchPlaceholder = 'Buscar...' 
}) => {
    return (
        <section className="layout">
            {/* Header for Mobile only */}
            <header className="mobile-header" aria-hidden="true">
                <KinefyLogo className="sidebar__brand" />
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
                        <button className="topbar__btn" aria-label="Notificaciones">
                            <BellIcon className="topbar__icon" />
                        </button>
                        <article className="topbar__user">
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
