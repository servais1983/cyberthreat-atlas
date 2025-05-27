import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const TechniquesList = () => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechniques = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTechniques([
        { id: 'T1001', name: 'Data Obfuscation', description: 'Technique d\'obfuscation de données' },
        { id: 'T1002', name: 'Data Compressed', description: 'Compression de données' }
      ]);
      setLoading(false);
    };
    fetchTechniques();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Techniques MITRE ATT&CK</h1>
        <p>Liste des techniques d'attaque</p>
      </div>
      <div className="dashboard-content">
        <div className="groups-grid">
          {techniques.map(technique => (
            <div key={technique.id} className="group-card">
              <h3>{technique.name}</h3>
              <p>{technique.description}</p>
              <span className="group-country">{technique.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechniquesList;