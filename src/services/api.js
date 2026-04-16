import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://localhost:3000';

const normalizeProduct = (product) => {
    if (!product) return product;
    return {
        ...product,
        minQuantity: product.min_quantity,
        lastUpdated: product.last_updated,
        expiryDate: product.expiry_date,
    };
};

const normalizeProductList = (products) => {
    return Array.isArray(products) ? products.map(normalizeProduct) : products;
};

const denormalizeProduct = (product) => {
    const { minQuantity, lastUpdated, expiryDate, ...rest } = product;
    return {
        ...rest,
        min_quantity: minQuantity,
        expiry_date: expiryDate,
    };
};

const request = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('@vetstock_token');

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            ...options
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Erro ${response.status}`);
        }

        // Para 204 No Content e 200 com body vazio
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }
        
        const data = await response.json();
        
        // Normalizar produtos recebidos da API
        if (Array.isArray(data)) {
            return normalizeProductList(data);
        }
        if (data && data.id) {
            return normalizeProduct(data);
        }
        return data;
    } catch (err) {
        console.error(`Error for ${endpoint}:`, err.message);
        throw err;
    }
};

export const authApi = {
    login: (username, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
}

export const productsApi = {
    getAll: () => request('/products'),
    create: (data) => request('/products', {method: 'POST', body: JSON.stringify(denormalizeProduct(data))}),
    update: (id, data) => request(`/products/${id}`, {method: 'PUT', body: JSON.stringify(denormalizeProduct(data))}),
    updateQuantity: (id, delta) => request(`/products/${id}/quantity`, {method: 'PATCH', body: JSON.stringify({delta})}),
    delete: (id) => request(`/products/${id}`, {method: 'DELETE'}),
}