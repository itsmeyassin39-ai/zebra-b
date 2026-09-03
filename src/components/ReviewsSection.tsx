import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/StoreContext';

/**
 * Customer screenshots uploaded in Dashboard > Mes avis > Photos WhatsApp.
 * This deliberately contains no review copy: the screenshots are the reviews.
 */
export const ReviewsSection: React.FC = () => {
  const { whatsappPictures } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Do not leave an empty block on the storefront before the first upload.
  if (whatsappPictures.length === 0) return null;

  return (
    <section id="reviews-section" className="bg-white border-b border-zinc-200 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold uppercase tracking-wider text-zinc-900 mb-8 sm:mb-12">
          Avis de nos clients
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {whatsappPictures.map((picture) => (
            <button
              key={picture.id}
              type="button"
              onClick={() => setSelectedImage(picture.imageUrl)}
              className="group overflow-hidden rounded-xl bg-zinc-100 text-left shadow-sm ring-1 ring-zinc-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-label="Agrandir cette capture d'écran client"
            >
              <img
                src={picture.imageUrl}
                alt={picture.caption || "Capture d'écran d'un avis client"}
                className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Capture d'écran client agrandie"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage}
            alt="Capture d'écran d'un avis client"
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
