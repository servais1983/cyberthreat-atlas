import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCampaigns([
        { id: 1, name: 'Operation Aurora', description: 'Campagne de cyberattaque' },
        { id: 2, name: 'Stuxnet', description: 'Malware sophistiqué' }
      ]);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Campagnes d'Attaque</h1>
        <p>Liste des campagnes connues</p>
      </div>
      <div className="dashboard-content">
        <div className="groups-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="group-card">
              <h3>{campaign.name}</h3>
              <p>{campaign.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignsList;