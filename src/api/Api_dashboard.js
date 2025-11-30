// src/api/Api_dashboard.js
import axios from 'axios';

// Manual BASE_URL - fix untuk production
const BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

// Get dashboard data
export const getDashboardData = async (date = null) => {
    try {
        console.log('🚀 Fetching dashboard data from:', BASE_URL);
        const params = date ? {
            date
        } : {};

        const response = await axios.get(`${BASE_URL}/api/dashboard`, {
            params,
            timeout: 10000 // 10 second timeout
        });

        console.log('✅ Dashboard API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        if (error.response) {
            // Server responded with error status
            console.error('Response error:', error.response.status, error.response.data);
        } else if (error.request) {
            // No response received
            console.error('No response received:', error.request);
        } else {
            // Other errors
            console.error('Error message:', error.message);
        }
        throw error;
    }
};