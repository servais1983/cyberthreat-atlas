import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const NotFound = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>404 - Page Non Trouvée</h1>
        <p>La page que vous recherchez n'existe pas.</p>
      </div>
      <div className="dashboard-content">
        <Link to="/" className="btn btn-primary">Retour au tableau de bord</Link>
      </div>
    </div>
  );
};

export default NotFound;