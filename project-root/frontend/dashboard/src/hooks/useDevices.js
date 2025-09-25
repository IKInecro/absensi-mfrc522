import { useEffect, useState, useCallback } from "react";
import { getDevices } from "../services/api";
import useSSE from "./useSSE";

/**
 * Hook Device Data
 * - Ambil daftar device ESP dari API
 * - Update status online/offline real-time lewat SSE
 */
export default function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data awal dari API
  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDevices();
      setDevices(res || []);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE update status device
  const onEvent = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "device_status") {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === data.device_id
              ? { ...d, online: data.online, last_seen: data.last_seen }
              : d
          )
        );
      }
    } catch (err) {
      console.error("Invalid SSE data:", err);
    }
  }, []);

  // Panggil pertama kali + langganan SSE
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useSSE("/api/events.php", onEvent);

  return { devices, loading, refresh: fetchDevices };
}
