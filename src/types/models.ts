/** Modelo de produto tal como usado dentro do app (camelCase, já normalizado). */
export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  expiryDate: string | null;
  lastUpdated: string;
}

/** Payload aceito para criar/editar um produto (antes de ser enviado à API). */
export type ProductInput = Omit<Product, 'id' | 'lastUpdated'>;

export type UserRole = 'admin' | 'funcionario';

export interface User {
  id: number;
  username: string;
  role: UserRole | string;
}

export interface ExpiryAlerts {
  expired: Product[];
  expiring: Product[];
}

export interface StockStats {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  categories: number;
}

export type ProductsByCategory = Record<string, Product[]>;
