import React, { useEffect, useState } from "react";

const Title = () => {
  const text = " Selamat Datang";

  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Cek ukuran layar
  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth <= 650);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Efek animasi HANYA untuk layar besar
  useEffect(() => {
    if (isSmallScreen) return; // Matikan animasi

    const timeout = setTimeout(() => {
      const nextText = text.slice(0, index + 1);
      setDisplayText(nextText);

      if (index === text.length - 1) {
        setTimeout(() => setIndex(0), 1500);
      } else {
        setIndex((prev) => prev + 1);
      }
    }, 120);

    return () => clearTimeout(timeout);
  }, [index, isSmallScreen]);

  return (
    <div className="text-start mt-10 px-8">
      <h1 className="font-poppins font-extrabold text-4xl text-gray-900 tracking-wide">
        Hallo,
        {isSmallScreen ? text : displayText}
        {!isSmallScreen && <span className="animate-blink ">|</span>}
      </h1>

      <p className="text-gray-600 text-lg mt-3 tracking-wide">
        Ayo Pesan Sebanyak Mungkin!
      </p>
    </div>
  );
};

export default Title;
