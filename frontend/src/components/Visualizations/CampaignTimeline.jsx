import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, Timeline, Customized } from 'recharts';
import { format } from 'date-fns';
import './CampaignTimeline.css';

const CampaignTimeline = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Chargement des données pour la timeline
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construction des paramètres pour l'API
        let params = {};
        
        if (filters) {
          if (filters.timeframe) {
            if (filters.timeframe.start) {
              params.start_date = filters.timeframe.start;
            }
            if (filters.timeframe.end) {
              params.end_date = filters.timeframe.end;
            }
          }
          
          if (filters.attackGroup) {
            params.attack_group = filters.attackGroup;
          }
          
          if (filters.sectors && filters.sectors.length > 0) {
            params.sectors = filters.sectors.join(',');
          }
          
          if (filters.regions && filters.regions.length > 0) {
            params.regions = filters.regions.join(',');
          }
        }
        
        // Appel à l'API pour récupérer les données de timeline
        const response = await axios.get('/api/v1/campaigns/timeline', { params });
        
        // Transformation des données pour la timeline
        const formattedData = response.data.data.map(campaign => {
          const startDate = new Date(campaign.start);
          const endDate = campaign.end ? new Date(campaign.end) : new Date();
          
          return {
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            start: startDate,
            end: endDate,
            duration: endDate - startDate,
            status: campaign.status,
            severity: campaign.severity,
            attack_group: campaign.attack_group,
            regions: campaign.regions
          };
        });
        
        // Tri par date de début
        formattedData.sort((a, b) => a.start - b.start);
        
        setTimelineData(formattedData);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimelineData();
  }, [filters]);
  
  // Gestion du clic sur une campagne
  const handleCampaignClick = (campaign) => {
    if (selectedCampaign && selectedCampaign.id === campaign.id) {
      setSelectedCampaign(null); // Désélectionner si déjà sélectionné
    } else {
      setSelectedCampaign(campaign); // Sélectionner la nouvelle campagne
    }
  };
  
  // Rendu personnalisé pour la timeline
  const renderCustomizedTimeline = () => {
    const minTime = Math.min(...timelineData.map(d => d.start.getTime()));
    const maxTime = Math.max(...timelineData.map(d => d.end.getTime()));
    const timeRange = maxTime - minTime;
    
    // Calcul de la largeur de la timeline en fonction du nombre de campagnes
    const timelineWidth = Math.max(800, timelineData.length * 200);
    
    // Fonction pour calculer la position X d'une date sur la timeline
    const getXPosition = (date) => {
      return ((date.getTime() - minTime) / timeRange) * (timelineWidth - 100) + 50;
    };
    
    // Création des repères temporels (mois/années)
    const timeMarkers = [];
    const firstDate = new Date(minTime);
    const lastDate = new Date(maxTime);
    
    // Déterminer l'intervalle des marqueurs (mensuel ou annuel)
    const useMonthly = (lastDate.getFullYear() - firstDate.getFullYear()) < 2;
    
    if (useMonthly) {
      // Marqueurs mensuels
      let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      while (currentDate <= lastDate) {
        timeMarkers.push({
          date: new Date(currentDate),
          label: format(currentDate, 'MMM yyyy')
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      // Marqueurs annuels
      let currentYear = firstDate.getFullYear();
      while (currentYear <= lastDate.getFullYear()) {
        timeMarkers.push({
          date: new Date(currentYear, 0, 1),
          label: currentYear.toString()
        });
        currentYear += 1;
      }
    }
    
    return (
      <svg width={timelineWidth} height={600} className="campaign-timeline-svg">
        {/* Axe horizontal de la timeline */}
        <line 
          x1="50" 
          y1="300" 
          x2={timelineWidth - 50} 
          y2="300" 
          stroke="#ccc" 
          strokeWidth="2"
        />
        
        {/* Marqueurs de temps */}
        {timeMarkers.map((marker, index) => {
          const xPos = getXPosition(marker.date);
          return (
            <g key={`marker-${index}`}>
              <line 
                x1={xPos} 
                y1="295" 
                x2={xPos} 
                y2="305" 
                stroke="#999" 
                strokeWidth="1"
              />
              <text 
                x={xPos} 
                y="325" 
                textAnchor="middle" 
                fontSize="12" 
                fill="#666"
              >
                {marker.label}
              </text>
            </g>
          );
        })}
        
        {/* Rendu des campagnes */}
        {timelineData.map((campaign, index) => {
          const startX = getXPosition(campaign.start);
          const endX = getXPosition(campaign.end);
          const width = Math.max(10, endX - startX); // Largeur minimale de 10px
          
          // Déterminer si la campagne doit être affichée au-dessus ou en-dessous de l'axe
          const yPosition = index % 2 === 0 ? 250 : 350;
          
          // Couleur en fonction de la sévérité
          const getColor = (severity) => {
            switch (severity) {
              case 'critical': return '#d32f2f';
              case 'high': return '#f57c00';
              case 'medium': return '#fbc02d';
              case 'low': return '#7cb342';
              default: return '#2196f3';
            }
          };
          
          const color = getColor(campaign.severity);
          
          // Déterminer si cette campagne est sélectionnée
          const isSelected = selectedCampaign && selectedCampaign.id === campaign.id;
          
          return (
            <g 
              key={`campaign-${campaign.id}`}
              onClick={() => handleCampaignClick(campaign)}
              className={`campaign-item ${isSelected ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Ligne de connexion à l'axe */}
              <line 
                x1={startX + width / 2} 
                y1="300" 
                x2={startX + width / 2} 
                y2={yPosition} 
                stroke="#999" 
                strokeWidth="1" 
                strokeDasharray={isSelected ? "none" : "3,3"}
              />
              
              {/* Barre de campagne */}
              <rect 
                x={startX} 
                y={yPosition - 20} 
                width={width} 
                height="40" 
                rx="5" 
                ry="5" 
                fill={color} 
                opacity={isSelected ? 1 : 0.7}
                stroke={isSelected ? "#333" : "none"}
                strokeWidth={isSelected ? 2 : 0}
              />
              
              {/* Statut (icône) */}
              <circle 
                cx={startX - 5} 
                cy={yPosition} 
                r="8" 
                fill={campaign.status === 'ongoing' ? '#4caf50' : 
                      campaign.status === 'completed' ? '#9e9e9e' : 
                      campaign.status === 'planned' ? '#2196f3' : '#ff9800'} 
              />
              
              {/* Nom de la campagne */}
              <text 
                x={startX + width / 2} 
                y={yPosition + 5} 
                textAnchor="middle" 
                fill="white" 
                fontWeight={isSelected ? "bold" : "normal"}
                fontSize="12"
                className="campaign-label"
              >
                {campaign.name}
              </text>
              
              {/* Points de début et fin */}
              <circle 
                cx={startX} 
                cy={yPosition} 
                r="4" 
                fill="white" 
                stroke={color} 
                strokeWidth="2" 
              />
              <circle 
                cx={endX} 
                cy={yPosition} 
                r="4" 
                fill="white" 
                stroke={color} 
                strokeWidth="2" 
              />
              
              {/* Dates au survol/sélection */}
              {isSelected && (
                <>
                  <text 
                    x={startX} 
                    y={yPosition - 30} 
                    textAnchor="middle" 
                    fill="#333" 
                    fontSize="10"
                  >
                    {format(campaign.start, 'dd/MM/yyyy')}
                  </text>
                  <text 
                    x={endX} 
                    y={yPosition - 30} 
                    textAnchor="middle" 
                    fill="#333" 
                    fontSize="10"
                  >
                    {campaign.status === 'ongoing' ? 'Present' : format(campaign.end, 'dd/MM/yyyy')}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };
  
  // Affichage des détails de la campagne sélectionnée
  const renderCampaignDetails = () => {
    if (!selectedCampaign) return null;
    
    return (
      <div className="campaign-details">
        <h3>{selectedCampaign.name}</h3>
        <div className="campaign-detail-grid">
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-${selectedCampaign.status}`}>
              {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Severity:</span>
            <span className={`detail-value severity-${selectedCampaign.severity}`}>
              {selectedCampaign.severity.charAt(0).toUpperCase() + selectedCampaign.severity.slice(1)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Started:</span>
            <span className="detail-value">
              {format(selectedCampaign.start, 'dd MMMM yyyy')}
            </span>
          </div>
          {selectedCampaign.status === 'completed' && (
            <div className="detail-item">
              <span className="detail-label">Ended:</span>
              <span className="detail-value">
                {format(selectedCampaign.end, 'dd MMMM yyyy')}
              </span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">
              {Math.ceil(selectedCampaign.duration / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
          {selectedCampaign.attack_group && (
            <div className="detail-item">
              <span className="detail-label">Attack Group:</span>
              <span className="detail-value">
                {selectedCampaign.attack_group.name}
                {selectedCampaign.attack_group.country && ` (${selectedCampaign.attack_group.country})`}
              </span>
            </div>
          )}
        </div>
        
        {selectedCampaign.description && (
          <div className="campaign-description">
            <p>{selectedCampaign.description}</p>
          </div>
        )}
        
        {selectedCampaign.regions && selectedCampaign.regions.length > 0 && (
          <div className="campaign-regions">
            <h4>Targeted Regions:</h4>
            <div className="regions-list">
              {selectedCampaign.regions.map(region => (
                <span key={region.id} className="region-tag">
                  {region.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="campaign-actions">
          <a href={`/campaigns/${selectedCampaign.id}`} className="view-details-btn">
            View Full Details
          </a>
        </div>
      </div>
    );
  };
  
  return (
    <div className="campaign-timeline-container">
      {loading && <div className="timeline-loading">Loading timeline data...</div>}
      {error && <div className="timeline-error">{error}</div>}
      {!loading && !error && timelineData.length === 0 && (
        <div className="timeline-empty">No campaigns found for the selected filters.</div>
      )}
      
      {!loading && !error && timelineData.length > 0 && (
        <div className="timeline-content">
          <div className="timeline-scroll-container">
            {renderCustomizedTimeline()}
          </div>
          
          <div className="timeline-legend">
            <h4>Severity</h4>
            <div className="legend-items severity">
              <div className="legend-item">
                <div className="legend-color critical"></div>
                <span>Critical</span>
              </div>
              <div className="legend-item">
                <div className="legend-color high"></div>
                <span>High</span>
              </div>
              <div className="legend-item">
                <div className="legend-color medium"></div>
                <span>Medium</span>
              </div>
              <div className="legend-item">
                <div className="legend-color low"></div>
                <span>Low</span>
              </div>
            </div>
            
            <h4>Status</h4>
            <div className="legend-items status">
              <div className="legend-item">
                <div className="legend-status ongoing"></div>
                <span>Ongoing</span>
              </div>
              <div className="legend-item">
                <div className="legend-status completed"></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <div className="legend-status planned"></div>
                <span>Planned</span>
              </div>
              <div className="legend-item">
                <div className="legend-status suspended"></div>
                <span>Suspended</span>
              </div>
            </div>
          </div>
          
          {renderCampaignDetails()}
        </div>
      )}
    </div>
  );
};

export default CampaignTimeline;
