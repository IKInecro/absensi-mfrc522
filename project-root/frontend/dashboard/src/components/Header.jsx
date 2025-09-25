import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  const navClass =
    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150';

  const activeClass = 'bg-blue-600 text-white dark:bg-blue-500';
  const inactiveClass =
    'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700';

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Judul */}
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Absensi RFID
          </h1>

          {/* Menu Navigasi */}
          <nav className="flex space-x-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Siswa
            </NavLink>
            <NavLink
              to="/cards"
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Kartu
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Absensi
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${navClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Pengaturan
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
