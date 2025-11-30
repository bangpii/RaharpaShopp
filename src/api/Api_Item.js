// api/Api_Item.js - OPTIMIZED VERSION
import {
    io
} from 'socket.io-client';

const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app/api';
const SOCKET_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

let socket = null;
let itemsUpdateCallback = null;

// Initialize socket untuk items - OPTIMIZED
export const initializeItemsSocket = () => {
    if (!socket) {
        console.log('🔌 Initializing optimized items socket...');

        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            timeout: 10000
        });

        // Socket event handlers - OPTIMIZED
        socket.on('connect', () => {
            console.log('✅ Items socket connected:', socket.id);
            socket.emit('join-admin-room-items');
        });

        // REAL-TIME OPTIMIZATION: Langsung update tanpa delay
        socket.on('items-updated', (data) => {
            console.log('🔄 Real-time items update received:', data);
            if (itemsUpdateCallback) {
                itemsUpdateCallback(data);
            }
        });

        socket.on('item-added', (data) => {
            console.log('➕ New item added via socket:', data);
            if (itemsUpdateCallback) {
                itemsUpdateCallback({
                    action: 'added',
                    item: data.item
                });
            }
        });

        socket.on('item-updated', (data) => {
            console.log('✏️ Item updated via socket:', data);
            if (itemsUpdateCallback) {
                itemsUpdateCallback({
                    action: 'updated',
                    item: data.item
                });
            }
        });

        socket.on('item-deleted', (data) => {
            console.log('🗑️ Item deleted via socket:', data);
            if (itemsUpdateCallback) {
                itemsUpdateCallback({
                    action: 'deleted',
                    itemId: data.itemId
                });
            }
        });

        socket.on('item-sent', (data) => {
            console.log('📤 Item sent via socket:', data);
            if (itemsUpdateCallback) {
                itemsUpdateCallback({
                    action: 'sent',
                    item: data.item
                });
            }
        });

        socket.on('connect_error', (error) => {
            console.error('💥 Items socket connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Items socket disconnected:', reason);
        });
    }
    return socket;
};

// Set callback untuk real-time updates - OPTIMIZED
export const setItemsUpdateCallback = (callback) => {
    itemsUpdateCallback = callback;
};

// Cleanup socket listeners
export const cleanupItemsSocket = () => {
    if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('items-updated');
        socket.off('item-added');
        socket.off('item-updated');
        socket.off('item-deleted');
        socket.off('item-sent');
        socket.off('reconnect');

        socket.disconnect();
        socket = null;
        itemsUpdateCallback = null;
        console.log('🧹 Items socket cleaned up');
    }
};

// Simple fetch dengan timeout yang reasonable
const apiFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

    try {
        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
            mode: 'cors'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', error);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server membutuhkan waktu terlalu lama untuk merespons');
        }

        throw error;
    }
};

// Get semua items - OPTIMIZED
export const getAllItems = async () => {
    try {
        console.log('📡 Fetching all items...');

        const result = await apiFetch(`${API_BASE_URL}/items`, {
            method: 'GET'
        });

        if (result.success) {
            console.log(`✅ Successfully fetched ${result.data.length} items`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch items');
        }
    } catch (error) {
        console.error('❌ Error fetching items:', error);
        throw error;
    }
};

// Tambah item baru - OPTIMIZED
export const addItem = async (itemData) => {
    try {
        console.log('📝 Adding new item:', {
            ...itemData,
            image: itemData.image ? `Base64 (${itemData.image.length} chars)` : 'No image'
        });

        const result = await apiFetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            body: JSON.stringify(itemData),
        });

        if (result.success) {
            console.log('✅ Item added successfully:', result.data);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to add item');
        }
    } catch (error) {
        console.error('❌ Error adding item:', error);
        throw error;
    }
};

// Update item - OPTIMIZED
export const updateItem = async (itemId, itemData) => {
    try {
        console.log('✏️ Updating item:', itemId);

        const result = await apiFetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });

        if (result.success) {
            console.log('✅ Item updated successfully:', result.data);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to update item');
        }
    } catch (error) {
        console.error('❌ Error updating item:', error);
        throw error;
    }
};

// Delete item - OPTIMIZED
export const deleteItem = async (itemId) => {
    try {
        console.log('🗑️ Deleting item:', itemId);

        const result = await apiFetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
        });

        if (result.success) {
            console.log('✅ Item deleted successfully');
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to delete item');
        }
    } catch (error) {
        console.error('❌ Error deleting item:', error);
        throw error;
    }
};

// Send item - OPTIMIZED
export const sendItem = async (itemId, sentTo) => {
    try {
        console.log('📤 Sending item:', itemId, 'to user:', sentTo);

        const result = await apiFetch(`${API_BASE_URL}/items/${itemId}/send`, {
            method: 'PUT',
            body: JSON.stringify({
                sentTo
            }),
        });

        if (result.success) {
            console.log('✅ Item sent successfully:', result.data);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to send item');
        }
    } catch (error) {
        console.error('❌ Error sending item:', error);
        throw error;
    }
};