import DOMPurify from 'dompurify';

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

// Detect Instagram post/reel URL
const getInstagramPath = (url) => {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `${m[1]}/${m[2]}` : null;
};

const buildYouTubeEmbed = (id) =>
  `<div class="embed-responsive"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;

const buildInstagramEmbed = (path) =>
  `<div class="embed-responsive embed-instagram"><iframe src="https://www.instagram.com/${path}/embed" title="Instagram post" frameborder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe></div>`;

// Convert standalone YouTube/Instagram URLs in <p> tags into iframe embeds
// before sanitization.
const autoEmbed = (html) => {
  if (!html) return html;

  // Replace <p>https://youtu.be/xxx</p> or <p>https://www.youtube.com/watch?v=xxx</p>
  html = html.replace(
    /<p>\s*(?:<a[^>]*>)?\s*(https?:\/\/[^\s<"]+)\s*(?:<\/a>)?\s*<\/p>/gi,
    (match, url) => {
      const yt = getYouTubeId(url);
      if (yt) return buildYouTubeEmbed(yt);
      const ig = getInstagramPath(url);
      if (ig) return buildInstagramEmbed(ig);
      return match;
    }
  );

  // Replace TinyMCE oembed-style outputs e.g. <oembed url="..."></oembed>
  html = html.replace(/<oembed[^>]*url="([^"]+)"[^>]*>\s*<\/oembed>/gi, (match, url) => {
    const yt = getYouTubeId(url);
    if (yt) return buildYouTubeEmbed(yt);
    const ig = getInstagramPath(url);
    if (ig) return buildInstagramEmbed(ig);
    return '';
  });

  return html;
};

// Allow iframes only from these hosts
const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'www.instagram.com',
  'instagram.com',
  'www.google.com', // for Google Maps embeds
  'maps.google.com',
];

// Configure DOMPurify hook so iframes are kept only when src host is allowed.
const purifier = DOMPurify;
purifier.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = node.getAttribute('src') || '';
    try {
      const url = new URL(src, window.location.origin);
      if (!ALLOWED_IFRAME_HOSTS.includes(url.hostname)) {
        node.parentNode && node.parentNode.removeChild(node);
      }
    } catch (e) {
      node.parentNode && node.parentNode.removeChild(node);
    }
  }
});

export const sanitizeArticleHTML = (rawHtml) => {
  if (!rawHtml) return '';
  const withEmbeds = autoEmbed(rawHtml);
  return purifier.sanitize(withEmbeds, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'allowtransparency',
      'referrerpolicy',
      'loading',
      'target',
      'rel',
    ],
  });
};
