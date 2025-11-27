// ../api/Api_loginUsers.js - Vercel Optimized
import io from 'socket.io-client';

// Konfigurasi API URL
const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

// Clear all storage data
export const clearAllStorage = () => {
    try {
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionTimestamp');
        sessionStorage.removeItem('userSession');
        console.log('✅ All storage cleared');
        return true;
    } catch (error) {
        console.error('❌ Storage clear error:', error);
        return false;
    }
};

// Socket.IO connection dengan Vercel optimization
export const initializeSocket = () => {
    try {
        console.log('🔄 Initializing Socket.IO connection for Vercel...');

        const socket = io(API_BASE_URL, {
            transports: ['websocket', 'polling'],
            timeout: 15000, // Increased timeout for Vercel
            reconnectionAttempts: 5,
            reconnectionDelay: 3000, // Increased delay for Vercel
            forceNew: false,
            withCredentials: false
        });

        // Global socket event handlers
        socket.on('connect', () => {
            console.log('✅ Socket.IO connected successfully in Vercel');
        });

        socket.on('connect_error', (error) => {
            console.warn('❌ Socket connection error in Vercel:', error.message);
        });

        socket.on('error', (error) => {
            console.warn('⚠️ Socket error in Vercel:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected in Vercel:', reason);
        });

        socket.on('welcome', (data) => {
            console.log('👋 Socket welcome in Vercel:', data);
        });

        return socket;
    } catch (error) {
        console.error('💥 Failed to initialize socket in Vercel:', error);
        return createDummySocket();
    }
};

// Create dummy socket untuk fallback
const createDummySocket = () => {
    return {
        connected: false,
        on: () => this,
        off: () => this,
        emit: () => this,
        close: () => console.log('[Dummy Socket] Closed'),
        disconnect: () => console.log('[Dummy Socket] Disconnected')
    };
};

// User Login/Register API dengan Vercel optimization
export const loginUser = async (name) => {
    try {
        console.log('🔐 Login attempt in Vercel for:', name);

        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.trim()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Login API error in Vercel:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Login successful in Vercel:', result);
        return result;
    } catch (error) {
        console.error('💥 Login API error in Vercel:', error);
        throw error;
    }
};

// User Logout API
export const logoutUser = async (userId) => {
    try {
        console.log('🚪 Logout attempt in Vercel for user:', userId);

        const response = await fetch(`${API_BASE_URL}/api/users/logout/${userId}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Logout successful in Vercel:', result);
        return result;
    } catch (error) {
        console.error('💥 Logout API error in Vercel:', error);
        throw error;
    }
};

// Socket event handlers dengan safe execution
export const setupSocketListeners = (socket, callbacks = {}) => {
    if (!socket || typeof socket.on !== 'function') {
        console.warn('Socket not available for setting up listeners in Vercel');
        return;
    }

    const {
        onUserLoggedIn,
        onUserLoggedOut,
        onUsersUpdated,
        onError,
        onConnected,
        onRoomJoined
    } = callbacks;

    // Connection events
    socket.on('connect', () => {
        console.log('✅ Socket connected in setupListeners - Vercel');
        if (onConnected) onConnected();
    });

    socket.on('welcome', (data) => {
        console.log('👋 Welcome from server in Vercel:', data);
    });

    socket.on('room-joined', (data) => {
        console.log('🚪 Room joined in Vercel:', data);
        if (onRoomJoined) onRoomJoined(data);
    });

    // Listen for user login events
    socket.on('user-logged-in', (data) => {
        console.log('User logged in via socket in Vercel:', data);
        if (onUserLoggedIn) onUserLoggedIn(data);
    });

    socket.on('user-logged-out', (data) => {
        console.log('User logged out via socket in Vercel:', data);
        if (onUserLoggedOut) onUserLoggedOut(data);
    });

    socket.on('users-updated', (users) => {
        console.log('Users list updated via socket in Vercel:', users);
        if (onUsersUpdated) onUsersUpdated(users);
    });

    socket.on('connect_error', (error) => {
        console.warn('Socket connection error in Vercel setup:', error.message);
        if (onError) onError('Connection error: ' + error.message);
    });

    socket.on('error', (error) => {
        console.warn('Socket error in Vercel setup:', error);
        if (onError) onError('Socket error: ' + error);
    });
};

// Cleanup socket listeners
export const cleanupSocketListeners = (socket) => {
    if (!socket || typeof socket.off !== 'function') return;

    const events = [
        'connect', 'disconnect', 'error', 'connect_error',
        'user-logged-in', 'user-logged-out', 'users-updated',
        'welcome', 'room-joined'
    ];

    events.forEach(event => {
        socket.off(event);
    });
};

// Join user room dengan safety check
export const joinUserRoom = (socket, userId) => {
    if (socket && socket.connected && userId) {
        console.log(`🚪 Joining user room in Vercel: user_${userId}`);
        socket.emit('join-user-room', userId);
    } else {
        console.warn('Cannot join user room in Vercel - socket not connected or missing userId');
    }
};

export default {
    loginUser,
    logoutUser,
    initializeSocket,
    setupSocketListeners,
    cleanupSocketListeners,
    joinUserRoom,
    clearAllStorage
};