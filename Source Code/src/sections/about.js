/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: About section component.
 */

import { createElement } from '../utils/dom.js';

export const renderAbout = () => {
  const section = createElement('section', { id: 'about', className: 'section about-section' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '01. Introduction');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'About Me');
  
  const contentWrapper = createElement('div', { className: 'about-content-wrapper grid' });
  
  const textContent = createElement('div', { className: 'about-text reveal reveal-delay-2' });
  textContent.innerHTML = `
    <p>I am a Chemical Engineer transitioning into business leadership through an MBA at the Indian Institute of Management (IIM) Mumbai. My foundation lies in rigorous process engineering, where I specialized in optimizing plant operations, conducting techno-economic evaluations, and implementing data-driven reliability models.</p>
    
    <p>During my time in the chemical manufacturing industry, I led root cause analyses and moisture reduction studies that directly improved asset utilization and production throughput. I enjoy solving complex, multi-variable problems—whether that involves designing a 25 TPA specialty chemicals facility or building AI-driven predictive maintenance dashboards.</p>
    
    <p>Now, I am combining my technical background with advanced business strategy, supply chain analytics, and financial modeling. My goal is to bridge the gap between engineering excellence and executive decision-making, driving technology-driven improvements across operations and product management.</p>
  `;
  
  const metricsContent = createElement('div', { className: 'about-metrics reveal reveal-delay-3' });
  
  const metrics = [
    { value: '6+', label: 'Engineering Projects' },
    { value: '3+', label: 'Technical Publications' },
    { value: '2', label: 'Industrial Internships' }
  ];
  
  metrics.forEach(metric => {
    const card = createElement('div', { className: 'metric-card' });
    card.innerHTML = `
      <span class="metric-value">${metric.value}</span>
      <span class="metric-label">${metric.label}</span>
    `;
    metricsContent.appendChild(card);
  });
  
  contentWrapper.appendChild(textContent);
  contentWrapper.appendChild(metricsContent);
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(contentWrapper);
  section.appendChild(container);
  
  return section;
};
