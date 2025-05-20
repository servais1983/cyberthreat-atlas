import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange }) => {
  // États pour les différents filtres
  const [attackGroups, setAttackGroups] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Valeurs des filtres sélectionnés
  const [selectedFilters, setSelectedFilters] = useState({
    attackGroup: '',
    techniques: [],
    sectors: [],
    regions: [],
    timeframe: {
      start: '',
      end: ''
    },
    severity: [],
    status: []
  });
  
  // Statut d'expansion des sections de filtres
  const [expandedSections, setExpandedSections] = useState({
    attackGroups: true,
    techniques: false,
    sectors: false,
    regions: false,
    timeframe: true,
    severity: true,
    status: true
  });
  
  // Options prédéfinies pour les filtres de sévérité et de statut
  const severityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];
  
  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'planned', label: 'Planned' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  // Chargement des données pour les filtres
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Requêtes parallèles pour les données des filtres
        const [
          attackGroupsResponse,
          techniquesResponse,
          sectorsResponse,
          regionsResponse
        ] = await Promise.all([
          axios.get('/api/v1/attack-groups'),
          axios.get('/api/v1/techniques'),
          axios.get('/api/v1/sectors'),
          axios.get('/api/v1/regions')
        ]);
        
        // Mettre à jour les états avec les données récupérées
        setAttackGroups(attackGroupsResponse.data.data);
        setTechniques(techniquesResponse.data.data);
        setSectors(sectorsResponse.data.data);
        setRegions(regionsResponse.data.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Failed to load filter options. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);
  
  // Gérer les changements de filtre (groupe d'attaque)
  const handleAttackGroupChange = (event) => {
    const attackGroupId = event.target.value;
    
    setSelectedFilters(prev => ({
      ...prev,
      attackGroup: attackGroupId
    }));
  };
  
  // Gérer les changements de filtre (techniques)
  const handleTechniqueChange = (techniqueId) => {
    setSelectedFilters(prev => {
      const updatedTechniques = prev.techniques.includes(techniqueId)
        ? prev.techniques.filter(id => id !== techniqueId)
        : [...prev.techniques, techniqueId];
      
      return {
        ...prev,
        techniques: updatedTechniques
      };
    });
  };
  
  // Gérer les changements de filtre (secteurs)
  const handleSectorChange = (sectorId) => {
    setSelectedFilters(prev => {
      const updatedSectors = prev.sectors.includes(sectorId)
        ? prev.sectors.filter(id => id !== sectorId)
        : [...prev.sectors, sectorId];
      
      return {
        ...prev,
        sectors: updatedSectors
      };
    });
  };
  
  // Gérer les changements de filtre (régions)
  const handleRegionChange = (regionId) => {
    setSelectedFilters(prev => {
      const updatedRegions = prev.regions.includes(regionId)
        ? prev.regions.filter(id => id !== regionId)
        : [...prev.regions, regionId];
      
      return {
        ...prev,
        regions: updatedRegions
      };
    });
  };
  
  // Gérer les changements de filtre (période)
  const handleTimeframeChange = (field, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      timeframe: {
        ...prev.timeframe,
        [field]: value
      }
    }));
  };
  
  // Gérer les changements de filtre (sévérité)
  const handleSeverityChange = (severityValue) => {
    setSelectedFilters(prev => {
      const updatedSeverity = prev.severity.includes(severityValue)
        ? prev.severity.filter(value => value !== severityValue)
        : [...prev.severity, severityValue];
      
      return {
        ...prev,
        severity: updatedSeverity
      };
    });
  };
  
  // Gérer les changements de filtre (statut)
  const handleStatusChange = (statusValue) => {
    setSelectedFilters(prev => {
      const updatedStatus = prev.status.includes(statusValue)
        ? prev.status.filter(value => value !== statusValue)
        : [...prev.status, statusValue];
      
      return {
        ...prev,
        status: updatedStatus
      };
    });
  };
  
  // Basculer l'expansion d'une section de filtres
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedFilters({
      attackGroup: '',
      techniques: [],
      sectors: [],
      regions: [],
      timeframe: {
        start: '',
        end: ''
      },
      severity: [],
      status: []
    });
    
    // Appliquer les changements de filtre
    onFilterChange({
      attackGroup: '',
      techniques: [],
      sectors: [],
      regions: [],
      timeframe: {
        start: '',
        end: ''
      },
      severity: [],
      status: []
    });
  };
  
  // Appliquer les filtres
  const applyFilters = () => {
    onFilterChange(selectedFilters);
  };
  
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Advanced Filters</h3>
        <button 
          className="reset-button" 
          onClick={resetFilters}
          title="Reset all filters"
        >
          Reset
        </button>
      </div>
      
      {loading ? (
        <div className="filter-loading">Loading filter options...</div>
      ) : error ? (
        <div className="filter-error">{error}</div>
      ) : (
        <div className="filter-sections">
          {/* Section Groupe d'attaque */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('attackGroups')}
            >
              <h4>Attack Group</h4>
              <span className={`toggle-icon ${expandedSections.attackGroups ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.attackGroups && (
              <div className="section-content">
                <select 
                  className="attack-group-select"
                  value={selectedFilters.attackGroup}
                  onChange={handleAttackGroupChange}
                >
                  <option value="">All Attack Groups</option>
                  {attackGroups.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                      {group.country_of_origin && ` (${group.country_of_origin})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Section Techniques */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('techniques')}
            >
              <h4>Techniques</h4>
              <span className={`toggle-icon ${expandedSections.techniques ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.techniques && (
              <div className="section-content scrollable-content">
                {techniques.map(technique => (
                  <div key={technique._id} className="checkbox-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.techniques.includes(technique._id)}
                        onChange={() => handleTechniqueChange(technique._id)}
                      />
                      <span className="checkbox-label">
                        {technique.name}
                        {technique.mitre_id && <span className="id-badge">{technique.mitre_id}</span>}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Section Secteurs */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('sectors')}
            >
              <h4>Targeted Sectors</h4>
              <span className={`toggle-icon ${expandedSections.sectors ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.sectors && (
              <div className="section-content">
                {sectors.map(sector => (
                  <div key={sector._id} className="checkbox-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.sectors.includes(sector._id)}
                        onChange={() => handleSectorChange(sector._id)}
                      />
                      <span className="checkbox-label">{sector.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Section Régions */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('regions')}
            >
              <h4>Targeted Regions</h4>
              <span className={`toggle-icon ${expandedSections.regions ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.regions && (
              <div className="section-content scrollable-content">
                {regions.map(region => (
                  <div key={region._id} className="checkbox-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.regions.includes(region._id)}
                        onChange={() => handleRegionChange(region._id)}
                      />
                      <span className="checkbox-label">
                        {region.name}
                        {region.code && <span className="code-badge">{region.code}</span>}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Section Période */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('timeframe')}
            >
              <h4>Timeframe</h4>
              <span className={`toggle-icon ${expandedSections.timeframe ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.timeframe && (
              <div className="section-content">
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label htmlFor="start-date">From:</label>
                    <input 
                      type="date" 
                      id="start-date"
                      value={selectedFilters.timeframe.start}
                      onChange={(e) => handleTimeframeChange('start', e.target.value)}
                    />
                  </div>
                  
                  <div className="date-input-group">
                    <label htmlFor="end-date">To:</label>
                    <input 
                      type="date" 
                      id="end-date"
                      value={selectedFilters.timeframe.end}
                      onChange={(e) => handleTimeframeChange('end', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Section Sévérité */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('severity')}
            >
              <h4>Severity</h4>
              <span className={`toggle-icon ${expandedSections.severity ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.severity && (
              <div className="section-content">
                <div className="severity-options">
                  {severityOptions.map(option => (
                    <div key={option.value} className="checkbox-item severity-item">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.severity.includes(option.value)}
                          onChange={() => handleSeverityChange(option.value)}
                        />
                        <span className={`severity-label ${option.value}`}>
                          {option.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Section Statut */}
          <div className="filter-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('status')}
            >
              <h4>Status</h4>
              <span className={`toggle-icon ${expandedSections.status ? 'expanded' : ''}`}>
                &#9660;
              </span>
            </div>
            
            {expandedSections.status && (
              <div className="section-content">
                <div className="status-options">
                  {statusOptions.map(option => (
                    <div key={option.value} className="checkbox-item status-item">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.status.includes(option.value)}
                          onChange={() => handleStatusChange(option.value)}
                        />
                        <span className={`status-label ${option.value}`}>
                          {option.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="filter-actions">
        <button 
          className="apply-button" 
          onClick={applyFilters}
          disabled={loading}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
