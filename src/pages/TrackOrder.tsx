import React, { useState } from 'react';
import {
  Package,
  Search,
  Truck,
  PackageCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus, Currency } from '../types';
import { api } from '../api/client';
import { formatPrice } from '../utils/formatters';

const LOGO_URL = '/assets/imgs/Zebra logo (1).png';

const STATUS_ORDER: OrderStatus[] = ['nouvelle', 'en_cours', 'expediee', 'livree'];

const STATUS_STEPS: { id: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'nouvelle', label: 'Commande reçue', icon: Clock },
  { id: 'en_cours', label: 'En cours de préparation', icon: Package },
  { id: 'expediee', label: 'Expédiée', icon: Truck },
  { id: 'livree', label: 'Livrée', icon: PackageCheck },
];

interface TrackOrderProps {
  onClose: () => void;
}

export const TrackOrder: React.FC<TrackOrderProps> = ({ onClose }) => {
  const [reference, setReference] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = reference.trim().toUpperCase();
    if (!q) {
      setError('Veuillez saisir votre référence de commande.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);
    try {
      const found = await api<Order>(`/api/orders/track?reference=${encodeURIComponent(q)}`);
      setOrder(found);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      setError(
        status === 404
          ? 'Aucune commande trouvée avec cette référence. Vérifiez votre numéro (ex : ZB-2026-1234).'
          : 'Impossible de vérifier votre commande pour le moment. Réessayez plus tard.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-black transition-colors cursor-pointer uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black overflow-hidden">
              <img src={LOGO_URL} alt="Zebra" className="w-full h-full object-contain" />
            </div>
            <span className="font-display tracking-[0.2em] text-sm font-bold text-zinc-900 uppercase">
              ZEBRA BAGS
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500 mb-3">
            <Package className="w-3.5 h-3.5" />
            Suivi de Colis
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900 uppercase tracking-tight">
            Suivre ma commande
          </h1>
          <p className="text-sm text-zinc-600 mt-2 font-light max-w-md mx-auto">
            Entrez votre référence de commande pour connaître l'état de votre colis (en préparation, expédiée, livrée...).
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex : ZB-2026-1234"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-300 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Suivre</span>
          </button>
        </form>

        {error && (
          <div className="max-w-md mx-auto mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl text-left font-medium">
            {error}
          </div>
        )}

        {!order && !error && !loading && searched && (
          <div className="max-w-md mx-auto mt-6 p-6 text-center text-zinc-500 text-sm rounded-xl border border-dashed border-zinc-300">
            <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            Aucun résultat pour le moment.
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="mt-10 space-y-6 text-left animate-in fade-in duration-300">
            {/* Order Summary Header */}
            <div className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400">
                    Référence de commande
                  </span>
                  <p className="font-display text-xl font-extrabold tracking-wide">{order.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 block">
                    Date de commande
                  </span>
                  <p className="text-sm text-zinc-200 font-mono">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="flex items-center">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStatusIdx;
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                            done
                              ? 'bg-white text-black'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span
                          className={`text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight ${
                            done ? 'text-white' : 'text-zinc-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 self-start mt-5 min-w-[8px] ${
                            idx < currentStatusIdx ? 'bg-white' : 'bg-zinc-800'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">
                <ShoppingBag className="w-4 h-4" />
                Articles commandés
              </div>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 py-3 border-b border-zinc-200 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {item.hardware ? item.hardware : ''}
                          {item.monogram ? ` • Monogramme: ${item.monogram}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-zinc-900">
                        {formatPrice(item.price * item.quantity, order.currency as Currency)}
                      </p>
                      <p className="text-[11px] text-zinc-500">x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-zinc-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotal, order.currency as Currency)}</span>
                </div>
                {order.discountPercent > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Remise ({order.discountPercent}%)</span>
                    <span className="text-emerald-600">
                      -{formatPrice((order.subtotal * order.discountPercent) / 100, order.currency as Currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Livraison</span>
                  <span>{order.shipping === 0 ? 'Offerte' : formatPrice(order.shipping, order.currency as Currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-200 text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total, order.currency as Currency)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  Adresse de livraison
                </div>
                <p className="text-sm font-semibold text-zinc-900">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  {order.customer.address}
                  <br />
                  {order.customer.city}
                  {order.customer.state ? `, ${order.customer.state}` : ''}{' '}
                  {order.customer.postalCode}
                </p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                  <Phone className="w-4 h-4" />
                  Contact & Paiement
                </div>
                <p className="text-sm text-zinc-900">{order.customer.phone}</p>
                {order.customer.email && (
                  <p className="text-xs text-zinc-600 mt-1">{order.customer.email}</p>
                )}
                <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  {order.customer.paymentMethod}
                </p>
              </div>
            </div>

            {order.giftNote && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
                <span className="font-bold block mb-1">🎁 Note cadeau :</span>
                {order.giftNote}
              </div>
            )}

            <div className="text-center text-xs text-zinc-400 font-mono pt-2">
              Une question sur votre commande ? Contactez-nous au +212 779 440 140
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackOrder;
