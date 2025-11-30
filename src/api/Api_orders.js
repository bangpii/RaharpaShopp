import {
    initializeSocket,
    setupSocketListeners,
    cleanupSocketListeners
} from './Api_loginUsers';

const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app/api';

// Socket instance
let socket = null;

// Initialize socket untuk orders
export const initializeOrdersSocket = () => {
    if (!socket) {
        socket = initializeSocket();

        setupSocketListeners(socket, {
            onOrderCreated: (order) => {
                console.log('🛒 Real-time order created:', order);
                if (typeof window !== 'undefined' && window.ordersUpdateCallback) {
                    window.ordersUpdateCallback();
                }
            },
            onOrderUpdated: (order) => {
                console.log('✏️ Real-time order updated:', order);
                if (typeof window !== 'undefined' && window.ordersUpdateCallback) {
                    window.ordersUpdateCallback();
                }
            },
            onOrderStatusUpdated: (data) => {
                console.log('🔄 Real-time order status updated:', data);
                if (typeof window !== 'undefined' && window.ordersUpdateCallback) {
                    window.ordersUpdateCallback();
                }
            },
            onOrderDeleted: (data) => {
                console.log('🗑️ Real-time order deleted:', data);
                if (typeof window !== 'undefined' && window.ordersUpdateCallback) {
                    window.ordersUpdateCallback();
                }
            },
            onError: (error) => {
                console.warn('Socket error in Orders:', error);
            }
        });
    }
    return socket;
};

// Get all orders
export const getAllOrders = async () => {
    try {
        console.log('📡 Fetching all orders from backend...');

        const response = await fetch(`${API_BASE_URL}/orders`, {
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
            console.log(`✅ Successfully fetched ${result.data.length} orders`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch orders');
        }
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
    }
};

// Create new order
export const createOrder = async (orderData) => {
    try {
        console.log('📝 Creating new order:', orderData);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ Order created successfully:', result.data);

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('order-created', result.data);
            }

            return result.data;
        } else {
            throw new Error(result.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('❌ Error creating order:', error);
        throw error;
    }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
    try {
        console.log('✏️ Updating order:', orderId, orderData);

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ Order updated successfully:', result.data);

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('order-updated', result.data);
            }

            return result.data;
        } else {
            throw new Error(result.message || 'Failed to update order');
        }
    } catch (error) {
        console.error('❌ Error updating order:', error);
        throw error;
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        console.log('🔄 Updating order status:', orderId, status);

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ Order status updated successfully');

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('order-status-updated', {
                    orderId: orderId,
                    status: status,
                    order: result.data
                });
            }

            return result.data;
        } else {
            throw new Error(result.message || 'Failed to update order status');
        }
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        throw error;
    }
};

// Delete order
export const deleteOrder = async (orderId) => {
    try {
        console.log('🗑️ Deleting order:', orderId);

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
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
            console.log('✅ Order deleted successfully');

            // Emit socket event untuk real-time update
            if (socket) {
                socket.emit('order-deleted', {
                    orderId: orderId
                });
            }

            return result;
        } else {
            throw new Error(result.message || 'Failed to delete order');
        }
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        throw error;
    }
};

// Get orders by user
export const getOrdersByUser = async (userId) => {
    try {
        console.log(`📡 Fetching orders for user ${userId} from backend...`);

        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
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
            console.log(`✅ Successfully fetched ${result.data.length} orders for user ${userId}`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch user orders');
        }
    } catch (error) {
        console.error('❌ Error fetching user orders:', error);
        throw error;
    }
};

// Cleanup socket
export const cleanupOrdersSocket = () => {
    if (socket) {
        cleanupSocketListeners(socket);
        socket = null;
    }
};

// Set callback for real-time updates
export const setOrdersUpdateCallback = (callback) => {
    if (typeof window !== 'undefined') {
        window.ordersUpdateCallback = callback;
    }
};