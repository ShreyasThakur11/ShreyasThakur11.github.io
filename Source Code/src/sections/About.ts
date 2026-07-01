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
    <h2 class="section-title">Value Proposition</h2>
  `;

  const contentGrid = createElement('div', { className: 'about-grid' });
  
  const textCol = createElement('div', { className: 'about-text reveal reveal-delay-1' });
  textCol.innerHTML = `
    <p>I am a Chemical Engineer transitioning into business leadership through an MBA at the Indian Institute of Management (IIM) Mumbai. My foundation lies in rigorous process engineering, where I specialized in optimizing plant operations, conducting techno-economic evaluations, and implementing data-driven reliability models.</p>
    <p>During my time in the chemical manufacturing industry, I led root cause analyses and moisture reduction studies that directly improved asset utilization and production throughput. I excel at solving complex, multi-variable problems, whether that involves designing a 25 TPA specialty chemicals facility or building AI-driven predictive maintenance pipelines.</p>
    <p>Now, I am combining my technical background with advanced business strategy, supply chain analytics, and financial modeling. My goal is to bridge the gap between engineering excellence and executive decision-making to drive sustainable enterprise growth.</p>
  `;

  const photoCol = createElement('div', { className: 'about-photo-wrapper reveal reveal-delay-2' });
  const photo = createElement('img', { 
    src: '/images/Shreyas Thakur Pic 1.jpeg', 
    alt: 'Portrait of Shreyas Thakur',
    className: 'about-photo'
  });
  
  photoCol.appendChild(photo);
  contentGrid.appendChild(textCol);
  contentGrid.appendChild(photoCol);

  container.appendChild(header);
  container.appendChild(contentGrid);
  section.appendChild(container);

  return section;
};
