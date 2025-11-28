// components/AkunUsers.jsx
import React, { useState, useEffect } from 'react'
import { 
  getAllUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  forceUserLogin,
  initializeAkunUsersSocket,
  cleanupAkunUsersSocket,
  setUsersUpdateCallback
} from '../../api/Api_AkunUsers'

const AkunUsers = ({ onNavigate }) => {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUserName, setNewUserName] = useState('')
  const [newUserDate, setNewUserDate] = useState('')
  const [editUserName, setEditUserName] = useState('')
  const [editUserDate, setEditUserDate] = useState('')
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [akunUsers, setAkunUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Initialize socket and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        
        // Initialize socket
        const userSocket = initializeAkunUsersSocket()
        setSocket(userSocket)
        
        // Set callback for real-time updates
        setUsersUpdateCallback((users) => {
          console.log('🔄 Real-time update received in component:', users)
          setAkunUsers(users)
        })
        
        // Load initial data
        await loadUsersData()
        
      } catch (error) {
        console.error('❌ Error initializing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()

    // Cleanup on unmount
    return () => {
      cleanupAkunUsersSocket()
      setUsersUpdateCallback(null)
    }
  }, [])

  // Load users data from backend
  const loadUsersData = async () => {
    try {
      console.log('📥 Loading users data from backend...')
      const users = await getAllUsers()
      setAkunUsers(users)
      console.log('✅ Users data loaded successfully:', users.length)
    } catch (error) {
      console.error('❌ Failed to load users data:', error)
      alert('Gagal memuat data users. Silakan refresh halaman.')
    }
  }

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard')
    }
  }

  const handleAkunUsersRefresh = () => {
    setSearchTerm('')
    loadUsersData()
  }

  const years = ['2025', '2026', '2027', '2028', '2029', '2030']

  const filteredUsers = akunUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.includes(searchTerm)
  )

  // Filter users berdasarkan tahun yang dipilih
  const usersByYear = filteredUsers.filter(user => {
    const userYear = new Date(user.date).getFullYear().toString()
    return userYear.includes(selectedYear)
  })

  // Handle Tambah Data
  const handleAddUser = async () => {
    if (newUserName.trim() === '' || newUserDate === '') {
      alert('Nama dan tanggal harus diisi')
      return
    }
    
    try {
      setIsLoading(true)
      
      const newUserData = {
        name: newUserName,
        date: newUserDate
      }
      
      await addUser(newUserData)
      
      setNewUserName('')
      setNewUserDate('')
      setShowAddForm(false)
      
      // Data akan otomatis update via socket
      alert('User berhasil ditambahkan!')
      
    } catch (error) {
      console.error('❌ Error adding user:', error)
      alert('Gagal menambahkan user: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit Data
  const handleEditUser = async () => {
    if (editUserName.trim() === '' || editUserDate === '') {
      alert('Nama dan tanggal harus diisi')
      return
    }
    
    try {
      setIsLoading(true)
      
      const updatedUserData = {
        name: editUserName,
        date: editUserDate
      }
      
      await updateUser(selectedUser._id, updatedUserData)
      
      setEditUserName('')
      setEditUserDate('')
      setShowEditForm(false)
      setSelectedUser(null)
      
      // Data akan otomatis update via socket
      alert('User berhasil diupdate!')
      
    } catch (error) {
      console.error('❌ Error updating user:', error)
      alert('Gagal mengupdate user: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Hapus Data
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setIsLoading(true)
      
      await deleteUser(selectedUser._id)
      
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      setShowUserDetail(false)
      
      // Data akan otomatis update via socket
      alert('User berhasil dihapus!')
      
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      alert('Gagal menghapus user: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Force User Login
  const handleForceLogin = async (user) => {
    try {
      setIsLoading(true)
      
      await forceUserLogin(user._id)
      
      // Data akan otomatis update via socket
      alert(`User ${user.name} berhasil di-set sebagai login!`)
      
    } catch (error) {
      console.error('❌ Error forcing user login:', error)
      alert('Gagal mengupdate status login: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Format date dari input date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Format date untuk display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Format last login untuk display
  const formatLastLogin = (user) => {
    if (user.loginstatus) {
      return "Login"
    }
    
    const lastLogin = new Date(user.lastlogin)
    const now = new Date()
    const diffMs = now - lastLogin
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) {
      return `Terakhir Login ${diffMins} menit yang lalu`
    } else if (diffHours < 24) {
      return `Terakhir Login ${diffHours} jam yang lalu`
    } else if (diffDays === 1) {
      return "Terakhir Login Kemarin"
    } else {
      return `Terakhir Login ${diffDays} hari lalu`
    }
  }

  // Buka form edit
  const openEditForm = (user) => {
    setSelectedUser(user)
    setEditUserName(user.name)
    // Convert date string back to input format
    const date = new Date(user.date)
    const formattedDate = date.toISOString().split('T')[0]
    setEditUserDate(formattedDate)
    setShowEditForm(true)
    setShowUserDetail(false)
  }

  // Buka konfirmasi hapus
  const openDeleteConfirm = (user) => {
    setSelectedUser(user)
    setShowDeleteConfirm(true)
    setShowUserDetail(false)
  }

  // Buka detail user
  const openUserDetail = (user) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  return (
    <div className='space-y-4 xs:space-y-6 overflow-x-hidden min-h-screen bg-gray-50'>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Memuat data...</span>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Form Tambah Data */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddForm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tambah Data User</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama User
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan nama user"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Bergabung
                </label>
                <input
                  type="date"
                  value={newUserDate}
                  onChange={(e) => setNewUserDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Form Edit Data */}
      {showEditForm && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowEditForm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-6 xs:p-8 w-full max-w-md 
                         shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Data User</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama User
                </label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm placeholder-gray-400"
                  placeholder="Masukkan nama user"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Bergabung
                </label>
                <input
                  type="date"
                  value={editUserDate}
                  onChange={(e) => setEditUserDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleEditUser}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Konfirmasi Hapus */}
      {showDeleteConfirm && selectedUser && (
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
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Data User</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus data <span className="font-semibold text-amber-700">{selectedUser.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)]
                         hover:from-red-700 hover:to-red-800 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dan Modal untuk Detail User (Mobile Only) */}
      {showUserDetail && selectedUser && isMobile && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowUserDetail(false)}
          ></div>
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden
                         shadow-[0_-20px_60px_rgba(0,0,0,0.3)] border border-amber-100
                         animate-slideUp sm:animate-scaleIn">
            {/* Header dengan Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-amber-100 bg-white sticky top-0">
              <h3 className="text-xl font-bold text-gray-800">Detail User</h3>
              <button 
                onClick={() => setShowUserDetail(false)}
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
                    <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                    <p className="text-gray-600">ID: {selectedUser._id}</p>
                  </div>
                </div>

                {/* Informasi Detail */}
                <div className="grid gap-4">
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-calendar text-amber-600 text-lg'></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Tanggal Bergabung</h4>
                        <p className="text-gray-600 text-sm">{formatDisplayDate(selectedUser.date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <i className='bx bx-user-check text-amber-600 text-lg'></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Status Login</h4>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${
                          selectedUser.loginstatus 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {selectedUser.loginstatus ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              {formatLastLogin(selectedUser)}
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {formatLastLogin(selectedUser)}
                            </>
                          )}
                        </div>
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
                  onClick={() => handleForceLogin(selectedUser)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white 
                           rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(34,197,94,0.3)]
                           hover:from-green-700 hover:to-green-800 transition-all duration-200
                           flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className='bx bx-log-in text-lg'></i>
                  Set Login
                </button>
                <button
                  onClick={() => openEditForm(selectedUser)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                           rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                           hover:from-blue-700 hover:to-blue-800 transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <i className='bx bx-edit text-lg'></i>
                  Edit
                </button>
                <button
                  onClick={() => openDeleteConfirm(selectedUser)}
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
              onClick={handleAkunUsersRefresh}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-user text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Akun User</span>
            </button>
          </div>
        </div>
        
        {/* Title dan Year Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">AKUN USER</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Kelola data akun user dengan mudah dan efisien</p>
          </div>
          
          <div className="relative mt-3 xs:mt-4 md:mt-0">
            <button 
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="bg-gradient-to-br from-amber-600 to-amber-700 border rounded-xl px-3 xs:px-4 py-2 xs:py-2.5 
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200 w-full md:w-auto"
            >
              <div className="text-xs xs:text-sm text-white text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                <i className='bx bx-calendar text-xs xs:text-sm'></i>
                Data Akun Tahun {selectedYear}
              </div>
            </button>
            
            {/* Year Picker Modal */}
            {showYearPicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-amber-200 rounded-xl 
                            shadow-[0_10px_30px_rgba(186,118,48,0.2)] z-10 p-3 min-w-[140px] w-full md:w-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Pilih Tahun</h3>
                  <button 
                    onClick={() => setShowYearPicker(false)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <i className='bx bx-x text-lg'></i>
                  </button>
                </div>
                <div className="space-y-1">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year)
                        setShowYearPicker(false)
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg transition-colors text-sm ${
                        selectedYear === year 
                          ? 'bg-amber-100 text-amber-700 font-semibold' 
                          : 'hover:bg-amber-50 text-gray-700'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
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
              placeholder="Cari user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 xs:py-2.5 lg:py-3 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-amber-500 focus:border-transparent
                       bg-gray-50 hover:bg-white transition-colors duration-200
                       text-xs xs:text-sm lg:text-base placeholder-gray-400"
            />
          </div>
          
          <div className="text-xs xs:text-sm text-gray-500 text-center sm:text-left">
            Menampilkan {usersByYear.length} user
          </div>
        </div>

        {/* Table Container dengan Scroll */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="h-[60vh] min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
              {/* Desktop Table */}
              <table className="w-full min-w-full hidden md:table">
                <thead>
                  <tr className="sticky top-0">
                    <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tl-2xl">
                      <div className="flex items-center gap-1">
                        ID
                        <button className="text-amber-200 hover:text-white transition-colors">
                          <i className='bx bx-sort text-xs'></i>
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      <div className="flex items-center gap-1">
                        Nama
                        <button className="text-amber-200 hover:text-white transition-colors">
                          <i className='bx bx-sort text-xs'></i>
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      <div className="flex items-center gap-1">
                        Tanggal Bergabung
                        <button className="text-amber-200 hover:text-white transition-colors">
                          <i className='bx bx-sort text-xs'></i>
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600">
                      <div className="flex items-center gap-1">
                        Status Login
                        <button className="text-amber-200 hover:text-white transition-colors">
                          <i className='bx bx-sort text-xs'></i>
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-4 xs:py-5 px-2 xs:px-4 text-white font-semibold text-xs lg:text-sm whitespace-nowrap bg-gradient-to-br from-amber-600 to-amber-600 rounded-tr-2xl">
                      Aksi
                    </th>
                  </tr>
                  {/* Blur effect di bawah thead */}
                  <tr>
                    <td colSpan="5" className="h-2 bg-gradient-to-b from-amber-600/20 to-transparent backdrop-blur-sm"></td>
                  </tr>
                </thead>
                <tbody>
                  {usersByYear.map((user) => (
                    <tr key={user._id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                      <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                        {user._id.substring(0, 8)}...
                      </td>
                      <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                        flex items-center justify-center text-white flex-shrink-0">
                            <i className='bx bx-user text-sm'></i>
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-600 text-xs lg:text-sm">
                        <div className="flex items-center gap-2">
                          <i className='bx bx-calendar text-gray-400 text-xs'></i>
                          {formatDisplayDate(user.date)}
                        </div>
                      </td>
                      <td className="py-3 xs:py-4 px-2 xs:px-4">
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            user.loginstatus 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {user.loginstatus ? (
                              <>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {formatLastLogin(user)}
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                {formatLastLogin(user)}
                              </>
                            )}
                          </div>
                          <button 
                            onClick={() => handleForceLogin(user)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Set sebagai login"
                          >
                            <i className='bx bx-log-in text-sm'></i>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 xs:py-4 px-2 xs:px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditForm(user)}
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <i className='bx bx-edit text-lg'></i>
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(user)}
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

              {/* Mobile List */}
              <div className="md:hidden space-y-3">
                {usersByYear.map((user) => (
                  <div key={user._id} className="bg-white rounded-2xl p-4 border border-amber-100 
                                              shadow-[0_4px_12px_rgba(186,118,48,0.1)] hover:shadow-[0_6px_20px_rgba(186,118,48,0.15)] 
                                              transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 
                                      flex items-center justify-center text-white flex-shrink-0">
                          <i className='bx bx-user text-base'></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{user.name}</h3>
                          <p className="text-gray-500 text-xs truncate">ID: {user._id.substring(0, 8)}...</p>
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs mt-1 ${
                            user.loginstatus 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.loginstatus ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                {formatLastLogin(user)}
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                {formatLastLogin(user)}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openUserDetail(user)}
                        className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors flex-shrink-0 ml-2"
                      >
                        <i className='bx bx-show text-xl'></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {usersByYear.length === 0 && !isLoading && (
                <div className="py-8 xs:py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <i className='bx bx-user-x text-4xl xs:text-5xl mb-3'></i>
                    <p className="text-sm xs:text-base font-medium">Tidak ada user yang ditemukan</p>
                    <p className="text-xs xs:text-sm mt-1">Coba ubah kata kunci pencarian atau tahun</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Tambah Data */}
        <div className="mt-4 xs:mt-6 pt-4 border-t border-amber-100">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                     px-6 py-3 rounded-2xl font-semibold text-sm xs:text-base
                     shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]
                     hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                     flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <i className='bx bx-plus text-lg xs:text-xl'></i>
            Tambah Data User
          </button>
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

export default AkunUsers