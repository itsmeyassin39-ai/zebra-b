import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Gift,
} from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currentCurrency: Currency;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, giftNote: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  currentCurrency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const finalTotal = rawSubtotal;

  // Free shipping
  const freeShippingProgress = 100;
  const amountNeededForFreeShipping = 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-[#111114] border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-white animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h3 className="font-display tracking-[0.2em] text-base font-bold uppercase">
                Mon Panier ({items.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>
            <button
              id="btn-close-cart"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3.5 bg-zinc-950/80 border-b border-zinc-800 text-left">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                <Truck className="w-3.5 h-3.5" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-white font-semibold">
                    Vous avez débloqué la Livraison Express Gratuite !
                  </span>
                ) : (
                  <span>
                    Ajoutez{' '}
                    <strong className="text-white">
                      {formatPrice(amountNeededForFreeShipping, currentCurrency)}
                    </strong>{' '}
                    de plus pour bénéficier de la Livraison Express Gratuite
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-wide">
                    Votre panier est vide
                  </h4>
                  <p className="text-xs text-zinc-400 font-light">
                    Explorez notre collection artisanale et découvrez votre pièce signature.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 cursor-pointer"
                >
                  Commencer à Explorer
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="flex gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images.main}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover border border-zinc-800 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white tracking-wide line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          title="Retirer l'article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {item.selectedHardware}
                      </p>

                      {item.personalizedMonogram && (
                        <span className="inline-block text-[9px] font-mono tracking-widest text-zinc-300 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded mt-1">
                          Monogramme : {item.personalizedMonogram}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-2">
                      <div className="flex items-center border border-zinc-700 rounded-md bg-zinc-900">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 text-zinc-400 hover:text-white"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono text-white font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 text-zinc-400 hover:text-white"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white font-mono">
                        {formatPrice(item.product.price * item.quantity, currentCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Gift Note Accordion */}
            {items.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-zinc-300" />
                  <span>
                    {isGiftNoteOpen ? 'Masquer la Note d\'Emballage Cadeau' : '+ Ajouter une Note Cadeau Offerte'}
                  </span>
                </button>

                {isGiftNoteOpen && (
                  <div className="mt-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Écrivez ici votre note personnelle manuscrite..."
                      rows={2}
                      className="w-full bg-zinc-900 text-xs text-white p-2 rounded border border-zinc-700 focus:outline-none focus:border-white placeholder-zinc-500"
                    />
                    <p className="text-[10px] text-zinc-500 font-light">
                      Imprimée sur un vélin ivoire épais sur mesure, glissé dans notre enveloppe Zebra signature.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer / Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 space-y-4 text-left">
              
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 font-light pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span>Livraison Express</span>
                  <span className="font-mono text-zinc-200">
                    {amountNeededForFreeShipping === 0 ? 'Offerte' : formatPrice(25, currentCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Estimé</span>
                  <span className="font-mono text-base">
                    {formatPrice(finalTotal, currentCurrency)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="btn-drawer-proceed-checkout"
                onClick={() => onProceedToCheckout(0, giftNote)}
                className="w-full py-4 bg-white text-black hover:bg-zinc-200 text-xs tracking-[0.2em] uppercase font-bold rounded-lg shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Passer au Paiement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sécurité Chiffrée 256 Bits • Retours Sous 30 Jours</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
