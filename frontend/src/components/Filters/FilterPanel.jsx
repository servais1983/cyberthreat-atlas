import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange }) => {
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

  const attackGroups = [
    'APT1', 'APT28', 'APT29', 'Lazarus Group', 'Fancy Bear', 'Cozy Bear'
  ];

  const techniques = [
    'Spear Phishing', 'Malware', 'SQL Injection', 'DDoS', 'Ransomware', 'Social Engineering'
  ];

  const sectors = [
    'Government', 'Financial', 'Healthcare', 'Education', 'Energy', 'Technology'
  ];

  const regions = [
    'North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa', 'South America'
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['Active', 'Inactive', 'Under Investigation', 'Resolved'];

  const handleFilterChange = (filterType, value) => {
    let newFilters = { ...filters };

    if (filterType === 'attackGroup') {
      newFilters.attackGroup = value;
    } else if (filterType === 'timeframe') {
      newFilters.timeframe = { ...newFilters.timeframe, ...value };
    } else if (Array.isArray(newFilters[filterType])) {
      const currentValues = newFilters[filterType];
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentValues, value];
      }
    }

    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      attackGroup: '',
      techniques: [],
      sectors: [],
      regions: [],
      timeframe: { start: '', end: '' },
      severity: [],
      status: []
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const renderCheckboxGroup = (title, options, filterType) => {
    return (
      <div className="filter-group">
        <h4>{title}</h4>
        <div className="checkbox-group">
          {options.map(option => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters[filterType].includes(option)}
                onChange={() => handleFilterChange(filterType, option)}
              />
              <span className="checkbox-text">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      {/* Attack Group Select */}
      <div className="filter-group">
        <h4>Attack Group</h4>
        <select
          value={filters.attackGroup}
          onChange={(e) => handleFilterChange('attackGroup', e.target.value)}
          className="filter-select"
        >
          <option value="">All Groups</option>
          {attackGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Timeframe */}
      <div className="filter-group">
        <h4>Timeframe</h4>
        <div className="date-inputs">
          <input
            type="date"
            value={filters.timeframe.start}
            onChange={(e) => handleFilterChange('timeframe', { start: e.target.value })}
            className="date-input"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.timeframe.end}
            onChange={(e) => handleFilterChange('timeframe', { end: e.target.value })}
            className="date-input"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Techniques */}
      {renderCheckboxGroup('Techniques', techniques, 'techniques')}

      {/* Sectors */}
      {renderCheckboxGroup('Sectors', sectors, 'sectors')}

      {/* Regions */}
      {renderCheckboxGroup('Regions', regions, 'regions')}

      {/* Severity */}
      {renderCheckboxGroup('Severity', severityLevels, 'severity')}

      {/* Status */}
      {renderCheckboxGroup('Status', statusOptions, 'status')}
    </div>
  );
};

export default FilterPanel;