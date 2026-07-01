/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Experience section component.
 */

import { createElement } from '../utils/dom.js';

export const renderExperience = () => {
  const section = createElement('section', { id: 'experience', className: 'section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '03. Professional History');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Experience');
  
  const expGrid = createElement('div', { className: 'experience-grid' });
  
  const experiences = [
    {
      role: 'Tax & Audit Assistant',
      company: 'Office of Santosh S. Bakshetti',
      location: 'Mumbai, Maharashtra',
      date: 'Jun 2025 – May 2026',
      bullets: [
        'Led statutory audits and financial reconciliation for 10+ cooperative housing societies, identifying balance discrepancies and ensuring 100% adherence to regulatory reporting standards.',
        'Managed end-to-end bookkeeping and accounts reconciliation for a manufacturing client generating INR 50 Cr in annual revenue, reducing audit preparation turnaround by 30%.',
        'Streamlined income tax documentation and filing workflows for 15+ high-net-worth individual clients, redesigning data collection protocols to eliminate late-filing compliance risks.'
      ],
      note: 'Verified via formal experience letter.'
    },
    {
      role: 'Process Engineering Intern',
      company: 'Epigral Ltd.',
      location: 'Dahej, Gujarat',
      date: 'Jun 2024 – Aug 2024',
      bullets: [
        'Performed root cause analysis on plant operational data to diagnose catalyst deactivation; designed a predictive monitoring framework that improved asset utilization by 12%.',
        'Investigated critical burner failures using Process Safety Management (PSM) protocols and proposed corrective actions that reduced potential unplanned downtime by 20%.',
        'Executed a systematic moisture reduction study across purification units, identifying and eliminating process bottlenecks to improve production throughput by 8%.'
      ]
    }
  ];
  
  experiences.forEach((exp, index) => {
    const card = createElement('div', { className: `card exp-card reveal reveal-delay-${(index % 2) + 1}` });
    
    const header = createElement('div', { className: 'exp-header' });
    header.innerHTML = `
      <div class="exp-title-row">
        <h3>${exp.role}</h3>
        <span class="exp-date">${exp.date}</span>
      </div>
      <div class="exp-company-row">
        <span class="exp-company">${exp.company}</span>
        <span class="exp-location">${exp.location}</span>
      </div>
    `;
    
    const body = createElement('div', { className: 'exp-body' });
    const ul = createElement('ul', { className: 'exp-list' });
    
    exp.bullets.forEach(bullet => {
      const li = createElement('li', {}, bullet);
      ul.appendChild(li);
    });
    
    body.appendChild(ul);
    
    card.appendChild(header);
    card.appendChild(body);
    
    if (exp.note) {
      const footer = createElement('div', { className: 'exp-footer text-muted text-sm mt-4' });
      footer.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle; margin-right:4px;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        ${exp.note}
      `;
      card.appendChild(footer);
    }
    
    expGrid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(expGrid);
  section.appendChild(container);
  
  return section;
};
