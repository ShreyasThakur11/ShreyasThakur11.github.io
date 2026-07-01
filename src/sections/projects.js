/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Projects and Engineering Tools section.
 */

import { createElement } from '../utils/dom.js';

export const renderProjects = () => {
  const section = createElement('section', { id: 'projects', className: 'section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '04. Portfolio');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Projects & Tools');
  
  // Part 1: Academic/Strategic Projects
  const academicHeader = createElement('h3', { className: 'projects-category-title reveal reveal-delay-2 mt-8 mb-6' }, 'Strategic & Academic Research');
  
  const academicGrid = createElement('div', { className: 'projects-grid-featured' });
  
  const academicProjects = [
    {
      title: 'Ambrettolide Manufacturing Plant Design (25 TPA)',
      type: 'Capstone Project',
      date: 'Sep 2024 – Apr 2025',
      bullets: [
        'Developed CAPEX/OPEX financial models and ROI projections to evaluate techno-economic viability.',
        'Compared synthesis pathways on cost, yield, and scalability, optimizing equipment sizing.',
        'Designed process flow diagrams and led a HAZOP study, identifying and mitigating 15 critical risk scenarios.'
      ]
    },
    {
      title: 'Climate Change Impact on Water Quality',
      type: 'Research Seminar',
      date: 'Nov 2024 – Jan 2025',
      bullets: [
        'Analyzed climate-driven water quality degradation and benchmarked parameters against Pollution Control Board standards.',
        'Evaluated advanced purification technologies for industrial deployment, assessing scalability and cost-effectiveness.'
      ]
    }
  ];
  
  academicProjects.forEach((proj, index) => {
    const card = createElement('div', { className: `card project-featured-card reveal reveal-delay-${(index % 2) + 2}` });
    card.innerHTML = `
      <div class="project-featured-header">
        <span class="project-featured-type">${proj.type}</span>
        <span class="project-featured-date text-muted">${proj.date}</span>
      </div>
      <h4>${proj.title}</h4>
      <ul class="project-featured-list">
        ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    `;
    academicGrid.appendChild(card);
  });
  
  // Part 2: Engineering Software Tools
  const toolsHeader = createElement('h3', { className: 'projects-category-title reveal mt-12 mb-6' }, 'Interactive Engineering Software');
  const toolsDesc = createElement('p', { className: 'reveal mb-8' }, 'A suite of client-side web applications built to automate complex chemical engineering calculations and design workflows.');
  
  const toolsGrid = createElement('div', { className: 'projects-grid-tools' });
  
  const tools = [
    {
      title: 'Smart PFD Generator',
      desc: 'Generative AI tool converting text descriptions into professional Process Flow Diagrams.',
      tags: ['Generative AI', 'NLP', 'Mermaid.js'],
      link: '/projects/pfd/index.html',
      badge: 'AI Powered'
    },
    {
      title: 'AI HAZOP Assistant',
      desc: 'Automated Process Hazard Analysis tool generating deviations and safeguards from text.',
      tags: ['Safety', 'Risk Analysis', 'Expert System'],
      link: '/projects/hazop/index.html',
      badge: 'Safety',
      blogLink: '/blog/ai-driven-hazop.html'
    },
    {
      title: 'Predictive Maintenance AI',
      desc: 'Dashboard using time-series regression to forecast fouling and detect anomalies.',
      tags: ['Time-Series', 'Forecasting', 'Chart.js'],
      link: '/projects/maintenance/index.html',
      badge: 'Reliability',
      blogLink: '/blog/predictive-maintenance.html'
    },
    {
      title: 'Shell & Tube Exchanger',
      desc: 'Rigorous design tool using Iterative Kern Method for detailed shell-side analysis.',
      tags: ['Kern Method', 'Unit Ops', 'JS'],
      link: '/projects/sthx/index.html',
      blogLink: '/blog/designing-heat-exchangers.html'
    },
    {
      title: 'Pressure Vessel Design',
      desc: 'ASME Section VIII Div 1 engine automating sizing, weight, and code compliance.',
      tags: ['ASME', 'Static Equip', 'Cost Est.'],
      link: '/projects/mechanical/index.html',
      badge: 'Mechanical'
    },
    {
      title: 'Double Pipe Exchanger',
      desc: 'Iterative design tool for heat duty analysis, area optimization, and pressure drop.',
      tags: ['Process Design', 'Numerical', 'JS'],
      link: '/projects/dphx/index.html'
    },
    {
      title: 'Distillation Tower',
      desc: 'Binary fractionation design using McCabe-Thiele with interactive VLE graphing.',
      tags: ['McCabe-Thiele', 'Mass Transfer', 'Chart.js'],
      link: '/projects/distillation/index.html'
    },
    {
      title: 'Multicomponent FUG',
      desc: 'Shortcut design for complex mixtures using Fenske-Underwood-Gilliland method.',
      tags: ['FUG Method', 'Simulation', 'JS'],
      link: '/projects/fug/index.html'
    },
    {
      title: 'Reactor Design AI',
      desc: 'CSTR & PFR engine solving Arrhenius kinetics numerically with RK4 integration.',
      tags: ['Kinetics', 'ODE Solver', 'JS'],
      link: '/projects/reactor/index.html',
      badge: 'Reaction Eng'
    }
  ];
  
  tools.forEach((tool, index) => {
    const card = createElement('div', { className: `card tool-card reveal reveal-delay-${(index % 3) + 1}` });
    
    let badgeHtml = '';
    if (tool.badge) {
      badgeHtml = `<span class="tool-badge">${tool.badge}</span>`;
    }
    
    let blogHtml = '';
    if (tool.blogLink) {
      blogHtml = `<a href="${tool.blogLink}" class="tool-blog-link">Read Case Study</a>`;
    }
    
    card.innerHTML = `
      ${badgeHtml}
      <h4>${tool.title}</h4>
      <p class="tool-desc text-sm">${tool.desc}</p>
      <div class="tool-tags">
        ${tool.tags.map(t => `<span class="badge">${t}</span>`).join('')}
      </div>
      <div class="tool-footer mt-auto pt-4 flex items-center justify-between">
        <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;">Launch Tool</a>
        ${blogHtml}
      </div>
    `;
    
    toolsGrid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  
  container.appendChild(academicHeader);
  container.appendChild(academicGrid);
  
  const divider = createElement('div', { className: 'divider reveal' });
  container.appendChild(divider);
  
  container.appendChild(toolsHeader);
  container.appendChild(toolsDesc);
  container.appendChild(toolsGrid);
  
  section.appendChild(container);
  
  return section;
};
