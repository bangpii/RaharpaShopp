// src/api/Api_dashboard.js
import axios from 'axios';

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

// Get dashboard data
export const getDashboardData = async (date = null) => {
    try {
        const params = date ? {
            date
        } : {};
        const response = await axios.get(`${BASE_URL}/api/dashboard`, {
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};