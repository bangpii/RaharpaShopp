import React, { useState, useEffect } from 'react'

const Orders = ({ onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState('2025-11-19')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallLaptop, setIsSmallLaptop] = useState(false)
  const [editOrderData, setEditOrderData] = useState({
    code: '',
    status: 'pending',
    locationLink: '',
    method: 'shoppie'
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

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard')
    }
  }

  const handleOrdersRefresh = () => {
    setSearchTerm('')
  }

  const handleDateClick = () => {
    setShowDatePicker(!showDatePicker)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setShowDatePicker(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Data orders dengan struktur baru - gambar dan harga berdasarkan code barang
  const [orders, setOrders] = useState([
    {
      id: "1",
      name: "Baihaqie Ar Rafi",
      code: "BRG001, BRG002",
      quantity: 2,
      price: "250.000, 150.000",
      total: 400000,
      status: "completed",
      date: "2025-11-19",
      time: "14:30",
      image: "01,02",
      locationLink: "https://maps.google.com/?q=Jakarta",
      method: "shoppie"
    },
    {
      id: "2",
      name: "Rahima Maisarah",
      code: "BRG003",
      quantity: 1,
      price: "150.000",
      total: 150000,
      status: "pending",
      date: "2025-11-19",
      time: "10:15",
      image: "03",
      locationLink: "https://maps.google.com/?q=Bandung",
      method: "manual"
    },
    {
      id: "3",
      name: "Gabriel Silitonga",
      code: "BRG004, BRG005, BRG006",
      quantity: 3,
      price: "75.000, 80.000, 70.000",
      total: 225000,
      status: "processing",
      date: "2025-11-18",
      time: "16:45",
      image: "04,05,01",
      locationLink: "https://maps.google.com/?q=Surabaya",
      method: "shoppie"
    },
    {
      id: "4",
      name: "Jarjit Shings",
      code: "BRG007",
      quantity: 1,
      price: "500.000",
      total: 500000,
      status: "completed",
      date: "2025-11-19",
      time: "09:20",
      image: "02",
      locationLink: "https://maps.google.com/?q=Yogyakarta",
      method: "manual"
    },
    {
      id: "5",
      name: "Sarah Johnson",
      code: "BRG008, BRG009",
      quantity: 2,
      price: "125.000, 125.000",
      total: 250000,
      status: "cancelled",
      date: "2025-11-17",
      time: "11:30",
      image: "03,04",
      locationLink: "https://maps.google.com/?q=Semarang",
      method: "shoppie"
    },
    {
      id: "6",
      name: "Michael Chen",
      code: "BRG010",
      quantity: 1,
      price: "300.000",
      total: 300000,
      status: "completed",
      date: "2025-11-16",
      time: "13:15",
      image: "05",
      locationLink: "https://maps.google.com/?q=Malang",
      method: "manual"
    },
    {
      id: "7",
      name: "Lisa Anderson",
      code: "BRG011, BRG012, BRG013, BRG014",
      quantity: 4,
      price: "50.000, 55.000, 45.000, 50.000",
      total: 200000,
      status: "processing",
      date: "2025-11-15",
      time: "15:40",
      image: "01,02,03,04",
      locationLink: "https://maps.google.com/?q=Denpasar",
      method: "shoppie"
    },
    {
      id: "8",
      name: "Tukul Nono",
      code: "BRG015",
      quantity: 1,
      price: "750.000",
      total: 750000,
      status: "completed",
      date: "2025-11-15",
      time: "08:50",
      image: "05",
      locationLink: "https://maps.google.com/?q=Medan",
      method: "manual"
    }
  ])

  // Mapping code barang ke gambar dan harga
  const codeToImageMap = {
    'BRG001': '01',
    'BRG002': '02',
    'BRG003': '03',
    'BRG004': '04',
    'BRG005': '05',
    'BRG006': '01',
    'BRG007': '02',
    'BRG008': '03',
    'BRG009': '04',
    'BRG010': '05',
    'BRG011': '01',
    'BRG012': '02',
    'BRG013': '03',
    'BRG014': '04',
    'BRG015': '05'
  }

  const codeToPriceMap = {
    'BRG001': '250.000',
    'BRG002': '150.000',
    'BRG003': '150.000',
    'BRG004': '75.000',
    'BRG005': '80.000',
    'BRG006': '70.000',
    'BRG007': '500.000',
    'BRG008': '125.000',
    'BRG009': '125.000',
    'BRG010': '300.000',
    'BRG011': '50.000',
    'BRG012': '55.000',
    'BRG013': '45.000',
    'BRG014': '50.000',
    'BRG015': '750.000'
  }

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.includes(searchTerm) ||
    order.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter orders berdasarkan tanggal yang dipilih
  const ordersByDate = filteredOrders.filter(order => 
    order.date === selectedDate
  )

  // Buat ID increment berdasarkan looping
  const ordersWithIncrementId = ordersByDate.map((order, index) => ({
    ...order,
    incrementId: (index + 1).toString()
  }))

  // Handle Edit Data
  const handleEditOrder = () => {
    if (editOrderData.code === '') return
    
    // Generate gambar, harga, dan quantity otomatis dari code barang
    const codes = editOrderData.code.split(',').map(code => code.trim())
    const images = codes.map(code => codeToImageMap[code] || '01').join(', ')
    const prices = codes.map(code => codeToPriceMap[code] || '0').join(', ')
    const quantity = codes.length
    
    // Hitung total berdasarkan harga
    const total = codes.reduce((sum, code) => {
      const price = parseInt(codeToPriceMap[code]?.replace(/\./g, '') || '0')
      return sum + price
    }, 0)
    
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? { 
            ...order, 
            code: editOrderData.code,
            quantity: quantity,
            price: prices,
            total: total,
            status: editOrderData.status,
            image: images,
            locationLink: editOrderData.locationLink,
            method: editOrderData.method
          } 
        : order
    )
    
    setOrders(updatedOrders)
    setEditOrderData({
      code: '',
      status: 'pending',
      locationLink: '',
      method: 'shoppie'
    })
    setShowEditForm(false)
    setSelectedOrder(null)
  }

  // Handle Hapus Data
  const handleDeleteOrder = () => {
    const updatedOrders = orders.filter(order => order.id !== selectedOrder.id)
    setOrders(updatedOrders)
    setShowDeleteConfirm(false)
    setSelectedOrder(null)
    setShowOrderDetail(false)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Buka form edit
  const openEditForm = (order) => {
    setSelectedOrder(order)
    setEditOrderData({
      code: order.code,
      status: order.status,
      locationLink: order.locationLink || '',
      method: order.method || 'shoppie'
    })
    setShowEditForm(true)
    setShowOrderDetail(false)
  }

  // Buka konfirmasi hapus
  const openDeleteConfirm = (order) => {
    setSelectedOrder(order)
    setShowDeleteConfirm(true)
    setShowOrderDetail(false)
  }

  // Buka detail order
  const openOrderDetail = (order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
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

  // Render multiple images
  const renderImages = (imageString) => {
    const images = imageString.split(',')
    return (
      <div className="flex gap-1">
        {images.map((img, index) => (
          <div key={index} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            <img 
              src={`/${img.trim()}.jpeg`} 
              alt={`Gambar ${img.trim()}`}
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

  // Preview gambar dan harga berdasarkan code barang
  const renderCodePreview = (codeString) => {
    const codes = codeString.split(',').map(code => code.trim())
    return (
      <div className="space-y-2">
        {codes.map((code, index) => (
          <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                <img 
                  src={`/${codeToImageMap[code] || '01'}.jpeg`} 
                  alt={code}
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
              <span className="font-medium">{code}</span>
            </div>
            <span className="text-green-600 font-semibold">
              {codeToPriceMap[code] || '0'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4 xs:space-y-6 min-h-screen bg-gray-50'>
      {/* Overlay dan Modal untuk Form Edit Data */}
      {showEditForm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowEditForm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Data Order</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Code Barang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Barang
                </label>
                <input
                  type="text"
                  value={editOrderData.code}
                  onChange={(e) => setEditOrderData({...editOrderData, code: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Kode barang (pisah dengan koma)"
                />
              </div>

              {/* Preview Code Barang */}
              {editOrderData.code && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Barang
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    {renderCodePreview(editOrderData.code)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * Gambar, harga, dan jumlah akan otomatis terupdate berdasarkan code barang
                  </p>
                </div>
              )}

              {/* Link Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Lokasi Pengiriman
                </label>
                <input
                  type="text"
                  value={editOrderData.locationLink}
                  onChange={(e) => setEditOrderData({...editOrderData, locationLink: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="https://maps.google.com/..."
                />
                {editOrderData.locationLink && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Link akan terbuka di tab baru saat diklik
                  </p>
                )}
              </div>

              {/* Metode Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Order
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOrderData({...editOrderData, method: 'shoppie'})}
                    className={`p-3 border rounded-xl transition-all duration-200 ${
                      editOrderData.method === 'shoppie'
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className='bx bx-store text-lg'></i>
                      <span className="font-medium text-sm">Shoppie</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditOrderData({...editOrderData, method: 'manual'})}
                    className={`p-3 border rounded-xl transition-all duration-200 ${
                      editOrderData.method === 'manual'
                        ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className='bx bx-edit text-lg'></i>
                      <span className="font-medium text-sm">Manual</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editOrderData.status}
                  onChange={(e) => setEditOrderData({...editOrderData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditOrder}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Konfirmasi Hapus */}
      {showDeleteConfirm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <i className='bx bx-trash text-2xl text-red-600'></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Data Order</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus order dari <span className="font-semibold text-amber-700">{selectedOrder.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)]
                         hover:from-red-700 hover:to-red-800 transition-all duration-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
              <h3 className="text-xl font-bold text-gray-800">Detail Order</h3>
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

            {/* Action Buttons */}
            <div className="p-6 border-t border-amber-100 bg-white sticky bottom-0">
              <div className="flex gap-3">
                <button
                  onClick={() => openEditForm(selectedOrder)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                           rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                           hover:from-blue-700 hover:to-blue-800 transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <i className='bx bx-edit text-lg'></i>
                  Edit
                </button>
                <button
                  onClick={() => openDeleteConfirm(selectedOrder)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white 
                           rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)]
                           hover:from-red-700 hover:to-red-800 transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <i className='bx bx-trash text-lg'></i>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header dengan Breadcrumb */}
      <div className="flex flex-col px-3 xs:px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs xs:text-sm text-gray-500 mb-1 xs:mb-2">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDashboardClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-home text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Dashboard</span>
            </button>
            <i className='bx bx-chevron-right text-gray-400'></i>
            <button 
              onClick={handleOrdersRefresh}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-package text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Orders</span>
            </button>
          </div>
        </div>
        
        {/* Title dan Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">ORDERS</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Kelola data pesanan dengan mudah dan efisien</p>
          </div>
          
          <div className="relative mt-3 xs:mt-4 md:mt-0">
            <button 
              onClick={handleDateClick}
              className="bg-white border border-amber-200 rounded-xl px-3 xs:px-4 py-2 xs:py-2.5 
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                         hover:bg-amber-50 transition-colors w-full md:w-auto"
            >
              <div className="text-xs xs:text-sm text-amber-700 text-center md:text-left">{formatDate(selectedDate)}</div>
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
                  max="2025-12-31"
                  min="2025-01-01"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search dan Content */}
      <div className="bg-white rounded-2xl mx-3 xs:mx-4 sm:mx-6 p-3 xs:p-4 sm:p-6 lg:p-8 
                     shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                     border border-amber-100 mb-6">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 xs:mb-6 gap-3">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className='bx bx-search text-gray-400 text-sm xs:text-base'></i>
            </div>
            <input
              type="text"
              placeholder="Cari order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 xs:py-2.5 lg:py-3 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-amber-500 focus:border-transparent
                       bg-gray-50 hover:bg-white transition-colors duration-200
                       text-xs xs:text-sm lg:text-base placeholder-gray-400"
            />
          </div>
          
          <div className="text-xs xs:text-sm text-gray-500 text-center sm:text-left">
            Menampilkan {ordersWithIncrementId.length} order
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full">
          <div className="h-[60vh] min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
            {/* Desktop Table - Full untuk laptop besar (> 1640px) */}
            <table className="w-full hidden min-[1641px]:table">
              <thead>
                <tr className="sticky top-0">
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tl-2xl">
                    <div className="flex items-center gap-1">
                      No
                      <button className="text-amber-200 hover:text-white transition-colors">
                        <i className='bx bx-sort text-xs'></i>
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    <div className="flex items-center gap-1">
                      Nama User
                      <button className="text-amber-200 hover:text-white transition-colors">
                        <i className='bx bx-sort text-xs'></i>
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Code Barang
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Jumlah
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Harga Satuan
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Gambar
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Total Harga
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Status
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                    Tanggal & Waktu
                  </th>
                  <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl">
                    Aksi
                  </th>
                </tr>
                {/* Blur effect di bawah thead */}
                <tr>
                  <td colSpan="10" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                </tr>
              </thead>
              <tbody>
                {ordersWithIncrementId.map((order) => (
                  <tr key={order.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                      {order.incrementId}
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                      flex items-center justify-center text-white flex-shrink-0">
                          <i className='bx bx-user text-sm'></i>
                        </div>
                        <span className="font-medium">{order.name}</span>
                      </div>
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm font-medium">
                      {order.code}
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm">
                      {order.quantity} pcs
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-semibold">
                      {order.price}
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4">
                      {renderImages(order.image)}
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <i className={getStatusIcon(order.status)}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <i className='bx bx-calendar text-gray-400 text-xs'></i>
                          {new Date(order.date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <i className='bx bx-time text-gray-400 text-xs'></i>
                          {order.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 xs:py-4 px-2 xs:px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditForm(order)}
                          className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <i className='bx bx-edit text-lg'></i>
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm(order)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <i className='bx bx-trash text-lg'></i>
                        </button>
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
                {ordersWithIncrementId.map((order) => (
                  <tr key={order.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                    <td className="py-4 px-4 text-gray-800 text-sm font-medium">
                      {order.incrementId}
                    </td>
                    <td className="py-4 px-4 text-gray-800 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                      flex items-center justify-center text-white flex-shrink-0">
                          <i className='bx bx-user text-sm'></i>
                        </div>
                        <div>
                          <span className="font-medium block">{order.name}</span>
                          <span className="text-gray-500 text-xs">ID: {order.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                      {order.code}
                    </td>
                    <td className="py-4 px-4 text-gray-800 text-sm font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <i className={getStatusIcon(order.status)}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => openOrderDetail(order)}
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
            <div className="md:hidden space-y-3">
              {ordersWithIncrementId.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4 border border-amber-100 
                                            shadow-[0_4px_12px_rgba(186,118,48,0.1)] hover:shadow-[0_6px_20px_rgba(186,118,48,0.15)] 
                                            transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 
                                    flex items-center justify-center text-white flex-shrink-0">
                        <i className='bx bx-user text-base'></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{order.name}</h3>
                        <p className="text-gray-500 text-xs truncate">ID: {order.id}</p>
                        <p className="text-green-600 font-bold text-sm mt-1">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openOrderDetail(order)}
                      className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors flex-shrink-0 ml-2"
                    >
                      <i className='bx bx-show text-xl'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {ordersWithIncrementId.length === 0 && (
              <div className="py-8 xs:py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <i className='bx bx-package text-4xl xs:text-5xl mb-3'></i>
                  <p className="text-sm xs:text-base font-medium">Tidak ada order yang ditemukan</p>
                  <p className="text-xs xs:text-sm mt-1">Coba ubah kata kunci pencarian atau tanggal</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

export default Orders