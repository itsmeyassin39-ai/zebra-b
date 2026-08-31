import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';

export const ClientReviewsSection: React.FC = () => {
  const { customerReviews } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [customerReviews]);

  if (customerReviews.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'left' ? -420 : 420, behavior: 'smooth' });
  };

  const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

  return (
    <section id="client-reviews-section" className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500 font-semibold block mb-3">
              Avis clients
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
              Ce que disent nos clients
            </h2>
          </div>
          {customerReviews.length > 1 && (
            <div className="flex gap-3">
              <button onClick={() => scroll('left')} disabled={!canScrollLeft} aria-label="Avis précédent" className="w-12 h-12 rounded-full bg-zinc-950 text-white disabled:bg-zinc-100 disabled:text-zinc-400 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} disabled={!canScrollRight} aria-label="Avis suivant" className="w-12 h-12 rounded-full bg-zinc-950 text-white disabled:bg-zinc-100 disabled:text-zinc-400 flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none">
          {customerReviews.map((review) => (
            <article key={review.id} className="w-[85vw] sm:w-[390px] shrink-0 snap-start rounded-[2rem] bg-zinc-50 border border-zinc-200 p-8 min-h-[320px] flex flex-col">
              <div className="flex gap-1 text-amber-500 mb-6" aria-label={`${review.rating} sur 5`}>
                {Array.from({ length: review.rating }, (_, index) => <span key={index}>★</span>)}
              </div>
              {review.title && <h3 className="font-bold text-lg text-zinc-900 mb-3">{review.title}</h3>}
              <p className="text-zinc-700 leading-relaxed text-lg">{review.comment}</p>
              <div className="flex items-center gap-3 mt-auto pt-6">
                <div className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-display text-sm shrink-0">
                  {initial(review.author)}
                </div>
                <div className="border-l-2 border-zinc-300 pl-4 min-w-0">
                  <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                    {review.author}
                    {review.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {(review.location || review.productPurchased) && <div className="text-sm text-zinc-500 mt-1">{[review.location, review.productPurchased].filter(Boolean).join(' · ')}</div>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
