import React from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * Wraps any CMS route to ensure its page is excluded from search engines
 * and AI crawlers via <meta name="robots" content="noindex,nofollow">.
 * Defense in depth — robots.txt already disallows /forinternalonly/.
 */
const CmsRouteWrapper = ({ children }) => {
  useDocumentMeta({
    title: 'CMS',
    description: 'Internal content management system.',
    noindex: true,
  });
  return <>{children}</>;
};

export default CmsRouteWrapper;
