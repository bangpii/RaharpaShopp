// User.jsx - Enhanced untuk Vercel
import React, { useState, useEffect, useRef } from 'react'
import Header from '../components/user/Header'
import Title from '../components/user/Title'
import ChatRoom from '../components/user/ChatRoom'
import WishList from '../components/user/WishList'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { 
  loginUser, 
  logoutUser, 
  initializeSocket, 
  setupSocketListeners, 
  cleanupSocketListeners,
  joinUserRoom
} from '../api/Api_loginUsers';

const User = () => {
  const [showWishlist, setShowWishlist] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const loginCardRef = useRef(null)
  
  // Use ref untuk track initialization
  const initializedRef = useRef(false)
  const sessionCheckedRef = useRef(false)

  // Session configuration - 1 MINGGU
  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milliseconds

  // FIXED: Enhanced Persistent Login untuk Vercel
  useEffect(() => {
    if (sessionCheckedRef.current) return;
    
    const validateAndRestoreSession = () => {
      try {
        const savedUserData = localStorage.getItem('userData')
        const sessionTimestamp = localStorage.getItem('sessionTimestamp')
        
        console.log('🔄 Checking session in Vercel...', { 
          hasUserData: !!savedUserData, 
          hasTimestamp: !!sessionTimestamp 
        })
        
        if (savedUserData && sessionTimestamp) {
          const user = JSON.parse(savedUserData)
          const sessionAge = Date.now() - parseInt(sessionTimestamp)
          
          // Cek jika session expired (1 minggu)
          if (sessionAge > SESSION_DURATION) {
            console.log('🕒 Session expired (1 minggu), auto logout')
            performCleanLogout()
            return
          }
          
          console.log('✅ Session valid, restoring user:', user.name)
          setUserData(user)
          setShowLoginModal(false)
          
          // Update session timestamp untuk memperpanjang
          localStorage.setItem('sessionTimestamp', Date.now().toString())
          
        } else {
          // VERCEL FIX: Jika ada userData tapi tidak ada timestamp, buat timestamp
          if (savedUserData && !sessionTimestamp) {
            console.log('⚠️ Vercel fix: Creating session timestamp')
            localStorage.setItem('sessionTimestamp', Date.now().toString())
            const user = JSON.parse(savedUserData)
            setUserData(user)
            setShowLoginModal(false)
          } else {
            performCleanLogout()
          }
        }
      } catch (error) {
        console.error('❌ Error restoring session in Vercel:', error)
        performCleanLogout()
      }
      
      sessionCheckedRef.current = true
    }

    // Delay sedikit untuk memastikan localStorage ready di Vercel
    setTimeout(validateAndRestoreSession, 100)
  }, [SESSION_DURATION])

  // Clean logout tanpa API call
  const performCleanLogout = () => {
    localStorage.removeItem('userData')
    localStorage.removeItem('sessionTimestamp')
    sessionStorage.removeItem('userSession')
    setUserData(null)
    setShowLoginModal(true)
    console.log('🧹 Clean logout performed')
  }

  // Enhanced cleanup untuk mobile - Hanya untuk manual logout
  const enhancedCleanup = () => {
    localStorage.removeItem('userData')
    localStorage.removeItem('sessionTimestamp')
    sessionStorage.removeItem('userSession')
    setUserData(null)
    setShowLoginModal(true)
    console.log('🚀 Enhanced cleanup completed')
  }

  // FIXED: Initialize AOS dan Socket - Optimized untuk Vercel
  useEffect(() => {
    if (initializedRef.current) return;
    
    console.log('🚀 Initializing App in Vercel...')
    
    // Initialize AOS
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })

    // Initialize Socket.IO connection dengan retry mechanism
    const initializeSocketWithRetry = () => {
      try {
        const newSocket = initializeSocket();
        setSocket(newSocket);

        setupSocketListeners(newSocket, {
          onUserLoggedIn: (data) => {
            console.log('User logged in via socket:', data);
          },
          onUserLoggedOut: (data) => {
            console.log('User logged out via socket:', data);
          },
          onUsersUpdated: (users) => {
            console.log('Users list updated via socket:', users);
          },
          onError: (error) => {
            console.warn('Socket error:', error);
          }
        });
      } catch (error) {
        console.warn('Failed to initialize socket, retrying...:', error);
        // Retry setelah 2 detik
        setTimeout(initializeSocketWithRetry, 2000);
      }
    }

    initializeSocketWithRetry();
    initializedRef.current = true;

    // Cleanup on unmount
    return () => {
      if (socket) {
        cleanupSocketListeners(socket);
        if (socket.close) {
          socket.close();
        }
      }
    };
  }, [socket])

  // FIXED: Enhanced activity tracking untuk Vercel
  useEffect(() => {
    if (!userData) return;

    const updateSessionTimestamp = () => {
      const currentTime = Date.now().toString();
      localStorage.setItem('sessionTimestamp', currentTime);
      console.log('🕒 Session timestamp updated:', new Date(parseInt(currentTime)).toLocaleString());
    };

    // Event listeners untuk user activity
    const activities = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    
    const handleUserActivity = () => {
      updateSessionTimestamp();
    };

    // Attach event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, handleUserActivity, { passive: true });
    });

    // Juga update session secara periodic
    const activityInterval = setInterval(updateSessionTimestamp, 10 * 60 * 1000); // Update setiap 10 menit

    // Update session saat component mount
    updateSessionTimestamp();

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleUserActivity);
      });
      clearInterval(activityInterval);
    };
  }, [userData]);

  // FIXED: Periodic session check - Optimized untuk Vercel
  useEffect(() => {
    if (!userData) return;

    const checkSession = () => {
      try {
        const sessionTimestamp = localStorage.getItem('sessionTimestamp');
        const savedUserData = localStorage.getItem('userData');
        
        if (sessionTimestamp && savedUserData) {
          const sessionAge = Date.now() - parseInt(sessionTimestamp);
          if (sessionAge > SESSION_DURATION) {
            console.log('⏰ Vercel: Session expired, logging out...');
            performCleanLogout();
            alert('Session telah berakhir. Silakan login kembali.');
          } else {
            // Debug info
            const daysLeft = (SESSION_DURATION - sessionAge) / (24 * 60 * 60 * 1000);
            console.log('🔍 Vercel Session Check:', {
              age: Math.round(sessionAge / 1000 / 60) + ' minutes',
              daysLeft: daysLeft.toFixed(2) + ' days remaining'
            });
          }
        }
      } catch (error) {
        console.error('Error in session check:', error);
      }
    };

    // Check setiap 5 menit di Vercel
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Check sekali saat component mount
    checkSession();

    return () => clearInterval(interval);
  }, [userData, SESSION_DURATION]);

  // Disable scroll ketika modal muncul
  useEffect(() => {
    if (showLoginModal || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal, showLogoutModal]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    const name = formData.get('name');

    try {
      console.log('User login attempt:', name);
      
      const result = await loginUser(name);

      if (result.success) {
        console.log('Login successful:', result.data);
        
        // Enhanced storage dengan session 1 minggu - VERCEL COMPATIBLE
        const now = Date.now();
        localStorage.setItem('userData', JSON.stringify(result.data));
        localStorage.setItem('sessionTimestamp', now.toString());
        
        setUserData(result.data);
        setShowLoginModal(false);
        
        // Join user room dengan Socket.IO
        if (socket) {
          joinUserRoom(socket, result.data.id);
        }
        
        // Show success message
        alert(`Login berhasil! Session akan aktif selama 1 minggu.`);
      } else {
        alert('Login gagal: ' + result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    if (!userData) return;

    try {
      // Coba logout via API, tapi jangan block jika gagal
      await logoutUser(userData.id);
      console.log('Logout API success');
    } catch (error) {
      console.warn('Logout API error (non-critical):', error);
      // Tetap lanjut cleanup lokal meski API gagal
    } finally {
      // Always cleanup locally - INI YANG BUAT LOGOUT BENAR-BENAR TERJADI
      enhancedCleanup();
      setShowLogoutModal(false);
      alert('Logout berhasil');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // 3D Mouse Move Effect
  const handleMouseMove = (e) => {
    if (!loginCardRef.current) return;
    
    const card = loginCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = (x - centerX) / 25;
    const rotateX = (centerY - y) / 25;
    
    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
  };

  const handleMouseLeave = () => {
    if (loginCardRef.current) {
      loginCardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  // Debug info - Vercel compatible
  useEffect(() => {
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    if (sessionTimestamp && userData) {
      const sessionAge = Date.now() - parseInt(sessionTimestamp);
      const daysLeft = (SESSION_DURATION - sessionAge) / (24 * 60 * 60 * 1000);
      console.log('🔍 Session Debug Info:', {
        user: userData.name,
        age: Math.round(sessionAge / 1000 / 60) + ' minutes',
        daysLeft: daysLeft.toFixed(2) + ' days',
        expiresIn: new Date(parseInt(sessionTimestamp) + SESSION_DURATION).toLocaleString()
      });
    }
  }, [userData, SESSION_DURATION]);

  // Di dalam User component, tambahkan:
React.useEffect(() => {
  console.log('🧪 User page - Testing backend...');
  
  // Test backend
  fetch('https://serverraharpashopp-production-f317.up.railway.app/health')
    .then(response => response.json())
    .then(data => {
      console.log('✅ User page - Backend OK:', data);
    })
    .catch(error => {
      console.error('❌ User page - Backend failed:', error);
    });
}, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 flex justify-center relative overflow-hidden">
        
        {/* Luxury Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSIjZmRiZjIzIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div 
          data-aos="fade-up"
          data-aos-delay="200"
          className="w-full max-w-7xl relative z-10"
        >
          
          <Header 
            userData={userData} 
            onLogout={handleLogoutClick}
          />
          
          {/* Title - Hidden di bawah 445px */}
          <div className="max-[445px]:hidden">
            <Title />
          </div>

          {/* Layout kanan-kiri */}
          <div className="flex gap-4 mt-4 h-[calc(100vh-200px)] min-h-[500px] max-[445px]:mt-2 max-[445px]:h-[calc(100vh-120px)]">

            <div 
              className="flex-1 h-full"
              data-aos="fade-right"
              data-aos-delay="400"
            >
              <ChatRoom 
                showWishlist={showWishlist} 
                setShowWishlist={setShowWishlist}
                userData={userData}
                socket={socket}
              />
            </div>

            <div 
              className={`w-[35%] h-full transition-all duration-500 max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full max-lg:h-full ${
                showWishlist ? 'max-lg:block' : 'max-lg:hidden'
              }`}
            >
              {showWishlist && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowWishlist(false)}
                />
              )}
              
              <div className={`w-full h-full bg-white rounded-2xl shadow-2xl transform transition-all duration-300 relative z-50 ${
                showWishlist ? 'max-lg:scale-100 max-lg:opacity-100' : 'max-lg:scale-95 max-lg:opacity-0'
              }`}>
                <WishList 
                  onClose={() => setShowWishlist(false)}
                  userData={userData}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Login Modal - Muncul pertama kali */}
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
                  <i className="bx bx-user text-white text-3xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome User</h2>
                <p className="text-amber-100 text-sm">Masukkan nama Anda untuk memulai chat</p>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="p-8 bg-white relative">
              <div className="space-y-6">
                {/* Nama Field */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">
                    Nama Anda
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="bx bx-user-circle text-gray-500"></i>
                    </div>
                    <input
                      type="text"
                      name="name"
                      className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Masukkan nama lengkap Anda"
                      required
                      minLength="1"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-br from-amber-700 to-amber-600 text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>PROSES...</span>
                    </div>
                  ) : (
                    'SIGN IN'
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 ease-out border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-700 to-amber-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <i className="bx bx-log-out text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Logout</h3>
            </div>
            
            {/* Content */}
            <div className="p-6 bg-white">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Anda akan keluar dari akun <span className="font-semibold text-amber-700">{userData?.name}</span>
                </p>
   
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-amber-700 to-amber-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-amber-600"
                >
                  Ya
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 text-center border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500">
                Raharpa Shopp • © 2025
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default User