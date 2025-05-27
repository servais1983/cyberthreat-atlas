import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCampaign({ id, name: `Campagne ${id}`, description: 'Détails de la campagne' });
      setLoading(false);
    };
    fetchCampaign();
  }, [id]);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{campaign?.name}</h1>
        <p>{campaign?.description}</p>
      </div>
    </div>
  );
};

export default CampaignDetail;