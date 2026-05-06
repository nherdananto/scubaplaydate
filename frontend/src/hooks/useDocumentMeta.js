import { useEffect } from 'react';

const SITE_NAME = 'ScubaPlaydate';
const DEFAULT_TITLE = 'ScubaPlaydate — Scuba Stories, Style & Underwater Culture';
const DEFAULT_DESCRIPTION =
  'ScubaPlaydate is a digital space for divers to explore, share, and stay connected with the underwater world. Real stories, dive destinations, gear reviews, and underwater photography.';
const DEFAULT_IMAGE = 'https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg';

const setMeta = (selector, attr, value) => {
  if (!value) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, name] = selector.match(/meta\[([a-z-]+)="([^"]+)"\]/) || [];
    if (key && name) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setJsonLd = (id, data) => {
  // remove old
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Set per-page SEO tags (title, description, canonical, OpenGraph, Twitter,
 * optional JSON-LD). Pass `noindex: true` on CMS pages to keep them out of
 * search results.
 */
export const useDocumentMeta = ({
  title,
  description,
  image,
  type = 'website',
  noindex = false,
  jsonLd = null,
} = {}) => {
  useEffect(() => {
    const finalTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const finalImage = image || DEFAULT_IMAGE;
    const url = window.location.href;

    document.title = finalTitle;
    setMeta('meta[name="description"]', 'content', finalDescription);
    setMeta(
      'meta[name="robots"]',
      'content',
      noindex ? 'noindex, nofollow' : 'index, follow'
    );
    setLink('canonical', url);

    // OpenGraph
    setMeta('meta[property="og:title"]', 'content', finalTitle);
    setMeta('meta[property="og:description"]', 'content', finalDescription);
    setMeta('meta[property="og:image"]', 'content', finalImage);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);

    // Twitter
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', finalTitle);
    setMeta('meta[name="twitter:description"]', 'content', finalDescription);
    setMeta('meta[name="twitter:image"]', 'content', finalImage);

    setJsonLd('page-jsonld', jsonLd);
  }, [title, description, image, type, noindex, jsonLd]);
};
