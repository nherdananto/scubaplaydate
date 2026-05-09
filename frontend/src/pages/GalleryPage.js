import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomBanner from '../components/BottomBanner';
import { mediaAPI } from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Image as ImageIcon, X } from '@phosphor-icons/react';

const BACKEND = process.env.REACT_APP_BACKEND_URL || '';

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  useDocumentMeta({
    title: 'Underwater Photo Gallery',
    description: 'Underwater photography from the ScubaPlaydate community — coral reefs, marine life, and dive site moments.',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await mediaAPI.list({ in_gallery: true, limit: 200 });
        if (!cancelled) setItems(res.data);
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="gallery-page" className="bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ImageIcon size={32} className="text-[#0284C7]" weight="bold" />
            <h1 className="text-5xl font-black text-[#0A0F1C] tracking-tighter">Gallery</h1>
          </div>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            Underwater photography from the ScubaPlaydate community.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-[#F1F5F9] animate-pulse rounded-sm" />
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => (
              <button
                key={item.filename}
                onClick={() => setActive(item)}
                data-testid={`gallery-thumb-${item.filename}`}
                className="aspect-square overflow-hidden rounded-sm bg-[#F8FAFC] group"
              >
                <img
                  src={(BACKEND || '') + item.url}
                  alt={item.alt || ''}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-24 text-[#94A3B8]">
            <p>No images in the gallery yet.</p>
            <p className="text-xs mt-2">Curate images via CMS → Media Library → "In public gallery".</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          onClick={() => setActive(null)}
          data-testid="gallery-lightbox"
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-4 right-4 text-white hover:text-[#0284C7] z-10"
            data-testid="gallery-lightbox-close"
            aria-label="Close"
          >
            <X size={32} weight="bold" />
          </button>
          <img
            src={(BACKEND || '') + active.url}
            alt={active.alt || ''}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <BottomBanner showPlaceholder={false} />
      <Footer />
    </div>
  );
};

export default GalleryPage;
