import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Product, CategoryInfo, InstagramPost } from '../types';
import { api } from '../api/client';
import { clearSession } from './auth';
import { clearGoogleSession } from './googleAuth';

export interface StoreData {
  products: Product[];
  categories: CategoryInfo[];
  instagramPosts: InstagramPost[];
}

interface StoreContextValue extends StoreData {
  loading: boolean;
  error: string | null;
  lastSync: number;
  refresh: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: CategoryInfo) => Promise<void>;
  updateCategory: (id: string, patch: Partial<CategoryInfo>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addInstagramPost: (post: InstagramPost) => Promise<void>;
  updateInstagramPost: (id: string, patch: Partial<InstagramPost>) => Promise<void>;
  deleteInstagramPost: (id: string) => Promise<void>;
  exportJson: () => string;
  importJson: (json: string) => Promise<boolean>;
  resetAll: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const empty: StoreData = { products: [], categories: [], instagramPosts: [] };

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoreData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number>(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const payload = await api<StoreData>('/api/all');
      setData(payload);
      setError(null);
      setLastSync(Date.now());
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 401) {
        clearSession();
        clearGoogleSession();
        window.location.reload();
        return;
      }
      setError(e.message || 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = useCallback(async (product: Product) => {
    await api('/api/products', { method: 'POST', body: product });
    await refresh();
  }, [refresh]);

  const updateProduct = useCallback(async (id: string, patch: Partial<Product>) => {
    await api(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: patch });
    await refresh();
  }, [refresh]);

  const deleteProduct = useCallback(async (id: string) => {
    await api(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  }, [refresh]);

  const addCategory = useCallback(async (category: CategoryInfo) => {
    await api('/api/categories', { method: 'POST', body: category });
    await refresh();
  }, [refresh]);

  const updateCategory = useCallback(async (id: string, patch: Partial<CategoryInfo>) => {
    await api(`/api/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: patch });
    await refresh();
  }, [refresh]);

  const deleteCategory = useCallback(async (id: string) => {
    await api(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  }, [refresh]);

  const addInstagramPost = useCallback(async (post: InstagramPost) => {
    await api('/api/posts', { method: 'POST', body: post });
    await refresh();
  }, [refresh]);

  const updateInstagramPost = useCallback(async (id: string, patch: Partial<InstagramPost>) => {
    await api(`/api/posts/${encodeURIComponent(id)}`, { method: 'PUT', body: patch });
    await refresh();
  }, [refresh]);

  const deleteInstagramPost = useCallback(async (id: string) => {
    await api(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  }, [refresh]);

  const exportJson = useCallback(
    () =>
      JSON.stringify(
        {
          products: data.products,
          categories: data.categories,
          instagramPosts: data.instagramPosts,
        },
        null,
        2
      ),
    [data]
  );

  const importJson = useCallback(
    async (json: string) => {
      try {
        const parsed = JSON.parse(json) as StoreData;
        await api<StoreData>('/api/import', { method: 'POST', body: parsed });
        const fresh = await api<StoreData>('/api/all');
        setData(fresh);
        setError(null);
        setLastSync(Date.now());
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const resetAll = useCallback(async () => {
    const fresh = await api<StoreData>('/api/reset', { method: 'POST' });
    setData(fresh);
    setError(null);
    setLastSync(Date.now());
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...data,
      loading,
      error,
      lastSync,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addInstagramPost,
      updateInstagramPost,
      deleteInstagramPost,
      exportJson,
      importJson,
      resetAll,
    }),
    [data, loading, error, lastSync, refresh, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, addInstagramPost, updateInstagramPost, deleteInstagramPost, exportJson, importJson, resetAll]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}