// api/Api_AkunUsers.js
import {
    initializeSocket,
    setupSocketListeners,
    cleanupSocketListeners
} from './Api_loginUsers';

const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app/api';

// Socket instance
let socket = null;

// Initialize socket for AkunUsers
export const initializeAkunUsersSocket = () => {
    if (!socket) {
        socket = initializeSocket();

        setupSocketListeners(socket, {
            onUsersUpdated: (users) => {
                console.log('🔄 Real-time users update received:', users);
                // Event ini akan dipanggil ketika ada perubahan data user
                if (typeof window !== 'undefined' && window.usersUpdateCallback) {
                    window.usersUpdateCallback(users);
                }
            },
            onUserLoggedIn: (data) => {
                console.log('🔑 User logged in via socket:', data);
                // Trigger refresh data
                if (typeof window !== 'undefined' && window.usersUpdateCallback) {
                    setTimeout(() => {
                        getAllUsers().then(users => {
                            if (window.usersUpdateCallback) {
                                window.usersUpdateCallback(users);
                            }
                        });
                    }, 500);
                }
            },
            onUserLoggedOut: (data) => {
                console.log('🚪 User logged out via socket:', data);
                // Trigger refresh data
                if (typeof window !== 'undefined' && window.usersUpdateCallback) {
                    setTimeout(() => {
                        getAllUsers().then(users => {
                            if (window.usersUpdateCallback) {
                                window.usersUpdateCallback(users);
                            }
                        });
                    }, 500);
                }
            },
            onError: (error) => {
                console.warn('Socket error in AkunUsers:', error);
            }
        });
    }
    return socket;
};

// Get all users
export const getAllUsers = async () => {
    try {
        console.log('📡 Fetching all users from backend...');

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Successfully fetched ${result.data.length} users`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch users');
        }
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
    }
};

// Add new user
export const addUser = async (userData) => {
    try {
        console.log('📝 Adding new user:', userData);

        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: userData.name
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ User added successfully:', result.data);

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('user-added', result.data);
            }

            return result.data;
        } else {
            throw new Error(result.message || 'Failed to add user');
        }
    } catch (error) {
        console.error('❌ Error adding user:', error);
        throw error;
    }
};

// Update user
export const updateUser = async (userId, userData) => {
    try {
        console.log('✏️ Updating user:', userId, userData);

        // Untuk update user, kita perlu membuat endpoint khusus di backend
        // Sementara menggunakan endpoint yang ada dengan approach yang berbeda
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: userData.name,
                date: userData.date
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ User updated successfully:', result.data);

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('user-updated', result.data);
            }

            return result.data;
        } else {
            throw new Error(result.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('❌ Error updating user:', error);
        throw error;
    }
};

// Delete user
export const deleteUser = async (userId) => {
    try {
        console.log('🗑️ Deleting user:', userId);

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ User deleted successfully');

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('user-deleted', {
                    userId
                });
            }

            return result;
        } else {
            throw new Error(result.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
    }
};

// Force user login status
export const forceUserLogin = async (userId) => {
    try {
        console.log('🔑 Forcing user login:', userId);

        // Gunakan endpoint login untuk mengupdate status login
        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: user.name
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ User login status updated successfully');
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to update user login status');
        }
    } catch (error) {
        console.error('❌ Error forcing user login:', error);
        throw error;
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch user');
        }
    } catch (error) {
        console.error('❌ Error fetching user by ID:', error);
        throw error;
    }
};

// Cleanup socket
export const cleanupAkunUsersSocket = () => {
    if (socket) {
        cleanupSocketListeners(socket);
        socket = null;
    }
};

// Set callback for real-time updates
export const setUsersUpdateCallback = (callback) => {
    if (typeof window !== 'undefined') {
        window.usersUpdateCallback = callback;
    }
};