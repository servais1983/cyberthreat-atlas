import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };
  
  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  const menuItems = [
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: '📊',
      path: '/'
    },
    {
      key: 'groups',
      label: 'Groupes d\'attaque',
      icon: '👥',
      path: '/groups',
      children: [
        { label: 'Tous les groupes', path: '/groups' },
        { label: 'Par région', path: '/groups/regions' },
        { label: 'Par motivation', path: '/groups/motivation' }
      ]
    },
    {
      key: 'techniques',
      label: 'Techniques',
      icon: '⚔️',
      path: '/techniques',
      children: [
        { label: 'MITRE ATT&CK', path: '/techniques' },
        { label: 'Par tactique', path: '/techniques/tactics' },
        { label: 'Tendances', path: '/techniques/trends' }
      ]
    },
    {
      key: 'campaigns',
      label: 'Campagnes',
      icon: '🎯',
      path: '/campaigns',
      children: [
        { label: 'Actives', path: '/campaigns?status=active' },
        { label: 'Terminées', path: '/campaigns?status=completed' },
        { label: 'Planifiées', path: '/campaigns?status=planned' }
      ]
    },
    {
      key: 'malware',
      label: 'Malwares',
      icon: '🦠',
      path: '/malware',
      children: [
        { label: 'Tous les malwares', path: '/malware' },
        { label: 'Par famille', path: '/malware/families' },
        { label: 'Nouveaux', path: '/malware/recent' }
      ]
    },
    {
      key: 'visualizations',
      label: 'Visualisations',
      icon: '🗺️',
      children: [
        { label: 'Carte mondiale', path: '/map' },
        { label: 'Relations', path: '/relationships' },
        { label: 'Timeline', path: '/timeline' }
      ]
    }
  ];
  
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map(item => (
            <li key={item.key} className="nav-item">
              {item.children ? (
                <div className="nav-group">
                  <button 
                    className={`nav-link group-toggle ${
                      item.children.some(child => isActiveLink(child.path)) ? 'active' : ''
                    }`}
                    onClick={() => toggleMenu(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <span className={`expand-icon ${expandedMenus[item.key] ? 'expanded' : ''}`}>▼</span>
                  </button>
                  
                  {expandedMenus[item.key] && (
                    <ul className="nav-submenu">
                      {item.children.map((child, index) => (
                        <li key={index} className="nav-subitem">
                          <Link 
                            to={child.path} 
                            className={`nav-sublink ${isActiveLink(child.path) ? 'active' : ''}`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
        
        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar-small">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name || 'Utilisateur'}</div>
                <div className="user-role">{user.role || 'Analyste'}</div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;