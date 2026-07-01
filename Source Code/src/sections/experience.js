/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Premium Experience section component.
 */

import { createElement } from '../utils/dom.js';

export const renderExperience = () => {
  const section = createElement('section', { id: 'experience', className: 'section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal text-center' }, '03. Career Profile');
  const title = createElement('h2', { className: 'reveal reveal-delay-1 text-center' }, 'Professional Experience');
  
  const list = createElement('div', { className: 'experience-list mt-8' });
  
  const experiences = [
    {
      role: 'Tax & Audit Assistant',
      company: 'Office of Santosh S. Bakshetti',
      date: 'Jun 2025 – May 2026',
      responsibilities: [
        'Assisted in comprehensive tax audits and compliance reporting.',
        'Gained exposure to financial auditing frameworks and regulatory taxation processes.',
        'Developed foundational skills in financial documentation and record reconciliation.'
      ],
      certificate: '/documents/Shreyas_Thakur_Experience_Letter_Bakshetti.pdf'
    },
    {
      role: 'Process Engineering Intern',
      company: 'Epigral Ltd. (formerly Meghmani Finechem Ltd.)',
      date: 'Jun 2024 – Aug 2024',
      responsibilities: [
        'Undertook project work in the Chemical department focused on process optimization and efficiency.',
        'Analyzed core chemical operations in a high-capacity industrial environment.',
        'Collaborated with senior engineers on practical plant performance evaluations.'
      ],
      certificate: '/documents/Shreyas_Thakur_Epigral_Internship_Certificate.pdf'
    }
  ];
  
  experiences.forEach((exp, index) => {
    const item = createElement('div', { className: `exp-item reveal reveal-delay-${(index % 2) + 1}` });
    
    let certHtml = '';
    if (exp.certificate) {
      certHtml = `
        <div class="exp-actions">
          <a href="${exp.certificate}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            View Verified Certificate
          </a>
        </div>
      `;
    }
    
    item.innerHTML = `
      <div class="exp-header">
        <div>
          <h3 class="exp-role">${exp.role}</h3>
          <span class="exp-company">${exp.company}</span>
        </div>
        <span class="exp-date">${exp.date}</span>
      </div>
      <ul class="exp-description">
        ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
      </ul>
      ${certHtml}
    `;
    
    list.appendChild(item);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(list);
  section.appendChild(container);
  
  return section;
};
