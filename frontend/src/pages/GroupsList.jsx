import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Réutilise le CSS du Dashboard pour l'instant

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simuler le chargement des données
    const fetchGroups = async () => {
      try {
        setLoading(true);
        // TODO: Remplacer par un vrai appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données de test
        const mockGroups = [
          { id: 1, name: 'APT1', description: 'Advanced Persistent Threat Group 1', country: 'China' },
          { id: 2, name: 'Lazarus Group', description: 'North Korean state-sponsored group', country: 'North Korea' },
          { id: 3, name: 'Fancy Bear', description: 'Russian military intelligence group', country: 'Russia' },
        ];
        
        setGroups(mockGroups);
      } catch (err) {
        setError('Erreur lors du chargement des groupes');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
        <p>Chargement des groupes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Groupes d'Attaque</h1>
        <p>Liste des groupes de menaces connues</p>
      </div>
      
      <div className="dashboard-content">
        <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <span className="group-country">{group.country}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsList;
