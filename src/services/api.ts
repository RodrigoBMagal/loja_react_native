import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductInput, User } from '../types';

const BASE_URL = 'http://localhost:3000';

/** Formato bruto de produto retornado pela API (snake_case). */
interface RawProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  price: number;
  supplier: string;
  expiry_date: string | null;
  last_updated: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const normalizeProduct = (product: RawProduct): Product => {
  const { min_quantity, last_updated, expiry_date, ...rest } = product;
  return {
    ...(rest as Omit<Product, 'minQuantity' | 'lastUpdated' | 'expiryDate'>),
    minQuantity: min_quantity,
    lastUpdated: last_updated,
    expiryDate: expiry_date,
  };
};

const normalizeProductList = (products: RawProduct[]): Product[] => products.map(normalizeProduct);

const denormalizeProduct = (product: Partial<ProductInput>): Record<string, unknown> => {
  const { minQuantity, expiryDate, ...rest } = product as ProductInput & {
    minQuantity?: number;
    expiryDate?: string | null;
  };
  return {
    ...rest,
    min_quantity: minQuantity,
    expiry_date: expiryDate,
  };
};

type RequestOptions = Omit<RequestInit, 'body'> & { body?: string };

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T | null> => {
  const token = await AsyncStorage.getItem('@vetstock_token');

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}) as { error?: string });
      throw new Error(err.error || `Erro ${response.status}`);
    }

    // Para 204 No Content e 200 com body vazio
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const data = await response.json();

    // Normalizar produtos recebidos da API
    if (Array.isArray(data)) {
      return normalizeProductList(data as RawProduct[]) as unknown as T;
    }
    if (data && typeof data === 'object' && 'id' in data && 'min_quantity' in data) {
      return normalizeProduct(data as RawProduct) as unknown as T;
    }
    return data as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error for ${endpoint}:`, message);
    throw err;
  }
};

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const productsApi = {
  getAll: () => request<Product[]>('/products'),
  create: (data: ProductInput) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(denormalizeProduct(data)) }),
  update: (id: number, data: ProductInput) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(denormalizeProduct(data)) }),
  updateQuantity: (id: number, delta: number) =>
    request<Product>(`/products/${id}/quantity`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
  delete: (id: number) => request<{ success: boolean; message: string }>(`/products/${id}`, { method: 'DELETE' }),
};
