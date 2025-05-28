import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        <Link to="/" className="header-logo">
          <span className="logo-text">CyberThreat Atlas</span>
        </Link>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Rechercher des menaces, groupes, techniques..." 
            className="search-input"
          />
          <button className="search-button">
            🔍
          </button>
        </div>
      </div>
      
      <div className="header-right">
        <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="notifications">
          <button className="notification-button">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        {user ? (
          <div className="user-menu">
            <button className="user-avatar" onClick={toggleUserMenu}>
              <span className="avatar-text">{user.name?.charAt(0) || 'U'}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  Mon profil
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  Paramètres
                </Link>
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline-primary">Connexion</Link>
            <Link to="/register" className="btn btn-primary">Inscription</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;