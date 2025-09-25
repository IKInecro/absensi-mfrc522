import { useEffect, useRef, useState } from "react";

/**
 * Hook untuk berlangganan SSE (Server-Sent Events)
 * Endpoint default: /backend/api/events.php
 * Mengirim update real-time ke dashboard (live feed, bubble notif, dsb.)
 */
export default function useSSE(url = "/backend/api/events.php") {
  const [events, setEvents] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    let retryTimeout;

    const connect = () => {
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setEvents((prev) => [data, ...prev].slice(0, 50)); // simpan max 50 event terbaru
        } catch (err) {
          console.error("Invalid SSE data:", err);
        }
      };

      es.onerror = () => {
        console.warn("SSE connection lost. Reconnecting in 3s...");
        es.close();
        retryTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      clearTimeout(retryTimeout);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [url]);

  return events;
}
