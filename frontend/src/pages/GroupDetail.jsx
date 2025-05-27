import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      // TODO: Remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGroup({ id, name: `Groupe ${id}`, description: 'Détails du groupe' });
      setLoading(false);
    };
    fetchGroup();
  }, [id]);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{group?.name}</h1>
        <p>{group?.description}</p>
      </div>
    </div>
  );
};

export default GroupDetail;