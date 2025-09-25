import { useEffect, useState, useCallback } from "react";
import useSSE from "./useSSE";

/**
 * Hook Live Feed
 * - Subscribe ke SSE `/api/events.php`
 * - Menangkap data absen real-time & menyimpannya dalam state
 * - Menyediakan fungsi clear() untuk mengosongkan feed
 */
export default function useLiveFeed() {
  const [feed, setFeed] = useState([]);

  // Callback setiap ada event baru dari SSE
  const onEvent = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setFeed((prev) => [data, ...prev].slice(0, 50)); // keep max 50 item
    } catch (err) {
      console.error("Invalid SSE data:", err);
    }
  }, []);

  // Langganan ke SSE
  useSSE("/api/events.php", onEvent);

  // Fungsi untuk clear feed
  const clear = () => setFeed([]);

  return { feed, clear };
}
