/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Certifications section component.
 */

import { createElement } from '../utils/dom.js';
import { openModal } from '../components/modal.js';

export const renderCertifications = () => {
  const section = createElement('section', { id: 'certifications', className: 'section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal text-center' }, '08. Qualifications');
  const title = createElement('h2', { className: 'reveal reveal-delay-1 text-center' }, 'Licenses & Certifications');
  
  const grid = createElement('div', { className: 'cert-grid mt-8' });
  
  const certs = [
    {
      title: 'Introduction To Industry 4.0 And Industrial IoT',
      issuer: 'NPTEL (Funded by MoE, Govt. of India)',
      date: 'Jan-Apr 2025',
      badge: 'Elite | Top 5%',
      score: '88%',
      pdf: '/documents/Shreyas_Thakur_NPTEL_IoT_Certificate.pdf'
    },
    {
      title: 'Petroleum Refinery Engineering (PRE)',
      issuer: 'Indian Institute of Chemical Engineers (IIChE)',
      date: 'Feb-Apr 2022',
      badge: 'Grade: A+',
      pdf: '/documents/Shreyas_Thakur_IICHE_Certificate.pdf'
    },
    {
      title: 'Industrial Environmental Pollution Management',
      issuer: 'Terra-Green Technologies Pvt. Ltd.',
      date: 'Jun-Jul 2022',
      badge: 'Grade: A',
      pdf: '/documents/Shreyas_Thakur_TerraGreen_Internship_Certificate.pdf'
    }
  ];
  
  certs.forEach((cert, index) => {
    const card = createElement('div', { className: `card cert-card reveal reveal-delay-${(index % 3) + 1}` });
    
    let scoreHtml = cert.score ? `<span class="cert-score">Score: ${cert.score}</span>` : '';
    
    card.innerHTML = `
      <div class="cert-header">
        <span class="cert-date">${cert.date}</span>
        ${cert.badge ? `<span class="badge cert-badge">${cert.badge}</span>` : ''}
      </div>
      <h3 class="cert-title">${cert.title}</h3>
      <span class="cert-issuer">${cert.issuer}</span>
      ${scoreHtml}
      <div class="cert-actions">
        <button class="btn btn-secondary text-sm mt-4 w-full view-cert-btn" data-url="${cert.pdf}" data-title="${cert.title}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Certificate
        </button>
      </div>
    `;
    
    // Attach event listener
    const btn = card.querySelector('.view-cert-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        openModal(btn.dataset.url, btn.dataset.title);
      });
    }
    
    grid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};

