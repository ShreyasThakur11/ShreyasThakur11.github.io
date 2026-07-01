/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Certifications section displaying relevant industry licenses.
 */

import { createElement } from '../utils/dom.js';
import { openModal } from '../components/Modal.js';

export const renderCertifications = (): HTMLElement => {
  const section = createElement('section', { className: 'section bg-alt', id: 'certifications' });
  const container = createElement('div', { className: 'container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <h2 class="section-title">Licenses & Certifications</h2>
  `;

  const grid = createElement('div', { className: 'projects-grid' }); // Reusing projects grid layout

  const certs = [
    {
      title: 'Introduction To Industry 4.0 And Industrial IoT',
      issuer: 'NPTEL (Funded by MoE, Govt. of India)',
      date: 'Jan-Apr 2025',
      badge: 'Elite | Top 5%',
      pdf: '/documents/Shreyas_Thakur_NPTEL_IoT_Certificate.pdf'
    },
    {
      title: 'Petroleum Refinery Engineering (PRE)',
      issuer: 'Indian Institute of Chemical Engineers (IIChE)',
      date: 'Feb-Apr 2022',
      badge: 'Grade: A+',
      pdf: '/documents/Shreyas_Thakur_IICHE_Certificate.pdf'
    }
  ];

  certs.forEach((cert, index) => {
    const card = createElement('div', { className: `cert-card glass-card reveal reveal-delay-${(index % 3) + 1}` });
    
    card.innerHTML = `
      <div class="project-tags">
        <span class="project-tag">${cert.date}</span>
        ${cert.badge ? `<span class="project-tag">${cert.badge}</span>` : ''}
      </div>
      <h3 class="project-title" style="font-size: 1.25rem;">${cert.title}</h3>
      <p class="project-desc">${cert.issuer}</p>
      
      <button data-url="${cert.pdf}" data-title="${cert.title}" class="btn btn-outline text-sm mt-4 view-cert-btn" style="padding: 0.5rem 1rem; width: 100%; font-size: 0.875rem;">
        View Document
      </button>
    `;
    
    const btn = card.querySelector('.view-cert-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        openModal((btn as HTMLElement).dataset.url!, (btn as HTMLElement).dataset.title!);
      });
    }

    grid.appendChild(card);
  });

  container.appendChild(header);
  container.appendChild(grid);
  section.appendChild(container);

  return section;
};
