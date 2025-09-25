import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LiveFeed() {
  const [logs, setLogs] = useState([]);

  // Ambil data absensi terbaru secara periodik
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/attendance/live.php");
        setLogs(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil live feed:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // refresh tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Live Feed Absensi
      </h2>
      <div className="max-h-64 overflow-y-auto">
        {logs.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log, idx) => (
              <li key={idx} className="py-2 flex justify-between text-sm">
                <span className="font-medium">{log.student_name}</span>
                <span className="text-gray-500 dark:text-gray-300">
                  {log.timestamp}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            Belum ada data absensi terbaru.
          </p>
        )}
      </div>
    </div>
  );
}
