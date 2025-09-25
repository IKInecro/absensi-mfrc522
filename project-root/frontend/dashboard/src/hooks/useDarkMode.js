import { useEffect, useState } from "react";

/**
 * Hook untuk mengatur Dark Mode
 * - Simpan preferensi ke localStorage
 * - Update class <html> agar Tailwind dark mode aktif
 */
export default function useDarkMode() {
  const [enabled, setEnabled] = useState(() => {
    // Cek preferensi user di localStorage
    const stored = localStorage.getItem("dark-mode");
    if (stored !== null) return stored === "true";
    // Default: ikuti preferensi OS
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Update class html dan simpan ke localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (enabled) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("dark-mode", enabled);
  }, [enabled]);

  // Toggle state
  const toggle = () => setEnabled((prev) => !prev);

  return [enabled, toggle];
}
