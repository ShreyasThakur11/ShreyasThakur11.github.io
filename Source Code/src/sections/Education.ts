/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Education section covering MBA and B.Tech details.
 */

import { createElement } from '../utils/dom.js';

export const renderEducation = (): HTMLElement => {
  const section = createElement('section', { className: 'section', id: 'education' });
  const container = createElement('div', { className: 'container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <h2 class="section-title">Academic Journey</h2>
    <p class="section-desc">A rigorous transition from process engineering to executive business management.</p>
  `;

  const list = createElement('div', { className: 'education-list' });

  const educationData = [
    {
      degree: 'Master of Business Administration (MBA)',
      institution: 'Indian Institute of Management (IIM) Mumbai',
      duration: '2026 - Present',
      details: 'Focusing on operations strategy, supply chain analytics, and corporate finance. Leveraging engineering background to solve complex business problems.'
    },
    {
      degree: 'B.Tech in Chemical Engineering',
      institution: 'Institute of Chemical Technology (ICT), Mumbai',
      duration: '2021 - 2025',
      details: 'Specialized in process synthesis, techno-economic evaluation, and transport phenomena. Developed a strong foundation in quantitative analysis and system modeling.'
    }
  ];

  educationData.forEach((edu, index) => {
    const item = createElement('div', { className: `education-item reveal reveal-delay-${(index % 2) + 1}` });
    
    item.innerHTML = `
      <div class="education-header">
        <h3 class="education-degree">${edu.degree}</h3>
        <span class="education-duration">${edu.duration}</span>
      </div>
      <div class="education-institution">${edu.institution}</div>
      <p class="education-details">${edu.details}</p>
    `;
    
    list.appendChild(item);
  });

  container.appendChild(header);
  container.appendChild(list);
  section.appendChild(container);

  return section;
};
