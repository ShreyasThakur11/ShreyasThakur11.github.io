/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: DOM manipulation utilities for lightweight element creation and selection.
 */

/**
 * Selects a single element from the DOM.
 */
export const $ = <T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): T | null => {
  return parent.querySelector<T>(selector);
};

/**
 * Selects multiple elements from the DOM.
 */
export const $$ = <T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): NodeListOf<T> => {
  return parent.querySelectorAll<T>(selector);
};

/**
 * Creates an HTML element with specified attributes and children.
 * 
 * @param tag - The HTML tag to create.
 * @param attributes - Object containing HTML attributes (className, id, etc.)
 * @param children - A string or an array of HTMLElements to append as children.
 * @returns The created HTMLElement.
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | boolean> = {},
  children?: string | HTMLElement | HTMLElement[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'className' && typeof value === 'string') {
      element.className = value;
    } else if (typeof value === 'boolean') {
      if (value) element.setAttribute(key, '');
    } else {
      element.setAttribute(key, String(value));
    }
  }

  if (children) {
    if (typeof children === 'string') {
      element.innerHTML = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => element.appendChild(child));
    } else {
      element.appendChild(children);
    }
  }

  return element;
};
