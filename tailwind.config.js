/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                cormorant: ["Cormorant Garamond", "serif"],
            },
            perspective: {
                '1000': '1000px',
            },
            textShadow: {
                'lg': '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)'
                    },
                }
            },
            screens: {
                'xs': '401px',
                'sm': '640px',
            },
        },
    },
    plugins: [],
}