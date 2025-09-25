/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}", // scan semua komponen React
    ],
    theme: {
      extend: {
        colors: {
          // Warna utama untuk status absensi
          hadir: '#22c55e',      // hijau
          terlambat: '#eab308',  // kuning
          tidakdikenal: '#ef4444', // merah
          pulang: '#3b82f6',     // biru
          libur: '#9ca3af',      // abu-abu
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          poppins: ['Poppins', 'sans-serif'],
        },
        boxShadow: {
          bubble: '0 4px 12px rgba(0, 0, 0, 0.15)', // untuk bubble notif
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          fadeOut: {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
          slideDown: {
            '0%': { transform: 'translateY(-100%)' },
            '100%': { transform: 'translateY(0)' },
          },
        },
        animation: {
          fadeIn: 'fadeIn 0.4s ease-out',
          fadeOut: 'fadeOut 0.4s ease-in',
          slideDown: 'slideDown 0.5s ease-out',
        },
      },
    },
    darkMode: 'class', // Dark mode toggle via class
    plugins: [],
  };
  