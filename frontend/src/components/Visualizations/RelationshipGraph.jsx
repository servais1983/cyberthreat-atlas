import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './RelationshipGraph.css';

const RelationshipGraph = ({ filters }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ nodes: [], links: [] });
  
  // Données de test pour éviter les erreurs d'API
  const mockData = {
    nodes: [
      { id: 'apt1', name: 'APT1', type: 'group', country: 'China' },
      { id: 'apt28', name: 'APT28', type: 'group', country: 'Russia' },
      { id: 'lazarus', name: 'Lazarus Group', type: 'group', country: 'North Korea' },
      { id: 't1566', name: 'Phishing', type: 'technique', category: 'Initial Access' },
      { id: 't1059', name: 'Command and Scripting', type: 'technique', category: 'Execution' },
      { id: 't1055', name: 'Process Injection', type: 'technique', category: 'Defense Evasion' },
      { id: 'finance', name: 'Financial Services', type: 'sector' },
      { id: 'government', name: 'Government', type: 'sector' },
      { id: 'healthcare', name: 'Healthcare', type: 'sector' },
      { id: 'campaign1', name: 'Operation Aurora', type: 'campaign', severity: 'critical' },
      { id: 'campaign2', name: 'NotPetya', type: 'campaign', severity: 'high' }
    ],
    links: [
      { source: 'apt1', target: 't1566', type: 'uses' },
      { source: 'apt1', target: 't1059', type: 'uses' },
      { source: 'apt28', target: 't1566', type: 'uses' },
      { source: 'apt28', target: 't1055', type: 'uses' },
      { source: 'lazarus', target: 't1059', type: 'uses' },
      { source: 'apt1', target: 'government', type: 'targets' },
      { source: 'apt28', target: 'government', type: 'targets' },
      { source: 'lazarus', target: 'finance', type: 'targets' },
      { source: 'apt1', target: 'campaign1', type: 'conducts' },
      { source: 'apt28', target: 'campaign2', type: 'conducts' }
    ]
  };
  
  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simuler un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Utiliser les données de test
        setData(mockData);
      } catch (err) {
        console.error('Error fetching data for relationship graph:', err);
        setError('Failed to load relationship data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  // Création et mise à jour du graphe
  useEffect(() => {
    if (loading || error || !data.nodes.length) return;
    
    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    // Effacer le contenu existant
    svg.selectAll('*').remove();
    
    // Obtenir les dimensions du conteneur
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Définir le schéma de couleurs
    const nodeColors = {
      group: '#e41a1c',
      technique: '#377eb8',
      sector: '#4daf4a',
      campaign: '#984ea3'
    };
    
    const severityColors = {
      critical: '#d32f2f',
      high: '#f57c00',
      medium: '#fbc02d',
      low: '#7cb342'
    };
    
    // Créer la simulation de force
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));
    
    // Créer les liens
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('class', d => `link link-${d.type}`);
    
    // Créer les nœuds
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', d => `node node-${d.type}`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Ajouter des cercles pour représenter les nœuds
    node.append('circle')
      .attr('r', d => (d.type === 'group' || d.type === 'campaign') ? 12 : 8)
      .attr('fill', d => {
        if (d.type === 'campaign' && d.severity) {
          return severityColors[d.severity] || nodeColors[d.type];
        }
        return nodeColors[d.type];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Ajouter des étiquettes pour les nœuds
    node.append('text')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .attr('class', 'node-label')
      .text(d => d.name)
      .attr('font-size', d => (d.type === 'group' || d.type === 'campaign') ? 12 : 10)
      .attr('font-weight', d => (d.type === 'group' || d.type === 'campaign') ? 'bold' : 'normal');
    
    // Événements d'interaction avec les nœuds
    node
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .attr('stroke', '#333')
          .attr('stroke-width', 2);
        
        // Afficher le tooltip
        tooltip
          .style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(createTooltipContent(d));
        
        // Mettre en évidence les liens connectés
        link
          .attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2)
          .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 2.5 : 1);
      })
      .on('mouseout', function() {
        d3.select(this).select('circle')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);
        
        tooltip.style('display', 'none');
        
        // Restaurer les styles des liens
        link
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 1.5);
      })
      .on('click', (event, d) => {
        // Navigation vers la page de détail du nœud sélectionné
        if (d.type === 'group') {
          window.location.href = `/groups/${d.id}`;
        } else if (d.type === 'technique') {
          window.location.href = `/techniques/${d.id}`;
        } else if (d.type === 'campaign') {
          window.location.href = `/campaigns/${d.id}`;
        } else if (d.type === 'sector') {
          window.location.href = `/sectors/${d.id}`;
        }
      });
    
    // Fonction pour créer le contenu du tooltip
    function createTooltipContent(d) {
      let content = `<div class="tooltip-title">${d.name}</div>`;
      
      switch (d.type) {
        case 'group':
          content += `
            <p><strong>Type:</strong> Attack Group</p>
            ${d.country ? `<p><strong>Country:</strong> ${d.country}</p>` : ''}
          `;
          break;
        case 'technique':
          content += `
            <p><strong>Type:</strong> Attack Technique</p>
            ${d.category ? `<p><strong>Tactic:</strong> ${d.category}</p>` : ''}
          `;
          break;
        case 'sector':
          content += `
            <p><strong>Type:</strong> Targeted Sector</p>
          `;
          break;
        case 'campaign':
          content += `
            <p><strong>Type:</strong> Active Campaign</p>
            <p><strong>Severity:</strong> ${d.severity}</p>
          `;
          break;
      }
      
      content += `<p class="tooltip-instruction">Click to view details</p>`;
      
      return content;
    }
    
    // Fonctions de gestion du drag & drop
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Mise à jour des positions à chaque tick de la simulation
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Nettoyage lors du démontage
    return () => {
      simulation.stop();
    };
  }, [data, loading, error]);
  
  // Ajustement de la taille lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && containerRef.current) {
        const container = containerRef.current;
        const svg = d3.select(svgRef.current);
        
        svg.attr('width', container.clientWidth)
          .attr('height', container.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="relationship-graph-container" ref={containerRef}>
      {loading && <div className="graph-loading">Loading relationship data...</div>}
      {error && <div className="graph-error">{error}</div>}
      {!loading && !error && data.nodes.length === 0 && (
        <div className="graph-empty">No data available for the selected filters.</div>
      )}
      <svg ref={svgRef} width="100%" height="600"></svg>
      <div className="graph-tooltip" ref={tooltipRef}></div>
      
      <div className="graph-legend">
        <h4>Node Types</h4>
        <div className="legend-item">
          <div className="legend-node group"></div>
          <span>Attack Group</span>
        </div>
        <div className="legend-item">
          <div className="legend-node technique"></div>
          <span>Technique</span>
        </div>
        <div className="legend-item">
          <div className="legend-node sector"></div>
          <span>Targeted Sector</span>
        </div>
        <div className="legend-item">
          <div className="legend-node campaign"></div>
          <span>Active Campaign</span>
        </div>
      </div>
    </div>
  );
};

export default RelationshipGraph;