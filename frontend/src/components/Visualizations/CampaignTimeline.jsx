import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './CampaignTimeline.css';

const CampaignTimeline = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Données de test pour éviter les erreurs d'API
  const mockTimelineData = [
    {
      id: '1',
      name: 'Operation Aurora',
      description: 'Sophisticated cyber attack targeting Google and other major companies',
      start: new Date('2009-12-01'),
      end: new Date('2010-01-12'),
      status: 'completed',
      severity: 'critical',
      attack_group: { name: 'APT1', id: 'apt1' },
      regions: [{ id: 'us', name: 'United States' }, { id: 'eu', name: 'Europe' }]
    },
    {
      id: '2',
      name: 'NotPetya Campaign',
      description: 'Ransomware attack that caused billions in damages worldwide',
      start: new Date('2017-06-27'),
      end: new Date('2017-07-15'),
      status: 'completed',
      severity: 'high',
      attack_group: { name: 'Sandworm', id: 'sandworm' },
      regions: [{ id: 'ua', name: 'Ukraine' }, { id: 'global', name: 'Global' }]
    },
    {
      id: '3',
      name: 'SolarWinds Hack',
      description: 'Supply chain attack affecting thousands of organizations',
      start: new Date('2020-03-01'),
      end: new Date('2020-12-13'),
      status: 'completed',
      severity: 'critical',
      attack_group: { name: 'APT29', id: 'apt29' },
      regions: [{ id: 'us', name: 'United States' }, { id: 'global', name: 'Global' }]
    },
    {
      id: '4',
      name: 'Ongoing APT Campaign',
      description: 'Current sophisticated persistent threat targeting government agencies',
      start: new Date('2024-01-15'),
      end: new Date(),
      status: 'ongoing',
      severity: 'high',
      attack_group: { name: 'APT40', id: 'apt40' },
      regions: [{ id: 'asia', name: 'Asia Pacific' }]
    },
    {
      id: '5',
      name: 'Ransomware Wave',
      description: 'Series of coordinated ransomware attacks on healthcare systems',
      start: new Date('2023-09-01'),
      end: new Date('2024-02-28'),
      status: 'completed',
      severity: 'medium',
      attack_group: { name: 'Conti', id: 'conti' },
      regions: [{ id: 'na', name: 'North America' }]
    }
  ];
  
  // Chargement des données pour la timeline
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simuler un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Transformation des données pour la timeline
        const formattedData = mockTimelineData.map(campaign => {
          const startDate = campaign.start;
          const endDate = campaign.end;
          
          return {
            ...campaign,
            duration: endDate - startDate
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
      setSelectedCampaign(null);
    } else {
      setSelectedCampaign(campaign);
    }
  };
  
  // Rendu personnalisé pour la timeline
  const renderCustomizedTimeline = () => {
    if (!timelineData.length) return null;
    
    const minTime = Math.min(...timelineData.map(d => d.start.getTime()));
    const maxTime = Math.max(...timelineData.map(d => d.end.getTime()));
    const timeRange = maxTime - minTime;
    
    const timelineWidth = Math.max(800, timelineData.length * 200);
    
    const getXPosition = (date) => {
      return ((date.getTime() - minTime) / timeRange) * (timelineWidth - 100) + 50;
    };
    
    const timeMarkers = [];
    const firstDate = new Date(minTime);
    const lastDate = new Date(maxTime);
    
    const useMonthly = (lastDate.getFullYear() - firstDate.getFullYear()) < 2;
    
    if (useMonthly) {
      let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      while (currentDate <= lastDate) {
        timeMarkers.push({
          date: new Date(currentDate),
          label: format(currentDate, 'MMM yyyy')
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
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
        <line 
          x1="50" 
          y1="300" 
          x2={timelineWidth - 50} 
          y2="300" 
          stroke="#ccc" 
          strokeWidth="2"
        />
        
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
        
        {timelineData.map((campaign, index) => {
          const startX = getXPosition(campaign.start);
          const endX = getXPosition(campaign.end);
          const width = Math.max(10, endX - startX);
          const yPosition = index % 2 === 0 ? 250 : 350;
          
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
          const isSelected = selectedCampaign && selectedCampaign.id === campaign.id;
          
          return (
            <g 
              key={`campaign-${campaign.id}`}
              onClick={() => handleCampaignClick(campaign)}
              className={`campaign-item ${isSelected ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <line 
                x1={startX + width / 2} 
                y1="300" 
                x2={startX + width / 2} 
                y2={yPosition} 
                stroke="#999" 
                strokeWidth="1" 
                strokeDasharray={isSelected ? "none" : "3,3"}
              />
              
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
              
              <circle 
                cx={startX - 5} 
                cy={yPosition} 
                r="8" 
                fill={campaign.status === 'ongoing' ? '#4caf50' : 
                      campaign.status === 'completed' ? '#9e9e9e' : 
                      campaign.status === 'planned' ? '#2196f3' : '#ff9800'} 
              />
              
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