import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Truck,
  ArrowRight,
  Gift,
  User,
  Phone,
  MapPin,
  Building,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Currency, Order } from '../types';
import { formatPrice } from '../utils/formatters';
import { api } from '../api/client';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  currentCurrency: Currency;
  appliedDiscountPercent: number;
  giftNote?: string;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  currentCurrency,
  appliedDiscountPercent,
  giftNote,
  onClose,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = (rawSubtotal * appliedDiscountPercent) / 100;
  const shippingFee = 0;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.address.trim()) {
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      const generatedId = `ZB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderId(generatedId);

      const trimmedName = formData.fullName.trim();
      const nameParts = trimmedName.split(' ');
      const firstName = nameParts[0] || trimmedName;
      const lastName = nameParts.slice(1).join(' ') || '';

      const order: Order = {
        id: generatedId,
        customer: {
          firstName,
          lastName,
          email: '',
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: '',
          postalCode: '',
          paymentMethod: 'Paiement à la livraison / الدفع عند الاستلام',
        },
        items: items.map((it) => ({
          productId: it.productId,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          color: it.selectedColor.name,
          hardware: it.selectedHardware,
          monogram: it.personalizedMonogram,
        })),
        subtotal: rawSubtotal,
        discountPercent: appliedDiscountPercent,
        shipping: shippingFee,
        total: grandTotal,
        currency: currentCurrency,
        giftNote,
        status: 'nouvelle',
      };

      try {
        await api('/api/orders', { method: 'POST', body: order });
      } catch (err) {
        console.error('Échec de l\'enregistrement de la commande', err);
      }

      setIsProcessing(false);
      setIsCompleted(true);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#000000', '#d4d4d8', '#a1a1aa'],
        });
      } catch {
        // ignore
      }

      onOrderSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div
        id="checkout-modal-card"
        className="relative z-10 max-w-3xl w-full bg-[#111114] border border-zinc-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display tracking-[0.15em] text-sm sm:text-base font-bold uppercase block text-white">
                Finaliser Votre Commande • إتمام الطلب
              </span>
              <p className="text-[11px] text-zinc-400 font-sans">
                Paiement à la livraison • الدفع عند الاستلام
              </p>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        {!isCompleted ? (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Column: Essential Customer & Delivery Info (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 text-left border-b lg:border-b-0 lg:border-r border-zinc-800">
              
              <div className="space-y-4">
                
                {/* 1. Nom Complet / الاسم الكامل */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      Nom Complet
                    </span>
                    <span className="font-arabic text-zinc-400 text-xs" dir="rtl">الاسم الكامل</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Fatima Zahra Alami"
                    className="w-full bg-zinc-950 border border-zinc-700 text-sm px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  />
                </div>

                {/* 2. Numero De telefon / رقم الهاتف */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      Numéro De Téléphone
                    </span>
                    <span className="font-arabic text-zinc-400 text-xs" dir="rtl">رقم الهاتف</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 XX XX XX XX / +212..."
                    className="w-full bg-zinc-950 border border-zinc-700 text-sm px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  />
                </div>

                {/* 3. Ville / المدينة */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      Ville
                    </span>
                    <span className="font-arabic text-zinc-400 text-xs" dir="rtl">المدينة</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Casablanca, Rabat, Marrakech, Tanger..."
                    className="w-full bg-zinc-950 border border-zinc-700 text-sm px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  />
                </div>

                {/* 4. Adresse de livraison / عنوان التوصيل */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      Adresse de livraison
                    </span>
                    <span className="font-arabic text-zinc-400 text-xs" dir="rtl">عنوان التوصيل</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Quartier, Boulevard, N° Immeuble / الحي، الشارع، رقم المنزل"
                    className="w-full bg-zinc-950 border border-zinc-700 text-sm px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                  />
                </div>

              </div>

              {/* Payment Mode Note */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">Paiement à la livraison</span>
                    <span className="text-emerald-400 font-arabic text-[11px]" dir="rtl">الدفع عند الاستلام</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Livraison gratuite partout au Maroc. Vous ne payez qu'après réception.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Place Order (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-zinc-950 flex flex-col justify-between text-left space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-300 font-bold">
                    Votre Panier ({items.length})
                  </h4>
                  <span className="text-xs text-zinc-400 font-arabic" dir="rtl">ملخص الطلب</span>
                </div>

                {/* Items preview */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={it.product.images.main}
                          alt={it.product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                        />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{it.product.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Qté : {it.quantity} • {it.selectedColor.name.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-zinc-200 shrink-0 font-bold">
                        {formatPrice(it.product.price * it.quantity, currentCurrency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Gift Note if included */}
                {giftNote && (
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-2">
                    <Gift className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Carte Cadeau Incluse :</span>
                      <p className="italic font-light">"{giftNote}"</p>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Sous-total</span>
                    <span className="font-mono text-white">
                      {formatPrice(rawSubtotal, currentCurrency)}
                    </span>
                  </div>
                  {appliedDiscountPercent > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Réduction ({appliedDiscountPercent}%)</span>
                      <span className="font-mono">
                        -{formatPrice(discountAmount, currentCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Livraison</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Gratuite / مجاناً
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-zinc-800">
                    <span>Prix Total</span>
                    <span className="font-mono text-lg text-white">
                      {formatPrice(grandTotal, currentCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={isProcessing}
                  id="btn-confirm-place-order"
                  className="w-full py-4 bg-white text-black hover:bg-zinc-200 font-bold text-xs tracking-[0.15em] uppercase rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Enregistrement du paiement...</span>
                  ) : (
                    <>
                      <span>Confirmer la Commande • تأكيد الطلب</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>COMMANDE 100% SÉCURISÉE • PAIEMENT À LA RÉCEPTION</span>
                </div>
              </div>

            </div>

          </form>
        ) : (
          /* Order Confirmation Screen */
          <div className="p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-400">
                COMMANDE ENREGISTRÉE • تم تسجيل الطلب
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase">
                Merci {formData.fullName} !
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Votre commande a été enregistrée avec succès. Notre équipe vous contactera sous peu par téléphone pour confirmer la livraison.
              </p>
              <p className="text-xs text-zinc-400 font-arabic pt-1" dir="rtl">
                شكراً لكم! سنتصل بكم هاتفياً لتأكيد موعد التوصيل.
              </p>
            </div>

            {/* Order Specs Box */}
            <div className="max-w-md mx-auto p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Référence de Commande :</span>
                <span className="text-white font-bold">{orderId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Téléphone :</span>
                <span className="text-zinc-200">{formData.phone}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Ville de livraison :</span>
                <span className="text-zinc-200">{formData.city}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Adresse :</span>
                <span className="text-zinc-200 truncate max-w-[200px]">{formData.address}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Mode de Paiement :</span>
                <span className="text-emerald-400 font-bold">Paiement à la livraison</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-white font-bold">Prix Total</span>
                <span className="text-white font-bold">
                  {formatPrice(grandTotal, currentCurrency)}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={onClose}
                className="px-8 py-3.5 bg-white text-black hover:bg-zinc-200 text-xs tracking-widest uppercase font-bold rounded-xl shadow-xl cursor-pointer"
              >
                Retourner sur Zebra Bags
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
