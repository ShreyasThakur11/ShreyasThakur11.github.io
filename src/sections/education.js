/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Education section component.
 */

import { createElement } from '../utils/dom.js';

export const renderEducation = () => {
  const section = createElement('section', { id: 'education', className: 'section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '07. Academic Background');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Education');
  
  const grid = createElement('div', { className: 'education-grid' });
  
  const education = [
    {
      degree: 'Master of Business Administration (MBA)',
      institution: 'Indian Institute of Management (IIM), Mumbai',
      location: 'Mumbai, India',
      date: 'Jun 2026 – Present',
      highlight: 'Transitioning to business leadership with focus on advanced strategy, analytics, and operations.',
      coursework: []
    },
    {
      degree: 'Bachelor of Technology (B.Tech) in Chemical Engineering',
      institution: 'Institute of Chemical Technology (ICT), Mumbai',
      location: 'Mumbai, India',
      date: '2021 – 2025',
      score: 'CGPA: 6.60 / 10.00',
      coursework: ['Process Economics', 'Systems Optimization', 'Numerical Methods', 'Industrial Management', 'Transport Phenomena']
    }
  ];
  
  education.forEach((edu, index) => {
    const card = createElement('div', { className: `card edu-card reveal reveal-delay-${(index % 2) + 1}` });
    
    let scoreHtml = edu.score ? `<span class="edu-score badge">${edu.score}</span>` : '';
    let highlightHtml = edu.highlight ? `<p class="edu-highlight">${edu.highlight}</p>` : '';
    
    let courseworkHtml = '';
    if (edu.coursework && edu.coursework.length > 0) {
      courseworkHtml = `
        <div class="edu-coursework mt-4">
          <span class="text-sm font-semibold text-secondary">Relevant Coursework:</span>
          <div class="tool-tags mt-2">
            ${edu.coursework.map(c => `<span class="badge">${c}</span>`).join('')}
          </div>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="edu-header">
        <div class="edu-title-wrapper">
          <h3>${edu.degree}</h3>
          ${scoreHtml}
        </div>
        <span class="edu-date">${edu.date}</span>
      </div>
      <div class="edu-inst-row">
        <span class="edu-institution">${edu.institution}</span>
        <span class="edu-location">${edu.location}</span>
      </div>
      ${highlightHtml}
      ${courseworkHtml}
    `;
    
    grid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};
