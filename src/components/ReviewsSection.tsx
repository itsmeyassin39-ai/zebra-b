import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/products';

const PRESS_QUOTES = [
  {
    publication: 'VOGUE ITALIA',
    quote: '« Zebra Bags apporte une tension architecturale explosive à la maroquinerie florentine classique. Un triomphe du minimalisme monochrome. »',
  },
  {
    publication: 'HARPER\'S BAZAAR',
    quote: '« L\'accessoire remarquable de la saison. Le discret pli zébré transforme les cabas quotidiens en pièces sculpturales dignes du podium. »',
  },
  {
    publication: 'ELLE INTERNATIONAL',
    quote: '« Un artisanat sauvage et sans compromis qui rend chaque tenue instantanément plus affirmée, plus audacieuse et plus confiante. »',
  },
];

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews-section" className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Press Accolades Banner */}
        <div className="mb-20">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500 block text-center mb-8 font-medium">
            Acclamé Par La Presse Couture
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRESS_QUOTES.map((press, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <Quote className="w-6 h-6 text-zinc-400 mb-3" />
                <p className="text-sm text-zinc-700 font-light italic leading-relaxed mb-4">
                  {press.quote}
                </p>
                <span className="text-xs font-bold tracking-[0.25em] text-zinc-900 uppercase font-display border-t border-zinc-200 pt-3">
                  {press.publication}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-mono tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Note Globale 4,94 / 5,0 (Plus de 1 240 Avis Vérifiés)</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight uppercase">
            Réflexions de Collectionneurs
          </h2>
        </div>

        {/* Verified Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-left flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <h3 className="font-bold text-sm text-zinc-900 mb-1">{rev.title}</h3>
                <p className="text-xs text-zinc-600 font-light leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-900">{rev.author}</span>
                    {rev.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        Vérifié
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{rev.location}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 px-2.5 py-1 rounded">
                  {rev.productPurchased}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
