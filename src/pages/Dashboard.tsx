import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  Upload,
  RotateCcw,
  ArrowLeft,
  Search,
  Save,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Folder,
  ClipboardList,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock,
  LogOut,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Sparkles,
  Star,
  Link,
} from 'lucide-react';
import { Product, CategoryInfo, ProductColor, Order, OrderStatus, Currency, CustomerReview, WhatsAppPicture } from '../types';
import { useStore } from '../store/StoreContext';
import { logout, getRememberedEmail, getToken } from '../store/auth';
import { api } from '../api/client';
import { formatPrice } from '../utils/formatters';
import { connectOrderStream, playNewOrderChime } from '../store/liveOrders';
import ImageUploadField from '../components/ImageUploadField';
import {
  enablePush,
  disablePush,
  getPushStatus,
  restorePushIfEnabled,
  PushStatus,
  requestNotificationPermission,
  sendBrowserOrderNotification,
  testOrderNotification,
  getNotificationPermission,
} from '../lib/push';

interface DashboardProps {
  onClose: () => void;
}

type TabId = 'products' | 'categories' | 'orders' | 'reviews';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'products', label: 'Mes produits', icon: ShoppingBag },
  { id: 'categories', label: 'Mes catégories', icon: Folder },
  { id: 'orders', label: 'Mes commandes', icon: ClipboardList },
  { id: 'reviews', label: 'Photos clients', icon: WhatsAppIcon },
];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: 'Nouvelle',
  en_cours: 'En cours',
  expediee: 'Expédiée',
  livree: 'Livrée',
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  nouvelle: 'bg-black text-white',
  en_cours: 'bg-amber-100 text-amber-800',
  expediee: 'bg-blue-100 text-blue-800',
  livree: 'bg-emerald-100 text-emerald-800',
};

interface ProductFormState {
  name: string;
  tagline: string;
  category: string;
  categoryName: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  stockCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isLimited: boolean;
  main: string;
  hover: string;
  detail: string;
  lifestyle: string;
  gallery: string[];
  colors: ProductColor[];
  material: string;
  lining: string;
  hardware: string;
  weight: string;
  strapDrop: string;
  zebraAccentStyle: string;
  featuresText: string;
  dimensions: { width: number; height: number; depth: number; unit: string };
}

const emptyProductForm = (categoryId: string, categoryName: string): ProductFormState => ({
  name: '',
  tagline: '',
  category: categoryId,
  categoryName,
  price: 299,
  originalPrice: 0,
  rating: 5,
  reviewsCount: 0,
  stockCount: 5,
  isNew: true,
  isBestSeller: false,
  isLimited: false,
  main: '',
  hover: '',
  detail: '',
  lifestyle: '',
  gallery: [],
  colors: [{ name: '', hex: '#fafaf9', previewUrl: '' }],
  material: '',
  lining: '',
  hardware: 'Argent brossé Palladium',
  weight: '',
  strapDrop: '',
  zebraAccentStyle: '',
  featuresText: '',
  dimensions: { width: 30, height: 22, depth: 12, unit: 'cm' },
});

function productToForm(p: Product): ProductFormState {
  return {
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    categoryName: p.categoryName,
    price: p.price,
    originalPrice: p.originalPrice ?? 0,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    stockCount: p.stockCount,
    isNew: Boolean(p.isNew),
    isBestSeller: Boolean(p.isBestSeller),
    isLimited: Boolean(p.isLimited),
    main: p.images.main,
    hover: p.images.hover,
    detail: p.images.detail ?? '',
    lifestyle: p.images.lifestyle ?? '',
    gallery: (p.images.gallery ?? []).filter(Boolean),
    colors: p.colors.map((c) => ({ ...c })),
    material: p.material,
    lining: p.lining ?? '',
    hardware: p.hardware,
    weight: p.weight,
    strapDrop: p.strapDrop,
    zebraAccentStyle: p.zebraAccentStyle,
    featuresText: (p.features ?? []).join(', '),
    dimensions: {
      width: p.dimensions?.width ?? 30,
      height: p.dimensions?.height ?? 22,
      depth: p.dimensions?.depth ?? 12,
      unit: p.dimensions?.unit ?? 'cm',
    },
  };
}

const labelCls = 'block text-sm font-semibold text-zinc-800 mb-1';
const labelHint = 'text-xs text-zinc-400 mt-1';
const inputCls =
  'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900';
const btnPrimary =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm';
const btnSecondary =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-bold hover:bg-zinc-50 transition-colors cursor-pointer';

interface Toast {
  message: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const store = useStore();
  const [tab, setTab] = useState<TabId>('products');

  // toast feedback
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = (message: string) => {
    setToast({ message });
    window.setTimeout(() => setToast(null), 3500);
  };

  // live order notification (SSE)
  const [liveOrder, setLiveOrder] = useState<Order | null>(null);

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [pushStatus, setPushStatus] = useState<PushStatus>('unknown');
  const [pushBusy, setPushBusy] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // 1. Demande automatique de permission dès l'entrée sur le tableau de bord
  useEffect(() => {
    void (async () => {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      // Restaure le push s'il avait déjà été activé sur cet appareil, pour que
      // le bouton ne repasse pas tout seul sur "Désactivé".
      const status = await restorePushIfEnabled();
      setPushStatus(status);
      if (perm === 'granted' && status === 'on') {
        notify('Notifications en direct activées 🔔');
      } else if (perm === 'granted' && status !== 'on') {
        notify('Permission accordée, mais le push téléphone n\'a pas pu être activé.');
      }
    })();
  }, []);

  // 2. Écoute en direct des commandes (SSE) + déclenchement de la notification navigateur & carillon
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const dispose = connectOrderStream(token, (order) => {
      setLiveOrder(order);
      playNewOrderChime();
      sendBrowserOrderNotification(order);
      notify(`Nouvelle commande ${order.id} reçue !`);
    });
    return dispose;
  }, []);

  const handleAskPermission = async () => {
    setPushBusy(true);
    try {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      const status = await getPushStatus();
      setPushStatus(status);
      if (perm === 'granted' && status === 'on') {
        playNewOrderChime();
        testOrderNotification();
        notify('Notifications autorisées et activées avec succès ! 🔔');
      } else if (perm === 'granted' && status !== 'on') {
        notify('Permission accordée, mais le push téléphone n\'a pas pu être activé.');
      } else if (perm === 'denied') {
        notify('Notifications bloquées par votre navigateur.');
      }
    } finally {
      setPushBusy(false);
    }
  };

  const handleTestNotification = () => {
    playNewOrderChime();
    testOrderNotification();
    notify('Notification de test envoyée au navigateur 🔔');
  };

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushStatus === 'on') {
        await disablePush();
        setPushStatus('off');
        notify('Notifications push désactivées');
      } else {
        const result = await enablePush();
        setPushStatus(result);
        setNotifPermission(getNotificationPermission());
        if (result === 'on') {
          playNewOrderChime();
          notify('Notifications push activées ✓');
        } else if (result === 'denied') {
          notify('Notifications bloquées par le navigateur.');
        }
      }
    } finally {
      setPushBusy(false);
    }
  };

  // product editor state
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(() =>
    emptyProductForm(store.categories[0]?.id ?? '', store.categories[0]?.name ?? '')
  );
  const [formError, setFormError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [securityOpen, setSecurityOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const q = searchTerm.trim().toLowerCase();
  const filteredProducts = store.products.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  });

  const handleCopyProductLink = (productId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/product/${productId}`;
    navigator.clipboard.writeText(url).then(() => {
      notify('Lien copié !');
    }).catch(() => {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      notify('Lien copié !');
    });
  };

  const openNewProduct = () => {
    setEditingProductId(null);
    setFormError('');
    setShowAdvanced(false);
    setProductForm(
      emptyProductForm(store.categories[0]?.id ?? '', store.categories[0]?.name ?? '')
    );
    setProductDrawerOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setFormError('');
    setShowAdvanced(false);
    setProductForm(productToForm(p));
    setProductDrawerOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim()) {
      setFormError('Donnez un nom au produit.');
      return;
    }
    const cat =
      store.categories.find((c) => c.id === productForm.category) || store.categories[0];
    const main = productForm.main.trim();
    const base = {
      name: productForm.name.trim(),
      tagline: productForm.tagline.trim() || 'Nouvelle pièce signature',
      category: cat?.id ?? productForm.category,
      categoryName: cat?.name ?? productForm.categoryName,
      price: productForm.price,
      originalPrice: productForm.originalPrice || undefined,
      rating: productForm.rating,
      reviewsCount: productForm.reviewsCount,
      isNew: productForm.isNew,
      isBestSeller: productForm.isBestSeller,
      isLimited: productForm.isLimited,
      stockCount: productForm.stockCount,
      images: {
        main,
        hover: productForm.hover.trim() || main,
        detail: productForm.detail.trim() || undefined,
        lifestyle: productForm.lifestyle.trim() || undefined,
        gallery: productForm.gallery.filter(Boolean),
      },
      colors:
        productForm.colors.filter((c) => c.name.trim()).length > 0
          ? productForm.colors.filter((c) => c.name.trim())
          : [{ name: 'Zèbre Signature', hex: '#fafaf9', previewUrl: main }],
      material: productForm.material,
      hardware: productForm.hardware,
      weight: productForm.weight,
      strapDrop: productForm.strapDrop,
      zebraAccentStyle: productForm.zebraAccentStyle,
      features: productForm.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      dimensions: {
        width: Number(productForm.dimensions.width) || 30,
        height: Number(productForm.dimensions.height) || 22,
        depth: Number(productForm.dimensions.depth) || 12,
        unit: productForm.dimensions.unit || 'cm',
      },
      lining: productForm.lining,
    };
    if (editingProductId) {
      store.updateProduct(editingProductId, base);
      notify('Produit modifié ✓');
    } else {
      store.addProduct({ id: `prod-${Date.now()}`, ...base });
      notify('Produit ajouté ✓');
    }
    setProductDrawerOpen(false);
  };

  const handleExport = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zebra-store-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Données exportées ✓');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      store.importJson(String(reader.result ?? '')).then((ok) => {
        if (ok) notify('Données importées ✓');
        else window.alert('Ce fichier ne ressemble pas à un fichier de sauvegarde valide.');
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous revenir aux produits et photos d\u2019origine ?')) {
      store.resetAll();
      notify('Données réinitialisées');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Vous déconnecter ?')) {
      logout().finally(() => {
        window.location.hash = '';
        window.location.reload();
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-display text-xl font-extrabold tracking-tight">
                  Mon tableau de bord
                </h1>
                <p className="text-xs text-zinc-500">
                  Tout est enregistré automatiquement.
                </p>
              </div>
            </div>
            <button onClick={onClose} className={btnSecondary}>
              <ArrowLeft className="w-4 h-4" />
              Voir la boutique
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-5 items-center overflow-x-auto scrollbar-none pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  tab === t.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
              <button onClick={handleExport} className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer" title="Sauvegarder une copie sur mon ordinateur">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer" title="Restaurer depuis une copie">
                <Upload className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
              <button onClick={handleReset} className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Revenir aux données d'origine">
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-zinc-200 mx-1" />
              
              {/* Notification Pill */}
              <button
                onClick={() => setNotifModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : notifPermission === 'denied'
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
                title="Gérer les notifications de commandes"
              >
                {notifPermission === 'granted' ? (
                  <>
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Alertes actives</span>
                  </>
                ) : notifPermission === 'denied' ? (
                  <>
                    <BellOff className="w-3.5 h-3.5 text-red-600" />
                    <span className="hidden sm:inline">Alertes bloquées</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Activer alertes</span>
                  </>
                )}
              </button>

              <div className="w-px h-6 bg-zinc-200 mx-1" />
              <button onClick={() => setSecurityOpen(true)} className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer" title="Changer l'e-mail et le mot de passe">
                <Lock className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Se déconnecter">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Permission Banner (quand non encore accordée) */}
      {notifPermission === 'default' && !dismissedBanner && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black text-white border-b border-zinc-800 px-4 sm:px-6 py-3.5 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Activez les notifications du navigateur pour les commandes
                </p>
                <p className="text-xs text-zinc-400">
                  Recevez un carillon sonore et une alerte du navigateur dès qu&apos;un client commande.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
              <button
                onClick={handleAskPermission}
                disabled={pushBusy}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-extrabold uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                {pushBusy ? 'Activation…' : 'Autoriser les notifications'}
              </button>
              <button
                onClick={() => setDismissedBanner(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Masquer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live order notification banner */}
      {liveOrder && (
        <div className="sticky top-0 z-50 px-4 sm:px-6 py-3 bg-black text-white shadow-lg animate-in slide-in-from-top duration-300">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
              <BellRing className="w-5 h-5 shrink-0 text-white" />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">Nouvelle commande reçue !</p>
                <p className="text-xs text-zinc-400 font-mono truncate">
                  {liveOrder.id} · {liveOrder.customer.firstName} {liveOrder.customer.lastName} ·{' '}
                  {formatPrice(liveOrder.total, liveOrder.currency as Currency)}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setTab('orders');
                  setLiveOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Voir la commande
              </button>
              <button
                onClick={() => setLiveOrder(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ================= PRODUITS ================= */}
        {tab === 'products' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-zinc-600">
                <span className="font-bold">{store.products.length}</span> produit(s)
              </div>
              <button onClick={openNewProduct} className={btnPrimary}>
                <Plus className="w-4 h-4" />
                Ajouter un produit
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit…"
                className={`${inputCls} pl-11`}
              />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200">
                <p className="text-zinc-500">Aucun produit trouvé.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative aspect-[4/3] bg-zinc-100">
                      {p.images.main ? (
                        <img src={p.images.main} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end">
                        {p.isNew && <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-bold uppercase tracking-wider">Nouveau</span>}
                        {p.isBestSeller && <span className="px-2 py-0.5 rounded bg-white border border-zinc-300 text-zinc-800 text-[9px] font-bold uppercase tracking-wider">Best-seller</span>}
                        {p.isLimited && <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">Limitée</span>}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">{p.categoryName}</span>
                        <span className="text-[11px] font-mono text-zinc-400">{p.stockCount} en stock</span>
                      </div>
                      <h3 className="font-bold text-base text-zinc-900 line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{p.tagline}</p>
                      <div className="mt-3 font-mono font-bold text-lg text-zinc-900">{formatPrice(p.price, 'DH')}</div>

                      {(p.colors?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {p.colors.slice(0, 6).map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              className="w-4 h-4 rounded-full border border-zinc-300"
                              style={{ backgroundColor: c.hex || '#fafaf9' }}
                            />
                          ))}
                          {(p.colors?.length ?? 0) > 6 && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              +{(p.colors?.length ?? 0) - 6}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-2">
                        <button
                          onClick={() => handleCopyProductLink(p.id)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                          title="Copier le lien de partage"
                        >
                          <Link className="w-4 h-4" />
                          Copier le lien
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer « ${p.name} » ?`)) {
                              store.deleteProduct(p.id);
                              notify('Produit supprimé');
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditProduct(p)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= CATEGORIES ================= */}
        {tab === 'categories' && <CategoriesTab />}

        {/* ================= COMMANDES ================= */}
        {tab === 'orders' && <OrdersTab liveOrder={liveOrder} />}

        {/* ================= AVIS ================= */}
        {tab === 'reviews' && <WhatsAppGallery />}
      </main>

      {/* ================= ÉDITEUR PRODUIT ================= */}
      {productDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-extrabold">
                {editingProductId ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => {
                  if (window.confirm('Fermer sans enregistrer ?')) setProductDrawerOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-zinc-100 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-7">
              {formError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                  {formError}
                </div>
              )}

              {/* Essentiel */}
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                  Le nécessaire
                </h3>

                <div className="space-y-5">
                  <div>
                    <ImageUploadField
                      label="Photo du produit"
                      value={productForm.main}
                      onChange={(url) => setProductForm((f) => ({ ...f, main: url }))}
                      hint="Choisissez une photo depuis votre téléphone. Elle sera automatiquement chargée sur le serveur."
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Nom du produit</label>
                    <input
                      className={inputCls}
                      value={productForm.name}
                      onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ex : Sac de voyage Savanna"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <select
                      className={inputCls}
                      value={productForm.category}
                      onChange={(e) => {
                        const cat = store.categories.find((c) => c.id === e.target.value);
                        setProductForm((f) => ({
                          ...f,
                          category: e.target.value,
                          categoryName: cat?.name ?? '',
                        }));
                      }}
                    >
                      {store.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <p className={labelHint}>La catégorie s&#39;affiche sur la fiche produit.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Prix (en DH)</label>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={productForm.price}
                        onChange={(e) => setProductForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                        placeholder="299"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Prix barré (promo)</label>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm((f) => ({ ...f, originalPrice: Number(e.target.value) || 0 }))}
                        placeholder="Optionnel"
                      />
                      <p className={labelHint}>L&#39;ancien prix, si le produit est en solde.</p>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Combien d&#39;articles disponibles ?</label>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={productForm.stockCount}
                      onChange={(e) => setProductForm((f) => ({ ...f, stockCount: Number(e.target.value) || 0 }))}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Étiquettes</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl">
                        <input type="checkbox" className="accent-black" checked={productForm.isNew} onChange={(e) => setProductForm((f) => ({ ...f, isNew: e.target.checked }))} />
                        Nouveau
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl">
                        <input type="checkbox" className="accent-black" checked={productForm.isBestSeller} onChange={(e) => setProductForm((f) => ({ ...f, isBestSeller: e.target.checked }))} />
                        Meilleure vente
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl">
                        <input type="checkbox" className="accent-black" checked={productForm.isLimited} onChange={(e) => setProductForm((f) => ({ ...f, isLimited: e.target.checked }))} />
                        Édition limitée
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails du produit (primaires) */}
              <div className="border-t border-zinc-100 pt-4">
                <h3 className="text-sm font-bold text-zinc-900 mb-4">Détails du produit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Matière</label>
                    <input className={inputCls} value={productForm.material} onChange={(e) => setProductForm((f) => ({ ...f, material: e.target.value }))} placeholder="Ex : Poil de veau" />
                  </div>
                  <div>
                    <label className={labelCls}>Doublure</label>
                    <input className={inputCls} value={productForm.lining} onChange={(e) => setProductForm((f) => ({ ...f, lining: e.target.value }))} placeholder="Ex : Cuir de veau microfibre" />
                  </div>
                  <div>
                    <label className={labelCls}>Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" min={0} className={inputCls} value={productForm.dimensions.width} onChange={(e) => setProductForm((f) => ({ ...f, dimensions: { ...f.dimensions, width: Number(e.target.value) } }))} placeholder="Larg." title="Largeur" />
                      <input type="number" min={0} className={inputCls} value={productForm.dimensions.height} onChange={(e) => setProductForm((f) => ({ ...f, dimensions: { ...f.dimensions, height: Number(e.target.value) } }))} placeholder="Haut." title="Hauteur" />
                    </div>
                    <input className={`${inputCls} mt-2`} value={productForm.dimensions.unit} onChange={(e) => setProductForm((f) => ({ ...f, dimensions: { ...f.dimensions, unit: e.target.value } }))} placeholder="cm" title="Unité" />
                  </div>
                </div>
              </div>

              {/* Couleurs du produit */}
              <div className="border-t border-zinc-100 pt-4">
                <h3 className="text-sm font-bold text-zinc-900 mb-4">Couleurs disponibles</h3>

                <div className="space-y-3">
                  {productForm.colors.map((cl, ci) => (
                    <div key={ci} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <input
                            className={inputCls}
                            value={cl.name}
                            onChange={(e) =>
                              setProductForm((f) => ({
                                ...f,
                                colors: f.colors.map((col, i) =>
                                  i === ci ? { ...col, name: e.target.value } : col
                                ),
                              }))
                            }
                            placeholder="Nom de la couleur (ex : Rouge)"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              className="w-12 h-10 rounded-lg border border-zinc-300 cursor-pointer bg-white p-1 shrink-0"
                              value={cl.hex || '#fafaf9'}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  colors: f.colors.map((col, i) =>
                                    i === ci ? { ...col, hex: e.target.value } : col
                                  ),
                                }))
                              }
                              title="Couleur de l'échantillon"
                            />
                            <ImageUploadField
                              label=""
                              compact
                              value={cl.previewUrl}
                              hint="Photo de cette variante (optionnel)"
                              onChange={(url) =>
                                setProductForm((f) => ({
                                  ...f,
                                  colors: f.colors.map((col, i) =>
                                    i === ci ? { ...col, previewUrl: url } : col
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm((f) => ({
                              ...f,
                              colors: f.colors.filter((_, i) => i !== ci),
                            }))
                          }
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 mt-1"
                          title="Retirer cette couleur"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setProductForm((f) => ({
                      ...f,
                      colors: [...f.colors, { name: '', hex: '#fafaf9', previewUrl: '' }],
                    }))
                  }
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une couleur
                </button>
                <p className={labelHint}>
                  Ces variantes s&#39;affichent sur la fiche produit. Sans aucune couleur, le produit est vendu en « Zèbre Signature ».
                </p>
              </div>

              {/* Avancé (replié) */}
              <div className="border-t border-zinc-100 pt-4">
                <button
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Plus d&#39;infos sur le produit (optionnel)
                </button>

                {showAdvanced && (
                  <div className="mt-5 space-y-5">
                    <div>
                      <label className={labelCls}>Sous-titre du produit</label>
                      <input className={inputCls} value={productForm.tagline} onChange={(e) => setProductForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Ex : Le cabas signature en poil de zèbre" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Note (0 à 5)</label>
                        <input type="number" min={0} max={5} step={0.1} className={inputCls} value={productForm.rating} onChange={(e) => setProductForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Nombre d&#39;avis</label>
                        <input type="number" min={0} className={inputCls} value={productForm.reviewsCount} onChange={(e) => setProductForm((f) => ({ ...f, reviewsCount: Number(e.target.value) || 0 }))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <ImageUploadField
                          label="Photo au survol"
                          compact
                          value={productForm.hover}
                          onChange={(url) => setProductForm((f) => ({ ...f, hover: url }))}
                        />
                      </div>
                      <div>
                        <ImageUploadField
                          label="Photo en détail"
                          compact
                          value={productForm.detail}
                          onChange={(url) => setProductForm((f) => ({ ...f, detail: url }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <ImageUploadField
                          label="Photo en situation"
                          compact
                          value={productForm.lifestyle}
                          onChange={(url) => setProductForm((f) => ({ ...f, lifestyle: url }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Galerie photos (illimité)
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {productForm.gallery.map((url, gi) => (
                            <div key={gi} className="relative">
                              <img
                                src={url}
                                alt={`Galerie ${gi + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-20 h-20 rounded-xl object-cover border border-zinc-200 bg-zinc-100"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setProductForm((f) => ({
                                    ...f,
                                    gallery: f.gallery.filter((_, idx) => idx !== gi),
                                  }))
                                }
                                className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                                title="Retirer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <ImageUploadField
                            label=""
                            compact
                            value=""
                            hint="Ajouter une photo"
                            onChange={(url) =>
                              setProductForm((f) => ({
                                ...f,
                                gallery: [...f.gallery, url].filter(Boolean),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-zinc-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Fermer sans enregistrer ?')) setProductDrawerOpen(false);
                }}
                className={btnSecondary}
              >
                Annuler
              </button>
              <button onClick={handleSaveProduct} className={btnPrimary}>
                <Save className="w-4 h-4" />
                Enregistrer le produit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sécurité */}
      {securityOpen && (
        <SecurityModal
          onClose={() => setSecurityOpen(false)}
          onSaved={(msg) => notify(msg)}
        />
      )}

      {/* Modal Notifications */}
      <NotificationSettingsModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        permission={notifPermission}
        pushStatus={pushStatus}
        busy={pushBusy}
        onAskPermission={handleAskPermission}
        onTogglePush={handleTogglePush}
        onTestNotification={handleTestNotification}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {toast.message}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// GALERIE PHOTOS WHATSAPP
// =====================================================================
const WhatsAppGallery: React.FC = () => {
  const { whatsappPictures, addWhatsAppPicture, deleteWhatsAppPicture } = useStore();
  const [pendingImage, setPendingImage] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [viewer, setViewer] = useState<string | null>(null);

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(''), 3000);
  };

  const toggle = () => setOpen((v) => !v);

  const handleAdd = async () => {
    if (!pendingImage) return;
    const picture: WhatsAppPicture = {
      id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      imageUrl: pendingImage,
      caption: caption.trim() || undefined,
    };
    await addWhatsAppPicture(picture);
    setPendingImage('');
    setCaption('');
    flash('Photo WhatsApp ajoutée ✓');
  };

  const handleDelete = async (p: WhatsAppPicture) => {
    if (!window.confirm('Supprimer cette photo WhatsApp ?')) return;
    await deleteWhatsAppPicture(p.id);
    flash('Photo supprimée');
  };

  return (
    <div className="mt-8 border-t border-zinc-200 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            Photos WhatsApp
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Ajoutez les captures d'écran WhatsApp de vos commandes clients ici.
          </p>
        </div>
        <button onClick={toggle} className={btnPrimary}>
          {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {open ? 'Fermer' : 'Ajouter une photo'}
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
          {msg}
        </div>
      )}

      {open && (
        <div className="mb-6 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <ImageUploadField
            label="Photo WhatsApp"
            value={pendingImage}
            onChange={setPendingImage}
            hint="Choisissez une capture d'écran WhatsApp (commande client, confirmation…)"
          />
          <div className="mt-4">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Légende (optionnel)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex : Commande de Sara — Sac Léopard"
              className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={() => { setPendingImage(''); setCaption(''); setOpen(false); }} className={btnSecondary}>
              Annuler
            </button>
            <button onClick={handleAdd} disabled={!pendingImage} className={btnPrimary}>
              <Save className="w-4 h-4" />
              Ajouter la photo
            </button>
          </div>
        </div>
      )}

      {whatsappPictures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
          <WhatsAppIcon className="w-8 h-8 text-[#25D366] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-zinc-500">Aucune photo WhatsApp.</p>
          <p className="text-xs text-zinc-400 mt-1">Cliquez sur « Ajouter une photo » pour commencer.</p>
        </div>
      ) : (
        <div>
          <span className="text-xs text-zinc-400 font-mono">{whatsappPictures.length} photo{whatsappPictures.length > 1 ? 's' : ''}</span>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {whatsappPictures.map((p) => (
              <div key={p.id} className="group relative rounded-xl border border-zinc-200 overflow-hidden bg-white">
                <button
                  onClick={() => setViewer(p.imageUrl)}
                  className="block w-full cursor-zoom-in"
                >
                  <img src={p.imageUrl} alt={p.caption || 'Photo WhatsApp'} className="w-full aspect-square object-cover" />
                </button>
                {p.caption && (
                  <p className="px-2.5 py-1.5 text-[11px] text-zinc-500 line-clamp-2">{p.caption}</p>
                )}
                <button
                  onClick={() => handleDelete(p)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setViewer(null)}
        >
          <button
            onClick={() => setViewer(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={viewer} alt="Aperçu WhatsApp" className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const SecurityModal: React.FC<{ onClose: () => void; onSaved: (msg: string) => void }> = ({ onClose, onSaved }) => {
  const [email, setEmail] = useState(() => getRememberedEmail());
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Saisissez une adresse e-mail valide.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmation du mot de passe ne correspond pas.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api('/api/auth/credentials', {
        method: 'PUT',
        body: { currentPassword, email: email.trim(), newPassword },
      });
      onSaved('E-mail et mot de passe mis à jour ✓');
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Erreur serveur.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">Accès du tableau de bord</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 cursor-pointer" title="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Adresse e-mail de connexion</label>
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Mot de passe actuel</label>
            <input type="password" className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Pour confirmer votre identité" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="6 caractères minimum" />
            </div>
            <div>
              <label className={labelCls}>Confirmer</label>
              <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>
            Annuler
          </button>
          <button onClick={save} disabled={busy} className={`${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed`}>
            <Save className="w-4 h-4" />
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationSettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission | 'unsupported';
  pushStatus: PushStatus;
  busy: boolean;
  onAskPermission: () => void;
  onTogglePush: () => void;
  onTestNotification: () => void;
}> = ({
  isOpen,
  onClose,
  permission,
  pushStatus,
  busy,
  onAskPermission,
  onTogglePush,
  onTestNotification,
}) => {
  const [serverDevices, setServerDevices] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    api<{ count: number }>('/api/push/status')
      .then((d) => {
        if (!cancelled) setServerDevices(d.count);
      })
      .catch(() => {
        if (!cancelled) setServerDevices(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold">Notifications de commandes</h2>
              <p className="text-xs text-zinc-500">Alertes sonores & notifications navigateur</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 cursor-pointer" title="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">Statut du navigateur</span>
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Autorisées ✓
                </span>
              ) : permission === 'denied' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Bloquées ✗
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  En attente
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              {permission === 'granted'
                ? 'Le navigateur émettra un carillon sonore et affichera une notification instantanée à chaque commande passée par un client.'
                : permission === 'denied'
                ? 'Les notifications sont bloquées. Pour les réactiver, cliquez sur le cadenas 🔒 dans la barre d’adresse de votre navigateur et autorisez les notifications.'
                : 'Autorisez les notifications pour être averti instantanément lorsqu’un client passe une commande sur votre boutique.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {permission !== 'granted' && (
              <button
                onClick={onAskPermission}
                disabled={busy}
                className="w-full py-3 px-4 rounded-2xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                {busy ? 'Demande en cours…' : 'Demander la permission'}
              </button>
            )}

            <button
              onClick={onTestNotification}
              className="w-full py-3 px-4 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-zinc-600" />
              Tester la notification et le carillon
            </button>
          </div>

          {/* Push Web background section */}
          <div className="pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-zinc-800">Notifications en arrière-plan (Push)</p>
                <p className="text-zinc-500 text-[11px]">Fonctionne même onglet fermé / mobile</p>
              </div>
              <button
                onClick={onTogglePush}
                disabled={busy || permission === 'denied'}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  pushStatus === 'on'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {pushStatus === 'on' ? 'Activé' : 'Désactivé'}
              </button>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Appareils enregistrés sur le serveur</span>
                {serverDevices === null ? (
                  <span className="text-zinc-400">…</span>
                ) : serverDevices > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {serverDevices}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    0
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                {serverDevices === 0
                  ? 'Aucun appareil : la notification n\u2019arrivera pas en arrière-plan. Activez le bouton ci-dessus avec ce téléphone.'
                  : 'Ce chiffre doit être d\u2019au moins 1 pour que la notification arrive même quand l\u2019air est fermé.'}
              </p>
            </div>

            {/* Guide mobile : comment vraiment recevoir la notification */}
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[11px] font-bold text-amber-900 mb-1.5">
                📲 Pour recevoir l\u2019alerte même quand Chrome est fermé (sur téléphone) :
              </p>
              <ol className="text-[11px] text-amber-900 list-decimal pl-4 space-y-1 leading-relaxed">
                <li><b>Installez le site</b> : dans Chrome, menu ⋮ → « Ajouter à l\u2019écran d\u2019accueil » (ou « Installer l\u2019application »). Ouvrez-le ensuite depuis cet icône, pas depuis un onglet.</li>
                <li><b>Autorisez les notifications</b> avec ce téléphone (bouton ci-dessus).</li>
                <li><b>Empêchez Chrome d\u2019être mis en veille</b> : Réglages → Applications → Chrome → Batterie → « <b>Sans restriction</b> » (et désactivez l\u2019économiseur de batterie).</li>
                <li><b>Restez sur Chrome</b> (désactivez Brave) et gardez le téléphone <b>allumé</b> : aucun système ne peut afficher une notification si le téléphone est éteint.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-300 transition-colors cursor-pointer">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriesTab: React.FC = () => {
  const store = useStore();
  const [newName, setNewName] = useState('');

  const productCount = (id: string) => store.products.filter((p) => p.category === id).length;

  const addCategory = () => {
    if (!newName.trim()) return;
    const slug =
      newName
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
    const id = store.categories.some((c) => c.id === slug) ? `${slug}-${Date.now()}` : slug;
    store.addCategory({
      id,
      name: newName.trim(),
      tagline: '',
      itemCount: 0,
      image: '',
      badge: '',
    });
    setNewName('');
  };

  return (
    <section>
      <div className="text-zinc-600 mb-6">
        <span className="font-bold">{store.categories.length}</span> catégorie(s)
      </div>

      {/* Nouvelle catégorie */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <h3 className="font-bold text-base mb-4">
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une nouvelle catégorie
          </span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={labelCls}>Nom de la catégorie</label>
            <input className={inputCls} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex : Mallette" />
          </div>
          <div className="sm:self-end">
            <button onClick={addCategory} disabled={!newName.trim()} className={`${btnPrimary} w-full disabled:opacity-40 disabled:cursor-not-allowed`}>
              <Plus className="w-4 h-4" />
              Ajouter la catégorie
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {store.categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} productCount={productCount(cat.id)} />
        ))}
      </div>
    </section>
  );
};

const CategoryCard: React.FC<{ category: CategoryInfo; productCount: number }> = ({ category, productCount }) => {
  const store = useStore();
  const [name, setName] = useState(category.name);

  const save = () => {
    if (!name.trim()) return;
    store.updateCategory(category.id, { name: name.trim(), itemCount: productCount });
  };

  const remove = () => {
    const msg =
      productCount > 0
        ? `Supprimer « ${category.name} » ? Les ${productCount} produit(s) seront déplacés vers une autre catégorie.`
        : `Supprimer la catégorie « ${category.name} » ?`;
    if (window.confirm(msg)) {
      store.deleteCategory(category.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base">{category.name}</div>
            <div className="text-xs text-zinc-500">{productCount} produit(s)</div>
          </div>
        </div>
        <button onClick={remove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer" title="Supprimer la catégorie">
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls}>Nom de la catégorie</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button onClick={save} className={`${btnPrimary} w-full justify-center`}>
          <Save className="w-4 h-4" />
          Enregistrer la catégorie
        </button>
      </div>
    </div>
  );
};

const OrdersTab: React.FC<{ liveOrder: Order | null }> = ({ liveOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(''), 3000);
  };

  const load = async () => {
    try {
      const data = await api<Order[]>('/api/orders');
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (liveOrder && !orders.some((o) => o.id === liveOrder.id)) {
      setOrders((prev) => [liveOrder, ...prev]);
    }
  }, [liveOrder]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    await api(`/api/orders/${encodeURIComponent(id)}`, { method: 'PUT', body: { status } });
    await load();
    flash('Statut mis à jour ✓');
  };

  const removeOrder = async (o: Order) => {
    if (
      !window.confirm(
        `Supprimer la commande ${o.id} de ${o.customer.firstName} ${o.customer.lastName} ?`
      )
    )
      return;
    await api(`/api/orders/${encodeURIComponent(o.id)}`, { method: 'DELETE' });
    await load();
    flash('Commande supprimée');
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const cardLabel = 'text-[10px] font-mono uppercase tracking-wider text-zinc-400';

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-zinc-600">
          <span className="font-bold">{orders.length}</span> commande(s)
        </div>
        <button onClick={load} className={btnSecondary}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200 text-zinc-500">
          Chargement des commandes…
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200">
          <ClipboardList className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune commande pour le moment.</p>
          <p className="text-xs text-zinc-400 mt-1">
            Les commandes passées sur la boutique apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

              {/* Header Bar */}
              <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${ORDER_STATUS_STYLES[o.status] ?? 'bg-zinc-100 text-zinc-700'}`}>
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-sm text-zinc-900">{o.id}</p>
                    <p className="text-[11px] text-zinc-400">{formatDate(o.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</p>
                    <p className="font-mono font-bold text-base text-zinc-900">
                      {formatPrice(o.total, o.currency as Currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer + Items Grid */}
              <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Left: Customer Info */}
                <div className="lg:col-span-3 space-y-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Client</p>
                    <p className="font-semibold text-sm text-zinc-900">
                      {[o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ')}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-600">{o.customer.phone}</p>
                    <p className="text-xs text-zinc-500">{[o.customer.city, o.customer.address].filter(Boolean).join(' — ')}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-600 uppercase tracking-wide">
                    {o.customer.paymentMethod || 'Livraison'}
                  </div>
                </div>

                {/* Middle: Product Items */}
                <div className="lg:col-span-6">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-3">Articles</p>
                  <div className="space-y-3">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-4 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-zinc-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-zinc-900 truncate">{it.name}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{it.color}{it.hardware ? ` · ${it.hardware}` : ''}</p>
                          {it.monogram && (
                            <p className="text-[11px] text-zinc-400 italic mt-0.5">Monogramme : {it.monogram}</p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-zinc-400">Qté : {it.quantity}</span>
                            <span className="font-mono text-sm font-bold text-zinc-900">
                              {formatPrice(it.price * it.quantity, o.currency as Currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {o.giftNote && (
                    <p className="text-zinc-400 italic text-[11px] mt-3 px-1">🎁 {o.giftNote}</p>
                  )}
                </div>

                {/* Right: Summary & Actions */}
                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Récapitulatif</p>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Sous-total</span>
                      <span className="font-mono">{formatPrice(o.subtotal, o.currency as Currency)}</span>
                    </div>
                    {o.discountPercent > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">
                        <span>Réduction {o.discountPercent}%</span>
                        <span className="font-mono">-{formatPrice((o.subtotal * o.discountPercent) / 100, o.currency as Currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Livraison</span>
                      <span className="font-mono">{o.shipping === 0 ? 'Offerte' : formatPrice(o.shipping, o.currency as Currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-zinc-200">
                      <span>Total</span>
                      <span className="font-mono">{formatPrice(o.total, o.currency as Currency)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-100">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black cursor-pointer font-medium"
                    >
                      {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeOrder(o)}
                      className="p-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const ReviewsTab: React.FC = () => {
  const { products, customerReviews, addCustomerReview, updateCustomerReview, deleteCustomerReview, whatsappPictures, addWhatsAppPicture, deleteWhatsAppPicture } = useStore();
  const [editing, setEditing] = useState<CustomerReview | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(''), 3000);
  };

  const emptyForm: Omit<CustomerReview, 'id'> = {
    author: '',
    location: '',
    rating: 5,
    date: new Date().toISOString().slice(0, 10),
    title: '',
    comment: '',
    productPurchased: '',
    productId: '',
    verified: true,
  };

  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (r: CustomerReview) => {
    setEditing(r);
    setForm({
      author: r.author,
      location: r.location,
      rating: r.rating,
      date: r.date,
      title: r.title,
      comment: r.comment,
      productPurchased: r.productPurchased,
      productId: r.productId ?? '',
      verified: r.verified,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.author.trim() || !form.title.trim()) return;
    if (editing) {
      await updateCustomerReview(editing.id, form);
      flash('Avis modifié ✓');
    } else {
      const review: CustomerReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...form,
      };
      await addCustomerReview(review);
      flash('Avis ajouté ✓');
    }
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (r: CustomerReview) => {
    if (!window.confirm(`Supprimer l'avis de ${r.author} ?`)) return;
    await deleteCustomerReview(r.id);
    flash('Avis supprimé');
  };

  const selectedProduct = products.find((p) => p.id === form.productId);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-zinc-600">
          <span className="font-bold">{customerReviews.length}</span> avis
        </div>
        <button onClick={openNew} className={btnPrimary}>
          <Plus className="w-4 h-4" />
          Ajouter un avis
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
          {msg}
        </div>
      )}

      {/* Form Panel */}
      {isFormOpen && (
        <div className="mb-6 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              {editing ? 'Modifier l\'avis' : 'Nouvel avis'}
            </h3>
            <button onClick={() => { setIsFormOpen(false); setEditing(null); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Produit</label>
              <select
                value={form.productId ?? ''}
                onChange={(e) => {
                  const pid = e.target.value;
                  const prod = products.find((p) => p.id === pid);
                  setForm({ ...form, productId: pid, productPurchased: prod?.name ?? '' });
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black cursor-pointer"
              >
                <option value="">— Sélectionner un produit —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Auteur</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Nom du client"
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Ville</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Casablanca, Maroc"
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Note</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, rating: s })}
                    className="cursor-pointer"
                  >
                    <Star className={`w-6 h-6 transition-colors ${s <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Titre</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre de l'avis"
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Comment */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">Commentaire</label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Texte de l'avis client..."
                className="w-full rounded-xl border border-zinc-200 bg-white text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
              />
            </div>

            {/* Verified */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm text-zinc-700">Avis vérifié</span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button onClick={() => { setIsFormOpen(false); setEditing(null); }} className={btnSecondary}>
              Annuler
            </button>
            <button onClick={handleSave} className={btnPrimary}>
              <Save className="w-4 h-4" />
              {editing ? 'Enregistrer' : 'Publier l\'avis'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {customerReviews.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200">
          <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucun avis pour le moment.</p>
          <p className="text-xs text-zinc-400 mt-1">
            Ajoutez des avis pour les afficher sur vos fiches produit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customerReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-zinc-100 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
              {/* Avatar / Initials */}
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-zinc-600">
                  {r.author.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-zinc-900">{r.author}</span>
                  {r.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      Vérifié
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400 font-mono ml-auto">{r.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <p className="font-semibold text-xs text-zinc-800">{r.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{r.comment}</p>
                <div className="flex items-center gap-2 mt-2">
                  {r.productPurchased && (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded">
                      {r.productPurchased}
                    </span>
                  )}
                  {r.location && (
                    <span className="text-[10px] font-mono text-zinc-400">{r.location}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Pictures Gallery */}
      <WhatsAppGallery />
    </section>
  );
};

export default Dashboard;
