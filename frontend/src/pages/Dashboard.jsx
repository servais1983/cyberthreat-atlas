import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ThreatMap from '../components/Visualizations/ThreatMap';
import RelationshipGraph from '../components/Visualizations/RelationshipGraph';
import CampaignTimeline from '../components/Visualizations/CampaignTimeline';
import FilterPanel from '../components/Filters/FilterPanel';
import './Dashboard.css';

const Dashboard = () => {
  // État pour les filtres sélectionnés
  const [filters, setFilters] = useState({
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
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState(0);
  
  // Gestion du changement de filtres
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Résumé des filtres appliqués
  const renderAppliedFilters = () => {
    const appliedFilters = [];
    
    if (filters.attackGroup) {
      appliedFilters.push('Attack Group');
    }
    
    if (filters.techniques && filters.techniques.length > 0) {
      appliedFilters.push(`${filters.techniques.length} Technique(s)`);
    }
    
    if (filters.sectors && filters.sectors.length > 0) {
      appliedFilters.push(`${filters.sectors.length} Sector(s)`);
    }
    
    if (filters.regions && filters.regions.length > 0) {
      appliedFilters.push(`${filters.regions.length} Region(s)`);
    }
    
    if (filters.severity && filters.severity.length > 0) {
      appliedFilters.push(`${filters.severity.length} Severity Level(s)`);
    }
    
    if (filters.status && filters.status.length > 0) {
      appliedFilters.push(`${filters.status.length} Status(es)`);
    }
    
    if (filters.timeframe && (filters.timeframe.start || filters.timeframe.end)) {
      const timeframeText = [];
      if (filters.timeframe.start) {
        timeframeText.push(`From: ${filters.timeframe.start}`);
      }
      if (filters.timeframe.end) {
        timeframeText.push(`To: ${filters.timeframe.end}`);
      }
      appliedFilters.push(timeframeText.join(' '));
    }
    
    if (appliedFilters.length === 0) {
      return <span className="no-filters">No filters applied</span>;
    }
    
    return (
      <div className="filter-pills">
        {appliedFilters.map((filter, index) => (
          <span key={index} className="filter-pill">
            {filter}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>CyberThreat Atlas</h1>
        <p className="dashboard-subtitle">
          Global visualization of cyber attack campaigns, techniques, and threat actors
        </p>
      </div>
      
      <div className="dashboard-content">
        <div className="filter-sidebar">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
        
        <div className="visualization-content">
          <div className="applied-filters-container">
            <div className="applied-filters-header">
              <h3>Applied Filters</h3>
            </div>
            <div className="applied-filters-content">
              {renderAppliedFilters()}
            </div>
          </div>
          
          <div className="tabs-container">
            <Tabs 
              selectedIndex={activeTab} 
              onSelect={(index) => setActiveTab(index)}
              className="dashboard-tabs"
            >
              <TabList>
                <Tab>World Map</Tab>
                <Tab>Relationship Graph</Tab>
                <Tab>Campaign Timeline</Tab>
              </TabList>
              
              <TabPanel>
                <div className="visualization-panel">
                  <ThreatMap filters={filters} />
                </div>
              </TabPanel>
              
              <TabPanel>
                <div className="visualization-panel">
                  <RelationshipGraph filters={filters} />
                </div>
              </TabPanel>
              
              <TabPanel>
                <div className="visualization-panel">
                  <CampaignTimeline filters={filters} />
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
