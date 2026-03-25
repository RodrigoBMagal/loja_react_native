import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StockContext = createContext();
const STORAGE_KEY = '@vetstock_products';

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Amoxicilina 50mg', category: 'Medicamentos', quantity: 5, minQuantity: 10, unit: 'comprimidos', price: 45.90, supplier: 'VetBras', expiryDate: '2025-12-31', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Vacina V10 Canina', category: 'Vacinas', quantity: 22, minQuantity: 15, unit: 'doses', price: 38.50, supplier: 'Merial', expiryDate: '2025-09-30', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Frontline Spray 250ml', category: 'Antiparasitários', quantity: 3, minQuantity: 8, unit: 'frascos', price: 89.90, supplier: 'Boehringer', expiryDate: '2026-01-15', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Soro Fisiológico 500ml', category: 'Soluções', quantity: 40, minQuantity: 20, unit: 'frascos', price: 12.00, supplier: 'Fresenius', expiryDate: '2026-06-01', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Ivermectina 1%', category: 'Antiparasitários', quantity: 2, minQuantity: 10, unit: 'frascos', price: 25.00, supplier: 'Ourofino', expiryDate: '2025-11-20', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Dexametasona 2mg', category: 'Medicamentos', quantity: 18, minQuantity: 12, unit: 'ampolas', price: 8.50, supplier: 'Hipolabor', expiryDate: '2025-08-10', lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Vacina Antirrábica', category: 'Vacinas', quantity: 30, minQuantity: 20, unit: 'doses', price: 35.00, supplier: 'Merial', expiryDate: '2025-07-15', lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Collar Elizabetano P', category: 'Equipamentos', quantity: 4, minQuantity: 10, unit: 'unidades', price: 15.00, supplier: 'PetFarm', expiryDate: null, lastUpdated: new Date().toISOString() },
  { id: '9', name: 'Suplemento Vitamínico', category: 'Suplementos', quantity: 7, minQuantity: 8, unit: 'frascos', price: 55.00, supplier: 'Vetnil', expiryDate: '2026-03-01', lastUpdated: new Date().toISOString() },
  { id: '10', name: 'Cloridrato de Tramadol', category: 'Medicamentos', quantity: 25, minQuantity: 15, unit: 'comprimidos', price: 60.00, supplier: 'Cristália', expiryDate: '2025-10-10', lastUpdated: new Date().toISOString() },
];

export const StockProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts(INITIAL_PRODUCTS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const persist = async (newProducts) => {
    setProducts(newProducts);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  const addProduct = useCallback(async (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    };
    await persist([...products, newProduct]);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback(async (id, updatedData) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, ...updatedData, id, lastUpdated: new Date().toISOString() } : p
    );
    await persist(updated);
  }, [products]);

  const deleteProduct = useCallback(async (id) => {
    await persist(products.filter(p => p.id !== id));
  }, [products]);

  const updateQuantity = useCallback(async (id, delta) => {
    const updated = products.map(p =>
      p.id === id
        ? { ...p, quantity: Math.max(0, p.quantity + delta), lastUpdated: new Date().toISOString() }
        : p
    );
    await persist(updated);
  }, [products]);

  const getLowStockProducts = useCallback(() =>
    products.filter(p => p.quantity <= p.minQuantity),
    [products]
  );

  const getProductsByCategory = useCallback(() => {
    const map = {};
    products.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [products]);

  const getStats = useCallback(() => {
    const lowStock = getLowStockProducts();
    const outOfStock = products.filter(p => p.quantity === 0);
    const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const categories = [...new Set(products.map(p => p.category))];
    return {
      total: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      categories: categories.length,
    };
  }, [products]);

  return (
    <StockContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      updateQuantity,
      getLowStockProducts,
      getProductsByCategory,
      getStats,
      reload: loadProducts,
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
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

export const CATEGORY_COLORS = {
  Medicamentos: '#1565C0',
  Vacinas: '#2E7D32',
  Antiparasitários: '#6A1B9A',
  Soluções: '#00838F',
  Suplementos: '#E65100',
  Equipamentos: '#37474F',
  Outros: '#795548',
};