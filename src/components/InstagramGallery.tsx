import React, { useState } from 'react';
import { Instagram, Heart, MessageCircle, ShoppingBag, Eye, X, ArrowUpRight } from 'lucide-react';
import { InstagramPost, Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface InstagramGalleryProps {
  currentCurrency: Currency;
  onQuickView: (product: Product) => void;
}

const ZEBRA_STRIP: React.CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(90deg, #18181b 0px, #18181b 10px, transparent 10px, transparent 20px)',
};

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({
  currentCurrency,
  onQuickView,
}) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  const { products, instagramPosts } = useStore();

  const handleShopTaggedProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedPost(null);
      onQuickView(prod);
    }
  };

  const featured = instagramPosts[0];
  const rest = instagramPosts.slice(1);
  const totalLikes = instagramPosts.reduce((s, p) => s + p.likes, 0);
  const totalComments = instagramPosts.reduce((s, p) => s + p.comments, 0);
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}K` : String(n);

  const renderTile = (post: InstagramPost, className: string) => (
    <div
      key={`tile-${post.id}`}
      onClick={() => setSelectedPost(post)}
      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 border border-zinc-200 hover:border-zinc-400 transition-all duration-300 shadow-sm ${className}`}
    >
      <img
        src={post.imageUrl}
        alt={post.caption}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
      />

      {/* Instagram watermark */}
      <div className="absolute top-3 left-3 text-white/90 drop-shadow-lg">
        <Instagram className="w-4 h-4" />
      </div>

      {/* Tagged pill */}
      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-white uppercase tracking-wider">
        {post.productTaggedName.length > 16 ? `${post.productTaggedName.slice(0, 16)}…` : post.productTaggedName}
      </div>

      {/* Hover overla y */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
        <div className="self-center mt-auto flex items-center justify-center gap-2 text-white text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all delay-100 translate-y-2 group-hover:translate-y-0">
          <Eye className="w-3.5 h-3.5" /> Voir la publication
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-all delay-150 translate-y-2 group-hover:translate-y-0">
          <div className="text-[10px] font-mono text-white/70">@{post.handle}</div>
          <div className="text-xs font-semibold text-white line-clamp-1 mt-0.5">{post.caption.slice(0, 48)}…</div>
          <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-white/80">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-white" /> {fmt(post.likes)}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 fill-white" /> {fmt(post.comments)}</span>
          </div>
        </div>
      </div>

      {/* Zebra accent */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 opacity-80" style={ZEBRA_STRIP} />
    </div>
  );

  return (
    <section id="instagram-gallery-section" className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500">
              <span className="inline-block w-10 h-[2px] bg-zinc-900" />
              #PortezVotreCôtéSauvage
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] text-zinc-900">
              Mis en scène par notre <span className="italic font-serif font-normal text-zinc-400">communauté mondiale</span>
            </h2>
            <p className="text-zinc-600 text-sm font-light tracking-wide">
              Taguez <span className="font-semibold text-zinc-900">@ZebraBags</span> sur Instagram pour avoir une chance de figurer dans notre lookbook saisonnier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2">
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{fmt(totalLikes)} j&apos;aime cumulés</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2">
              <MessageCircle className="w-3.5 h-3.5 text-zinc-700" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{fmt(totalComments)} commentaires</span>
            </div>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-950 text-white rounded-full px-4 py-2.5 shadow-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Suivre @ZebraBags</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bento mosaic */}
        {instagramPosts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider mb-2">Aucune publication pour le moment.</p>
            <p className="text-zinc-400 text-xs font-light">Ajoutez des publications depuis votre tableau de bord.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto">
          {featured && renderTile(featured, 'col-span-2 row-span-2 border-zinc-300')}

          {rest.slice(0, 4).map((post) => renderTile(post, ''))}

          {rest[4] && renderTile(rest[4], 'col-span-2')}

          {/* Community CTA tile */}
          <div className="col-span-2 relative bg-zebra-pattern-dark text-white rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center gap-4 p-8 sm:p-10 shadow-lg">
            <div className="absolute top-0 inset-x-0 h-1.5" style={ZEBRA_STRIP} />
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div className="font-display text-2xl font-bold tracking-tight">
              @ZebraBags
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-light">
              Le mois prochain, votre look pourrait être notre prochaine couverture. Montrez-nous votre côté sauvage.
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white bg-white px-5 py-2.5 rounded-full font-bold shadow hover:bg-zinc-200 transition-colors cursor-pointer">
              Partager mon look
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
        )}

        {/* Instagram Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative z-10 max-w-2xl w-full bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 text-zinc-900">
              <div className="absolute top-0 inset-x-0 h-1.5 z-20" style={ZEBRA_STRIP} />

              <div className="relative aspect-square bg-zinc-100">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                    <span className="font-bold text-sm text-zinc-900">@{selectedPost.handle}</span>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Fermer"
                      aria-label="Fermer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed mb-4">
                    {selectedPost.caption}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 mb-6">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> {selectedPost.likes.toLocaleString('fr-FR')} J&apos;aime</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {selectedPost.comments.toLocaleString('fr-FR')} Commentaires</span>
                  </div>
                </div>

                {(() => {
                  const taggedProd = products.find((p) => p.id === selectedPost.productId);
                  if (!taggedProd) return null;
                  return (
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={taggedProd.images.main}
                          alt={taggedProd.name}
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-200"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pièce Vedette</span>
                          <h4 className="font-bold text-xs text-zinc-900 line-clamp-1">{taggedProd.name}</h4>
                          <span className="text-xs font-mono text-zinc-900 font-semibold">{formatPrice(taggedProd.price, currentCurrency)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShopTaggedProduct(taggedProd.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Acheter
                      </button>
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};