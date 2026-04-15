import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://localhost:3000';

const request = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('@vetstock_token');

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

    if (response.status === 204) return null;
    return response.json();
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
    create: (data) => request('/products', {method: 'POST', body: JSON.stringify(data)}),
    update: (id, data) => request(`/products/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
    updateQuantity: (id, delta) => request(`/products/${id}/quantity`, {method: 'PATCH', body: JSON.stringify({delta})}),
    delete: (id) => request(`/products/${id}`, {method: 'DELETE'}),
}