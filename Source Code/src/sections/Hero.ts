/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Hero section introducing the core value proposition.
 */

import { createElement } from '../utils/dom.js';

export const renderHero = (): HTMLElement => {
  const section = createElement('section', { className: 'hero-section', id: 'top' });
  const container = createElement('div', { className: 'container hero-container' });

  const content = createElement('div', { className: 'hero-content glass-panel reveal' });
  content.style.padding = '3rem';
  content.style.maxWidth = '800px';

  const eyebrow = createElement('span', { className: 'hero-eyebrow' }, 'Shreyas Thakur');
  
  const headline = createElement('h1', { className: 'hero-title' });
  headline.innerHTML = `Engineering precise solutions.<br/>Driving business strategy.`;

  const description = createElement('p', { className: 'hero-description' });
  description.innerHTML = `
    A Chemical Engineer transitioning into business leadership through an MBA at IIM Mumbai. 
    Specializing in process optimization, financial modeling, and operational strategy.
  `;

  const actions = createElement('div', { className: 'hero-actions' });
  
  const resumeBtn = createElement('a', { 
    href: 'https://github.com/ShreyasThakur11/Resume/releases/latest/download/Shreyas_Thakur_Resume.pdf', 
    className: 'btn btn-primary',
    target: '_blank',
    rel: 'noopener noreferrer'
  }, 'View Resume');

  const contactBtn = createElement('a', { 
    href: '#contact', 
    className: 'btn btn-outline' 
  }, 'Get in Touch');

  const scrollIndicator = createElement('div', { className: 'hero-scroll-indicator reveal reveal-delay-4' });
  scrollIndicator.innerHTML = `
    <div class="mouse">
      <div class="wheel"></div>
    </div>
    <div>
      <span class="m_scroll_arrows unu"></span>
      <span class="m_scroll_arrows doi"></span>
    </div>
  `;

  actions.appendChild(resumeBtn);
  actions.appendChild(contactBtn);

  content.appendChild(eyebrow);
  content.appendChild(headline);
  content.appendChild(description);
  content.appendChild(actions);

  container.appendChild(content);
  section.appendChild(container);
  section.appendChild(scrollIndicator);

  return section;
};
