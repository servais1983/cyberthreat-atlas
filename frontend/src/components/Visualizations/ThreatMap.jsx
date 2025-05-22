import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './ThreatMap.css';

// Import des marqueurs personnalisés Leaflet
import markerIconUrl from '../../assets/images/marker-icon.png';
import markerShadowUrl from '../../assets/images/marker-shadow.png';
import markerIconCriticalUrl from '../../assets/images/marker-icon-critical.png';
import markerIconHighUrl from '../../assets/images/marker-icon-high.png';
import markerIconMediumUrl from '../../assets/images/marker-icon-medium.png';
import markerIconLowUrl from '../../assets/images/marker-icon-low.png';

// Correction pour l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Icônes personnalisées pour différents niveaux de sévérité
const severityIcons = {
  critical: new L.Icon({
    iconUrl: markerIconCriticalUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [28, 45], // Légèrement plus grand pour une meilleure visibilité
    iconAnchor: [14, 45],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  high: new L.Icon({
    iconUrl: markerIconHighUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [26, 43], // Taille intermédiaire pour hiérarchie visuelle
    iconAnchor: [13, 43],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  medium: new L.Icon({
    iconUrl: markerIconMediumUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  low: new L.Icon({
    iconUrl: markerIconLowUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [23, 38], // Légèrement plus petit pour hiérarchie visuelle
    iconAnchor: [11, 38],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
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
  const heatLayerRef = useRef(null);
  const attackLinesLayerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [mapStyle, setMapStyle] = useState('dark'); // Style de carte par défaut
  const [viewMode, setViewMode] = useState('markers'); // Mode d'affichage: markers, heat, flow
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  // Initialisation de la carte
  useEffect(() => {
    if (!leafletMapRef.current && mapRef.current) {
      // Création de la carte Leaflet avec options améliorées
      leafletMapRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        maxBounds: [
          [-90, -180],
          [90, 180]
        ],
        zoomControl: false, // Désactivé pour le repositionner
        attributionControl: false // Désactivé pour le repositionner
      });

      // Repositionnement des contrôles pour une meilleure ergonomie
      L.control.zoom({
        position: 'bottomright'
      }).addTo(leafletMapRef.current);
      
      L.control.attribution({
        position: 'bottomleft',
        prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | CyberThreat Atlas'
      }).addTo(leafletMapRef.current);

      // Ajout de la couche de tuiles avec style dark par défaut
      L.tileLayer(mapStyles.dark, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);

      // Création des couches pour différentes visualisations
      markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      heatLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      attackLinesLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      
      // Masquer les couches non utilisées par défaut
      heatLayerRef.current.remove();
      attackLinesLayerRef.current.remove();
    }

    // Nettoyage lors du démontage du composant
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
      // Supprimer les couches de tuiles existantes
      leafletMapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current.removeLayer(layer);
        }
      });
      
      // Ajouter la nouvelle couche de tuiles selon le style sélectionné
      L.tileLayer(mapStyles[mapStyle], {
        attribution: mapStyle === 'default' 
          ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
          : mapStyle === 'satellite'
            ? '&copy; <a href="https://www.esri.com">Esri</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);
    }
  }, [mapStyle]);

  // Changement de mode d'affichage
  useEffect(() => {
    if (!markersLayerRef.current || !heatLayerRef.current || !attackLinesLayerRef.current) return;
    
    // Masquer toutes les couches
    markersLayerRef.current.remove();
    heatLayerRef.current.remove();
    attackLinesLayerRef.current.remove();
    
    // Afficher la couche correspondant au mode sélectionné
    switch (viewMode) {
      case 'markers':
        markersLayerRef.current.addTo(leafletMapRef.current);
        break;
      case 'heat':
        heatLayerRef.current.addTo(leafletMapRef.current);
        break;
      case 'flow':
        attackLinesLayerRef.current.addTo(leafletMapRef.current);
        markersLayerRef.current.addTo(leafletMapRef.current); // Afficher aussi les marqueurs en mode flux
        break;
      default:
        markersLayerRef.current.addTo(leafletMapRef.current);
    }
  }, [viewMode]);

  // Chargement des données de campagnes
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construction des paramètres de requête basés sur les filtres
        let params = {};
        if (filters) {
          if (filters.attackGroup) {
            params.attack_group = filters.attackGroup;
          }
          if (filters.timeframe) {
            if (filters.timeframe.start) {
              params.start_date = filters.timeframe.start;
            }
            if (filters.timeframe.end) {
              params.end_date = filters.timeframe.end;
            }
          }
          if (filters.severity && filters.severity.length > 0) {
            params.severity = filters.severity.join(',');
          }
          if (filters.status && filters.status.length > 0) {
            params.status = filters.status.join(',');
          }
          if (filters.sectors && filters.sectors.length > 0) {
            params.sectors = filters.sectors.join(',');
          }
        }

        // Appel API pour récupérer les campagnes
        const response = await axios.get('/api/v1/campaigns', { params });
        setCampaigns(response.data.data);
        
        // Calculer les statistiques
        const stats = {
          total: response.data.data.length,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
        
        response.data.data.forEach(campaign => {
          if (campaign.severity) {
            stats[campaign.severity.toLowerCase()]++;
          }
        });
        
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

  // Mise à jour des marqueurs sur la carte lorsque les campagnes changent
  useEffect(() => {
    if (!markersLayerRef.current || !heatLayerRef.current || !attackLinesLayerRef.current) return;

    // Effacer toutes les couches
    markersLayerRef.current.clearLayers();
    heatLayerRef.current.clearLayers();
    attackLinesLayerRef.current.clearLayers();
    
    // Points pour la carte de chaleur
    const heatPoints = [];
    
    // Ajouter de nouveaux marqueurs pour chaque région ciblée par une campagne
    campaigns.forEach(campaign => {
      if (campaign.targeted_regions && campaign.targeted_regions.length > 0) {
        campaign.targeted_regions.forEach(region => {
          if (region.latitude && region.longitude) {
            // Sélectionner l'icône en fonction de la sévérité
            const icon = severityIcons[campaign.severity] || severityIcons.medium;
            
            // Créer le marqueur avec animation à l'apparition
            const marker = L.marker([region.latitude, region.longitude], { 
              icon,
              opacity: 0 // Commencer invisible pour l'animation
            }).addTo(markersLayerRef.current);
            
            // Animation d'apparition
            setTimeout(() => {
              let opacity = 0;
              const fadeIn = setInterval(() => {
                opacity += 0.1;
                marker.setOpacity(opacity);
                if (opacity >= 1) clearInterval(fadeIn);
              }, 50);
            }, Math.random() * 1000); // Délai aléatoire pour effet cascade
            
            // Ajouter une popup améliorée avec des informations sur la campagne
            marker.bindPopup(`
              <div class="map-popup">
                <h3>${campaign.name}</h3>
                <div class="popup-severity ${campaign.severity}">
                  <span class="severity-indicator"></span>
                  ${campaign.severity.toUpperCase()}
                </div>
                <div class="popup-details">
                  <p><strong>Status:</strong> <span class="status ${campaign.status.toLowerCase()}">${campaign.status}</span></p>
                  <p><strong>Region:</strong> ${region.name}</p>
                  ${campaign.attack_group ? `<p><strong>Attack Group:</strong> <a href="/attack-groups/${campaign.attack_group._id}">${campaign.attack_group.name}</a></p>` : ''}
                  <p><strong>Started:</strong> ${new Date(campaign.start_date).toLocaleDateString()}</p>
                  ${campaign.end_date ? `<p><strong>Ended:</strong> ${new Date(campaign.end_date).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="popup-description">
                  <p>${campaign.description}</p>
                </div>
                <div class="popup-actions">
                  <a href="/campaigns/${campaign._id}" class="popup-button">View Details</a>
                  <button class="popup-button secondary" onclick="window.alert('Threat intelligence report will be generated')">Generate Report</button>
                </div>
              </div>
            `, {
              maxWidth: 400,
              className: 'custom-popup'
            });
            
            // Ajouter un point à la carte de chaleur
            const intensity = campaign.severity === 'critical' ? 100 :
                             campaign.severity === 'high' ? 70 :
                             campaign.severity === 'medium' ? 40 : 20;
            
            heatPoints.push([region.latitude, region.longitude, intensity]);
            
            // Si la campagne a une origine connue, ajouter une ligne d'attaque
            if (campaign.origin_region && 
                campaign.origin_region.latitude && 
                campaign.origin_region.longitude) {
              
              // Créer une ligne entre l'origine et la cible
              const attackLine = L.polyline([
                [campaign.origin_region.latitude, campaign.origin_region.longitude],
                [region.latitude, region.longitude]
              ], {
                color: campaign.severity === 'critical' ? '#ff2d2d' :
                       campaign.severity === 'high' ? '#ff9e2d' :
                       campaign.severity === 'medium' ? '#ffcf2d' : '#2dbaff',
                weight: campaign.severity === 'critical' ? 3 :
                        campaign.severity === 'high' ? 2.5 :
                        campaign.severity === 'medium' ? 2 : 1.5,
                opacity: 0.7,
                dashArray: '5, 10',
                className: 'attack-line'
              }).addTo(attackLinesLayerRef.current);
              
              // Ajouter une animation à la ligne d'attaque
              const path = document.querySelector(`.attack-line:last-child`);
              if (path) {
                path.innerHTML = `
                  <animate attributeName="stroke-dashoffset" from="0" to="15" dur="1s" repeatCount="indefinite" />
                `;
              }
              
              // Ajouter un marqueur d'origine
              const originMarker = L.circleMarker(
                [campaign.origin_region.latitude, campaign.origin_region.longitude],
                {
                  radius: 5,
                  color: '#ff2d2d',
                  fillColor: '#ff2d2d',
                  fillOpacity: 0.8,
                  weight: 1
                }
              ).addTo(attackLinesLayerRef.current);
              
              // Popup pour le marqueur d'origine
              originMarker.bindTooltip(`
                <div class="origin-tooltip">
                  <strong>Attack Origin:</strong> ${campaign.origin_region.name}<br>
                  <strong>Group:</strong> ${campaign.attack_group ? campaign.attack_group.name : 'Unknown'}
                </div>
              `);
            }
          }
        });
      }
    });
    
    // Créer la carte de chaleur si la bibliothèque est disponible
    if (window.L.heatLayer) {
      window.L.heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.4: 'blue',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(heatLayerRef.current);
    } else {
      // Fallback si la bibliothèque de carte de chaleur n'est pas disponible
      console.warn('Leaflet.heat plugin not available. Heat map disabled.');
    }
    
  }, [campaigns]);

  // Mise à jour de la taille de la carte lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        
        <div className="view-mode-selector">
          <button 
            className={`view-mode-button ${viewMode === 'markers' ? 'active' : ''}`}
            onClick={() => setViewMode('markers')}
            title="Marker View"
          >
            <span className="icon">📍</span>
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'heat' ? 'active' : ''}`}
            onClick={() => setViewMode('heat')}
            title="Heat Map"
          >
            <span className="icon">🔥</span>
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'flow' ? 'active' : ''}`}
            onClick={() => setViewMode('flow')}
            title="Attack Flow"
          >
            <span className="icon">➡️</span>
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
