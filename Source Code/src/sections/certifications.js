/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Certifications section component.
 */

import { createElement } from '../utils/dom.js';

export const renderCertifications = () => {
  const section = createElement('section', { id: 'certifications', className: 'section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '08. Qualifications');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Licenses & Certifications');
  
  const grid = createElement('div', { className: 'cert-grid' });
  
  const certs = [
    {
      title: 'Pollution Control & Environmental Management',
      issuer: 'NPTEL (National Programme on Technology Enhanced Learning)',
      date: 'Aug 2022',
      badge: 'Top 5%'
    },
    {
      title: 'Petroleum Refinery Engineering',
      issuer: 'NPTEL',
      date: 'Aug 2022',
      badge: 'Elite'
    },
    {
      title: 'Introduction to Industrial Internet of Things',
      issuer: 'NPTEL',
      date: 'Apr 2022',
      badge: 'Top 5%'
    }
  ];
  
  certs.forEach((cert, index) => {
    const card = createElement('div', { className: `card cert-card reveal reveal-delay-${(index % 3) + 1}` });
    
    card.innerHTML = `
      <div class="cert-header">
        <span class="cert-date">${cert.date}</span>
        ${cert.badge ? `<span class="badge cert-badge">${cert.badge}</span>` : ''}
      </div>
      <h3 class="cert-title">${cert.title}</h3>
      <span class="cert-issuer">${cert.issuer}</span>
    `;
    
    grid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};
