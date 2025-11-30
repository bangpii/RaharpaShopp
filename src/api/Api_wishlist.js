// api/Api_wishlist.js - Wishlist Socket Implementation
import {
    io
} from 'socket.io-client';

const SOCKET_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

let socket = null;
let wishlistUpdateCallback = null;

// Initialize socket untuk wishlist
export const initializeWishlistSocket = () => {
    if (!socket) {
        console.log('🔌 Initializing wishlist socket...');

        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            timeout: 10000
        });

        // Socket event handlers
        socket.on('connect', () => {
            console.log('✅ Wishlist socket connected:', socket.id);
        });

        // REAL-TIME: Listen untuk wishlist updates
        socket.on('wishlist-updated', (data) => {
            console.log('🔄 Wishlist update received via socket:', data);
            if (wishlistUpdateCallback) {
                wishlistUpdateCallback({
                    action: 'wishlist-updated',
                    ...data
                });
            }
        });

        // REAL-TIME: Listen untuk order events yang mempengaruhi wishlist
        socket.on('order-created', (data) => {
            console.log('🛒 Order created via socket (affects wishlist):', data);
            if (wishlistUpdateCallback) {
                wishlistUpdateCallback({
                    action: 'order-created',
                    order: data
                });
            }
        });

        socket.on('order-updated', (data) => {
            console.log('✏️ Order updated via socket (affects wishlist):', data);
            if (wishlistUpdateCallback) {
                wishlistUpdateCallback({
                    action: 'order-updated',
                    order: data
                });
            }
        });

        socket.on('order-deleted', (data) => {
            console.log('🗑️ Order deleted via socket (affects wishlist):', data);
            if (wishlistUpdateCallback) {
                wishlistUpdateCallback({
                    action: 'order-deleted',
                    ...data
                });
            }
        });

        socket.on('connect_error', (error) => {
            console.error('💥 Wishlist socket connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Wishlist socket disconnected:', reason);
        });
    }
    return socket;
};

// Set callback untuk real-time updates
export const setWishlistUpdateCallback = (callback) => {
    wishlistUpdateCallback = callback;
};

// Cleanup socket listeners
export const cleanupWishlistSocket = () => {
    if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('wishlist-updated');
        socket.off('order-created');
        socket.off('order-updated');
        socket.off('order-deleted');

        socket.disconnect();
        socket = null;
        wishlistUpdateCallback = null;
        console.log('🧹 Wishlist socket cleaned up');
    }
};

// Emit wishlist update event (bisa digunakan dari komponen lain)
export const emitWishlistUpdate = (userId) => {
    if (socket) {
        socket.emit('wishlist-update', {
            userId
        });
        console.log('📢 Wishlist update emitted for user:', userId);
    }
};