/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Skills & Technical Expertise section.
 */

import { createElement } from '../utils/dom.js';

export const renderSkills = () => {
  const section = createElement('section', { id: 'skills', className: 'section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '05. Expertise');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Skills & Competencies');
  
  const grid = createElement('div', { className: 'skills-grid' });
  
  const categories = [
    {
      title: 'Business & Strategy',
      icon: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>', // Bar chart
      skills: [
        'Financial Modeling', 'Business Analysis', 'Process Optimization', 
        'Supply Chain Analytics', 'Market Research', 'Project Management', 
        'Stakeholder Management', 'Corporate Compliance', 'Risk Assessment'
      ]
    },
    {
      title: 'Data & Analytics',
      icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>', // Database
      skills: [
        'SQL (MySQL, PostgreSQL)', 'Query Optimization', 'Python (Pandas, NumPy)', 
        'Scikit-Learn', 'Statsmodels', 'Seaborn', 'Advanced MS Excel (VBA)', 
        'Power Query', 'Solver', 'Power BI (DAX)', 'Data Visualization', 'Statistical Analysis'
      ]
    },
    {
      title: 'Technology & AI Tools',
      icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', // Code/Tech
      skills: [
        'Cloud Infrastructure (GKE, K8s)', 'Machine Learning (XGBoost, cuML)', 
        'AI Coding Assistants', 'Claude Code', 'Google Antigravity', 
        'Git/GitHub', 'Process Automation', 'AutoCAD'
      ]
    }
  ];
  
  categories.forEach((cat, index) => {
    const card = createElement('div', { className: `card skills-card reveal reveal-delay-${(index % 3) + 1}` });
    
    card.innerHTML = `
      <div class="skills-card-header">
        <div class="skills-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${cat.icon}
          </svg>
        </div>
        <h3>${cat.title}</h3>
      </div>
      <div class="skills-list">
        ${cat.skills.map(skill => `<span class="badge skill-badge">${skill}</span>`).join('')}
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};
