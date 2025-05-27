import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css';

const TechniqueDetail = () => {
  const { id } = useParams();
  const [technique, setTechnique] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnique = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTechnique({ id, name: `Technique ${id}`, description: 'Détails de la technique' });
      setLoading(false);
    };
    fetchTechnique();
  }, [id]);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{technique?.name}</h1>
        <p>{technique?.description}</p>
      </div>
    </div>
  );
};

export default TechniqueDetail;