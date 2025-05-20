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
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  high: new L.Icon({
    iconUrl: markerIconHighUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

const ThreatMap = ({ filters }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // Initialisation de la carte
  useEffect(() => {
    if (!leafletMapRef.current && mapRef.current) {
      // Création de la carte Leaflet
      leafletMapRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180]
        ]
      });

      // Ajout de la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);

      // Création d'une couche pour les marqueurs
      markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

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
    if (!markersLayerRef.current) return;

    // Effacer tous les marqueurs existants
    markersLayerRef.current.clearLayers();

    // Ajouter de nouveaux marqueurs pour chaque région ciblée par une campagne
    campaigns.forEach(campaign => {
      if (campaign.targeted_regions && campaign.targeted_regions.length > 0) {
        campaign.targeted_regions.forEach(region => {
          if (region.latitude && region.longitude) {
            // Sélectionner l'icône en fonction de la sévérité
            const icon = severityIcons[campaign.severity] || severityIcons.medium;
            
            // Créer le marqueur
            const marker = L.marker([region.latitude, region.longitude], { icon })
              .addTo(markersLayerRef.current);
            
            // Ajouter une popup avec des informations sur la campagne
            marker.bindPopup(`
              <div class="map-popup">
                <h3>${campaign.name}</h3>
                <p><strong>Status:</strong> ${campaign.status}</p>
                <p><strong>Severity:</strong> ${campaign.severity}</p>
                <p><strong>Region:</strong> ${region.name}</p>
                ${campaign.attack_group ? `<p><strong>Attack Group:</strong> ${campaign.attack_group.name}</p>` : ''}
                <p><strong>Started:</strong> ${new Date(campaign.start_date).toLocaleDateString()}</p>
                ${campaign.end_date ? `<p><strong>Ended:</strong> ${new Date(campaign.end_date).toLocaleDateString()}</p>` : ''}
                <p>${campaign.description}</p>
                <a href="/campaigns/${campaign._id}" class="popup-link">View Details</a>
              </div>
            `);
          }
        });
      }
    });
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
      {loading && <div className="map-loading">Loading map data...</div>}
      {error && <div className="map-error">{error}</div>}
      <div 
        ref={mapRef} 
        className="threat-map"
        style={{ height: '100%', width: '100%' }}
      />
      <div className="map-legend">
        <h4>Threat Severity</h4>
        <div className="legend-item">
          <div className="legend-marker critical"></div>
          <span>Critical</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker high"></div>
          <span>High</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker medium"></div>
          <span>Medium</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker low"></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
