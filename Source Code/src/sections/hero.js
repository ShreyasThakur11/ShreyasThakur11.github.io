/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Hero section component.
 */

import { createElement } from '../utils/dom.js';

export const renderHero = () => {
  const section = createElement('section', { id: 'home', className: 'hero-section' });
  const container = createElement('div', { className: 'container hero-container' });
  
  // Left: Text content
  const textContent = createElement('div', { className: 'hero-content' });
  
  const greeting = createElement('span', { className: 'hero-greeting reveal' }, 'Hello, I am');
  const name = createElement('h1', { className: 'hero-name reveal reveal-delay-1' }, 'Shreyas Thakur');
  
  const titleWrapper = createElement('div', { className: 'hero-title-wrapper reveal reveal-delay-2' });
  titleWrapper.innerHTML = `
    <h2 class="hero-title">Chemical Engineer <span class="title-separator">&amp;</span> MBA Candidate at IIM Mumbai</h2>
  `;
  
  const description = createElement('p', { className: 'hero-description reveal reveal-delay-2' }, 
    'Specializing in process engineering, data analytics, and business strategy to drive technology-driven improvements in operational reliability and yield.'
  );
  
  const ctaGroup = createElement('div', { className: 'hero-cta-group reveal reveal-delay-3' });
  
  const resumeBtn = createElement('a', { 
    href: 'https://github.com/ShreyasThakur11/Resume/releases/latest/download/Shreyas_Thakur_Resume.pdf',
    className: 'btn btn-primary',
    target: '_blank',
    rel: 'noopener noreferrer'
  });
  resumeBtn.innerHTML = `
    Download Resume
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  `;
  
  const contactBtn = createElement('a', { 
    href: '#contact',
    className: 'btn btn-secondary'
  }, 'Get in Touch');
  
  ctaGroup.appendChild(resumeBtn);
  ctaGroup.appendChild(contactBtn);
  
  textContent.appendChild(greeting);
  textContent.appendChild(name);
  textContent.appendChild(titleWrapper);
  textContent.appendChild(description);
  textContent.appendChild(ctaGroup);
  
  // Right: Profile image
  const imageContent = createElement('div', { className: 'hero-image-wrapper reveal reveal-delay-2' });
  
  // Add a subtle decorative frame/backdrop
  const frame = createElement('div', { className: 'hero-image-frame' });
  const img = createElement('img', {
    src: '/images/profile.jpg',
    alt: 'Shreyas Thakur',
    className: 'hero-image',
    loading: 'eager'
  });
  
  imageContent.appendChild(frame);
  imageContent.appendChild(img);
  
  // Scroll indicator
  const scrollIndicator = createElement('div', { className: 'scroll-indicator' });
  scrollIndicator.innerHTML = `
    <span class="mouse">
      <span class="wheel"></span>
    </span>
  `;
  
  container.appendChild(textContent);
  container.appendChild(imageContent);
  
  section.appendChild(container);
  section.appendChild(scrollIndicator);
  
  return section;
};
