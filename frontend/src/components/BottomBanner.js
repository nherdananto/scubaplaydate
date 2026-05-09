import React, { useEffect, useState } from 'react';
import { bannersAPI } from '../utils/api';

/**
 * Renders the active "bottom" banner (full-width, above the footer) and
 * tracks impressions/clicks. If no banner is configured, renders the
 * dashed placeholder so the editor can see where it'd appear.
 */
const BottomBanner = ({ showPlaceholder = true }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await bannersAPI.list({ active: true });
        const b = (res.data || []).find((x) => x.position === 'bottom');
        if (!cancelled && b) {
          setBanner(b);
          bannersAPI.trackImpression(b.id).catch(() => {});
        }
      } catch (e) {
        // ignore — section just won't render
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;

  if (!banner) {
    if (!showPlaceholder) return null;
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="bg-[#FFF4ED] border-2 border-dashed border-[#F26419] p-12 rounded-sm text-center">
          <div className="text-sm font-semibold text-[#F26419] mb-2">
            Bottom Banner Placement (Full Width)
          </div>
          <p className="text-sm text-[#64748B]">No banner configured</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            Add in CMS → Banners → Position: Bottom
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
      <a
        href={banner.link_url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => bannersAPI.trackClick(banner.id).catch(() => {})}
        data-testid={`bottom-banner-${banner.id}`}
        className="block relative overflow-hidden rounded-sm border-2 border-[#F26419]"
      >
        <div className="absolute top-4 right-4 text-xs font-semibold text-white bg-[#F26419] px-3 py-1 rounded-sm z-10">
          Bottom Banner
        </div>
        <img src={banner.image_url} alt={banner.name} className="w-full h-auto" />
      </a>
    </section>
  );
};

export default BottomBanner;
