import React, {
    useEffect
} from 'react';

const ApiConnect = () => {
    useEffect(() => {
        console.log('🚀 STARTING API CONNECTION TEST...');

        fetch("https://serverraharpashopp-production-f317.up.railway.app")
            .then(res => res.json())
            .then(data => {
                console.log('✅ BACKEND CONNECTED!');
                console.log('📨 Message:', data.message);
                console.log('⏰ Timestamp:', data.timestamp);
                console.log('💾 Database:', data.database);
                console.log('🎯 FRONTEND-BACKEND CONNECTION: SUCCESS!');
            })
            .catch(err => {
                console.error('❌ CONNECTION FAILED:', err);
            });
    }, []);

    return null; // No UI, just console logs
};

export default ApiConnect;