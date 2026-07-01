/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Component for viewing certificates in an overlay modal.
 */

import { createElement, $ } from '../utils/dom.js';

export const renderModal = (): HTMLElement => {
  const overlay = createElement('div', { className: 'modal-overlay', id: 'cert-modal' });
  const container = createElement('div', { className: 'modal-container' });
  
  const header = createElement('div', { className: 'modal-header' });
  const title = createElement('h3', { className: 'modal-title', id: 'modal-title' }, 'Certificate');
  
  const actions = createElement('div', { className: 'modal-actions' });
  
  const downloadBtn = createElement('a', { 
    id: 'modal-download',
    className: 'modal-btn',
    title: 'Download PDF',
    download: true,
    target: '_blank'
  });
  downloadBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;
  
  const closeBtn = createElement('button', {
    className: 'modal-btn',
    title: 'Close',
    'aria-label': 'Close modal'
  });
  closeBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  
  actions.appendChild(downloadBtn);
  actions.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(actions);
  
  const body = createElement('div', { className: 'modal-body', id: 'modal-body' });
  
  container.appendChild(header);
  container.appendChild(body);
  overlay.appendChild(container);
  
  const closeModal = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => {
      body.innerHTML = '';
    }, 300);
    document.body.style.overflow = '';
  };
  
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
  
  return overlay;
};

export const openModal = (pdfUrl: string, titleText: string): void => {
  const modal = $('#cert-modal');
  const title = $('#modal-title');
  const download = $('#modal-download') as HTMLAnchorElement;
  const body = $('#modal-body');
  
  if (!modal || !title || !download || !body) return;
  
  title.textContent = titleText || 'Document Viewer';
  download.href = pdfUrl;
  
  body.innerHTML = \`<iframe src="\${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0" class="modal-iframe" title="\${titleText}"></iframe>\`;
  
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
};
