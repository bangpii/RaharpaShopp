import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { getDashboardData } from '../../api/Api_dashboard';
import { io } from 'socket.io-client';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBarChartModal, setShowBarChartModal] = useState(false);
  const [showDoughnutModal, setShowDoughnutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const socketRef = useRef(null);

  // Hardcode BASE_URL untuk socket
  const SOCKET_URL = 'https://serverraharpashopp-production-f317.up.railway.app';

  // Data default jika API error
  const getDefaultData = useCallback(() => ({
    stats: [
      { title: "New Orders", value: "0", icon: "bx bx-cart", color: "bg-gradient-to-br from-amber-700 to-amber-500" },
      { title: "Total Sales", value: "IDR 0", icon: "bx bx-dollar", color: "bg-gradient-to-br from-amber-700 to-amber-500" },
      { title: "Total Users", value: "0", icon: "bx bx-user", color: "bg-gradient-to-br from-amber-700 to-amber-500" },
      { title: "Item", value: "0", icon: "bx bx-package", color: "bg-gradient-to-br from-amber-700 to-amber-500" }
    ],
    barChartData: [0, 0, 0, 0, 0, 0, 0],
    doughnutData: [0, 0],
    recentOrders: []
  }), []);

  // Fetch dashboard data dengan useCallback untuk menghindari infinite loop
  const fetchDashboardData = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching dashboard data for date:', date);
      
      const response = await getDashboardData(date);
      console.log('📦 Dashboard data received:', response);
      
      if (response.success) {
        console.log('✅ Setting dashboard data:', response.data);
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard: ' + err.message);
      // Fallback ke data default
      setDashboardData(getDefaultData());
    } finally {
      setLoading(false);
    }
  }, [getDefaultData]);

  // Load data saat component mount atau date berubah
  useEffect(() => {
    console.log('🎯 Component mounted, fetching data...');
    fetchDashboardData(selectedDate);
  }, [selectedDate, fetchDashboardData]);

  // Socket.IO connection untuk real-time updates
  useEffect(() => {
    console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);
    
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      setSocketStatus('connected');
    });

    socketRef.current.on('welcome', (data) => {
      console.log('👋 Welcome message:', data);
    });

    // Join dashboard room
    socketRef.current.emit('join-dashboard-room');

    socketRef.current.on('dashboard-joined', (data) => {
      console.log('📊 Dashboard room joined:', data);
    });

    // Listen untuk real-time updates
    socketRef.current.on('dashboard-update', () => {
      console.log('🔄 Real-time dashboard update received');
      fetchDashboardData(selectedDate);
    });

    // Event listeners untuk berbagai update
    const events = [
      'order-created',
      'order-updated', 
      'user-logged-in',
      'item-added',
      'laporan-updated',
      'user-logged-out',
      'item-updated',
      'item-deleted'
    ];

    events.forEach(event => {
      socketRef.current.on(event, () => {
        console.log(`🔄 ${event} received, refreshing dashboard...`);
        fetchDashboardData(selectedDate);
      });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setSocketStatus('error');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setSocketStatus('disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedDate, fetchDashboardData]);

  const handleDateClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setShowDatePicker(false);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchDashboardData(selectedDate);
  };

  // Data untuk bar chart (Mingguan)
  const barChartData = {
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    datasets: [
      {
        label: 'Sales (IDR)',
        data: dashboardData?.barChartData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(180, 83, 9, 0.8)',
        borderColor: 'rgba(180, 83, 9, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `IDR ${context.raw.toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return 'IDR ' + value.toLocaleString('id-ID');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Data untuk doughnut chart - Manual vs Shoppie
  const doughnutChartData = {
    labels: ['Manual', 'Shoppie'],
    datasets: [
      {
        data: dashboardData?.doughnutData || [0, 0],
        backgroundColor: [
          'rgba(180, 83, 9, 0.8)', // Coklat tua untuk Manual
          'rgba(217, 119, 6, 0.8)', // Coklat medium untuk Shoppie
        ],
        borderColor: [
          'rgba(180, 83, 9, 1)',
          'rgba(217, 119, 6, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} orders (${percentage}%)`;
          }
        }
      }
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const getSocketStatusColor = () => {
    switch(socketStatus) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSocketStatusText = () => {
    switch(socketStatus) {
      case 'connected': return 'Live';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          <p className="text-xs text-gray-500 mt-2">From: {SOCKET_URL}</p>
        </div>
      </div>
    );
  }

  const currentData = dashboardData || getDefaultData();

  console.log('🎯 Current data to render:', currentData);

  return (
    <div className="space-y-4 xs:space-y-6 overflow-x-hidden md:overflow-x-visible">
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs hidden">
        <div className="flex justify-between items-center">
          <div>
            <strong>Debug Info:</strong> 
            <span className="ml-2">Data: {dashboardData ? '✅ Loaded' : '❌ Null'}</span>
            <span className="ml-2">Socket: <span className={getSocketStatusColor()}>{getSocketStatusText()}</span></span>
            <span className="ml-2">Orders: {currentData.recentOrders.length}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <i className='bx bx-error text-red-600 text-lg mr-2'></i>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Header dengan Breadcrumb */}
      <div className="flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs xs:text-sm text-gray-500 mb-1 xs:mb-2">
          <div className="flex items-center space-x-2">
            <i className='bx bx-home text-base xs:text-lg text-amber-700'></i>
            <span className="text-amber-700 font-semibold">Dashboard</span>
          </div>
        </div>
        
        {/* Title dan Date */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">DASHBOARD</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">
              Real-time admin dashboard 
              <span className={`ml-2 ${getSocketStatusColor()}`}>• {getSocketStatusText()}</span>
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={handleDateClick}
              className="bg-white border border-amber-200 rounded-xl px-2 xs:px-3 py-1 xs:py-2 lg:px-4 lg:py-3 
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                         hover:bg-amber-50 transition-colors mt-3 xs:mt-4 md:mt-0 w-full md:w-auto"
            >
              <div className="text-xs lg:text-sm text-amber-700 text-center md:text-left">
                {formatDate(selectedDate)}
              </div>
            </button>
            
            {/* Date Picker Modal */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-amber-200 rounded-xl 
                            shadow-[0_10px_30px_rgba(186,118,48,0.2)] z-10 p-4 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal</h3>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <i className='bx bx-x text-lg'></i>
                  </button>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setShowDatePicker(false);
                  }}
                  className="w-full mt-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - TAMPILKAN DATA NYA */}
      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 lg:grid-cols-4 xs:gap-3 lg:gap-4">
        {currentData.stats.map((stat, index) => (
          <div 
            key={index}
            className={`${stat.color} rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white 
                       shadow-[0_10px_30px_rgba(146,64,14,0.4),0_4px_12px_rgba(146,64,14,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                       transform hover:scale-105 transition-transform duration-300 border border-amber-600`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs lg:text-sm">{stat.title}</p>
                <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-white">
                  {stat.value}
                </h3>
              </div>
              <div className="p-1 xs:p-2 lg:p-3 bg-white/25 rounded-xl">
                <i className={`${stat.icon} text-sm xs:text-base sm:text-lg lg:text-2xl text-amber-100`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 lg:gap-6">
        {/* Bar Chart - Weekly Sales */}
        <div className="bg-white rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 
                       shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                       border border-amber-100">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4 lg:mb-6">
            <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-800">Weekly Sales</h3>
            <button 
              onClick={() => setShowBarChartModal(true)}
              className="text-amber-700 hover:text-amber-800 text-xs lg:text-sm font-medium"
            >
              View Report
            </button>
          </div>
          <div className="h-32 xs:h-40 sm:h-48 lg:h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart - Order Method Distribution */}
        <div className="bg-white rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 
                       shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                       border border-amber-100">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4 lg:mb-6">
            <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-800">Order Distribution</h3>
            <button 
              onClick={() => setShowDoughnutModal(true)}
              className="text-amber-700 hover:text-amber-800 text-xs lg:text-sm font-medium"
            >
              View Details
            </button>
          </div>
          <div className="h-32 xs:h-40 sm:h-48 lg:h-64">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 
               shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
               border border-amber-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 xs:mb-3 sm:mb-4 lg:mb-6 gap-3">
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-800">
            Recent Orders ({currentData.recentOrders.length})
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm flex items-center"
            >
              <i className='bx bx-refresh mr-2'></i>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="text-left py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 font-semibold text-xs lg:text-sm whitespace-nowrap w-1/4">
                    User
                  </th>
                  <th className="text-left py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 font-semibold text-xs lg:text-sm whitespace-nowrap w-1/4">
                    Product
                  </th>
                  <th className="text-left py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 font-semibold text-xs lg:text-sm whitespace-nowrap w-1/4">
                    Status
                  </th>
                  <th className="text-left py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 font-semibold text-xs lg:text-sm whitespace-nowrap w-1/4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.recentOrders.length > 0 ? (
                  currentData.recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                      <td className="py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-800 text-xs lg:text-sm overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex-shrink-0 w-6 h-6 xs:w-7 xs:h-7 bg-amber-100 rounded-full flex items-center justify-center">
                            <i className='bx bx-user text-amber-600 text-xs'></i>
                          </div>
                          <span className="truncate block min-w-0">{order.user}</span>
                        </div>
                      </td>
                      <td className="py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 text-xs lg:text-sm overflow-hidden">
                        <span className="truncate block min-w-0">{order.product}</span>
                      </td>
                      <td className="py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 overflow-hidden">
                        <span className={`px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1 truncate ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <i className={`bx ${
                            order.status === 'completed' ? 'bx-check-circle' :
                            order.status === 'pending' ? 'bx-time' : 
                            order.status === 'processing' ? 'bx-cog' : 'bx-x-circle'
                          } text-xs flex-shrink-0`}></i>
                          <span className="truncate capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-1 xs:py-2 lg:py-3 px-1 xs:px-2 lg:px-4 text-gray-600 text-xs lg:text-sm overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <i className='bx bx-calendar text-gray-400 text-xs flex-shrink-0'></i>
                          <span className="truncate block min-w-0">{order.date}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 xs:py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <i className='bx bx-package text-3xl xs:text-4xl mb-2'></i>
                        <p className="text-sm xs:text-base">Tidak ada data order untuk tanggal ini</p>
                        <p className="text-xs xs:text-sm mt-1">Data akan muncul ketika ada order baru</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bar Chart Modal */}
      {showBarChartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Weekly Sales Report</h3>
              <button 
                onClick={() => setShowBarChartModal(false)}
                className="text-amber-600 hover:text-amber-700 text-lg sm:text-xl"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="h-64 sm:h-80 lg:h-96">
              <Bar data={barChartData} options={{...barChartOptions, maintainAspectRatio: false}} />
            </div>
          </div>
        </div>
      )}

      {/* Doughnut Chart Modal */}
      {showDoughnutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Order Distribution Details</h3>
              <button 
                onClick={() => setShowDoughnutModal(false)}
                className="text-amber-600 hover:text-amber-700 text-lg sm:text-xl"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="h-64 sm:h-80 lg:h-96">
              <Doughnut data={doughnutChartData} options={{...doughnutChartOptions, maintainAspectRatio: false}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard