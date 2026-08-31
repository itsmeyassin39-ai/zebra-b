import { api } from '../api/client';
import type { Order } from '../types';

export type PushStatus = 'unknown' | 'on' | 'off' | 'denied' | 'unsupported';

const PUSH_ENABLED_KEY = 'zebra_push_enabled_v1';

// Mémorise que le push a été activé sur cet appareil, pour que le bouton reste
// "Activé" même si la relecture de l'abonnement du navigateur vacille.
export function isPushStoredEnabled(): boolean {
  try {
    return localStorage.getItem(PUSH_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPushStoredEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(PUSH_ENABLED_KEY, '1');
    else localStorage.removeItem(PUSH_ENABLED_KEY);
  } catch {
    // storage unavailable
  }
}

export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window
  );
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    if (!reg) return null;
    return reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  // Si l'utilisateur a déjà activé le push sur cet appareil, on le considère
  // comme activé (il sera restauré automatiquement au besoin) plutôt que de
  // clignoter vers "off" à cause d'une relecture temporairement vide.
  if (isPushStoredEnabled()) return 'on';
  const sub = await getExistingSubscription();
  return sub ? 'on' : 'off';
}

export async function enablePush(): Promise<PushStatus> {
  if (!isPushSupported()) return 'unsupported';

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return 'denied';

  try {
    const { publicKey } = await api<{ publicKey: string | null }>('/api/push/vapid-key');
    if (!publicKey) return 'unsupported';

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    const subscription =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    await api('/api/push/subscribe', {
      method: 'POST',
      body: { subscription: subscription.toJSON() },
    });
    setPushStoredEnabled(true);
    return 'on';
  } catch (err) {
    console.warn('Erreur activation push:', err);
    // Ne PAS prétendre que le push est activé en cas d'échec : si
    // l'abonnement n'a pas pu être enregistré côté serveur, aucune
    // notification n'arrivera sur le téléphone. On retourne 'off' pour
    // que l'interface reflète réellement l'état et permette de réessayer.
    return 'off';
  }
}

export async function disablePush(): Promise<void> {
  const sub = await getExistingSubscription();
  if (sub) {
    try {
      await api('/api/push/subscribe', { method: 'DELETE', body: { endpoint: sub.endpoint } });
    } catch {
      // best effort
    }
    await sub.unsubscribe().catch(() => {});
  }
  setPushStoredEnabled(false);
}

/**
 * Restaure automatiquement le push si l'utilisateur l'avait déjà activé sur cet
 * appareil (bouton resté "Activé" mais abonnement non re-trouvé au chargement).
 * Idempotent : réutilise l'abonnement existant s'il est déjà présent.
 */
export async function restorePushIfEnabled(): Promise<PushStatus> {
  if (!isPushStoredEnabled()) return getPushStatus();
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return enablePush();
}

/**
 * Demande la permission de notification dès l'entrée sur le tableau de bord.
 * Si accordée, enregistre également l'abonnement Push pour les notifications en tâche de fond.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  if (Notification.permission !== 'granted') {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return perm;
    } catch (e) {
      console.error('Erreur demande de permission notification:', e);
      return Notification.permission;
    }
  }

  // Permission accordée : on enregistre l'abonnement push (téléphone /
  // arrière-plan). On attend réellement le résultat pour que l'interface
  // reflète si le push est opérationnel ou non.
  const status = await enablePush();
  if (status !== 'on') {
    console.warn('Push non enregistré (statut final :', status, ')');
  }
  return 'granted';
}

/**
 * Affiche une notification native du navigateur lorsqu'une commande est reçue.
 */
export function sendBrowserOrderNotification(order: Order): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const title = `🛒 Nouvelle commande #${order.id}`;
  const itemsText = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.quantity}x ${i.name || 'Sac Zebra'}`).join(', ')
    : 'Articles Zebra Bags';
  
  const body = `${order.customer.firstName} ${order.customer.lastName} • ${order.total} ${order.currency}\n${itemsText}`;
  const icon = '/assets/imgs/Zebra logo (1).png';

  // 1. Essayer via le Service Worker (fonctionne en onglet inactif et sur mobile)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return (registration as any).showNotification(title, {
          body,
          icon,
          badge: icon,
          tag: `order-${order.id}`,
          renotify: true,
          vibrate: [200, 100, 200, 100, 200],
          data: {
            url: '/#/dashboard',
            orderId: order.id,
          },
        });
      })
      .catch(() => {
        showFallbackNotification(title, body, icon, order.id);
      });
  } else {
    showFallbackNotification(title, body, icon, order.id);
  }
}

function showFallbackNotification(title: string, body: string, icon: string, orderId: string) {
  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: `order-${orderId}`,
    });

    notif.onclick = () => {
      window.focus();
      if (!window.location.hash.startsWith('#/dashboard')) {
        window.location.hash = '#/dashboard';
      }
      notif.close();
    };
  } catch (err) {
    console.warn('Impossible de créer la notification directe:', err);
  }
}

/**
 * Envoie une notification de test pour permettre à l'administrateur de vérifier l'affichage
 */
export function testOrderNotification(): void {
  const dummyOrder: Order = {
    id: `ZB-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: {
      firstName: 'Sophie',
      lastName: 'Benali',
      email: 'sophie.test@example.com',
      phone: '+212 6 12 34 56 78',
      address: 'Boulevard d\'Anfa',
      city: 'Casablanca',
      state: 'Grand Casablanca',
      postalCode: '20000',
      paymentMethod: 'Paiement à la livraison',
    },
    items: [
      {
        productId: 'prod-test',
        name: 'Sac Savanna Noir & Blanc',
        price: 890,
        quantity: 1,
        color: 'Noir / Blanc',
        hardware: 'Argent Palladium',
      },
    ],
    subtotal: 890,
    discountPercent: 0,
    shipping: 0,
    total: 890,
    currency: 'DH',
    status: 'nouvelle',
    createdAt: new Date().toISOString(),
  };

  sendBrowserOrderNotification(dummyOrder);
}