import React, { useRef } from "react";
import "boxicons/css/boxicons.min.css";

const ChatRoom = ({ showWishlist, setShowWishlist }) => {
  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file JPG, JPEG, dan PNG yang diizinkan!');
        return;
      }
      
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }
      
      console.log('File yang dipilih:', file.name);
      // Di sini bisa tambahkan logic untuk upload file
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-amber-100 
                    shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                    transform transition-all duration-500 hover:shadow-[0_20px_40px_rgba(186,118,48,0.15),0_8px_24px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]
                    hover:-translate-y-1 relative
                    max-[470px]:w-[calc(100vw-24px)] max-[470px]:mx-auto max-[470px]:max-w-full
                    max-[440px]:w-[calc(100vw-20px)]
                    max-[420px]:w-[calc(100vw-16px)]
                    max-[401px]:w-[calc(100vw-12px)]
                    max-[380px]:w-[calc(100vw-8px)] max-[380px]:rounded-xl max-[380px]:border max-[380px]:border-amber-100">

      {/* Efek 3D Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white/50 pointer-events-none 
                     max-[380px]:rounded-xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-amber-100 
                     bg-gradient-to-r from-white to-amber-50 rounded-t-2xl
                     shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_8px_rgba(186,118,48,0.1)]
                     max-[470px]:px-3 max-[470px]:py-3
                     max-[440px]:px-3 max-[440px]:py-3
                     max-[420px]:px-2.5 max-[420px]:py-2.5
                     max-[401px]:px-2 max-[401px]:py-2
                     max-[400px]:px-3 max-[380px]:px-2 max-[380px]:py-2 max-[380px]:rounded-t-xl">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 
                       max-[470px]:gap-2
                       max-[440px]:gap-2
                       max-[420px]:gap-1.5
                       max-[401px]:gap-1.5
                       max-[400px]:gap-2 max-[380px]:gap-1.5">
          {/* Profile 3D Effect */}
          <div className="relative">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-2xl 
                           bg-gradient-to-br from-amber-600 to-amber-700 
                           shadow-[0_8px_20px_rgba(186,118,48,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)]
                           flex items-center justify-center text-white text-lg xs:text-xl sm:text-2xl 
                           transform transition-transform hover:scale-110 hover:rotate-3
                           max-[470px]:w-9 max-[470px]:h-9 max-[470px]:text-base
                           max-[440px]:w-9 max-[440px]:h-9 max-[440px]:text-base
                           max-[420px]:w-9 max-[420px]:h-9 max-[420px]:text-base
                           max-[401px]:w-8 max-[401px]:h-8 max-[401px]:text-sm
                           max-[400px]:w-9 max-[400px]:h-9 max-[400px]:text-base
                           max-[380px]:w-8 max-[380px]:h-8 max-[380px]:text-sm max-[380px]:rounded-lg">
              <i className="bx bx-user"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 
                           bg-green-400 rounded-full border-2 border-white 
                           shadow-[0_2px_8px_rgba(34,197,94,0.5)]
                           max-[470px]:w-2.5 max-[470px]:h-2.5
                           max-[440px]:w-2.5 max-[440px]:h-2.5
                           max-[420px]:w-2.5 max-[420px]:h-2.5
                           max-[401px]:w-2 max-[401px]:h-2 max-[401px]:-bottom-0.5 max-[401px]:-right-0.5
                           max-[400px]:w-2.5 max-[400px]:h-2.5
                           max-[380px]:w-2 max-[380px]:h-2 max-[380px]:-bottom-0.5 max-[380px]:-right-0.5"></div>
          </div>
          
          <div className="max-[470px]:flex-1 max-[470px]:min-w-0
                         max-[440px]:flex-1 max-[440px]:min-w-0
                         max-[420px]:flex-1 max-[420px]:min-w-0
                         max-[401px]:flex-1 max-[401px]:min-w-0
                         max-[400px]:flex-1 max-[400px]:min-w-0 max-[380px]:min-w-0 max-[380px]:flex-1">
            <h1 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 
                          drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]
                          max-[470px]:text-sm max-[470px]:truncate
                          max-[440px]:text-sm max-[440px]:truncate
                          max-[420px]:text-sm max-[420px]:truncate
                          max-[401px]:text-xs max-[401px]:truncate max-[401px]:leading-4
                          max-[400px]:text-sm max-[400px]:truncate
                          max-[380px]:text-xs max-[380px]:leading-tight">
              Live Chat Room
            </h1>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1
                         max-[470px]:text-[10px] max-[470px]:mt-0.5
                         max-[440px]:text-[10px] max-[440px]:mt-0.5
                         max-[420px]:text-[10px] max-[420px]:mt-0.5
                         max-[401px]:text-[9px] max-[401px]:mt-0 max-[401px]:gap-0.5
                         max-[400px]:text-[10px] max-[400px]:mt-0.5
                         max-[380px]:text-[9px] max-[380px]:mt-0 max-[380px]:gap-0.5">
              <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-green-500 rounded-full animate-pulse 
                              shadow-[0_0_8px_rgba(34,197,94,0.6)]
                              max-[470px]:w-1.5 max-[470px]:h-1.5
                              max-[440px]:w-1.5 max-[440px]:h-1.5
                              max-[420px]:w-1.5 max-[420px]:h-1.5
                              max-[401px]:w-1 max-[401px]:h-1
                              max-[400px]:w-1.5 max-[400px]:h-1.5
                              max-[380px]:w-1 max-[380px]:h-1"></span>
              Admin • Online
            </p>
          </div>
        </div>

        <button 
  onClick={() => setShowWishlist(!showWishlist)}
  className="p-2 xs:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 
             text-white shadow-[0_6px_16px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]
             transform transition-all duration-300 hover:scale-110 
             hover:shadow-[0_8px_24px_rgba(186,118,48,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] lg:hidden
             flex items-center justify-center
             max-[470px]:p-2 max-[470px]:w-9 max-[470px]:h-9
             max-[440px]:p-2 max-[440px]:w-9 max-[440px]:h-9
             max-[420px]:p-2 max-[420px]:w-9 max-[420px]:h-9
             max-[401px]:p-1.5 max-[401px]:w-8 max-[401px]:h-8
             max-[400px]:p-2 max-[400px]:w-9 max-[400px]:h-9
             max-[380px]:p-1.5 max-[380px]:w-8 max-[380px]:h-8 max-[380px]:rounded-lg"
>
  <i className="bx bx-heart text-base xs:text-lg sm:text-xl 
               max-[470px]:text-sm 
               max-[440px]:text-sm
               max-[420px]:text-sm 
               max-[401px]:text-xs
               max-[400px]:text-sm max-[380px]:text-xs"></i>
</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-3 xs:p-4 sm:p-6 overflow-y-auto space-y-3 xs:space-y-4 sm:space-y-6 
                     bg-gradient-to-b from-white to-amber-25
                     shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)]
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                     max-[470px]:p-3 max-[470px]:space-y-3
                     max-[440px]:p-3 max-[440px]:space-y-3
                     max-[420px]:p-2.5 max-[420px]:space-y-2.5
                     max-[401px]:p-2 max-[401px]:space-y-2
                     max-[400px]:px-3 max-[380px]:p-2 max-[380px]:space-y-2">
        
        {/* Admin Message */}
        <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 transform transition-transform
                       max-[470px]:gap-2
                       max-[440px]:gap-2
                       max-[420px]:gap-1.5
                       max-[401px]:gap-1.5
                       max-[400px]:gap-2 max-[380px]:gap-1.5">
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                         bg-gradient-to-br from-gray-400 to-gray-600 
                         shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]
                         flex items-center justify-center text-white shadow-lg flex-shrink-0
                         max-[470px]:w-7 max-[470px]:h-7
                         max-[440px]:w-7 max-[440px]:h-7
                         max-[420px]:w-7 max-[420px]:h-7
                         max-[401px]:w-6 max-[401px]:h-6
                         max-[400px]:w-7 max-[400px]:h-7
                         max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
            <i className="bx bx-user text-xs xs:text-sm sm:text-base 
                         max-[470px]:text-xs
                         max-[440px]:text-xs
                         max-[420px]:text-xs
                         max-[401px]:text-[10px]
                         max-[400px]:text-xs max-[380px]:text-[10px]"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-600 mb-1 
                         max-[470px]:text-[10px] max-[470px]:mb-0.5
                         max-[440px]:text-[10px] max-[440px]:mb-0.5
                         max-[420px]:text-[10px] max-[420px]:mb-0.5
                         max-[401px]:text-[9px] max-[401px]:mb-0
                         max-[400px]:text-[10px] max-[400px]:mb-0.5 max-[380px]:text-[9px] max-[380px]:mb-0">Admin • 09:12</p>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 
                           px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none 
                           shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                           border border-gray-200 transform transition-all duration-300 
                           hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                           inline-block max-w-[80%] xs:max-w-[85%] sm:max-w-xs
                           max-[470px]:max-w-[90%] max-[470px]:px-2 max-[470px]:py-1.5
                           max-[440px]:max-w-[90%] max-[440px]:px-2 max-[440px]:py-1.5
                           max-[420px]:max-w-[92%] max-[420px]:px-2 max-[420px]:py-1.5
                           max-[401px]:max-w-[94%] max-[401px]:px-1.5 max-[401px]:py-1
                           max-[400px]:max-w-[calc(100%-10px)] max-[400px]:px-2 max-[400px]:py-1.5
                           max-[380px]:max-w-[calc(100%-8px)] max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:rounded-xl">
              <p className="text-xs xs:text-sm sm:text-base 
                           max-[470px]:text-xs max-[470px]:leading-tight
                           max-[440px]:text-xs max-[440px]:leading-tight
                           max-[420px]:text-xs max-[420px]:leading-tight
                           max-[401px]:text-[11px] max-[401px]:leading-tight
                           max-[400px]:text-xs max-[400px]:leading-tight max-[380px]:text-[11px] max-[380px]:leading-tight">
                Hallo, ada yang bisa saya bantu?
              </p>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex items-start justify-end gap-2 xs:gap-3 sm:gap-4 transform transition-transform
                       max-[470px]:gap-2
                       max-[440px]:gap-2
                       max-[420px]:gap-1.5
                       max-[401px]:gap-1.5
                       max-[400px]:gap-2 max-[380px]:gap-1.5">
          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs font-semibold text-gray-600 mb-1 
                         max-[470px]:text-[10px] max-[470px]:mb-0.5
                         max-[440px]:text-[10px] max-[440px]:mb-0.5
                         max-[420px]:text-[10px] max-[420px]:mb-0.5
                         max-[401px]:text-[9px] max-[401px]:mb-0
                         max-[400px]:text-[10px] max-[400px]:mb-0.5 max-[380px]:text-[9px] max-[380px]:mb-0">You • 09:13</p>
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                           px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-2xl rounded-tr-none 
                           shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]
                           inline-block transform transition-all duration-300 
                           hover:shadow-[0_6px_20px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] 
                           max-w-[80%] xs:max-w-[85%] sm:max-w-xs
                           max-[470px]:max-w-[90%] max-[470px]:px-2 max-[470px]:py-1.5
                           max-[440px]:max-w-[90%] max-[440px]:px-2 max-[440px]:py-1.5
                           max-[420px]:max-w-[92%] max-[420px]:px-2 max-[420px]:py-1.5
                           max-[401px]:max-w-[94%] max-[401px]:px-1.5 max-[401px]:py-1
                           max-[400px]:max-w-[calc(100%-10px)] max-[400px]:px-2 max-[400px]:py-1.5
                           max-[380px]:max-w-[calc(100%-8px)] max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:rounded-xl">
              <p className="text-xs xs:text-sm sm:text-base 
                           max-[470px]:text-xs max-[470px]:leading-tight
                           max-[440px]:text-xs max-[440px]:leading-tight
                           max-[420px]:text-xs max-[420px]:leading-tight
                           max-[401px]:text-[11px] max-[401px]:leading-tight
                           max-[400px]:text-xs max-[400px]:leading-tight max-[380px]:text-[11px] max-[380px]:leading-tight">
                Saya ingin bertanya tentang produk...
              </p>
            </div>
          </div>
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                         bg-gradient-to-br from-amber-600 to-amber-700 
                         shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)]
                         flex items-center justify-center text-white shadow-lg flex-shrink-0
                         max-[470px]:w-7 max-[470px]:h-7
                         max-[440px]:w-7 max-[440px]:h-7
                         max-[420px]:w-7 max-[420px]:h-7
                         max-[401px]:w-6 max-[401px]:h-6
                         max-[400px]:w-7 max-[400px]:h-7
                         max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
            <i className="bx bx-user text-xs xs:text-sm sm:text-base 
                         max-[470px]:text-xs
                         max-[440px]:text-xs
                         max-[420px]:text-xs
                         max-[401px]:text-[10px]
                         max-[400px]:text-xs max-[380px]:text-[10px]"></i>
          </div>
        </div>

        {/* Tambahkan beberapa chat untuk demo scroll */}
        <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 transform transition-transform
                       max-[470px]:gap-2
                       max-[440px]:gap-2
                       max-[420px]:gap-1.5
                       max-[401px]:gap-1.5
                       max-[400px]:gap-2 max-[380px]:gap-1.5">
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                         bg-gradient-to-br from-gray-400 to-gray-600 
                         shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]
                         flex items-center justify-center text-white shadow-lg flex-shrink-0
                         max-[470px]:w-7 max-[470px]:h-7
                         max-[440px]:w-7 max-[440px]:h-7
                         max-[420px]:w-7 max-[420px]:h-7
                         max-[401px]:w-6 max-[401px]:h-6
                         max-[400px]:w-7 max-[400px]:h-7
                         max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
            <i className="bx bx-user text-xs xs:text-sm sm:text-base 
                         max-[470px]:text-xs
                         max-[440px]:text-xs
                         max-[420px]:text-xs
                         max-[401px]:text-[10px]
                         max-[400px]:text-xs max-[380px]:text-[10px]"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-600 mb-1 
                         max-[470px]:text-[10px] max-[470px]:mb-0.5
                         max-[440px]:text-[10px] max-[440px]:mb-0.5
                         max-[420px]:text-[10px] max-[420px]:mb-0.5
                         max-[401px]:text-[9px] max-[401px]:mb-0
                         max-[400px]:text-[10px] max-[400px]:mb-0.5 max-[380px]:text-[9px] max-[380px]:mb-0">Admin • 09:14</p>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 
                           px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none 
                           shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                           border border-gray-200 transform transition-all duration-300 
                           hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                           inline-block max-w-[80%] xs:max-w-[85%] sm:max-w-xs
                           max-[470px]:max-w-[90%] max-[470px]:px-2 max-[470px]:py-1.5
                           max-[440px]:max-w-[90%] max-[440px]:px-2 max-[440px]:py-1.5
                           max-[420px]:max-w-[92%] max-[420px]:px-2 max-[420px]:py-1.5
                           max-[401px]:max-w-[94%] max-[401px]:px-1.5 max-[401px]:py-1
                           max-[400px]:max-w-[calc(100%-10px)] max-[400px]:px-2 max-[400px]:py-1.5
                           max-[380px]:max-w-[calc(100%-8px)] max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:rounded-xl">
              <p className="text-xs xs:text-sm sm:text-base 
                           max-[470px]:text-xs max-[470px]:leading-tight
                           max-[440px]:text-xs max-[440px]:leading-tight
                           max-[420px]:text-xs max-[420px]:leading-tight
                           max-[401px]:text-[11px] max-[401px]:leading-tight
                           max-[400px]:text-xs max-[400px]:leading-tight max-[380px]:text-[11px] max-[380px]:leading-tight">
                Tentu saja! Silakan tanyakan produk yang Anda minati.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="p-2 xs:p-3 sm:p-4 border-t border-amber-100 bg-white rounded-b-2xl
                     shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)]
                     max-[470px]:p-3
                     max-[440px]:p-3
                     max-[420px]:p-2.5
                     max-[401px]:p-2
                     max-[400px]:px-3 max-[400px]:py-2 max-[380px]:p-2 max-[380px]:rounded-b-xl">
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 
                       bg-gradient-to-r from-amber-50 to-white p-1.5 xs:p-2 rounded-2xl 
                       shadow-[inset_0_2px_8px_rgba(186,118,48,0.1),0_2px_8px_rgba(186,118,48,0.05)]
                       border border-amber-100
                       max-[470px]:gap-1.5 max-[470px]:p-1.5
                       max-[440px]:gap-1.5 max-[440px]:p-1.5
                       max-[420px]:gap-1.5 max-[420px]:p-1.5
                       max-[401px]:gap-1 max-[401px]:p-1
                       max-[400px]:gap-1.5 max-[400px]:p-1.5
                       max-[380px]:gap-1 max-[380px]:p-1 max-[380px]:rounded-lg">
          
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="hidden"
          />
          
          {/* File Upload Button */}
          <button 
            onClick={handleFileButtonClick}
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                       rounded-2xl bg-white text-amber-600 
                       shadow-[0_4px_12px_rgba(186,118,48,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]
                       transform transition-all duration-300 hover:scale-110 hover:bg-amber-50 
                       hover:shadow-[0_6px_16px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                       flex-shrink-0
                       max-[470px]:w-8 max-[470px]:h-8
                       max-[440px]:w-8 max-[440px]:h-8
                       max-[420px]:w-8 max-[420px]:h-8
                       max-[401px]:w-7 max-[401px]:h-7
                       max-[400px]:w-7 max-[400px]:h-7
                       max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg"
          >
            <i className="bx bx-plus text-lg xs:text-xl sm:text-2xl 
                         max-[470px]:text-base
                         max-[440px]:text-base
                         max-[420px]:text-base
                         max-[401px]:text-sm
                         max-[400px]:text-sm max-[380px]:text-xs"></i>
          </button>
          
          {/* Message Input */}
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 bg-transparent 
                       outline-none text-gray-700 placeholder-gray-400 text-xs xs:text-sm sm:text-base 
                       min-w-0 shadow-[inset_0_2px_4px_rgba(186,118,48,0.05)] rounded-xl
                       max-[470px]:px-2 max-[470px]:py-1.5 max-[470px]:text-xs
                       max-[440px]:px-2 max-[440px]:py-1.5 max-[440px]:text-xs
                       max-[420px]:px-2 max-[420px]:py-1.5 max-[420px]:text-xs
                       max-[401px]:px-1.5 max-[401px]:py-1 max-[401px]:text-[11px]
                       max-[400px]:px-2 max-[400px]:py-1.5 max-[400px]:text-xs
                       max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:text-[11px] max-[380px]:rounded-lg"
          />
          
          {/* Send Button */}
          <button className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                            rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                            shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]
                            transform transition-all duration-300 hover:scale-110 
                            hover:shadow-[0_6px_20px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] 
                            flex-shrink-0
                            max-[470px]:w-8 max-[470px]:h-8
                            max-[440px]:w-8 max-[440px]:h-8
                            max-[420px]:w-8 max-[420px]:h-8
                            max-[401px]:w-7 max-[401px]:h-7
                            max-[400px]:w-7 max-[400px]:h-7
                            max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
            <i className="bx bx-send text-sm xs:text-lg sm:text-xl 
                         max-[470px]:text-sm
                         max-[440px]:text-sm
                         max-[420px]:text-sm
                         max-[401px]:text-xs
                         max-[400px]:text-xs max-[380px]:text-[10px]"></i>
          </button>
        </div>
        
        {/* File Type Info */}
        <p className="text-[10px] xs:text-xs text-gray-500 text-center mt-3 xs:mt-2
                     drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]
                     max-[470px]:text-[10px] max-[470px]:mt-2
                     max-[440px]:text-[10px] max-[440px]:mt-2
                     max-[420px]:text-[10px] max-[420px]:mt-2
                     max-[401px]:text-[9px] max-[401px]:mt-1.5
                     max-[400px]:text-[9px] max-[400px]:mt-2
                     max-[380px]:text-[8px] max-[380px]:mt-1">
          Support: JPG, PNG (Max 5MB)
        </p>
      </div>

    </div>
  );
};

export default ChatRoom;