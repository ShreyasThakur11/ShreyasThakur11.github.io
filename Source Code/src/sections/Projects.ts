/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Projects section highlighting capstone and analytical work.
 */

import { createElement } from '../utils/dom.js';

export const renderProjects = (): HTMLElement => {
  const section = createElement('section', { className: 'section bg-alt', id: 'projects' });
  const container = createElement('div', { className: 'container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <h2 class="section-title">Selected Projects</h2>
    <p class="section-desc">Demonstrating technical rigor, complex problem solving, and system optimization.</p>
  `;

  // Projects Grid
  const grid = createElement('div', { className: 'projects-grid' });

  const projects = [
    {
      title: 'Ambrettolide Plant Design (25 TPA)',
      tags: ['Capstone', 'Process Economics', 'Optimization'],
      description: 'Comprehensive design of a 25 TPA specialty chemicals facility. Evaluated techno-economic viability, synthesized process flow diagrams, and optimized mass/energy balances.',
    },
    {
      title: 'AI-Driven Predictive Maintenance',
      tags: ['Industrial IoT', 'Data Analytics', 'Reliability'],
      description: 'Developed robust predictive models to anticipate equipment failure, minimizing downtime and optimizing maintenance scheduling for continuous manufacturing operations.',
    },
    {
      title: 'HAZOP & Safety Protocols',
      tags: ['Risk Management', 'Compliance', 'Safety'],
      description: 'Led Hazard and Operability (HAZOP) studies for critical process nodes. Identified potential deviations, assessed risks, and recommended engineering safeguards.',
    }
  ];

  projects.forEach((proj, index) => {
    const card = createElement('div', { className: `project-card glass-card reveal reveal-delay-${(index % 3) + 1}` });
    
    const tagsHtml = proj.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
    
    card.innerHTML = `
      <div class="project-tags">${tagsHtml}</div>
      <h3 class="project-title">${proj.title}</h3>
      <p class="project-desc">${proj.description}</p>
    `;
    
    grid.appendChild(card);
  });

  container.appendChild(header);
  container.appendChild(grid);
  section.appendChild(container);

  return section;
};
