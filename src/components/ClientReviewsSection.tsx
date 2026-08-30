import React, { useEffect, useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/products';

const AUTOPLAY_MS = 6500;

export const ClientReviewsSection: React.FC = () => {
  const reviews = CUSTOMER_REVIEWS;
  const count = reviews.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  const review = reviews[index];
  const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1).replace('.', ',');
  const verifiedCount = reviews.filter((r) => r.verified).length;
  const initials = review.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <section id="client-reviews-section" className="py-24 lg:py-32 bg-white border-b border-zinc-200 text-zinc-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500">
              <span className="inline-block w-10 h-[2px] bg-zinc-900" />
              Ils ont adopté le zèbre
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              La parole <span className="italic font-serif font-normal text-zinc-400">aux collectionneurs</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-950 text-white rounded-full px-4 py-2 shadow-sm">
              <span className="font-display text-base font-extrabold leading-none">{avg}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">/ 5 · note moyenne</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{verifiedCount} avis vérifiés</span>
            </div>
            <div className="flex items-center rounded-full border border-zinc-200 px-4 py-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">100 % recommandent</span>
            </div>
          </div>
        </div>

        {/* Ticker band */}
        <div className="bg-zinc-950 text-white overflow-hidden rounded-2xl shadow-lg">
          <div className="animate-marquee items-center py-3">
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-6 whitespace-nowrap">
                <Star className="w-3 h-3 fill-zinc-600 text-zinc-600" />
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-300">
                  {r.title.toLowerCase().slice(0, 42)}…
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500">
                  {r.author} — {r.location}
                </span>
                <span className="w-1.5 h-1.5 rotate-45 bg-zinc-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Spotlight + stack */}
        <div
          className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Featured spotlight */}
          <div
            key={review.id}
            className="lg:col-span-3 relative bg-zebra-pattern-dark text-white rounded-3xl p-8 sm:p-12 lg:p-14 overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
              <div
                className="h-full bg-white/90"
                style={{ animation: `review-progress ${AUTOPLAY_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
              />
            </div>
            <span className="absolute -top-14 -right-4 sm:-right-8 font-italiana text-[220px] leading-none text-white/5 select-none pointer-events-none">
              &rdquo;
            </span>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 bg-white/10 border border-white/10 px-4 py-2 rounded-full">
                Vignette n°{index + 1} / {count}
                {review.verified && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Vérifié
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1 mt-8 mb-6 text-zinc-200">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-white" />
                ))}
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-5">{review.title}</h3>

              <p className="font-italiana text-xl sm:text-2xl lg:text-3xl leading-relaxed text-zinc-100 max-w-2xl">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="mt-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center font-display text-sm tracking-widest shadow-lg">
                  {initials}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">{review.author}</div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{review.location} • {review.date}</div>
                </div>
              </div>

              <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-300 bg-white/10 border border-white/10 px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Acheté : {review.productPurchased}
              </span>
            </div>

            <button
              onClick={() => goTo(index - 1)}
              aria-label="Avis précédent"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 border border-white/15 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Avis suivant"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 border border-white/15 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Review stack */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-1">
              <span>Tous les avis</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> lecture automatique</span>
            </div>

            {reviews.map((r, i) => {
              const isActive = i === index;
              const cardInitials = r.author
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <button
                  key={r.id}
                  onClick={() => goTo(i)}
                  className={`group text-left rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-xl'
                      : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-xs tracking-widest transition-colors ${
                        isActive ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                      }`}>
                        {cardInitials}
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-tight">{r.author}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {r.location} • {r.date}
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] ${isActive ? 'text-zinc-500' : 'text-zinc-300'}`}>
                      0{i + 1}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 mb-2 ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                    {[...Array(r.rating)].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-3 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  <div className={`mt-3 inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest ${
                    isActive ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-current" /> Acheteur vérifié
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};