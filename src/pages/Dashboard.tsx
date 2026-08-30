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
  Instagram,
  ClipboardList,
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
} from 'lucide-react';
import { Product, CategoryInfo, InstagramPost, ProductColor, Order, OrderStatus, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { logout, getRememberedEmail, getToken } from '../store/auth';
import { getGoogleToken } from '../store/googleAuth';
import { api } from '../api/client';
import { formatPrice } from '../utils/formatters';
import { connectOrderStream, playNewOrderChime } from '../store/liveOrders';
import {
  enablePush,
  disablePush,
  getPushStatus,
  PushStatus,
  requestNotificationPermission,
  sendBrowserOrderNotification,
  testOrderNotification,
  getNotificationPermission,
} from '../lib/push';

interface DashboardProps {
  onClose: () => void;
}

type TabId = 'products' | 'categories' | 'posts' | 'orders';

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'products', label: 'Mes produits', icon: ShoppingBag },
  { id: 'categories', label: 'Mes catégories', icon: Folder },
  { id: 'posts', label: 'Mes publications', icon: Instagram },
  { id: 'orders', label: 'Mes commandes', icon: ClipboardList },
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
  colors: ProductColor[];
  description: string;
  material: string;
  hardware: string;
  weight: string;
  strapDrop: string;
  zebraAccentStyle: string;
  featuresText: string;
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
  colors: [{ name: '', hex: '#fafaf9', previewUrl: '' }],
  description: '',
  material: '',
  hardware: 'Argent brossé Palladium',
  weight: '',
  strapDrop: '',
  zebraAccentStyle: '',
  featuresText: '',
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
    colors: p.colors.map((c) => ({ ...c })),
    description: p.description,
    material: p.material,
    hardware: p.hardware,
    weight: p.weight,
    strapDrop: p.strapDrop,
    zebraAccentStyle: p.zebraAccentStyle,
    featuresText: (p.features ?? []).join(', '),
  };
}

interface PostFormState {
  handle: string;
  caption: string;
  imageUrl: string;
  likes: number;
  comments: number;
  productId: string;
}

const emptyPostForm = (productId: string): PostFormState => ({
  handle: 'zebrabags',
  caption: '',
  imageUrl: '',
  likes: 0,
  comments: 0,
  productId,
});

function postToForm(p: InstagramPost): PostFormState {
  return {
    handle: p.handle,
    caption: p.caption,
    imageUrl: p.imageUrl,
    likes: p.likes,
    comments: p.comments,
    productId: p.productId,
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
      const status = await getPushStatus();
      setPushStatus(status);
      if (perm === 'granted') {
        notify('Notifications en direct activées 🔔');
      }
    })();
  }, []);

  // 2. Écoute en direct des commandes (SSE) + déclenchement de la notification navigateur & carillon
  useEffect(() => {
    const token = getToken() || getGoogleToken();
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
      if (perm === 'granted') {
        playNewOrderChime();
        testOrderNotification();
        notify('Notifications autorisées et activées avec succès ! 🔔');
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

  const [postDrawerOpen, setPostDrawerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<PostFormState>(() =>
    emptyPostForm(store.products[0]?.id ?? '')
  );

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
      },
      colors:
        productForm.colors.filter((c) => c.name.trim()).length > 0
          ? productForm.colors.filter((c) => c.name.trim())
          : [{ name: 'Zèbre Signature', hex: '#fafaf9', previewUrl: main }],
      description: productForm.description,
      material: productForm.material,
      hardware: productForm.hardware,
      weight: productForm.weight,
      strapDrop: productForm.strapDrop,
      zebraAccentStyle: productForm.zebraAccentStyle,
      features: productForm.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      dimensions: { width: 30, height: 22, depth: 12, unit: 'cm' },
      lining: 'Cuir de veau microfibre',
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

  const openNewPost = () => {
    setEditingPostId(null);
    setFormError('');
    setPostForm(emptyPostForm(store.products[0]?.id ?? ''));
    setPostDrawerOpen(true);
  };

  const openEditPost = (p: InstagramPost) => {
    setEditingPostId(p.id);
    setFormError('');
    setPostForm(postToForm(p));
    setPostDrawerOpen(true);
  };

  const handleSavePost = () => {
    if (!postForm.caption.trim() && !postForm.imageUrl.trim()) {
      setFormError('Ajoutez une légende ou une image.');
      return;
    }
    const prod = store.products.find((p) => p.id === postForm.productId);
    const payload = {
      handle: postForm.handle.trim() || 'zebrabags',
      caption: postForm.caption,
      imageUrl: postForm.imageUrl || prod?.images.main || '',
      likes: postForm.likes,
      comments: postForm.comments,
      productId: postForm.productId,
      productTaggedName: prod?.name ?? '',
      productTaggedPrice: prod?.price ?? 0,
    };
    if (editingPostId) {
      store.updateInstagramPost(editingPostId, payload);
      notify('Publication modifiée ✓');
    } else {
      store.addInstagramPost({ id: `post-${Date.now()}`, ...payload });
      notify('Publication ajoutée ✓');
    }
    setPostDrawerOpen(false);
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
          <div className="flex gap-2 mt-5 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
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

                      <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer « ${p.name} » ?`)) {
                              store.deleteProduct(p.id);
                              notify('Produit supprimé');
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                        <button
                          onClick={() => openEditProduct(p)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Modifier
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

        {/* ================= PUBLICATIONS ================= */}
        {tab === 'posts' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-zinc-600">
                <span className="font-bold">{store.instagramPosts.length}</span> publication(s)
              </div>
              <button onClick={openNewPost} className={btnPrimary}>
                <Plus className="w-4 h-4" />
                Ajouter une publication
              </button>
            </div>

            {store.instagramPosts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200">
                <p className="text-zinc-500">Aucune publication pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {store.instagramPosts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative aspect-square bg-zinc-100">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.caption} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <Instagram className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg text-white text-xs font-bold">@{p.handle}</span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-sm text-zinc-700 line-clamp-2 mb-2">
                        {p.caption || '(sans légende)'}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mb-3">
                        <span>♥ {p.likes} j&#39;aime</span>
                        <span>💬 {p.comments} commentaires</span>
                      </div>
                      <div className="text-xs text-zinc-600 mb-4">
                        Produit montré :{' '}
                        <span className="font-semibold text-zinc-900">{p.productTaggedName || 'aucun'}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-zinc-100 flex gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm('Supprimer cette publication ?')) {
                              store.deleteInstagramPost(p.id);
                              notify('Publication supprimée');
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                        <button
                          onClick={() => openEditPost(p)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
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
                    <label className={labelCls}>Photo du produit</label>
                    <div className="flex items-center gap-4">
                      {productForm.main ? (
                        <img
                          src={productForm.main}
                          alt="Aperçu"
                          referrerPolicy="no-referrer"
                          className="w-24 h-24 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 shrink-0">
                          <ShoppingBag className="w-7 h-7" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          className={inputCls}
                          value={productForm.main}
                          onChange={(e) => setProductForm((f) => ({ ...f, main: e.target.value }))}
                          placeholder="Collez le lien de la photo…"
                        />
                        <p className={labelHint}>Astuce : écrivez <code className="bg-zinc-100 px-1 rounded">/assets/imgs/ma-photo.jpg</code> pour une photo de votre boutique.</p>
                      </div>
                    </div>
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

                  <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Note (0 à 5)</label>
                        <input type="number" min={0} max={5} step={0.1} className={inputCls} value={productForm.rating} onChange={(e) => setProductForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Nombre d&#39;avis</label>
                        <input type="number" min={0} className={inputCls} value={productForm.reviewsCount} onChange={(e) => setProductForm((f) => ({ ...f, reviewsCount: Number(e.target.value) || 0 }))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Photo au survol</label>
                        <input className={inputCls} value={productForm.hover} onChange={(e) => setProductForm((f) => ({ ...f, hover: e.target.value }))} placeholder="/assets/imgs/…" />
                      </div>
                      <div>
                        <label className={labelCls}>Photo en détail</label>
                        <input className={inputCls} value={productForm.detail} onChange={(e) => setProductForm((f) => ({ ...f, detail: e.target.value }))} placeholder="/assets/imgs/…" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Photo en situation</label>
                        <input className={inputCls} value={productForm.lifestyle} onChange={(e) => setProductForm((f) => ({ ...f, lifestyle: e.target.value }))} placeholder="/assets/imgs/…" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Couleurs disponibles</label>
                      <div className="space-y-2">
                        {productForm.colors.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input className={inputCls} value={c.name} placeholder="Nom de la couleur" onChange={(e) => setProductForm((f) => ({ ...f, colors: f.colors.map((cc, i) => (i === idx ? { ...cc, name: e.target.value } : cc)) }))} />
                            <input type="color" className="w-12 h-12 rounded-xl border border-zinc-300 bg-white cursor-pointer shrink-0" value={c.hex} onChange={(e) => setProductForm((f) => ({ ...f, colors: f.colors.map((cc, i) => (i === idx ? { ...cc, hex: e.target.value } : cc)) }))} />
                            <button onClick={() => setProductForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))} className="p-2 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0" title="Retirer cette couleur">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => setProductForm((f) => ({ ...f, colors: [...f.colors, { name: '', hex: '#fafaf9', previewUrl: '' }] }))} className="text-sm font-bold text-zinc-700 hover:text-black inline-flex items-center gap-1 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          Ajouter une couleur
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Description du produit</label>
                      <textarea rows={4} className={inputCls} value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Matière</label>
                        <input className={inputCls} value={productForm.material} onChange={(e) => setProductForm((f) => ({ ...f, material: e.target.value }))} placeholder="Ex : Poil de veau" />
                      </div>
                      <div>
                        <label className={labelCls}>Poids</label>
                        <input className={inputCls} value={productForm.weight} onChange={(e) => setProductForm((f) => ({ ...f, weight: e.target.value }))} placeholder="Ex : 1,2 kg" />
                      </div>
                      <div>
                        <label className={labelCls}>Quincaillerie</label>
                        <input className={inputCls} value={productForm.hardware} onChange={(e) => setProductForm((f) => ({ ...f, hardware: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Tombant de la sangle</label>
                        <input className={inputCls} value={productForm.strapDrop} onChange={(e) => setProductForm((f) => ({ ...f, strapDrop: e.target.value }))} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Caractéristiques (séparées par des virgules)</label>
                        <input className={inputCls} value={productForm.featuresText} onChange={(e) => setProductForm((f) => ({ ...f, featuresText: e.target.value }))} placeholder="Ex : Fermeture par tourniquet, Doublure zébrée" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Style d&#39;accent zèbre</label>
                        <input className={inputCls} value={productForm.zebraAccentStyle} onChange={(e) => setProductForm((f) => ({ ...f, zebraAccentStyle: e.target.value }))} />
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

      {/* ================= ÉDITEUR PUBLICATION ================= */}
      {postDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-extrabold">
                {editingPostId ? 'Modifier la publication' : 'Nouvelle publication'}
              </h2>
              <button
                onClick={() => {
                  if (window.confirm('Fermer sans enregistrer ?')) setPostDrawerOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-zinc-100 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                  {formError}
                </div>
              )}

              <div>
                <label className={labelCls}>Photo de la publication</label>
                <div className="flex items-center gap-4">
                  {postForm.imageUrl ? (
                    <img src={postForm.imageUrl} alt="Aperçu" referrerPolicy="no-referrer" className="w-24 h-24 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 shrink-0">
                      <Instagram className="w-7 h-7" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input className={inputCls} value={postForm.imageUrl} onChange={(e) => setPostForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="Collez le lien de la photo…" />
                    <p className={labelHint}>Astuce : écrivez <code className="bg-zinc-100 px-1 rounded">/assets/imgs/ma-photo.jpg</code> pour une photo de votre boutique.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Compte Instagram</label>
                <input className={inputCls} value={postForm.handle} onChange={(e) => setPostForm((f) => ({ ...f, handle: e.target.value }))} placeholder="zebrabags" />
              </div>

              <div>
                <label className={labelCls}>Légende</label>
                <textarea rows={4} className={inputCls} value={postForm.caption} onChange={(e) => setPostForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Ex : La nouvelle bandoulière est arrivée 🖤" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre de j&#39;aime</label>
                  <input type="number" min={0} className={inputCls} value={postForm.likes} onChange={(e) => setPostForm((f) => ({ ...f, likes: Number(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelCls}>Nombre de commentaires</label>
                  <input type="number" min={0} className={inputCls} value={postForm.comments} onChange={(e) => setPostForm((f) => ({ ...f, comments: Number(e.target.value) || 0 }))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Quel produit est montré ?</label>
                <select className={inputCls} value={postForm.productId} onChange={(e) => setPostForm((f) => ({ ...f, productId: e.target.value }))}>
                  <option value="">— Aucun —</option>
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className={labelHint}>Les visiteurs pourront acheter ce produit depuis la publication.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-zinc-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Fermer sans enregistrer ?')) setPostDrawerOpen(false);
                }}
                className={btnSecondary}
              >
                Annuler
              </button>
              <button onClick={handleSavePost} className={btnPrimary}>
                <Save className="w-4 h-4" />
                Enregistrer la publication
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
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
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
  const [newTagline, setNewTagline] = useState('');

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
      tagline: newTagline.trim() || 'Nouvelle collection',
      itemCount: 0,
      image: '',
      badge: '',
    });
    setNewName('');
    setNewTagline('');
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Nom de la catégorie</label>
            <input className={inputCls} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex : Mallette" />
          </div>
          <div>
            <label className={labelCls}>Petite description (optionnel)</label>
            <input className={inputCls} value={newTagline} onChange={(e) => setNewTagline(e.target.value)} placeholder="Ex : Pour les cadres exigeants" />
          </div>
          <div className="flex items-end">
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
  const [tagline, setTagline] = useState(category.tagline);
  const [image, setImage] = useState(category.image);
  const [badge, setBadge] = useState(category.badge ?? '');

  const save = () => {
    if (!name.trim()) return;
    store.updateCategory(category.id, { name: name.trim(), tagline, image, badge: badge || undefined, itemCount: productCount });
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
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
            {image ? (
              <img src={image} alt={category.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                <Folder className="w-5 h-5" />
              </div>
            )}
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
        <div>
          <label className={labelCls}>Petite description</label>
          <input className={inputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Image (photo de la catégorie)</label>
          <input className={inputCls} value={image} onChange={(e) => setImage(e.target.value)} placeholder="/assets/imgs/…" />
        </div>
        <div>
          <label className={labelCls}>Badge (optionnel)</label>
          <input className={inputCls} value={badge} onChange={(e) => setBadge(e.target.value)} />
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
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${ORDER_STATUS_STYLES[o.status] ?? 'bg-zinc-100 text-zinc-700'}`}>
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 truncate">
                      {[o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono">{formatDate(o.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                  <span className="font-mono font-bold text-sm text-zinc-900">
                    {formatPrice(o.total, o.currency as Currency)}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-zinc-200 bg-white text-xs text-zinc-700 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeOrder(o)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="border-t border-zinc-50 px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/50 text-xs text-zinc-600">
                {/* Contact */}
                <div className="space-y-1">
                  <p className="text-zinc-800 font-semibold">{o.customer.phone}</p>
                  <p className="text-zinc-500">{[o.customer.city, o.customer.address].filter(Boolean).join(' — ')}</p>
                  <p className="text-zinc-400 uppercase tracking-wide text-[10px]">
                    {o.customer.paymentMethod || 'Livraison'}
                  </p>
                </div>

                {/* Articles */}
                <div className="space-y-1">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="truncate text-zinc-600">{it.quantity}× {it.name}</span>
                      <span className="font-mono shrink-0 text-zinc-900 font-medium">
                        {formatPrice(it.price * it.quantity, o.currency as Currency)}
                      </span>
                    </div>
                  ))}
                  {o.giftNote && (
                    <p className="text-zinc-400 italic text-[11px]">🎁 {o.giftNote}</p>
                  )}
                </div>

                {/* Total breakdown */}
                <div className="space-y-1">
                  {o.discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Réduction {o.discountPercent}%</span>
                      <span className="font-mono">-{formatPrice((o.subtotal * o.discountPercent) / 100, o.currency as Currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="font-mono">{o.shipping === 0 ? 'Offerte' : formatPrice(o.shipping, o.currency as Currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900 pt-1 border-t border-zinc-200">
                    <span>Total</span>
                    <span className="font-mono">{formatPrice(o.total, o.currency as Currency)}</span>
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

export default Dashboard;