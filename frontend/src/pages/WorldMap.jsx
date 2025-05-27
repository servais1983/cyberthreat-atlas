import React from 'react';
import './Dashboard.css';

const WorldMap = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Carte Mondiale des Menaces</h1>
        <p>Visualisation géographique des cybermenaces</p>
      </div>
      <div className="dashboard-content">
        <div className="map-placeholder">
          <p>Carte interactive à implémenter</p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;