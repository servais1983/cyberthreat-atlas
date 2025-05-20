import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './RelationshipGraph.css';

const RelationshipGraph = ({ filters }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ nodes: [], links: [] });
  
  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Paramètres de filtrage
        let attackGroupParams = {};
        let campaignParams = {};
        
        if (filters) {
          // Appliquer les filtres aux requêtes
          if (filters.attackGroup) {
            attackGroupParams.id = filters.attackGroup;
            campaignParams.attack_group = filters.attackGroup;
          }
          
          if (filters.sectors && filters.sectors.length > 0) {
            attackGroupParams.targeted_sectors = filters.sectors.join(',');
            campaignParams.sectors = filters.sectors.join(',');
          }
          
          if (filters.timeframe) {
            if (filters.timeframe.start) {
              campaignParams.start_date = filters.timeframe.start;
            }
            if (filters.timeframe.end) {
              campaignParams.end_date = filters.timeframe.end;
            }
          }
        }
        
        // Requêtes parallèles pour les données nécessaires
        const [attackGroupsRes, campaignsRes, techniquesRes, sectorsRes] = await Promise.all([
          axios.get('/api/v1/attack-groups', { params: attackGroupParams }),
          axios.get('/api/v1/campaigns', { params: campaignParams }),
          axios.get('/api/v1/techniques'),
          axios.get('/api/v1/sectors')
        ]);
        
        // Préparation des données pour le graphe
        const nodes = [];
        const links = [];
        const nodeIds = new Set();
        
        // Ajouter les groupes d'attaque comme nœuds
        attackGroupsRes.data.data.forEach(group => {
          nodes.push({
            id: group._id,
            name: group.name,
            type: 'group',
            country: group.country_of_origin,
            data: group
          });
          nodeIds.add(group._id);
        });
        
        // Ajouter les techniques comme nœuds
        techniquesRes.data.data.forEach(technique => {
          // Vérifier si la technique est utilisée par un groupe filtré
          const isRelevant = attackGroupsRes.data.data.some(group => 
            group.known_techniques && group.known_techniques.includes(technique._id)
          );
          
          if (isRelevant) {
            nodes.push({
              id: technique._id,
              name: technique.name,
              type: 'technique',
              category: technique.tactic,
              data: technique
            });
            nodeIds.add(technique._id);
          }
        });
        
        // Ajouter les secteurs ciblés comme nœuds
        sectorsRes.data.data.forEach(sector => {
          // Vérifier si le secteur est ciblé par un groupe filtré
          const isRelevant = attackGroupsRes.data.data.some(group => 
            group.targeted_sectors && group.targeted_sectors.includes(sector._id)
          );
          
          if (isRelevant) {
            nodes.push({
              id: sector._id,
              name: sector.name,
              type: 'sector',
              data: sector
            });
            nodeIds.add(sector._id);
          }
        });
        
        // Créer les liens entre les groupes et les techniques
        attackGroupsRes.data.data.forEach(group => {
          if (group.known_techniques) {
            group.known_techniques.forEach(techniqueId => {
              if (nodeIds.has(techniqueId)) {
                links.push({
                  source: group._id,
                  target: techniqueId,
                  type: 'uses'
                });
              }
            });
          }
          
          // Créer les liens entre les groupes et les secteurs ciblés
          if (group.targeted_sectors) {
            group.targeted_sectors.forEach(sectorId => {
              if (nodeIds.has(sectorId)) {
                links.push({
                  source: group._id,
                  target: sectorId,
                  type: 'targets'
                });
              }
            });
          }
        });
        
        // Ajouter les campagnes actives comme nœuds supplémentaires
        campaignsRes.data.data.forEach(campaign => {
          if (campaign.status === 'ongoing' || campaign.status === 'active') {
            nodes.push({
              id: campaign._id,
              name: campaign.name,
              type: 'campaign',
              severity: campaign.severity,
              data: campaign
            });
            nodeIds.add(campaign._id);
            
            // Lien entre la campagne et le groupe d'attaque
            if (campaign.attack_group && nodeIds.has(campaign.attack_group)) {
              links.push({
                source: campaign.attack_group,
                target: campaign._id,
                type: 'conducts'
              });
            }
          }
        });
        
        setData({ nodes, links });
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
          window.location.href = `/attack-groups/${d.id}`;
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
            ${d.data.aliases?.length ? `<p><strong>Aliases:</strong> ${d.data.aliases.join(', ')}</p>` : ''}
            ${d.data.motivation ? `<p><strong>Motivation:</strong> ${d.data.motivation}</p>` : ''}
          `;
          break;
        case 'technique':
          content += `
            <p><strong>Type:</strong> Attack Technique</p>
            ${d.category ? `<p><strong>Tactic:</strong> ${d.category}</p>` : ''}
            ${d.data.mitre_id ? `<p><strong>MITRE ID:</strong> ${d.data.mitre_id}</p>` : ''}
          `;
          break;
        case 'sector':
          content += `
            <p><strong>Type:</strong> Targeted Sector</p>
            ${d.data.description ? `<p>${d.data.description}</p>` : ''}
          `;
          break;
        case 'campaign':
          content += `
            <p><strong>Type:</strong> Active Campaign</p>
            <p><strong>Status:</strong> ${d.data.status}</p>
            <p><strong>Severity:</strong> ${d.data.severity}</p>
            ${d.data.start_date ? `<p><strong>Started:</strong> ${new Date(d.data.start_date).toLocaleDateString()}</p>` : ''}
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
