import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { KinefyLogo } from '../auth/AuthIcons';
import { LogoutIcon } from './DashboardIcons';

const Sidebar = ({ navItems = [] }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('kinefy_user');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <header className="sidebar__header">
                <KinefyLogo className="sidebar__brand" />
            </header>

            <nav className="sidebar__nav" aria-label="Navegación principal">
                {navItems.map((item, index) => (
                    <NavLink 
                        key={index}
                        to={item.to} 
                        end={item.end} 
                        className={({ isActive }) => 
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__blob" aria-hidden="true" />
                        <item.icon className="sidebar__icon" /> 
                        <span className="sidebar__label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <footer className="sidebar__footer">
                <button className="sidebar__logout" onClick={handleLogout} aria-label="Cerrar sesión">
                    <LogoutIcon className="sidebar__icon" /> 
                    <span className="sidebar__label">Cerrar Sesión</span>
                </button>
            </footer>
        </aside>
    );
};

export default Sidebar;
