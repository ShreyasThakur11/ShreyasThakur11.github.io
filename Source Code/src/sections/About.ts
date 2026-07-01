/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Executive summary/about section bridging chemical engineering and MBA.
 */

import { createElement } from '../utils/dom.js';

export const renderAbout = (): HTMLElement => {
  const section = createElement('section', { className: 'section', id: 'about' });
  const container = createElement('div', { className: 'container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <span class="section-label">00 // Executive Summary</span>
    <h2 class="section-title">Value Proposition</h2>
  `;

  const contentGrid = createElement('div', { className: 'about-grid' });
  
  const textCol = createElement('div', { className: 'about-text reveal reveal-delay-1' });
  textCol.innerHTML = `
    <p>I am a Chemical Engineer transitioning into business leadership through an MBA at the Indian Institute of Management (IIM) Mumbai. My foundation lies in rigorous process engineering, where I specialized in optimizing plant operations, conducting techno-economic evaluations, and implementing data-driven reliability models.</p>
    <p>During my time in the chemical manufacturing industry, I led root cause analyses and moisture reduction studies that directly improved asset utilization and production throughput. I enjoy solving complex, multi-variable problems—whether that involves designing a 25 TPA specialty chemicals facility or building AI-driven predictive maintenance dashboards.</p>
    <p>Now, I am combining my technical background with advanced business strategy, supply chain analytics, and financial modeling. My goal is to bridge the gap between engineering excellence and executive decision-making.</p>
  `;

  const statsCol = createElement('div', { className: 'about-stats reveal reveal-delay-2' });
  
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
    statsCol.appendChild(statItem);
  });

  contentGrid.appendChild(textCol);
  contentGrid.appendChild(statsCol);

  container.appendChild(header);
  container.appendChild(contentGrid);
  section.appendChild(container);

  return section;
};
