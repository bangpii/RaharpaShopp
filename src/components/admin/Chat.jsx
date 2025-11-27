import React, { useState, useEffect } from 'react'

const Chat = ({onNavigate}) => {
  const [selectedChat, setSelectedChat] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Data kontak chat
  const contacts = [
    {
      id: 1,
      name: "Baihaqie Ar Rafi",
      lastMessage: "Kak gimana Pesanan saya",
      time: "10:30",
      unread: 2,
      online: true,
      lastOnline: "Online"
    },
    {
      id: 2,
      name: "Rahima Maisarah",
      lastMessage: "Apakah produk ini ready?",
      time: "Kemarin",
      unread: 1,
      online: false,
      lastOnline: "Kemarin"
    },
    {
      id: 3,
      name: "Ahmad Fauzi",
      lastMessage: "Terima kasih atas bantuannya",
      time: "09:15",
      unread: 0,
      online: true,
      lastOnline: "Online"
    },
    {
      id: 4,
      name: "Siti Nurhaliza",
      lastMessage: "Saya mau tanya tentang ukuran",
      time: "Kemarin",
      unread: 3,
      online: false,
      lastOnline: "2 hari lalu"
    },
    {
      id: 5,
      name: "Muhammad Rizki",
      lastMessage: "Pesanan sudah sampai, terima kasih",
      time: "12/11/2025",
      unread: 0,
      online: true,
      lastOnline: "Online"
    },
    {
      id: 6,
      name: "Sarah Johnson",
      lastMessage: "Bisa minta diskon?",
      time: "11/11/2025",
      unread: 0,
      online: false,
      lastOnline: "3 hari lalu"
    },
    {
      id: 7,
      name: "David Wilson",
      lastMessage: "Produknya bagus banget",
      time: "10/11/2025",
      unread: 1,
      online: true,
      lastOnline: "Online"
    },
    
    {
      id: 8,
      name: "Lisa Anderson",
      lastMessage: "Kapan restocknya?",
      time: "09/11/2025",
      unread: 0,
      online: false,
      lastOnline: "1 minggu lalu"
    }
  ]

  // Data chat untuk kontak yang dipilih
  const chatMessages = [
    { id: 1, sender: 'user', message: 'Kak gimana Pesanan saya', time: '10:30' },
    { id: 2, sender: 'admin', message: 'Halo, pesanan Anda sedang dalam proses packing. Akan segera kami kirim hari ini juga.', time: '10:31' },
    { id: 3, sender: 'user', message: 'Oh baik kak, terima kasih informasinya', time: '10:32' },
    { id: 4, sender: 'admin', message: 'Sama-sama. Kami akan kirimkan nomor resi begitu paket dikirim.', time: '10:33' },
    { id: 5, sender: 'user', message: 'Baik kak, saya tunggu updatenya', time: '10:34' },
    { id: 6, sender: 'admin', message: 'Terima kasih sudah berbelanja di toko kami. Jika ada pertanyaan lain, jangan ragu untuk bertanya.', time: '10:35' },
    { id: 7, sender: 'user', message: 'Oke kak, terima kasih banyak', time: '10:36' },
    { id: 8, sender: 'admin', message: 'Sama-sama, semoga harimu menyenangkan!', time: '10:37' }
  ]

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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleContactClick = (index) => {
    setSelectedChat(index)
    if (isMobile) {
      setShowChat(true)
    }
  }

  const handleBackClick = () => {
    setShowChat(false)
  }

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard')
    }
  }

  const handleChatRefresh = () => {
    setSelectedChat(0)
    setSearchTerm('')
    setShowChat(false)
    
    if (onNavigate) {
      onNavigate('Chat')
    }
  }

  return (
    <div className="space-y-4 xs:space-y-6 overflow-x-hidden min-h-screen bg-gray-50 sm:overflow-x-visible">
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
              onClick={handleChatRefresh}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-chat text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Chat</span>
            </button>
          </div>
        </div>
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">CHAT OBROLAN</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Kelola chat pelanggan dengan mudah dan efisien</p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl mx-3 xs:mx-4 sm:mx-6 p-3 xs:p-4 sm:p-6 
                     shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                     border border-amber-100 mb-6">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] min-h-[500px] max-h-[800px] rounded-xl overflow-hidden 
                       shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)] gap-0 lg:gap-4">
          
          {/* Sidebar Kontak - Card Terpisah */}
          <div className={`lg:w-1/3 bg-amber-25 flex flex-col rounded-xl
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100
                         ${showChat ? 'hidden lg:flex' : 'flex'} ${isMobile ? 'h-full' : ''}`}>
            
            {/* Search Bar */}
            <div className="p-3 xs:p-4 border-b border-amber-100 bg-white rounded-t-xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className='bx bx-search text-gray-400 text-sm xs:text-base'></i>
                </div>
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 xs:py-2.5 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-xs xs:text-sm placeholder-gray-400"
                />
              </div>
            </div>

            {/* List Kontak dengan Scroll yang berfungsi */}
            <div className="flex-1 overflow-y-auto rounded-b-xl custom-scrollbar">
              {filteredContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(index)}
                  className={`p-3 xs:p-4 border-b border-amber-50 cursor-pointer transition-all duration-200
                            ${selectedChat === index 
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' 
                              : 'hover:bg-amber-50'
                            }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar dengan status online */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-2xl flex items-center justify-center text-white
                                    ${selectedChat === index 
                                      ? 'bg-amber-800' 
                                      : 'bg-gradient-to-br from-amber-600 to-amber-700'
                                    }`}>
                        <i className='bx bx-user text-base xs:text-lg'></i>
                      </div>
                      {/* Online Indicator */}
                      {contact.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Konten */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate text-sm xs:text-base
                                     ${selectedChat === index ? 'text-white' : 'text-gray-800'}`}>
                          {contact.name}
                        </h3>
                        <span className={`text-xs ${selectedChat === index ? 'text-amber-100' : 'text-gray-500'}`}>
                          {contact.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`truncate text-xs xs:text-sm
                                    ${selectedChat === index ? 'text-amber-100' : 'text-gray-600'}`}>
                          {contact.lastMessage}
                        </p>
                        {/* Notifikasi Unread */}
                        {contact.unread > 0 && (
                          <span className={`flex items-center justify-center min-w-5 h-5 rounded-full text-xs font-semibold
                                         ${selectedChat === index 
                                           ? 'bg-white text-amber-700' 
                                           : 'bg-amber-600 text-white'
                                         }`}>
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area Chat - Card Terpisah */}
          <div className={`lg:w-2/3 flex flex-col rounded-xl
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100 bg-white
                         ${showChat ? 'flex' : 'hidden lg:flex'} ${isMobile ? 'h-full' : ''}`}>
            
            {/* Header Chat dengan Back Button untuk Mobile */}
            <div className="p-3 xs:p-4 border-b border-amber-100 bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back Button untuk Mobile */}
                  <button 
                    onClick={handleBackClick}
                    className="lg:hidden p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <i className='bx bx-arrow-back text-lg'></i>
                  </button>
                  
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                flex items-center justify-center text-white">
                    <i className='bx bx-user text-lg'></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm xs:text-base">
                      {filteredContacts[selectedChat]?.name}
                    </h3>
                    <p className={`text-xs flex items-center gap-1 ${
                      filteredContacts[selectedChat]?.online ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {filteredContacts[selectedChat]?.online ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Online
                        </>
                      ) : (
                        `Terakhir online ${filteredContacts[selectedChat]?.lastOnline}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Pesan dengan Scroll yang berfungsi */}
            <div className="flex-1 p-3 xs:p-4 overflow-y-auto bg-gradient-to-b from-white to-amber-25 custom-scrollbar">
              <div className="space-y-3 xs:space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 xs:gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                    flex items-center justify-center text-white flex-shrink-0">
                        <i className='bx bx-user text-sm'></i>
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] xs:max-w-xs sm:max-w-sm ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                      <div className={`mb-1 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                        <span className="text-xs font-semibold text-gray-600">
                          {msg.sender === 'admin' ? 'Anda' : filteredContacts[selectedChat]?.name}
                        </span>
                      </div>
                      <div className={`rounded-2xl p-3 xs:p-4 shadow-lg
                                    ${msg.sender === 'admin' 
                                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none' 
                                      : 'bg-white text-gray-800 border border-amber-100 rounded-bl-none'
                                    }`}>
                        <p className="text-sm xs:text-base break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-amber-100' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>

                    {msg.sender === 'admin' && (
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 
                                    flex items-center justify-center text-white flex-shrink-0">
                        <i className='bx bx-user text-sm'></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 xs:p-4 border-t border-amber-100 bg-white rounded-b-xl">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors">
                  <i className='bx bx-paperclip text-xl'></i>
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-amber-200 rounded-xl 
                             focus:ring-2 focus:ring-amber-500 focus:border-transparent
                             bg-amber-50 hover:bg-white transition-colors duration-200
                             text-sm xs:text-base placeholder-gray-400"
                  />
                </div>
                <button className="p-2 xs:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 
                                 text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                                 shadow-[0_4px_12px_rgba(186,118,48,0.3)]">
                  <i className='bx bx-send text-lg xs:text-xl'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS untuk scrollbar yang berfungsi - Hanya untuk mobile */}
      <style>{`
        /* Styles untuk layar di bawah 498px */
@media (max-width: 498px) {
  /* Header specific styles - Diperbesar */
  .text-xl {
    font-size: 1.5rem !important;
  }
  
  .text-2xl {
    font-size: 1.75rem !important;
  }
  
  .text-3xl {
    font-size: 2rem !important;
  }
  
  .text-4xl {
    font-size: 2.25rem !important;
  }
  
  .text-sm {
    font-size: 0.875rem !important;
  }
  
  .text-xs {
    font-size: 0.75rem !important;
  }
  
  .text-base {
    font-size: 0.875rem !important;
  }
  
  .text-lg {
    font-size: 1rem !important;
  }

  /* Spacing header diperbesar */
  .px-3 {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .pt-4 {
    padding-top: 1.5rem !important;
  }
  
  .space-x-2 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-x-reverse: 0;
    margin-right: calc(0.5rem * var(--tw-space-x-reverse)) !important;
    margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse))) !important;
  }
  
  .mb-1 {
    margin-bottom: 0.25rem !important;
  }
  
  .mb-2 {
    margin-bottom: 0.5rem !important;
  }
  
  .mt-1 {
    margin-top: 0.25rem !important;
  }

  /* Ukuran icon di header diperbesar */
  .text-base {
    font-size: 1.125rem !important;
  }
  
  .text-lg {
    font-size: 1.25rem !important;
  }

  /* Container lainnya tetap kecil */
  .space-y-4 {
    space-y: 0.75rem;
  }
  
  .mx-3 {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  
  .p-3 {
    padding: 0.5rem;
  }
  
  .rounded-2xl {
    border-radius: 0.5rem;
  }
  
  .rounded-xl {
    border-radius: 0.375rem;
  }
  
  .w-10 {
    width: 1.75rem;
  }
  
  .h-10 {
    height: 1.75rem;
  }
  
  .w-8 {
    width: 1.5rem;
  }
  
  .h-8 {
    height: 1.5rem;
  }
  
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-2 {
    padding: 0.375rem;
  }
  
  .custom-scrollbar {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #FFF transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #FFF;
    border-radius: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #FFF;
  }
  
  .min-h-[500px] {
    min-height: 400px;
  }
  
  .h-[calc(100vh-180px)] {
    height: calc(100vh - 140px);
  }
}
      `}</style>
    </div>
  )
}

export default Chat