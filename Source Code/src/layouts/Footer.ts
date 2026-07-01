/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Main site footer component with links and subtle visitor counter placeholder.
 */

import { createElement } from '../utils/dom.js';

export const renderFooter = (): HTMLElement => {
  const footer = createElement('footer', { className: 'site-footer' });
  const container = createElement('div', { className: 'container footer-container' });

  // Brand Column
  const brand = createElement('div', { className: 'footer-brand' });
  brand.innerHTML = `
    <h2>Shreyas Thakur.</h2>
    <p>Bridging rigorous process engineering with advanced business leadership.</p>
  `;

  // Links Columns
  const linksContainer = createElement('div', { className: 'footer-links' });

  const col1 = createElement('div', { className: 'footer-column' });
  col1.innerHTML = `
    <h3>Connect</h3>
    <ul>
      <li><a href="https://linkedin.com/in/shreyasthakur11" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
      <li><a href="https://github.com/ShreyasThakur11" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      <li><a href="mailto:thakursm11@gmail.com">Email</a></li>
    </ul>
  `;

  const col2 = createElement('div', { className: 'footer-column' });
  col2.innerHTML = `
    <h3>Navigation</h3>
    <ul>
      <li><a href="#about">About</a></li>
      <li><a href="#experience">Experience</a></li>
      <li><a href="#projects">Projects</a></li>
    </ul>
  `;

  linksContainer.appendChild(col1);
  linksContainer.appendChild(col2);

  container.appendChild(brand);
  container.appendChild(linksContainer);

  // Bottom Row
  const bottom = createElement('div', { className: 'container footer-bottom' });
  
  const currentYear = new Date().getFullYear();
  bottom.innerHTML = `
    <span>&copy; ${currentYear} Shreyas Thakur. All rights reserved.</span>
    <img src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fshreyasthakur11.github.io&countColor=%232563eb" alt="Visitor count" style="height: 20px;" />
    <span>Designed with intent.</span>
  `;

  footer.appendChild(container);
  footer.appendChild(bottom);

  return footer;
};
