import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://localhost:3000';

const normalizeProduct = (product) => {
    if (!product) return product;
    return {
        ...product,
        minQuantity: product.min_quantity,
        lastUpdated: product.last_updated,
    };
};

const normalizeProductList = (products) => {
    return Array.isArray(products) ? products.map(normalizeProduct) : products;
};

const denormalizeProduct = (product) => {
    const { minQuantity, lastUpdated, ...rest } = product;
    return {
        ...rest,
        min_quantity: minQuantity,
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
        
        console.log(`📡 ${options.method || 'GET'} ${endpoint} → ${response.status}`);
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('❌ API error:', err);
            throw new Error(err.error || `Erro ${response.status}`);
        }

        // Para 204 No Content e 200 com body vazio
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log('✅ Empty response');
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
        console.error(`❌ Request error for ${endpoint}:`, err.message);
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
    delete: (id) => {
        const url = `/products/${id}`;
        console.log('🌐 DELETE request to:', url, 'ID type:', typeof id, 'ID value:', id);
        return request(url, {method: 'DELETE'});
    },
}