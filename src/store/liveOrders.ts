import type { Order } from '../types';

export function connectOrderStream(
  token: string,
  onOrder: (order: Order) => void
): () => void {
  let closed = false;
  const es = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

  es.addEventListener('order', (event) => {
    if (closed) return;
    try {
      const order = JSON.parse((event as MessageEvent).data) as Order;
      onOrder(order);
    } catch {
      // message illisible, on ignore
    }
  });

  return () => {
    closed = true;
    es.close();
  };
}

let audioCtx: AudioContext | null = null;

/**
 * Joue un carillon sonore moderne et distinctif pour chaque nouvelle commande reçue.
 */
export function playNewOrderChime(): void {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audioCtx = audioCtx || new Ctor();

    const ctx = audioCtx;
    const play = () => {
      const now = ctx.currentTime;

      // Note 1 (A5 - 880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.28, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2 (C#6 - 1108Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1108.73, now + 0.12);
      gain2.gain.setValueAtTime(0.0001, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.32, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);

      // Note 3 (E6 - 1318.5Hz - note haute cristalline)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1318.51, now + 0.24);
      gain3.gain.setValueAtTime(0.0001, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.25, now + 0.27);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      osc3.connect(gain3).connect(ctx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 0.95);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {
    // audio indisponible
  }
}