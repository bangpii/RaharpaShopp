import React, { useState } from 'react'

const Item = ({ onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState('2025-11-19')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [newItemCode, setNewItemCode] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemImage, setNewItemImage] = useState(null)
  const [newItemPreview, setNewItemPreview] = useState('')
  const [editItemCode, setEditItemCode] = useState('')
  const [editItemPrice, setEditItemPrice] = useState('')
  const [editItemImage, setEditItemImage] = useState(null)
  const [editItemPreview, setEditItemPreview] = useState('')

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard')
    }
  }

  const handleItemRefresh = () => {
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

  // Handle image upload for add form
  const handleAddImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewItemImage(file)
      const previewUrl = URL.createObjectURL(file)
      setNewItemPreview(previewUrl)
    }
  }

  // Handle image upload for edit form
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditItemImage(file)
      const previewUrl = URL.createObjectURL(file)
      setEditItemPreview(previewUrl)
    }
  }

  // Clear add form
  const clearAddForm = () => {
    setNewItemCode('')
    setNewItemPrice('')
    setNewItemImage(null)
    setNewItemPreview('')
  }

  // Clear edit form
  const clearEditForm = () => {
    setEditItemCode('')
    setEditItemPrice('')
    setEditItemImage(null)
    setEditItemPreview('')
    setSelectedItem(null)
  }

  // Data items tersedia
  const [tersediaItems, setTersediaItems] = useState([
    {
      id: "1",
      code: "BRG001",
      price: "5.000",
      image: "/01.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    },
    {
      id: "2",
      code: "BRG002",
      price: "10.000",
      image: "/02.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    },
    {
      id: "3",
      code: "BRG003",
      price: "5.000",
      image: "/03.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    },
    {
      id: "4",
      code: "BRG004",
      price: "5.000",
      image: "/04.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    },
    {
      id: "5",
      code: "BRG005",
      price: "10.000",
      image: "/05.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    },
    {
      id: "6",
      code: "BRG006",
      price: "10.000",
      image: "/01.jpeg",
      status: "Tersedia",
      date: "2025-11-19"
    }
  ])

  // Data items sold out
  const [soldOutItems, setSoldOutItems] = useState([
    {
      id: "7",
      code: "BRG021",
      price: "5.000",
      image: "/01.jpeg",
      status: "Sold Out",
      date: "2025-11-18"
    },
    {
      id: "8",
      code: "BRG022",
      price: "10.000",
      image: "/02.jpeg",
      status: "Sold Out",
      date: "2025-11-19"
    },
    {
      id: "9",
      code: "BRG023",
      price: "5.000",
      image: "/03.jpeg",
      status: "Sold Out",
      date: "2025-11-19"
    },
    {
      id: "10",
      code: "BRG024",
      price: "5.000",
      image: "/04.jpeg",
      status: "Sold Out",
      date: "2025-11-18"
    },
    {
      id: "11",
      code: "BRG025",
      price: "10.000",
      image: "/05.jpeg",
      status: "Sold Out",
      date: "2025-11-19"
    },
    {
      id: "12",
      code: "BRG026",
      price: "10.000",
      image: "/01.jpeg",
      status: "Sold Out",
      date: "2025-11-19"
    }
  ])

  const filteredTersedia = tersediaItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.includes(searchTerm)
  )

  const filteredSoldOut = soldOutItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.includes(searchTerm)
  )

  // Filter items berdasarkan tanggal yang dipilih
  const tersediaByDate = filteredTersedia.filter(item => 
    item.date === selectedDate
  )

  const soldOutByDate = filteredSoldOut.filter(item => 
    item.date === selectedDate
  )

  // Buat ID increment berdasarkan looping
  const tersediaWithIncrementId = tersediaByDate.map((item, index) => ({
    ...item,
    incrementId: (index + 1).toString()
  }))

  const soldOutWithIncrementId = soldOutByDate.map((item, index) => ({
    ...item,
    incrementId: (index + 1).toString()
  }))

  // Handle Tambah Data
  const handleAddItem = () => {
    if (newItemCode.trim() === '' || newItemPrice === '' || !newItemImage) return
    
    // Simulate file upload - in real app, you would upload to server
    const imageUrl = newItemPreview || '/default-image.jpeg'
    
    const newItem = {
      id: (tersediaItems.length + soldOutItems.length + 1).toString(),
      code: newItemCode,
      price: formatPrice(newItemPrice),
      image: imageUrl,
      status: "Tersedia",
      date: selectedDate
    }
    
    setTersediaItems([...tersediaItems, newItem])
    clearAddForm()
    setShowAddForm(false)
  }

  // Handle Edit Data
  const handleEditItem = () => {
    if (editItemCode.trim() === '' || editItemPrice === '' || (!editItemImage && !editItemPreview)) return
    
    // Use existing image if no new image uploaded, otherwise use new preview
    const imageUrl = editItemPreview || selectedItem?.image || '/default-image.jpeg'
    
    // Update di tersedia items
    const updatedTersedia = tersediaItems.map(item => 
      item.id === selectedItem.id 
        ? { 
            ...item, 
            code: editItemCode, 
            price: formatPrice(editItemPrice),
            image: imageUrl
          } 
        : item
    )
    
    // Update di sold out items
    const updatedSoldOut = soldOutItems.map(item => 
      item.id === selectedItem.id 
        ? { 
            ...item, 
            code: editItemCode, 
            price: formatPrice(editItemPrice),
            image: imageUrl
          } 
        : item
    )
    
    setTersediaItems(updatedTersedia)
    setSoldOutItems(updatedSoldOut)
    clearEditForm()
    setShowEditForm(false)
  }

  // Handle Hapus Data
  const handleDeleteItem = () => {
    const updatedTersedia = tersediaItems.filter(item => item.id !== selectedItem.id)
    const updatedSoldOut = soldOutItems.filter(item => item.id !== selectedItem.id)
    
    setTersediaItems(updatedTersedia)
    setSoldOutItems(updatedSoldOut)
    setShowDeleteConfirm(false)
    setSelectedItem(null)
  }

  // Handle Send Item (Pindah dari Tersedia ke Sold Out)
  const handleSendItem = () => {
    // Hapus dari tersedia
    const updatedTersedia = tersediaItems.filter(item => item.id !== selectedItem.id)
    
    // Tambah ke sold out dengan status Sold Out
    const sentItem = {
      ...selectedItem,
      status: "Sold Out",
      date: selectedDate
    }
    
    setTersediaItems(updatedTersedia)
    setSoldOutItems([...soldOutItems, sentItem])
    setShowSendConfirm(false)
    setSelectedItem(null)
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(parseInt(price))
  }

  // Buka form edit
  const openEditForm = (item) => {
    setSelectedItem(item)
    setEditItemCode(item.code)
    setEditItemPrice(item.price.replace(/\./g, ''))
    setEditItemPreview(item.image)
    setEditItemImage(null)
    setShowEditForm(true)
  }

  // Buka konfirmasi hapus
  const openDeleteConfirm = (item) => {
    setSelectedItem(item)
    setShowDeleteConfirm(true)
  }

  // Buka konfirmasi send
  const openSendConfirm = (item) => {
    setSelectedItem(item)
    setShowSendConfirm(true)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Sold Out':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Tersedia':
        return 'bx bx-check-circle'
      case 'Sold Out':
        return 'bx bx-x-circle'
      default:
        return 'bx bx-question-mark'
    }
  }

  // Render image
  const renderImage = (image) => {
    return (
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={image} 
          alt="Gambar item"
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
    )
  }

  return (
    <div className='space-y-4 xs:space-y-6 overflow-x-hidden min-h-screen bg-gray-50'>
      {/* Overlay dan Modal untuk Form Tambah Data */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowAddForm(false)
              clearAddForm()
            }}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tambah Data Item</h3>
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  clearAddForm()
                }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Item
                </label>
                <input
                  type="text"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan code item"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga
                </label>
                <input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan harga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {newItemPreview && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden">
                        <img 
                          src={newItemPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <i className='bx bx-cloud-upload text-2xl text-gray-400 mb-2'></i>
                      <p className="text-xs text-gray-500 text-center">
                        <span className="font-semibold text-amber-600">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAddImageUpload}
                    />
                  </label>
                  
                  {/* File Info */}
                  {newItemImage && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <i className='bx bx-check text-green-600'></i>
                        <span className="text-xs text-green-800 font-medium">
                          {newItemImage.name}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setNewItemImage(null)
                          setNewItemPreview('')
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  clearAddForm()
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemCode || !newItemPrice || !newItemImage}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                         disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Form Edit Data */}
      {showEditForm && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowEditForm(false)
              clearEditForm()
            }}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Data Item</h3>
              <button 
                onClick={() => {
                  setShowEditForm(false)
                  clearEditForm()
                }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Item
                </label>
                <input
                  type="text"
                  value={editItemCode}
                  onChange={(e) => setEditItemCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan code item"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga
                </label>
                <input
                  type="number"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan harga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar
                </label>
                <div className="space-y-3">
                  {/* Current Image */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs text-gray-500">Gambar Saat Ini:</span>
                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden">
                      <img 
                        src={selectedItem.image} 
                        alt="Current" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Image Preview for New Upload */}
                  {editItemPreview && editItemPreview !== selectedItem.image && (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-xs text-gray-500">Gambar Baru:</span>
                      <div className="w-16 h-16 rounded-lg border border-amber-200 overflow-hidden">
                        <img 
                          src={editItemPreview} 
                          alt="New Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <i className='bx bx-cloud-upload text-2xl text-gray-400 mb-2'></i>
                      <p className="text-xs text-gray-500 text-center">
                        <span className="font-semibold text-amber-600">Klik untuk upload gambar baru</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleEditImageUpload}
                    />
                  </label>
                  
                  {/* File Info */}
                  {editItemImage && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <i className='bx bx-check text-green-600'></i>
                        <span className="text-xs text-green-800 font-medium">
                          {editItemImage.name}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditItemImage(null)
                          setEditItemPreview(selectedItem.image)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowEditForm(false)
                  clearEditForm()
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditItem}
                disabled={!editItemCode || !editItemPrice || (!editItemImage && !editItemPreview)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                         disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Konfirmasi Hapus */}
      {showDeleteConfirm && selectedItem && (
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
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Data Item</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus item <span className="font-semibold text-amber-700">{selectedItem.code}</span>? Tindakan ini tidak dapat dibatalkan.
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
                onClick={handleDeleteItem}
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

      {/* Overlay dan Modal untuk Konfirmasi Send */}
      {showSendConfirm && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSendConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <i className='bx bx-send text-2xl text-blue-600'></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Kirim Item</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin mengirim item <span className="font-semibold text-amber-700">{selectedItem.code}</span>? Item akan dipindahkan ke Sold Out.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSendConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSendItem}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                         hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Ya, Kirim
              </button>
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
              onClick={handleItemRefresh}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-package text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Item</span>
            </button>
          </div>
        </div>
        
        {/* Title dan Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">ITEM</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Kelola data item dengan mudah dan efisien</p>
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

      {/* Content */}
      <div className="space-y-8 px-3 xs:px-4 sm:px-6">
        
        {/* Table Tersedia */}
        <div className="bg-white rounded-2xl p-3 xs:p-4 sm:p-6 lg:p-8 
                       shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                       border border-amber-100">
          {/* Header Section Tersedia dengan Search dan Tambah Data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg xs:text-xl font-bold text-gray-800">Tersedia ({tersediaWithIncrementId.length})</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className='bx bx-search text-gray-400 text-sm xs:text-base'></i>
                </div>
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 xs:py-2.5 lg:py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-xs xs:text-sm lg:text-base placeholder-gray-400"
                />
              </div>
              
              {/* Tombol Tambah Data */}
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         px-4 py-2 xs:px-6 xs:py-3 rounded-2xl font-semibold text-sm xs:text-base
                         shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                         flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <i className='bx bx-plus text-lg xs:text-xl'></i>
                <span className="hidden xs:inline">Tambah Data</span>
              </button>
            </div>
          </div>

          {/* Desktop Table Tersedia */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="h-[40vh] min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full min-w-full hidden md:table">
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
                          Code Item
                          <button className="text-amber-200 hover:text-white transition-colors">
                            <i className='bx bx-sort text-xs'></i>
                          </button>
                        </div>
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Harga
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Gambar
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Status
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Tanggal
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl">
                        Aksi
                      </th>
                    </tr>
                    <tr>
                      <td colSpan="7" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                    </tr>
                  </thead>
                  <tbody>
                    {tersediaWithIncrementId.map((item) => (
                      <tr key={item.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                          {item.incrementId}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                          {item.code}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-semibold">
                          Rp {item.price}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          {renderImage(item.image)}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            <i className={getStatusIcon(item.status)}></i>
                            {item.status}
                          </div>
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm">
                          {new Date(item.date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openEditForm(item)}
                              className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <i className='bx bx-edit text-lg'></i>
                            </button>
                            <button 
                              onClick={() => openDeleteConfirm(item)}
                              className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <i className='bx bx-trash text-lg'></i>
                            </button>
                            <button 
                              onClick={() => openSendConfirm(item)}
                              className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                              title="Send"
                            >
                              <i className='bx bx-send text-lg'></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile List Tersedia */}
                <div className="md:hidden space-y-3">
                  {tersediaWithIncrementId.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-green-100 
                                                shadow-[0_4px_12px_rgba(34,197,94,0.1)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.15)] 
                                                transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {renderImage(item.image)}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">{item.code}</h3>
                            <p className="text-gray-500 text-xs truncate">No: {item.incrementId}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          <i className={getStatusIcon(item.status)}></i>
                          {item.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold">Rp {item.price}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(item.date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => openEditForm(item)}
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <i className='bx bx-edit text-base'></i>
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(item)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            <i className='bx bx-trash text-base'></i>
                          </button>
                          <button 
                            onClick={() => openSendConfirm(item)}
                            className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                            title="Send"
                          >
                            <i className='bx bx-send text-base'></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Sold Out */}
        <div className="bg-white rounded-2xl p-3 xs:p-4 sm:p-6 lg:p-8 
                       shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                       border border-amber-100">
          {/* Header Section Sold Out */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg xs:text-xl font-bold text-gray-800">Sold Out ({soldOutWithIncrementId.length})</h2>
            </div>
          </div>

          {/* Desktop Table Sold Out */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="h-[40vh] min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full min-w-full hidden md:table">
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
                          Code Item
                          <button className="text-amber-200 hover:text-white transition-colors">
                            <i className='bx bx-sort text-xs'></i>
                          </button>
                        </div>
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Harga
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Gambar
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Status
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                        Tanggal
                      </th>
                      <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl">
                        Aksi
                      </th>
                    </tr>
                    <tr>
                      <td colSpan="7" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                    </tr>
                  </thead>
                  <tbody>
                    {soldOutWithIncrementId.map((item) => (
                      <tr key={item.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                          {item.incrementId}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                          {item.code}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-semibold">
                          Rp {item.price}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          {renderImage(item.image)}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            <i className={getStatusIcon(item.status)}></i>
                            {item.status}
                          </div>
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm">
                          {new Date(item.date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 xs:py-4 px-2 xs:px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openDeleteConfirm(item)}
                              className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <i className='bx bx-trash text-lg'></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile List Sold Out */}
                <div className="md:hidden space-y-3">
                  {soldOutWithIncrementId.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-red-100 
                                                shadow-[0_4px_12px_rgba(239,68,68,0.1)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.15)] 
                                                transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {renderImage(item.image)}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">{item.code}</h3>
                            <p className="text-gray-500 text-xs truncate">No: {item.incrementId}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          <i className={getStatusIcon(item.status)}></i>
                          {item.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold">Rp {item.price}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(item.date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => openDeleteConfirm(item)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            <i className='bx bx-trash text-base'></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Item