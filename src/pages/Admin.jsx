// Admin.jsx - Updated dengan login real
import React, { useState, useRef } from 'react'
import Navigasi from '../components/admin/Navigasi'
import Dashboard from '../components/admin/Dashboard'
import AkunUsers from '../components/admin/AkunUsers'
import Orders from '../components/admin/Orders'
import Laporan from '../components/admin/Laporan'
import Item from '../components/admin/Item'
import Chat from '../components/admin/Chat'
import { loginAdmin, clearAdminStorage } from '../api/Api_admin'

const Admin = () => {
  const [activePage, setActivePage] = useState('Dashboard')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [adminData, setAdminData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const loginCardRef = useRef(null)

  const renderContent = () => {
    switch(activePage) {
      case 'Dashboard': return <Dashboard />
      case 'Chat': return <Chat onNavigate={setActivePage} />
      case 'Akun Users': return <AkunUsers onNavigate={setActivePage} />
      case 'Orders': return <Orders onNavigate={setActivePage} />
      case 'Laporan': return <Laporan onNavigate={setActivePage} />
      case 'Item': return <Item onNavigate={setActivePage} />
      default: return <Dashboard />
    }
  }

  // Check existing session on component mount
  React.useEffect(() => {
    const savedAdminData = localStorage.getItem('adminData')
    if (savedAdminData) {
      try {
        const admin = JSON.parse(savedAdminData)
        setAdminData(admin)
        setShowLoginModal(false)
        console.log('✅ Admin session restored:', admin.name)
      } catch (error) {
        console.error('❌ Error restoring admin session:', error)
        clearAdminStorage()
      }
    }
  }, [])

  const handleLogout = () => {
    console.log('Logout clicked')
    clearAdminStorage()
    setAdminData(null)
    setShowLoginModal(true)
    setShowLogoutModal(false)
    setLoginError('') // Reset error saat logout
  }

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }

  const handleNavItemClick = (item) => {
    setActivePage(item)
    setIsMobileNavOpen(false)
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('') // Reset error sebelumnya
    
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      console.log('Admin login attempt:', email)
      
      const result = await loginAdmin(email, password)

      if (result.success) {
        console.log('Admin login successful:', result.data)
        
        // Save admin data to localStorage
        localStorage.setItem('adminData', JSON.stringify(result.data))
        
        setAdminData(result.data)
        setShowLoginModal(false)
        
        // Show success message
        alert(`Login berhasil! Selamat datang ${result.data.name}`)
      } else {
        setLoginError(result.message || 'Login gagal')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      setLoginError('Terjadi kesalahan saat login. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // 3D Mouse Move Effect
  const handleMouseMove = (e) => {
    if (!loginCardRef.current) return
    
    const card = loginCardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateY = (x - centerX) / 25
    const rotateX = (centerY - y) / 25
    
    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg)
      scale3d(1.02, 1.02, 1.02)
    `
  }

  const handleMouseLeave = () => {
    if (loginCardRef.current) {
      loginCardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
    }
  }

  return (
    <>
      {/* Main Content - hanya tampil jika sudah login */}
      {!showLoginModal && (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-6 flex gap-4 md:gap-6 relative">
          {/* Mobile Toggle Button - Kecil */}
          <button
            onClick={handleMobileNavToggle}
            className="fixed top-4 right-4 z-50 md:hidden bg-amber-600 text-white p-2 rounded-lg shadow-lg hover:bg-amber-700 transition-colors"
          >
            <i className={`bx ${isMobileNavOpen ? 'bx-x' : 'bx-menu'} text-lg`}></i>
          </button>

          {/* Sidebar Navigasi */}
          <div className={`
            fixed md:relative z-40 transform transition-transform duration-300 ease-in-out
            ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            w-80
          `}>
            <Navigasi 
              activePage={activePage}
              setActivePage={handleNavItemClick}
              setShowLogoutModal={setShowLogoutModal}
              adminData={adminData}
            />
          </div>
          
          {/* Mobile Overlay */}
          {isMobileNavOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsMobileNavOpen(false)}
            ></div>
          )}
          
          {/* Content Area - Ada jarak dengan navigasi */}
          <div className="flex-1">
            <div className="w-full h-[93.5vh] bg-white rounded-2xl shadow-2xl p-6 md:p-8 overflow-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal - Muncul pertama kali atau setelah logout */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
          <div 
            ref={loginCardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out border border-gray-200 overflow-hidden relative"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Effect Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-400/3 rounded-3xl"></div>
            
            {/* Header */}
            <div 
              className="bg-gradient-to-br from-amber-700 to-amber-600 p-8 text-center relative overflow-hidden"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-800/40 to-amber-500/30"></div>
              
              <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
                <div 
                  className="w-20 h-20 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/20"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <i className="bx bx-lock-alt text-white text-3xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Login Admin</h2>
                <p className="text-amber-100 text-sm">Masukkan data login Anda untuk melanjutkan</p>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="p-8 bg-white relative">
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="bx bx-envelope text-gray-500"></i>
                    </div>
                    <input
                      type="email"
                      name="email"
                      className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Masukkan email admin"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="bx bx-lock-alt text-gray-500"></i>
                    </div>
                    <input
                      type="password"
                      name="password"
                      className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    <div className="flex items-center">
                      <i className="bx bx-error-circle mr-2"></i>
                      {loginError}
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-br from-amber-700 to-amber-600 text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>PROSES LOGIN...</span>
                    </div>
                  ) : (
                    'SIGN IN ADMIN'
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-6 text-center border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 font-medium">
                Raharpa Shopp • © 2025
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl transform scale-100 animate-fade-in max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Logout Admin</h3>
              <p className="text-gray-600 mb-6">Apakah Anda yakin ingin logout?</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Admin