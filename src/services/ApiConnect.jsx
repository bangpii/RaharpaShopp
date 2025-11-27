// src/services/ApiConnect.jsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ApiConnect = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vite menggunakan import.meta.env, bukan process.env
  const API_URL = import.meta.env.VITE_API_URL || 'https://serverraharpashopp-production-f317.up.railway.app';

  useEffect(() => {
    console.log('🔧 Environment Variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });

    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });

    testAllEndpoints();
  }, []);

  const testAllEndpoints = async () => {
    console.log('🧪 Starting API connection tests...');
    console.log('🔗 Using API URL:', API_URL);
    
    try {
      setLoading(true);
      setConnectionStatus('checking');
      
      // Test 1: Main endpoint
      console.log('📡 Testing main endpoint...');
      const mainResponse = await fetch(API_URL + '/');
      if (!mainResponse.ok) throw new Error(`Main endpoint failed: ${mainResponse.status}`);
      const mainData = await mainResponse.json();
      console.log('✅ Main endpoint:', mainData);

      // Test 2: Health endpoint
      console.log('❤️ Testing health endpoint...');
      const healthResponse = await fetch(API_URL + '/health');
      if (!healthResponse.ok) throw new Error(`Health endpoint failed: ${healthResponse.status}`);
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint:', healthData);

      setApiData({
        main: mainData,
        health: healthData,
        timestamp: new Date().toLocaleString(),
        apiUrl: API_URL
      });
      
      setConnectionStatus('connected');
      setError(null);
      
    } catch (err) {
      console.error('❌ API Test Failed:', err);
      setConnectionStatus('error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected ✅';
      case 'error': return 'Error ❌';
      default: return 'Checking... 🔄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div 
        className="max-w-4xl mx-auto mt-8"
        data-aos="fade-up"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">API Connection Status</h1>
            <div className={`px-4 py-2 rounded-full text-white font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Environment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <strong>VITE_API_URL:</strong> 
                <span className="text-blue-600 ml-2 break-all">
                  {import.meta.env.VITE_API_URL || 'Not set'}
                </span>
              </div>
              <div>
                <strong>Mode:</strong> 
                <span className="text-blue-600 ml-2">
                  {import.meta.env.MODE}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Backend URL</h3>
              <p className="text-sm text-blue-600 break-all">{API_URL}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Environment</h3>
              <p className="text-sm text-gray-600">{import.meta.env.MODE}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Last Check</h3>
              <p className="text-sm text-gray-600">
                {apiData?.timestamp || 'Not checked yet'}
              </p>
            </div>
          </div>

          <button
            onClick={testAllEndpoints}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 mb-6"
          >
            {loading ? 'Testing Connection...' : 'Test Connection Again'}
          </button>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Connecting to backend...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-2">URL: {API_URL}</p>
            </div>
          )}

          {apiData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Main Endpoint Response</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(apiData.main, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Health Check Response</h3>
                <pre className="bg-gray-800 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(apiData.health, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Debug Information</h3>
          <div className="text-yellow-700 space-y-2 text-sm">
            <p><strong>Problem:</strong> Environment variables not loading in Vite</p>
            <p><strong>Solution:</strong> Use import.meta.env.VITE_API_URL (not process.env)</p>
            <p><strong>Current API_URL:</strong> {API_URL}</p>
            <p><strong>Check:</strong> Browser console for detailed logs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConnect;