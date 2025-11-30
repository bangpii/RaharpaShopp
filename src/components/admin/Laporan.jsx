import React, { useState, useEffect } from 'react'
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
import { getLaporanData, getLaporanSummary } from '../../api/Api_laporan'

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

const Laporan = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBarChartModal, setShowBarChartModal] = useState(false)
  const [showDoughnutModal, setShowDoughnutModal] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallLaptop, setIsSmallLaptop] = useState(false)
  const [laporanData, setLaporanData] = useState([])
  const [totalKeseluruhan, setTotalKeseluruhan] = useState(0)
  const [chartData, setChartData] = useState({
    barChartData: [],
    doughnutData: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  })

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsSmallLaptop(width >= 768 && width <= 1640)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Di Laporan.jsx - TAMBAH useEffect untuk real-time updates
useEffect(() => {
  // Listen untuk real-time updates dari socket
  const handleLaporanUpdate = () => {
      console.log('🔄 Real-time laporan update received');
      loadLaporanData(); // Refresh data laporan
  };

  // Tambah event listener
  if (typeof window !== 'undefined') {
      window.addEventListener('laporan-updated', handleLaporanUpdate);
  }

  return () => {
      if (typeof window !== 'undefined') {
          window.removeEventListener('laporan-updated', handleLaporanUpdate);
      }
  };
}, []);

  // Load laporan data
  const loadLaporanData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading laporan data for:', selectedMonth)
      
      const [laporanResponse, summaryResponse] = await Promise.all([
        getLaporanData(selectedMonth),
        getLaporanSummary(selectedMonth)
      ])

      setLaporanData(laporanResponse.laporan || [])
      setTotalKeseluruhan(laporanResponse.totalKeseluruhan || 0)
      setChartData(laporanResponse.chartData || {
        barChartData: [],
        doughnutData: []
      })
      setSummaryData({
        totalOrders: summaryResponse.totalOrders || 0,
        totalRevenue: summaryResponse.totalRevenue || 0,
        avgOrderValue: summaryResponse.avgOrderValue || 0
      })

      console.log('✅ Laporan data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading laporan data:', error)
      setLaporanData([])
      setTotalKeseluruhan(0)
      setChartData({
        barChartData: [],
        doughnutData: []
      })
      setSummaryData({
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLaporanData()
  }, [selectedMonth])

  const handleMonthClick = () => {
    setShowMonthPicker(!showMonthPicker)
  }

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value)
    setShowMonthPicker(false)
  }

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-')
    const date = new Date(year, month - 1)
    const options = { month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Filter data berdasarkan search term
  const filteredData = laporanData.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Buat ID increment
  const dataWithIncrementId = filteredData.map((item, index) => ({
    ...item,
    incrementId: (index + 1).toString()
  }))

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'bx bx-check-circle'
      case 'processing':
        return 'bx bx-cog'
      case 'pending':
        return 'bx bx-time'
      case 'cancelled':
        return 'bx bx-x-circle'
      default:
        return 'bx bx-question-mark'
    }
  }

  // Get method color and icon
  const getMethodColor = (method) => {
    return method === 'shoppie' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const getMethodIcon = (method) => {
    return method === 'shoppie' ? 'bx bx-store' : 'bx bx-edit'
  }

  // Render multiple images
  const renderImages = (imageString) => {
    const images = imageString.split(',')
    return (
      <div className="flex gap-1">
        {images.map((img, index) => (
          <div key={index} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            <img 
              src={img !== 'default' ? img : '/01.jpeg'} 
              alt={`Gambar ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="hidden items-center justify-center text-gray-400 text-xs">
              <i className='bx bx-image'></i>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Buka detail order (mobile & small laptop)
  const openOrderDetail = (order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  // Data untuk bar chart
  const barChartData = {
    labels: Array.from({length: chartData.barChartData.length || 31}, (_, i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Sales per Hari',
        data: chartData.barChartData,
        backgroundColor: 'rgba(180, 83, 9, 0.8)',
        borderColor: 'rgba(180, 83, 9, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

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
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return 'Rp ' + value.toLocaleString('id-ID');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Hari dalam Bulan'
        }
      },
    },
  }

  // Data untuk doughnut chart
  const doughnutChartData = {
    labels: ['Manual', 'Shoppie'],
    datasets: [
      {
        data: chartData.doughnutData,
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
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Handle refresh
  const handleRefresh = () => {
    loadLaporanData()
  }

  return (
    <div className='space-y-4 xs:space-y-6 overflow-x-hidden min-h-screen bg-gray-50'>
      {/* Overlay dan Modal untuk Detail Order (Mobile & Small Laptop) */}
      {(showOrderDetail && selectedOrder && (isMobile || isSmallLaptop)) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowOrderDetail(false)}
          ></div>
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden
                         shadow-[0_-20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-slideUp sm:animate-scaleIn">
            {/* Header dengan Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-amber-100 bg-white sticky top-0">
              <h3 className="text-xl font-bold text-gray-800">Detail Laporan</h3>
              <button 
                onClick={() => setShowOrderDetail(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            {/* Content Detail */}
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="space-y-6">
                {/* Avatar dan Nama */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                flex items-center justify-center text-white">
                    <i className='bx bx-user text-2xl'></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedOrder.name}</h2>
                    <p className="text-gray-600">ID: {selectedOrder.id}</p>
                    <p className="text-green-600 font-bold text-lg mt-1">
                      {formatCurrency(selectedOrder.total)}
                    </p>
                  </div>
                </div>

                {/* Informasi Detail */}
                <div className="grid gap-4">
                  {/* Code Barang */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-barcode text-amber-600 text-lg'></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Code Barang</h4>
                        <p className="text-gray-600 text-sm font-medium">{selectedOrder.code}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gambar Barang */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-image text-amber-600 text-lg'></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Gambar Barang</h4>
                        {renderImages(selectedOrder.image)}
                      </div>
                    </div>
                  </div>

                  {/* Detail Harga */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-dollar text-amber-600 text-lg'></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">Detail Harga</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Jumlah Barang:</span>
                            <span className="font-semibold">{selectedOrder.quantity} pcs</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Harga Satuan:</span>
                            <span className="font-semibold">{selectedOrder.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status dan Metode */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-info-circle text-amber-600 text-lg'></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">Status & Metode</h4>
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                            <i className={getStatusIcon(selectedOrder.status)}></i>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <i className={`bx ${selectedOrder.method === 'shoppie' ? 'bx-store' : 'bx-edit'}`}></i>
                            Metode: {selectedOrder.method === 'shoppie' ? 'Shoppie' : 'Manual'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tanggal dan Waktu */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-calendar text-amber-600 text-lg'></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Tanggal & Waktu</h4>
                        <p className="text-gray-600 text-sm">{selectedOrder.date}</p>
                        <p className="text-gray-500 text-xs">{selectedOrder.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header dengan Breadcrumb */}
      <div className="flex flex-col px-3 xs:px-4 sm:px-6 pt-4 no-print">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs xs:text-sm text-gray-500 mb-1 xs:mb-2">
          <div className="flex items-center space-x-2">
            <i className='bx bx-home text-base xs:text-lg text-amber-700'></i>
            <span className="text-amber-700 font-semibold">Dashboard</span>
            <i className='bx bx-chevron-right text-gray-400'></i>
            <i className='bx bx-file text-base xs:text-lg text-amber-700'></i>
            <span className="text-amber-700 font-semibold">Laporan</span>
          </div>
        </div>
        
        {/* Title dan Month Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">LAPORAN</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Analisis data penjualan dan performa order</p>
          </div>
          
          <div className="flex items-center gap-3 mt-3 xs:mt-4 md:mt-0">
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                         text-white rounded-xl px-4 py-2.5 shadow-[0_4px_12px_rgba(34,197,94,0.3)] 
                         hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] transition-all duration-200 
                         flex items-center gap-2 group print:hidden"
              disabled={isLoading}
            >
              <i className={`bx ${isLoading ? 'bx-loader-circle bx-spin' : 'bx-refresh'} text-lg`}></i>
              <span className="text-sm font-medium">{isLoading ? 'Loading...' : 'Refresh'}</span>
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 
                         text-white rounded-xl px-4 py-2.5 shadow-[0_4px_12px_rgba(186,118,48,0.3)] 
                         hover:shadow-[0_6px_20px_rgba(186,118,48,0.4)] transition-all duration-200 
                         flex items-center gap-2 group print:hidden"
            >
              <i className='bx bx-printer text-lg'></i>
              <span className="text-sm font-medium">Print</span>
            </button>

            {/* Month Picker */}
            <div className="relative">
              <button 
                onClick={handleMonthClick}
                className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 
                           shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                           hover:bg-amber-50 transition-colors w-full md:w-auto"
              >
                <div className="text-sm text-amber-700 text-center md:text-left flex items-center gap-2">
                  <i className='bx bx-calendar text-amber-600'></i>
                  {formatMonth(selectedMonth)}
                </div>
              </button>
              
              {/* Month Picker Modal */}
              {showMonthPicker && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-amber-200 rounded-xl 
                              shadow-[0_10px_30px_rgba(186,118,48,0.2)] z-10 p-4 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Pilih Bulan</h3>
                    <button 
                      onClick={() => setShowMonthPicker(false)}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <i className='bx bx-x text-lg'></i>
                    </button>
                  </div>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    max="2025-12"
                    min="2025-01"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Keseluruhan Section */}
      <div className="px-3 xs:px-4 sm:px-6 no-print">
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-white 
                       shadow-[0_10px_30px_rgba(186,118,48,0.3)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg xs:text-xl font-bold mb-2">Total Keseluruhan Bulan {formatMonth(selectedMonth)}</h2>
              <p className="text-amber-100 text-sm">Seluruh pendapatan dari order yang completed</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="text-2xl xs:text-3xl font-bold">{formatCurrency(totalKeseluruhan)}</div>
              <div className="text-amber-100 text-sm mt-1">
                {summaryData.totalOrders} Order • Avg: {formatCurrency(summaryData.avgOrderValue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search dan Content */}
      <div className="bg-white rounded-2xl mx-3 xs:mx-4 sm:mx-6 p-4 xs:p-5 sm:p-6 lg:p-8 
                     shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                     border border-amber-100 mb-6 print:shadow-none print:border print:mx-2 print:p-4">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 xs:mb-6 gap-3 no-print">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className='bx bx-search text-gray-400 text-sm xs:text-base'></i>
            </div>
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-amber-500 focus:border-transparent
                       bg-gray-50 hover:bg-white transition-colors duration-200
                       text-xs xs:text-sm lg:text-base placeholder-gray-400"
            />
          </div>
          
          <div className="text-xs xs:text-sm text-gray-500 text-center sm:text-left">
            Menampilkan {dataWithIncrementId.length} data laporan
          </div>
        </div>

        {/* Table Container dengan Scroll */}
        <div className="overflow-hidden mb-8 print:mb-4">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="h-[60vh] min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar print:max-h-none print:h-auto">
              {/* Desktop Table - Full untuk laptop besar (> 1640px) */}
              <table className="w-full min-w-[1000px] hidden min-[1641px]:table print:table">
                <thead>
                  <tr className="sticky top-0 print:static">
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tl-2xl print:bg-amber-600 print:text-black">
                      No
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Nama User
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Code Barang
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Jumlah
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Harga Satuan
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Gambar
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Total Harga
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 print:bg-amber-600 print:text-black">
                      Metode Order
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl print:bg-amber-600 print:text-black">
                      Tanggal & Waktu
                    </th>
                  </tr>
                  {/* Blur effect di bawah thead */}
                  <tr className="no-print">
                    <td colSpan="10" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                  </tr>
                </thead>
                <tbody>
                  {dataWithIncrementId.map((item) => (
                    <tr key={item.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200 print:border-b print:border-gray-300">
                      <td className="py-4 px-4 text-gray-800 text-sm font-medium">
                        {item.incrementId}
                      </td>
                      <td className="py-4 px-4 text-gray-800 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                        flex items-center justify-center text-white flex-shrink-0 print:bg-amber-600">
                            <i className='bx bx-user text-sm'></i>
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                        {item.code}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {item.quantity} pcs
                      </td>
                      <td className="py-4 px-4 text-gray-800 text-sm font-semibold">
                        {item.price}
                      </td>
                      <td className="py-4 px-4">
                        {renderImages(item.image)}
                      </td>
                      <td className="py-4 px-4 text-gray-800 text-sm font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          <i className={getStatusIcon(item.status)}></i>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getMethodColor(item.method)}`}>
                          <i className={getMethodIcon(item.method)}></i>
                          {item.method === 'shoppie' ? 'Shoppie' : 'Manual'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <i className='bx bx-calendar text-gray-400 text-xs'></i>
                            {new Date(item.date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <i className='bx bx-time text-gray-400 text-xs'></i>
                            {item.time}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Desktop Table - Simplified untuk laptop kecil (768px - 1640px) */}
              <table className="w-full hidden md:table min-[1641px]:hidden">
                <thead>
                  <tr className="sticky top-0">
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tl-2xl">
                      No
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      Nama User
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      Code Barang
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      Total Harga
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl">
                      Detail
                    </th>
                  </tr>
                  {/* Blur effect di bawah thead */}
                  <tr>
                    <td colSpan="6" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                  </tr>
                </thead>
                <tbody>
                  {dataWithIncrementId.map((item) => (
                    <tr key={item.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                      <td className="py-4 px-4 text-gray-800 text-sm font-medium">
                        {item.incrementId}
                      </td>
                      <td className="py-4 px-4 text-gray-800 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                        flex items-center justify-center text-white flex-shrink-0">
                            <i className='bx bx-user text-sm'></i>
                          </div>
                          <div>
                            <span className="font-medium block">{item.name}</span>
                            <span className="text-gray-500 text-xs">ID: {item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                        {item.code}
                      </td>
                      <td className="py-4 px-4 text-gray-800 text-sm font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          <i className={getStatusIcon(item.status)}></i>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => openOrderDetail(item)}
                          className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Lihat Detail"
                        >
                          <i className='bx bx-show text-lg'></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile List (< 768px) */}
              <div className="md:hidden space-y-4 no-print">
                {dataWithIncrementId.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-amber-100 
                                              shadow-[0_4px_12px_rgba(186,118,48,0.1)] hover:shadow-[0_6px_20px_rgba(186,118,48,0.15)] 
                                              transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 
                                      flex items-center justify-center text-white flex-shrink-0">
                          <i className='bx bx-user text-base'></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">No: {item.incrementId}</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                              <i className={getStatusIcon(item.status)}></i>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openOrderDetail(item)}
                        className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors flex-shrink-0 ml-2"
                      >
                        <i className='bx bx-show text-xl'></i>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-3">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <i className='bx bx-barcode'></i>
                          <span className="font-medium">Code:</span>
                        </div>
                        <div className="text-gray-800 font-medium truncate">{item.code}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <i className='bx bx-package'></i>
                          <span className="font-medium">Qty:</span>
                        </div>
                        <div>{item.quantity} pcs</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <i className='bx bx-calendar'></i>
                          {new Date(item.date).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1">
                          <i className='bx bx-time'></i>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {dataWithIncrementId.length === 0 && !isLoading && (
                <div className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <i className='bx bx-file text-5xl mb-3'></i>
                    <p className="text-base font-medium">Tidak ada data laporan yang ditemukan</p>
                    <p className="text-sm mt-1">Coba ubah kata kunci pencarian atau bulan</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-base font-medium">Memuat data laporan...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section - Hidden saat print */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 print:hidden">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 
                         shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800">Sales Overview</h3>
              <button 
                onClick={() => setShowBarChartModal(true)}
                className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-2"
              >
                View Report
                <i className='bx bx-chevron-right'></i>
              </button>
            </div>
            <div className="h-64 lg:h-72">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 
                         shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800">Order Distribution</h3>
              <button 
                onClick={() => setShowDoughnutModal(true)}
                className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-2"
              >
                View Details
                <i className='bx bx-chevron-right'></i>
              </button>
            </div>
            <div className="h-64 lg:h-72">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Modal */}
      {showBarChartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Sales Overview Report</h3>
              <button 
                onClick={() => setShowBarChartModal(false)}
                className="text-amber-600 hover:text-amber-700 text-xl"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="h-96">
              <Bar data={barChartData} options={{...barChartOptions, maintainAspectRatio: false}} />
            </div>
          </div>
        </div>
      )}

      {/* Doughnut Chart Modal */}
      {showDoughnutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Order Distribution Details</h3>
              <button 
                onClick={() => setShowDoughnutModal(false)}
                className="text-amber-600 hover:text-amber-700 text-xl"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="h-96">
              <Doughnut data={doughnutChartData} options={{...doughnutChartOptions, maintainAspectRatio: false}} />
            </div>
          </div>
        </div>
      )}

      {/* CSS untuk animasi dan scrollbar */}
      <style>{`
        .custom-scrollbar {
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            font-size: 12px !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:h-auto {
            height: auto !important;
          }
          
          .print\\:max-h-none {
            max-height: none !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:mx-2 {
            margin-left: 0.5rem !important;
            margin-right: 0.5rem !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          
          .print\\:bg-amber-600 {
            background-color: #d97706 !important;
          }
          
          .print\\:text-black {
            color: black !important;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Laporan