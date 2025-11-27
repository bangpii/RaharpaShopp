import React, { useState, useEffect } from 'react'

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

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard')
    }
  }

  const handleAkunUsersRefresh = () => {
    setSearchTerm('')
  }

  // Data akun users
  const [akunUsers, setAkunUsers] = useState([
    {
      id: "1",
      name: "Baihaqie Ar Rafi",
      date: "19 November 2025",
      loginStatus: "online",
      lastLogin: "Login"
    },
    {
      id: "2",
      name: "Rahima Maisarah",
      date: "19 November 2025",
      loginStatus: "offline",
      lastLogin: "Terakhir Login 19.00 yang lalu"
    },
    {
      id: "3",
      name: "Gabriel Silitonga",
      date: "18 November 2025",
      loginStatus: "offline",
      lastLogin: "Terakhir Login Kemarin"
    },
    {
      id: "4",
      name: "Jarjit Shings",
      date: "19 November 2025",
      loginStatus: "online",
      lastLogin: "Login"
    },
    {
      id: "5",
      name: "Sarah Johnson",
      date: "17 November 2025",
      loginStatus: "offline",
      lastLogin: "Terakhir Login 3 hari lalu"
    },
    {
      id: "6",
      name: "Michael Chen",
      date: "16 November 2025",
      loginStatus: "online",
      lastLogin: "Login"
    },
    {
      id: "7",
      name: "Lisa Anderson",
      date: "15 Maret 2026",
      loginStatus: "online",
      lastLogin: "Login"
    },
    {
      id: "8",
      name: "Tukul Nono",
      date: "15 Maret 2025",
      loginStatus: "online",
      lastLogin: "Login"
    }
  ])

  

  const years = ['2025', '2026', '2027', '2028', '2029', '2030']

  const filteredUsers = akunUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  )

  // Filter users berdasarkan tahun yang dipilih
  const usersByYear = filteredUsers.filter(user => 
    user.date.includes(selectedYear)
  )

  // Handle Tambah Data
  const handleAddUser = () => {
    if (newUserName.trim() === '' || newUserDate === '') return
    
    const newUser = {
      id: (akunUsers.length + 1).toString(),
      name: newUserName,
      date: formatDate(newUserDate),
      loginStatus: "offline",
      lastLogin: "Belum pernah login"
    }
    
    setAkunUsers([...akunUsers, newUser])
    setNewUserName('')
    setNewUserDate('')
    setShowAddForm(false)
  }

  // Handle Edit Data
  const handleEditUser = () => {
    if (editUserName.trim() === '' || editUserDate === '') return
    
    const updatedUsers = akunUsers.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            name: editUserName, 
            date: formatDate(editUserDate) 
          } 
        : user
    )
    
    setAkunUsers(updatedUsers)
    setEditUserName('')
    setEditUserDate('')
    setShowEditForm(false)
    setSelectedUser(null)
  }

  // Handle Hapus Data
  const handleDeleteUser = () => {
    const updatedUsers = akunUsers.filter(user => user.id !== selectedUser.id)
    setAkunUsers(updatedUsers)
    setShowDeleteConfirm(false)
    setSelectedUser(null)
    setShowUserDetail(false)
  }

  // Format date dari input date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Buka form edit
  const openEditForm = (user) => {
    setSelectedUser(user)
    setEditUserName(user.name)
    // Convert date string back to input format
    const dateParts = user.date.split(' ')
    const months = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
      'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    }
    const formattedDate = `${dateParts[2]}-${months[dateParts[1]]}-${dateParts[0].padStart(2, '0')}`
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
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 
                         rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                         rounded-2xl font-semibold text-sm shadow-[0_4px_12px_rgba(186,118,48,0.3)]
                         hover:from-amber-700 hover:to-amber-800 transition-all duration-200"
              >
                Simpan
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
                />
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
                onClick={handleEditUser}
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
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
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
                    <p className="text-gray-600">ID: {selectedUser.id}</p>
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
                        <p className="text-gray-600 text-sm">{selectedUser.date}</p>
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
                          selectedUser.loginStatus === 'online' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {selectedUser.loginStatus === 'online' ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              {selectedUser.lastLogin}
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {selectedUser.lastLogin}
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
                    <tr key={user.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors duration-200">
                      <td className="py-3 xs:py-4 px-2 xs:px-4 text-gray-800 text-xs lg:text-sm font-medium">
                        {user.id}
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
                          {user.date}
                        </div>
                      </td>
                      <td className="py-3 xs:py-4 px-2 xs:px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.loginStatus === 'online' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {user.loginStatus === 'online' ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              {user.lastLogin}
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {user.lastLogin}
                            </>
                          )}
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
                  <div key={user.id} className="bg-white rounded-2xl p-4 border border-amber-100 
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
                          <p className="text-gray-500 text-xs truncate">ID: {user.id}</p>
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
              
              {usersByYear.length === 0 && (
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