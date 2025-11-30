// api/Api_laporan.js
const API_BASE_URL = 'https://serverraharpashopp-production-f317.up.railway.app/api';

// Get laporan data
export const getLaporanData = async (month) => {
    try {
        console.log('📊 Fetching laporan data for month:', month);

        const response = await fetch(`${API_BASE_URL}/laporan?month=${month}`, {
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
            console.log(`✅ Successfully fetched laporan data for ${month}`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch laporan data');
        }
    } catch (error) {
        console.error('❌ Error fetching laporan data:', error);
        throw error;
    }
};

// Get laporan summary
export const getLaporanSummary = async (month) => {
    try {
        console.log('📈 Fetching laporan summary for month:', month);

        const response = await fetch(`${API_BASE_URL}/laporan/summary?month=${month}`, {
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
            console.log(`✅ Successfully fetched laporan summary for ${month}`);
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch laporan summary');
        }
    } catch (error) {
        console.error('❌ Error fetching laporan summary:', error);
        throw error;
    }
};