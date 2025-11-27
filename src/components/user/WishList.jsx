import React from "react";
import "boxicons/css/boxicons.min.css";

const WishList = ({ onClose }) => {
  // Data wishlist yang sudah diperbaiki
  const wishlistItems = [
    {
      id: 1,
      name: "Kaos Polos Premium",
      price: "Rp 120.000",
      image: "/01.jpeg",
      rating: "4.8"
    },
    {
      id: 2,
      name: "Hoodie Oversize",
      price: "Rp 240.000",
      image: "/02.jpeg",
      rating: "4.9"
    },
    {
      id: 3,
      name: "Kemeja Linen",
      price: "Rp 180.000",
      image: "/04.jpeg",
      rating: "4.7"
    },
    {
      id: 4,
      name: "Blouse Floral",
      price: "Rp 150.000",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
      rating: "4.6"
    },
    {
      id: 5,
      name: "Jaket Denim Vintage",
      price: "Rp 275.000",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop",
      rating: "4.8"
    },
    {
      id: 6,
      name: "Celana Chino Slim",
      price: "Rp 190.000",
      image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=400&fit=crop",
      rating: "4.5"
    }
  ];

  // Calculate total keseluruhan - diperbaiki untuk handle format harga
  const totalKeseluruhan = wishlistItems.reduce((total, item) => {
    const priceNumber = parseInt(item.price.replace('Rp ', '').replace(/\./g, ''));
    return total + (isNaN(priceNumber) ? 0 : priceNumber);
  }, 0);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-amber-100 
                    shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                    transform transition-all duration-500 hover:shadow-[0_20px_40px_rgba(186,118,48,0.15),0_8px_24px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]
                    hover:-translate-y-1 relative p-4 xs:p-6">
      
      {/* Efek 3D Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white/50 pointer-events-none"></div>

      {/* Header - Logo, Title, dan Close Button sejajar */}
      <div className="flex items-center justify-between mb-4 xs:mb-6">
        <div className="flex items-center gap-2 xs:gap-3">
          <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl 
                         shadow-[0_4px_12px_rgba(186,118,48,0.3)] flex items-center justify-center">
            <i className="bx bx-heart text-white text-sm xs:text-lg"></i>
          </div>
          <h1 className="text-lg xs:text-xl font-bold text-gray-900
                        drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
            Wishlist Items
          </h1>
        </div>
        
        {/* Close Button - Hilang di 1023px ke atas */}
        <button 
          onClick={onClose}
          className="w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center rounded-xl 
                     bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                     shadow-[0_6px_16px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]
                     transform transition-all duration-300 hover:scale-110 
                     hover:shadow-[0_8px_24px_rgba(186,118,48,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] lg:hidden"
        >
          <i className="bx bx-x text-base xs:text-xl"></i>
        </button>
      </div>

      {/* Search Input untuk Semua Device - Tampil di bawah header */}
      <div className="relative mb-4">
        <input 
          type="text"
          placeholder="Cari item wishlist..."
          className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent 
                     bg-white text-sm
                     shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]"
        />
        <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 text-lg
                     drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"></i>
      </div>

      {/* Container utama untuk items dan total */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Wishlist Items Container - Scroll aktif setelah 4 item */}
        <div className="flex-1 overflow-y-auto mb-2 space-y-3 xs:space-y-4 max-h-[60vh] min-h-0
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                       pr-2">
          {wishlistItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4 border border-amber-100 rounded-2xl 
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                         hover:shadow-[0_8px_20px_rgba(186,118,48,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)]
                         transition-all duration-300 bg-gradient-to-r from-amber-50 to-white 
                         transform hover:-translate-y-0.5"
            >
              {/* Gambar - Diperkecil tapi tetap jelas */}
              <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 
                             shadow-[0_6px_16px_rgba(186,118,48,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)]
                             flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150/FFB74D/FFFFFF?text=${encodeURIComponent(item.name)}`;
                  }}
                />
              </div>

              {/* Content - Layout lebih compact */}
              <div className="flex-1 min-w-0">
                <p className="text-sm xs:text-base font-bold text-gray-900 truncate
                             drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  {item.name}
                </p>
                <p className="text-xs xs:text-sm text-gray-500 mt-0.5 xs:mt-1 flex items-center gap-1">
                  <i className="bx bx-star text-yellow-400 text-xs xs:text-sm
                               drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"></i>
                  {item.rating} • Wishlist
                </p>
                {/* Price di mobile pindah ke samping */}
                <p className="text-base xs:text-lg font-bold text-amber-600 mt-1 xs:mt-2
                             drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] xs:hidden">
                  {item.price}
                </p>
              </div>

              {/* Action & Price - Dirapikan */}
              <div className="flex flex-col items-end gap-1 xs:gap-2">
                <button className="text-xl xs:text-2xl text-amber-500 transform hover:scale-110 transition-transform cursor-pointer
                               drop-shadow-[0_2px_6px_rgba(186,118,48,0.3)] hover:text-amber-600">
                  <i className="bx bxs-heart"></i>
                </button>
                {/* Price di desktop */}
                <p className="text-lg xs:text-xl font-bold text-gray-800 hidden xs:block
                             drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Keseluruhan - Ditempel di bawah data untuk mobile */}
        <div className="bg-white text-amber-500 rounded-xl p-3 xs:p-4
                       shadow-[0_6px_16px_rgba(186,118,48,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]
                       border border-amber-100 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs xs:text-sm text-gray-600 font-medium
                           drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                Total Wishlist
              </p>
              <p className="text-base xs:text-lg font-bold text-amber-600
                           drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                Rp {totalKeseluruhan.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-500
                           drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              <i className="bx bx-heart text-base xs:text-lg"></i>
              <span className="text-xs xs:text-sm font-medium">{wishlistItems.length} items</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WishList;