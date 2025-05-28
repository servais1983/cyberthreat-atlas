import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ThreatMap.css';

// Correction pour l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Icônes personnalisées pour différents niveaux de sévérité avec couleurs CSS
const createColoredIcon = (color, size = [25, 41]) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]/2],
    popupAnchor: [0, -size[1]/2]
  });
};

const severityIcons = {
  critical: createColoredIcon('#dc2626', [28, 28]),
  high: createColoredIcon('#ea580c', [26, 26]),
  medium: createColoredIcon('#ca8a04', [24, 24]),
  low: createColoredIcon('#16a34a', [22, 22])
};

// Configuration des styles de carte
const mapStyles = {
  default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

// Composant principal de la carte des menaces
const ThreatMap = ({ filters }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [mapStyle, setMapStyle] = useState('dark');
  const [viewMode, setViewMode] = useState('markers');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  // Données de test pour la démonstration
  const mockCampaigns = [
    {
      _id: '1',
      name: 'APT1 Campaign',
      severity: 'critical',
      status: 'active',
      description: 'Advanced persistent threat targeting government institutions',
      start_date: '2024-01-15',
      attack_group: { name: 'APT1', _id: 'apt1' },
      targeted_regions: [
        { name: 'Washington DC', latitude: 38.9072, longitude: -77.0369 }
      ]
    },
    {
      _id: '2',
      name: 'Lazarus Banking Trojan',
      severity: 'high',
      status: 'active',
      description: 'Banking malware targeting financial institutions',
      start_date: '2024-02-01',
      attack_group: { name: 'Lazarus Group', _id: 'lazarus' },
      targeted_regions: [
        { name: 'London', latitude: 51.5074, longitude: -0.1278 },
        { name: 'Frankfurt', latitude: 50.1109, longitude: 8.6821 }
      ]
    },
    {
      _id: '3',
      name: 'Ransomware Campaign',
      severity: 'medium',
      status: 'resolved',
      description: 'Widespread ransomware attack on healthcare systems',
      start_date: '2024-01-20',
      end_date: '2024-02-15',
      targeted_regions: [
        { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
        { name: 'Seoul', latitude: 37.5665, longitude: 126.9780 }
      ]
    }
  ];

  // Initialisation de la carte
  useEffect(() => {
    if (!leafletMapRef.current && mapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({
        position: 'bottomright'
      }).addTo(leafletMapRef.current);
      
      L.control.attribution({
        position: 'bottomleft',
        prefix: '&copy; OpenStreetMap | CyberThreat Atlas'
      }).addTo(leafletMapRef.current);

      L.tileLayer(mapStyles.dark, {
        attribution: '&copy; OpenStreetMap | CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Changement de style de carte
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current.removeLayer(layer);
        }
      });
      
      L.tileLayer(mapStyles[mapStyle], {
        attribution: '&copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);
    }
  }, [mapStyle]);

  // Simulation du chargement des données
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simuler un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Utiliser les données de test
        setCampaigns(mockCampaigns);
        
        // Calculer les statistiques
        const stats = {
          total: mockCampaigns.length,
          critical: mockCampaigns.filter(c => c.severity === 'critical').length,
          high: mockCampaigns.filter(c => c.severity === 'high').length,
          medium: mockCampaigns.filter(c => c.severity === 'medium').length,
          low: mockCampaigns.filter(c => c.severity === 'low').length
        };
        
        setStats(stats);
      } catch (err) {
        console.error('Error fetching campaign data:', err);
        setError('Failed to load campaign data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filters]);

  // Mise à jour des marqueurs sur la carte
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    
    campaigns.forEach(campaign => {
      if (campaign.targeted_regions && campaign.targeted_regions.length > 0) {
        campaign.targeted_regions.forEach(region => {
          if (region.latitude && region.longitude) {
            const icon = severityIcons[campaign.severity] || severityIcons.medium;
            
            const marker = L.marker([region.latitude, region.longitude], { 
              icon
            }).addTo(markersLayerRef.current);
            
            marker.bindPopup(`
              <div class="map-popup">
                <h3>${campaign.name}</h3>
                <div class="popup-severity ${campaign.severity}">
                  <span class="severity-indicator"></span>
                  ${campaign.severity.toUpperCase()}
                </div>
                <div class="popup-details">
                  <p><strong>Status:</strong> <span class="status ${campaign.status}">${campaign.status}</span></p>
                  <p><strong>Region:</strong> ${region.name}</p>
                  ${campaign.attack_group ? `<p><strong>Attack Group:</strong> ${campaign.attack_group.name}</p>` : ''}
                  <p><strong>Started:</strong> ${new Date(campaign.start_date).toLocaleDateString()}</p>
                  ${campaign.end_date ? `<p><strong>Ended:</strong> ${new Date(campaign.end_date).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="popup-description">
                  <p>${campaign.description}</p>
                </div>
              </div>
            `, {
              maxWidth: 400,
              className: 'custom-popup'
            });
          }
        });
      }
    });
  }, [campaigns]);

  return (
    <div className="threat-map-container">
      {loading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <span>Chargement des données de menaces...</span>
        </div>
      )}
      
      {error && (
        <div className="map-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="retry-button">
            Réessayer
          </button>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="threat-map"
        style={{ height: '100%', width: '100%' }}
      />
      
      <div className="map-controls">
        <div className="map-style-selector">
          <button 
            className={`map-style-button ${mapStyle === 'dark' ? 'active' : ''}`}
            onClick={() => setMapStyle('dark')}
            title="Dark Mode"
          >
            <span className="icon">🌑</span>
          </button>
          <button 
            className={`map-style-button ${mapStyle === 'light' ? 'active' : ''}`}
            onClick={() => setMapStyle('light')}
            title="Light Mode"
          >
            <span className="icon">🌕</span>
          </button>
          <button 
            className={`map-style-button ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapStyle('satellite')}
            title="Satellite"
          >
            <span className="icon">🛰️</span>
          </button>
        </div>
      </div>
      
      <div className="map-stats">
        <div className="stats-header">Menaces Actives</div>
        <div className="stats-count">{stats.total}</div>
        <div className="stats-breakdown">
          <div className="stat-item critical">
            <span className="stat-label">Critique</span>
            <span className="stat-value">{stats.critical}</span>
          </div>
          <div className="stat-item high">
            <span className="stat-label">Élevé</span>
            <span className="stat-value">{stats.high}</span>
          </div>
          <div className="stat-item medium">
            <span className="stat-label">Moyen</span>
            <span className="stat-value">{stats.medium}</span>
          </div>
          <div className="stat-item low">
            <span className="stat-label">Faible</span>
            <span className="stat-value">{stats.low}</span>
          </div>
        </div>
      </div>
      
      <div className="map-legend">
        <h4>Sévérité des Menaces</h4>
        <div className="legend-item">
          <div className="legend-marker critical"></div>
          <span>Critique</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker high"></div>
          <span>Élevé</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker medium"></div>
          <span>Moyen</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker low"></div>
          <span>Faible</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;