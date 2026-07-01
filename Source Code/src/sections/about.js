/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: About section component.
 */

import { createElement } from '../utils/dom.js';

export const renderAbout = () => {
  const section = createElement('section', { id: 'about', className: 'section about-section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '01. Introduction');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'About Me');
  
  const grid = createElement('div', { className: 'about-grid mt-12' });
  
  // Left Column - Image
  const imageCol = createElement('div', { className: 'about-image-wrapper reveal reveal-delay-2' });
  imageCol.innerHTML = `
    <div class="about-image-bg"></div>
    <img src="/images/profile.jpg" alt="Shreyas Thakur" class="about-image" loading="lazy" />
  `;
  
  // Right Column - Content
  const contentCol = createElement('div', { className: 'about-content reveal reveal-delay-3' });
  contentCol.innerHTML = `
    <p>I am a Chemical Engineer transitioning into business leadership through an MBA at the Indian Institute of Management (IIM) Mumbai. My foundation lies in rigorous process engineering, where I specialized in optimizing plant operations, conducting techno-economic evaluations, and implementing data-driven reliability models.</p>
    <p>During my time in the chemical manufacturing industry, I led root cause analyses and moisture reduction studies that directly improved asset utilization and production throughput. I enjoy solving complex, multi-variable problems—whether that involves designing a 25 TPA specialty chemicals facility or building AI-driven predictive maintenance dashboards.</p>
    <p>Now, I am combining my technical background with advanced business strategy, supply chain analytics, and financial modeling. My goal is to bridge the gap between engineering excellence and executive decision-making.</p>
  `;
  
  const stats = createElement('div', { className: 'about-stats' });
  
  const metrics = [
    { value: '6+', label: 'Engineering Projects' },
    { value: '3+', label: 'Technical Publications' },
    { value: '2', label: 'Industrial Internships' }
  ];
  
  metrics.forEach(metric => {
    const statItem = createElement('div', { className: 'stat-item' });
    statItem.innerHTML = `
      <span class="stat-number">${metric.value}</span>
      <span class="stat-label">${metric.label}</span>
    `;
    stats.appendChild(statItem);
  });
  
  contentCol.appendChild(stats);
  
  grid.appendChild(imageCol);
  grid.appendChild(contentCol);
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};

