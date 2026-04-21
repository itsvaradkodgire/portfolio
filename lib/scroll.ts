/**
 * Single source of truth for all page-level scrolling.
 * Uses window.scrollTo() so the nav offset is always respected.
 * Never use scrollIntoView() for page navigation — it bypasses the offset.
 */

export const NAV_HEIGHT = 56; // matches h-14 in Nav
const OFFSET = NAV_HEIGHT + 16; // extra breathing room

/** Scroll to a CSS selector (e.g. "#systems") with nav offset */
export function scrollToSection(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}

/** Scroll to an element with nav offset (for when you have the element already) */
export function scrollToElement(el: Element) {
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}

/** Scroll to page top */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
