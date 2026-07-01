/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Premium Hero Section Component.
 */

import { createElement } from '../utils/dom.js';

export const renderHero = () => {
  const section = createElement('section', { id: 'home', className: 'section-hero edge-to-edge' });
  const container = createElement('div', { className: 'container hero-content' });
  
  // The subtle glow effect is less necessary in a light theme but adds depth
  const glow = createElement('div', { className: 'hero-glow' });
  
  const subtitle = createElement('h4', { className: 'hero-subtitle reveal' }, 'Chemical Engineer & MBA Candidate at IIM Mumbai');
  
  const title = createElement('h1', { className: 'hero-title reveal reveal-delay-1' });
  title.innerHTML = 'Bridging the gap between <em>engineering precision</em> and <em>strategic execution</em>.';
  
  const description = createElement('p', { className: 'hero-description reveal reveal-delay-2' }, 
    'I help organizations optimize complex industrial operations by combining a robust foundation in chemical technology with advanced management frameworks.'
  );
  
  const actions = createElement('div', { className: 'hero-actions reveal reveal-delay-3' });
  
  const contactBtn = createElement('a', { 
    href: '#contact', 
    className: 'btn btn-primary' 
  }, 'Get in touch');
  
  const resumeBtn = createElement('a', { 
    href: 'https://github.com/ShreyasThakur11/Resume/releases/latest/download/Shreyas_Thakur_Resume.pdf', 
    className: 'btn btn-secondary',
    target: '_blank',
    rel: 'noopener noreferrer'
  });
  
  resumeBtn.innerHTML = `
    Download Resume
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;
  
  actions.appendChild(contactBtn);
  actions.appendChild(resumeBtn);
  
  container.appendChild(glow);
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(actions);
  
  section.appendChild(container);
  
  return section;
};
