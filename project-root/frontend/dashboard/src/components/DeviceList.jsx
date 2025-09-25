import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * DeviceList.jsx
 * Komponen ringkas untuk menampilkan status online/offline
 * setiap device di Dashboard (read-only).
 * Lebih simpel dibanding DeviceTable (yang untuk Settings).
 */
export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get('/devices.php?action=list');
        if (res.success) setDevices(res.data);
      } catch (err) {
        console.error('Gagal memuat daftar device', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();

    // Realtime update via SSE
    const evtSource = new EventSource('/api/events.php');
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'device_status') {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === data.device.id ? { ...d, online: data.device.online } : d
          )
        );
      }
    };
    return () => evtSource.close();
  }, []);

  if (loading) return <p className="text-gray-500">Memuat device...</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Status Device
      </h2>
      {devices.length === 0 ? (
        <p className="text-gray-500">Belum ada device terdaftar.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {devices.map((d) => (
            <li
              key={d.id}
              className="flex justify-between items-center py-2"
            >
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {d.name}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  d.online
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}
              >
                {d.online ? 'Online' : 'Offline'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
