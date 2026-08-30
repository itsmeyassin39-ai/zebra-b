import { Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  DH: { symbol: 'DH', rate: 1, label: 'Dirham (DH)' },
  USD: { symbol: '$', rate: 0.1, label: 'Dollar ($)' },
  EUR: { symbol: '€', rate: 0.09, label: 'Euro (€)' },
};

export function formatPrice(amountDH: number, currency: Currency = 'DH'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.DH;
  const converted = amountDH * info.rate;

  if (currency === 'DH') {
    return `${Math.round(converted).toLocaleString()} DH`;
  }

  return `${info.symbol}${Math.round(converted).toLocaleString()}`;
}

export const FREE_SHIPPING_THRESHOLD_DH = 250;