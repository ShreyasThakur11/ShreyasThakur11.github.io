/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Professional experience section highlighting analytical and engineering roles.
 */

import { createElement } from '../utils/dom.js';
import { openModal } from '../components/Modal.js';

export const renderExperience = (): HTMLElement => {
  const section = createElement('section', { className: 'section', id: 'experience' });
  const container = createElement('div', { className: 'container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <h2 class="section-title">Professional Experience</h2>
    <p class="section-desc">A foundation in chemical process engineering, expanded into financial operations and business strategy.</p>
  `;

  // Experience List
  const list = createElement('div', { className: 'experience-list' });

  const experiences = [
    {
      role: 'Tax & Audit Assistant',
      company: 'Office of Santosh S. Bakshetti',
      duration: 'Jun 2025 - May 2026',
      details: [
        'Conducted comprehensive tax audits, ensuring adherence to statutory financial frameworks.',
        'Streamlined financial reconciliation processes for diverse corporate clients.',
        'Developed foundational expertise in quantitative financial analysis and regulatory reporting.'
      ],
      pdf: '/documents/Shreyas_Thakur_Experience_Letter_Bakshetti.pdf',
      pdfTitle: 'Experience Letter - Santosh S. Bakshetti'
    },
    {
      role: 'Process Engineering Intern',
      company: 'Epigral Ltd. (formerly Meghmani Finechem Ltd.)',
      duration: 'Jun 2024 - Aug 2024',
      details: [
        'Executed root cause analysis on catalyst deactivation and burner failures within a high-capacity industrial environment.',
        'Proposed operational parameter adjustments that directly contributed to improved asset utilization.',
        'Collaborated cross-functionally with senior plant engineers to enhance safety and throughput.'
      ],
      pdf: '/documents/Shreyas_Thakur_Epigral_Internship_Certificate.pdf',
      pdfTitle: 'Internship Certificate - Epigral Ltd.'
    }
  ];

  experiences.forEach((exp, index) => {
    const item = createElement('div', { className: `experience-item glass-card reveal reveal-delay-${(index % 3) + 1}` });
    item.style.marginBottom = '2rem';
    
    let certHtml = '';
    if (exp.pdf) {
      certHtml = `
        <div class="mt-4">
          <button data-url="${exp.pdf}" data-title="${exp.pdfTitle}" class="btn btn-outline text-sm view-cert-btn" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
            View Verified Certificate
          </button>
        </div>
      `;
    }

    item.innerHTML = `
      <div class="experience-meta">
        <span class="experience-duration">${exp.duration}</span>
      </div>
      <div class="experience-content">
        <h3 class="experience-role">${exp.role}</h3>
        <span class="experience-company">${exp.company}</span>
        <ul class="experience-details">
          ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>
        ${certHtml}
      </div>
    `;
    
    const btn = item.querySelector('.view-cert-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        openModal((btn as HTMLElement).dataset.url!, (btn as HTMLElement).dataset.title!);
      });
    }

    list.appendChild(item);
  });

  container.appendChild(header);
  container.appendChild(list);
  section.appendChild(container);

  return section;
};
