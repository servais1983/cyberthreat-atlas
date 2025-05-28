import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-copyright">
          &copy; {currentYear} CyberThreat Atlas. Tous droits réservés.
        </div>
        
        <div className="footer-links">
          <a href="/privacy" className="footer-link">Politique de confidentialité</a>
          <a href="/terms" className="footer-link">Conditions d'utilisation</a>
          <a href="/contact" className="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;