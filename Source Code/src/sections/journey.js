/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Career Journey section (timeline).
 */

import { createElement } from '../utils/dom.js';

export const renderJourney = () => {
  const section = createElement('section', { id: 'journey', className: 'section journey-section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '02. Career Progression');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'My Journey');
  
  const timeline = createElement('div', { className: 'timeline' });
  
  const milestones = [
    {
      year: '2026',
      title: 'MBA Candidate',
      organization: 'IIM Mumbai',
      description: 'Transitioning to business leadership, focusing on strategy, analytics, and operations management.'
    },
    {
      year: '2025',
      title: 'Tax & Audit Assistant',
      organization: 'Office of Santosh S. Bakshetti',
      description: 'Led statutory audits, streamlined tax documentation, and managed financial reconciliation for diverse clients.'
    },
    {
      year: '2024 - 2025',
      title: 'Capstone: Ambrettolide Plant Design',
      organization: 'ICT Mumbai',
      description: 'Designed a 25 TPA facility, evaluating techno-economic viability, process flows, and conducting HAZOP studies.'
    },
    {
      year: '2024',
      title: 'Process Engineering Intern',
      organization: 'Epigral Ltd.',
      description: 'Performed root cause analysis on catalyst deactivation and burner failures, improving asset utilization and safety.'
    },
    {
      year: '2022',
      title: 'Industrial Certifications',
      organization: 'IIChE / NPTEL',
      description: 'Ranked top 5% nationally in Industrial IoT; certified in Petroleum Refinery Engineering and Pollution Management.'
    },
    {
      year: '2021',
      title: 'B.Tech Chemical Engineering',
      organization: 'ICT Mumbai',
      description: 'Began rigorous engineering education with focus on systems optimization, process economics, and numerical methods.'
    }
  ];
  
  milestones.forEach((item, index) => {
    const delayClass = `reveal-delay-${(index % 3) + 1}`;
    
    const node = createElement('div', { className: `timeline-node reveal ${delayClass}` });
    
    const year = createElement('div', { className: 'timeline-year' }, item.year);
    
    const content = createElement('div', { className: 'timeline-content' });
    content.innerHTML = `
      <h3>${item.title}</h3>
      <span class="timeline-org">${item.organization}</span>
      <p>${item.description}</p>
    `;
    
    node.appendChild(year);
    node.appendChild(content);
    timeline.appendChild(node);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(timeline);
  section.appendChild(container);
  
  return section;
};
