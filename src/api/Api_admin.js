// ../api/Api_admin.js - Vercel Optimized

// Konfigurasi API URL - Gunakan environment variable
const API_BASE_URL =
    import.meta.env.VITE_API_URL;

console.log('🔧 Vite Environment:',
    import.meta.env.MODE);
console.log('🚀 API Base URL:', API_BASE_URL || 'Not set');

// Fallback ke hardcode jika env tidak terbaca
const FINAL_API_URL = API_BASE_URL || 'https://serverraharpashopp-production-f317.up.railway.app';

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🚀 Vite Environment:',
    import.meta.env);

// Admin Login API
export const loginAdmin = async (email, password) => {
    try {
        console.log('🔐 Admin login attempt to:', API_BASE_URL);
        console.log('📧 Email:', email);

        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password: password
            }),
            // Tambahkan timeout
            signal: AbortSignal.timeout(10000) // 10 detik timeout
        });

        // Cek jika response tidak OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP Error:', response.status, errorText);

            return {
                success: false,
                message: `Server error: ${response.status} - ${errorText || 'Unknown error'}`
            };
        }

        const result = await response.json();
        console.log('✅ Admin login response:', result);

        if (result.success) {
            return result;
        } else {
            return {
                success: false,
                message: result.message || 'Login gagal'
            };
        }
    } catch (error) {
        console.error('💥 Admin Login API error:', error);

        if (error.name === 'TimeoutError') {
            return {
                success: false,
                message: 'Timeout: Server tidak merespons. Silakan coba lagi.'
            };
        }

        if (error.name === 'TypeError') {
            return {
                success: false,
                message: 'Koneksi gagal. Periksa koneksi internet Anda.'
            };
        }

        return {
            success: false,
            message: 'Terjadi kesalahan jaringan. Silakan coba lagi.'
        };
    }
};

// Test koneksi API
export const testApiConnection = async () => {
    try {
        console.log('🧪 Testing API connection to:', API_BASE_URL);

        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API Connection test successful:', data);
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('❌ API Connection test failed:', error);
        return {
            success: false,
            message: `Cannot connect to server: ${error.message}`
        };
    }
};

// Get Admin Profile
export const getAdminProfile = async (adminId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/profile/${adminId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Admin profile API error:', error);
        throw error;
    }
};

// Update Admin Profile
export const updateAdminProfile = async (adminId, profileData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/profile/${adminId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Admin profile update API error:', error);
        throw error;
    }
};

// Clear admin storage
export const clearAdminStorage = () => {
    try {
        localStorage.removeItem('adminData');
        sessionStorage.removeItem('adminSession');
        console.log('✅ Admin storage cleared');
        return true;
    } catch (error) {
        console.error('❌ Admin storage clear error:', error);
        return false;
    }
};

export default {
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    clearAdminStorage,
    testApiConnection
};