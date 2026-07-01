/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Leadership & Achievements section.
 */

import { createElement } from '../utils/dom.js';

export const renderLeadership = () => {
  const section = createElement('section', { id: 'leadership', className: 'section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '06. Impact');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Leadership & Achievements');
  
  const grid = createElement('div', { className: 'leadership-grid' });
  
  const achievements = [
    {
      title: 'National Business Plan Competition — 2nd Place',
      desc: 'Secured 2nd place among 50+ participating teams by building a comprehensive market feasibility study with financial projections for a proposed consumer venture.',
      icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' // Star
    },
    {
      title: 'Top 5% Nationally in Industrial Certifications',
      desc: 'Ranked in the top 5% nationally across rigorous industrial certification programs in environmental management, petroleum refining, and Industrial IoT.',
      icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' // Check circle
    },
    {
      title: 'Creative Head, Bombay Technologist',
      desc: 'Served as Creative Head for ICT\'s official technical magazine; led a cross-functional editorial team to deliver on-schedule publication while elevating design standards.',
      icon: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>' // Pen tool / edit
    }
  ];
  
  achievements.forEach((item, index) => {
    const card = createElement('div', { className: `leadership-card reveal reveal-delay-${(index % 3) + 1}` });
    
    card.innerHTML = `
      <div class="leadership-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${item.icon}
        </svg>
      </div>
      <div class="leadership-content">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};
