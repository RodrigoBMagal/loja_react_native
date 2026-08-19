import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { productsApi } from '../services/api';
import {
  ExpiryAlerts,
  Product,
  ProductInput,
  ProductsByCategory,
  StockStats,
} from '../types';

interface StockContextValue {
  products: Product[];
  loading: boolean;
  addProduct: (product: ProductInput) => Promise<Product>;
  updateProduct: (id: number, data: ProductInput) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  updateQuantity: (id: number, delta: number) => Promise<Product>;
  getLowStockProducts: () => Product[];
  getExpiryAlerts: () => ExpiryAlerts;
  getProductsByCategory: () => ProductsByCategory;
  getStats: () => StockStats;
  reload: () => Promise<void>;
}

const StockContext = createContext<StockContextValue | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll(); // busca do banco
      setProducts(data ?? []);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o estoque.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: ProductInput): Promise<Product> => {
    try {
      const newProduct = await productsApi.create(product);
      if (!newProduct) throw new Error('Resposta vazia da API');
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Erro', 'Não foi possível adicionar o produto: ' + message);
      throw err;
    }
  };

  const updateProduct = async (id: number, data: ProductInput): Promise<Product> => {
    try {
      const updated = await productsApi.update(id, data);
      if (!updated) throw new Error('Resposta vazia da API');
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Erro', 'Não foi possível atualizar o produto: ' + message);
      throw err;
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Erro', 'Não foi possível excluir o produto: ' + message);
      throw err;
    }
  };

  const updateQuantity = async (id: number, delta: number): Promise<Product> => {
    try {
      const updated = await productsApi.updateQuantity(id, delta);
      if (!updated) throw new Error('Resposta vazia da API');
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Erro', 'Não foi possível atualizar a quantidade: ' + message);
      throw err;
    }
  };

  const parseExpiryDate = (expiryDate: string | null): Date | null => {
    if (!expiryDate) return null;
    const [y, m, d] = expiryDate.split('-');
    if (!y || !m || !d) return null;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  };

  const getLowStockProducts = useCallback(
    () => products.filter((p) => p.quantity <= p.minQuantity),
    [products]
  );

  const getExpiredProducts = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return products.filter((p) => {
      const date = parseExpiryDate(p.expiryDate);
      return date && date < today;
    });
  }, [products]);

  const getExpiringProducts = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return products.filter((p) => {
      const date = parseExpiryDate(p.expiryDate);
      if (!date) return false;
      const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });
  }, [products]);

  const getExpiryAlerts = useCallback(
    (): ExpiryAlerts => ({
      expired: getExpiredProducts(),
      expiring: getExpiringProducts(),
    }),
    [getExpiredProducts, getExpiringProducts]
  );

  const getProductsByCategory = useCallback((): ProductsByCategory => {
    const map: ProductsByCategory = {};
    products.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [products]);

  const getStats = useCallback((): StockStats => {
    const lowStock = getLowStockProducts();
    const outOfStock = products.filter((p) => p.quantity === 0);
    const totalValue = products.reduce(
      (acc, p) => acc + Number(p.price) * Number(p.quantity),
      0
    );
    const categories = [...new Set(products.map((p) => p.category))];
    return {
      total: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      categories: categories.length,
    };
  }, [products, getLowStockProducts]);

  return (
    <StockContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateQuantity,
        getLowStockProducts,
        getExpiryAlerts,
        getProductsByCategory,
        getStats,
        reload: loadProducts,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = (): StockContextValue => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock deve ser usado dentro de StockProvider');
  return ctx;
};

export const CATEGORIES = [
  'Medicamentos',
  'Vacinas',
  'Antiparasitários',
  'Soluções',
  'Suplementos',
  'Equipamentos',
  'Outros',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Medicamentos: '#1565C0',
  Vacinas: '#2E7D32',
  Antiparasitários: '#6A1B9A',
  Soluções: '#00838F',
  Suplementos: '#E65100',
  Equipamentos: '#37474F',
  Outros: '#795548',
};
