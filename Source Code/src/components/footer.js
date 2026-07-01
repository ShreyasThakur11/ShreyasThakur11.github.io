/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Footer component with copyright, links, and visitor counter placeholder.
 */

import { createElement } from '../utils/dom.js';

export const renderFooter = () => {
  const footer = createElement('footer', { className: 'site-footer' });
  const container = createElement('div', { className: 'container footer-container' });
  
  const currentYear = new Date().getFullYear();
  
  // Left side: Copyright & Counter
  const leftCol = createElement('div', { className: 'footer-left' });
  leftCol.innerHTML = `
    <p class="copyright">&copy; ${currentYear} Shreyas Thakur. All rights reserved.</p>
    <p class="footer-meta">Built with vanilla JS & CSS.</p>
  `;
  
  // Right side: Links
  const rightCol = createElement('div', { className: 'footer-right' });
  rightCol.innerHTML = `
    <div class="footer-links">
      <a href="https://linkedin.com/in/shreyasthakur11" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://github.com/ShreyasThakur11" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="mailto:thakursm11@gmail.com">Email</a>
    </div>
    <a href="#top" class="back-to-top" aria-label="Back to top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </a>
  `;
  
  container.appendChild(leftCol);
  container.appendChild(rightCol);
  footer.appendChild(container);
  
  return footer;
};
