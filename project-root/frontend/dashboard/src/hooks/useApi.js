import { useState, useCallback } from "react";

/**
 * Hook wrapper untuk fetch API backend.
 * - Menggunakan fetch bawaan browser
 * - Otomatis handle error & retry
 * - Mendukung fallback offline (localStorage cache opsional)
 */
export default function useApi(baseUrl = "/backend/api") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (endpoint, options = {}, { retry = 1, cacheKey = null } = {}) => {
      setLoading(true);
      setError(null);

      const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
      let attempts = 0;

      while (attempts <= retry) {
        try {
          const res = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            ...options,
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
          setLoading(false);
          return data;
        } catch (err) {
          attempts++;
          if (attempts > retry) {
            console.error("API Error:", err);
            setError(err.message);

            // Offline fallback jika ada cache
            if (cacheKey) {
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                console.warn("Using offline cache for:", cacheKey);
                setLoading(false);
                return JSON.parse(cached);
              }
            }
            setLoading(false);
            throw err;
          }
        }
      }
    },
    [baseUrl]
  );

  return { request, loading, error };
}
