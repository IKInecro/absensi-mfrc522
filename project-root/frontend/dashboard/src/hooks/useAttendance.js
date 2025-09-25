import { useEffect, useState, useCallback } from "react";
import { getAttendance } from "../services/api";
import useSSE from "./useSSE";

/**
 * Hook Attendance Data
 * - Ambil riwayat absensi awal
 * - Update real-time lewat SSE (attendance_new)
 */
export default function useAttendance(filters = {}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data awal
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAttendance(filters);
      setRecords(res || []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // SSE: push data baru ke atas list
  const onEvent = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "attendance_new") {
        setRecords((prev) => [data.record, ...prev]);
      }
    } catch (err) {
      console.error("Invalid SSE data:", err);
    }
  }, []);

  // Panggil pertama kali + SSE
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useSSE("/api/events.php", onEvent);

  return { records, loading, refresh: fetchAttendance };
}
