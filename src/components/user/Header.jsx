// components/user/Header.jsx
import React from "react";
import "boxicons/css/boxicons.min.css";

const Header = ({ userData, onLogout }) => {
  return (
    <header
      className="w-full flex items-center justify-between py-4 px-8 
      bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl 
      shadow-[0_10px_30px_rgba(186,118,48,0.3),0_4px_12px_rgba(186,118,48,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
      transform transition-all duration-300 hover:shadow-[0_15px_35px_rgba(186,118,48,0.4),0_6px_18px_rgba(186,118,48,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
       relative border border-amber-500
      max-[650px]:flex-col max-[650px]:items-center max-[650px]:gap-4"
    >
      {/* Efek Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 pointer-events-none"></div>
      
      {/* Logo */}
      <h2
        className="text-3xl tracking-wide text-white font-poppins text-center font-bold relative z-10
        max-[450px]:text-3xl max-[390px]:text-2xl transform transition-transform hover:scale-105
        whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      >
       Raharpa <span className="text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Shopp</span>
      </h2>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 max-[422px]:justify-center max-[390px]:gap-2 relative z-10">
        {/* Home Button */}
        <button
          className="px-5 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-amber-200/50
          text-amber-700 font-medium tracking-wide flex items-center gap-2
          shadow-[0_4px_15px_rgba(0,0,0,0.1),0_2px_8px_rgba(186,118,48,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]
          transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),0_3px_12px_rgba(186,118,48,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]
          transform hover:-translate-y-1 max-[390px]:px-4 max-[390px]:py-1.5 max-[390px]:text-sm"
        >
          <i className="bx bx-home text-xl text-amber-600 max-[390px]:text-lg"></i>
          Home
        </button>

        {/* Logout Button - Hanya tampil jika user sudah login */}
        {userData && (
          <button
            onClick={onLogout}
            className="px-5 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-amber-300/30
            text-white font-medium tracking-wide flex items-center gap-2 
            shadow-[0_4px_15px_rgba(0,0,0,0.2),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
            transition-all duration-300 hover:bg-white/30 hover:scale-105 
            hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),0_3px_12px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
            transform hover:-translate-y-1 border-white/40
            max-[390px]:px-4 max-[390px]:py-1.5 max-[390px]:text-sm"
          >
            <i className="bx bx-log-out text-xl max-[390px]:text-lg"></i>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;