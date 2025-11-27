// Navigasi.jsx - Updated
import React from 'react'

const Navigasi = ({ activePage, setActivePage, setShowLogoutModal, adminData }) => {
  const Nav = [
    "Dashboard", 
    "Chat",
    "Akun Users",
    "Orders",
    "Item",
    "Laporan",
  ]

  const getIcon = (name) => {
    switch(name) {
      case "Dashboard": return 'bx bx-home'
      case "Chat": return 'bx bx-chat'
      case "Akun Users": return 'bx bx-user'
      case "Orders": return 'bx bx-package'
      case "Item": return 'bx bx-box'
      case "Laporan": return 'bx bx-bar-chart'
      case "Logout": return 'bx bx-log-out'
      default: return 'bx bx-circle'
    }
  }

  const handleNavClick = (item) => {
    setActivePage(item)
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  return (
    <div className="h-[93.5vh] bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl 
                    shadow-[0_10px_30px_rgba(186,118,48,0.3),0_4px_12px_rgba(186,118,48,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
                    p-6 flex flex-col relative overflow-hidden border border-amber-500
                    /* Responsive styles */
                    max-h-[93.5vh] overflow-y-auto
                    md:overflow-y-visible md:max-h-none">
      
      {/* Efek 3D Depth */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 pointer-events-none"></div>
      
      {/* Efek Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 pointer-events-none"></div>
      
      {/* Bagian User/Admin */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="relative group mb-4">
          <div className="absolute -inset-2 bg-white/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <img 
            src="/01.jpeg" 
            alt="Admin" 
            className="relative w-28 h-28 rounded-full border-4 border-white/90 
                       shadow-[0_8px_25px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)]
                       object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          
          <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full 
                            shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]
                            hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.9)]
                            transform hover:scale-110 transition-all duration-300 border border-amber-200">
            <i className='bx bx-pencil text-amber-600 text-sm'></i>
          </button>
        </div>
        
        <h2 className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {adminData?.name || 'Admin'}
        </h2>
        <p className="text-amber-100 text-sm mt-1">{adminData?.email || 'admin@email.com'}</p>
        <div className="w-16 h-0.5 bg-white/40 rounded-full mt-2"></div>
      </div>

      {/* Navigasi Menu Utama - Tambah overflow untuk mobile */}
      <div className="flex-1 flex flex-col relative z-10 space-y-2 
                     overflow-y-auto overflow-x-hidden
                     md:overflow-visible">
        {Nav.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavClick(item)}
            className={`flex items-center gap-3 p-3 text-white rounded-xl 
                       shadow-[0_4px_15px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
                       hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                       transform hover:scale-[1.02] transition-all duration-200 group border ${
              activePage === item 
                ? 'bg-white/30 border-white/30' 
                : 'bg-white/15 border-white/10 hover:bg-white/25'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              activePage === item ? 'bg-white/30' : 'bg-white/20 group-hover:bg-white/30'
            }`}>
              <i className={`${getIcon(item)} text-lg`}></i>
            </div>
            <span className="font-medium text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{item}</span>
            <i className='bx bx-chevron-right ml-auto text-sm transform group-hover:translate-x-0.5 transition-transform'></i>
          </button>
        ))}
      </div>

      {/* Tombol Logout Terpisah */}
      <div className="relative z-10 mt-auto pt-4">
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 p-3 bg-white/20 text-white rounded-xl 
                     shadow-[0_4px_15px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
                     hover:bg-white/30 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                     transform hover:scale-[1.02] transition-all duration-200 group border border-white/20 w-full"
        >
          <div className="p-2 bg-white/25 rounded-lg group-hover:bg-white/35 transition-colors">
            <i className='bx bx-log-out text-lg'></i>
          </div>
          <span className="font-medium text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Navigasi