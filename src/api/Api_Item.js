// api/Api_Item.js - Standalone untuk Item
import {
    io
} from 'socket.io-client';

const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app/api';
const SOCKET_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

// Socket instance untuk items
let socket = null;

// Initialize socket untuk items
export const initializeItemsSocket = () => {
    if (!socket) {
        console.log('🔌 Initializing items socket...');

        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Socket event handlers
        socket.on('connect', () => {
            console.log('✅ Items socket connected:', socket.id);
            // Join admin room untuk items
            socket.emit('join-admin-room-items');
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Items socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('💥 Items socket connection error:', error);
        });

        socket.on('items-updated', (items) => {
            console.log('🔄 Real-time items update received:', items);
            if (typeof window !== 'undefined' && window.itemsUpdateCallback) {
                window.itemsUpdateCallback(items);
            }
        });

        socket.on('item-added', (data) => {
            console.log('➕ New item added via socket:', data);
            // Trigger refresh data
            if (typeof window !== 'undefined' && window.itemsUpdateCallback) {
                setTimeout(() => {
                    getAllItems().then(items => {
                        if (window.itemsUpdateCallback) {
                            window.itemsUpdateCallback(items);
                        }
                    });
                }, 500);
            }
        });

        socket.on('item-updated', (data) => {
            console.log('✏️ Item updated via socket:', data);
            // Trigger refresh data
            if (typeof window !== 'undefined' && window.itemsUpdateCallback) {
                setTimeout(() => {
                    getAllItems().then(items => {
                        if (window.itemsUpdateCallback) {
                            window.itemsUpdateCallback(items);
                        }
                    });
                }, 500);
            }
        });

        socket.on('item-deleted', (data) => {
            console.log('🗑️ Item deleted via socket:', data);
            // Trigger refresh data
            if (typeof window !== 'undefined' && window.itemsUpdateCallback) {
                setTimeout(() => {
                    getAllItems().then(items => {
                        if (window.itemsUpdateCallback) {
                            window.itemsUpdateCallback(items);
                        }
                    });
                }, 500);
            }
        });

        socket.on('item-sent', (data) => {
            console.log('📤 Item sent via socket:', data);
            // Trigger refresh data
            if (typeof window !== 'undefined' && window.itemsUpdateCallback) {
                setTimeout(() => {
                    getAllItems().then(items => {
                        if (window.itemsUpdateCallback) {
                            window.itemsUpdateCallback(items);
                        }
                    });
                }, 500);
            }
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Items socket reconnected. Attempt:', attemptNumber);
            // Re-join admin room setelah reconnect
            socket.emit('join-admin-room-items');
        });
    }
    return socket;
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
        console.log('🧹 Items socket cleaned up');
    }
};

// Set callback untuk real-time updates
export const setItemsUpdateCallback = (callback) => {
    if (typeof window !== 'undefined') {
        window.itemsUpdateCallback = callback;
    }
};

// Get semua items
export const getAllItems = async () => {
    try {
        console.log('📡 Fetching all items from backend...');

        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server response not OK:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

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

// Get items by status
export const getItemsByStatus = async (status) => {
    try {
        console.log(`📡 Fetching ${status} items from backend...`);

        const response = await fetch(`${API_BASE_URL}/items/status/${status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Successfully fetched ${result.data.length} ${status} items`);
            return result.data;
        } else {
            throw new Error(result.message || `Failed to fetch ${status} items`);
        }
    } catch (error) {
        console.error(`❌ Error fetching ${status} items:`, error);
        throw error;
    }
};

// Tambah item baru
export const addItem = async (itemData) => {
    try {
        console.log('📝 Adding new item:', {
            ...itemData,
            image: itemData.image ? `Base64 (${itemData.image.length} chars)` : 'No image'
        });

        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(itemData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            console.error('❌ Server error response:', errorData);
            throw new Error(errorMessage);
        }

        const result = await response.json();

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

// Update item
export const updateItem = async (itemId, itemData) => {
    try {
        console.log('✏️ Updating item:', itemId, {
            ...itemData,
            image: itemData.image ? `Base64 (${itemData.image.length} chars)` : 'No image'
        });

        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(itemData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

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

// Delete item
export const deleteItem = async (itemId) => {
    try {
        console.log('🗑️ Deleting item:', itemId);

        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

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

// Send item (ubah status ke Sold Out)
export const sendItem = async (itemId, sentTo) => {
    try {
        console.log('📤 Sending item:', itemId, 'to user:', sentTo);

        const response = await fetch(`${API_BASE_URL}/items/${itemId}/send`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                sentTo
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

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

// Get item by ID
export const getItemById = async (itemId) => {
    try {
        console.log('📡 Fetching item by ID:', itemId);
        const allItems = await getAllItems();
        const item = allItems.find(item => item._id === itemId);

        if (!item) {
            throw new Error('Item not found');
        }

        return item;
    } catch (error) {
        console.error('❌ Error fetching item by ID:', error);
        throw error;
    }
};