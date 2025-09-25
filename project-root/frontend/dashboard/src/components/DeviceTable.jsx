import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Komponen tabel untuk menampilkan daftar device ESP8266.
 * Menampilkan status online/offline realtime, dan tombol edit/hapus.
 * Dipakai di Settings.jsx
 */
export default function DeviceTable() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data device dari backend
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

    // Opsional: SSE untuk realtime status device
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

  if (loading) return <p className="text-gray-500">Memuat data device...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-blue-600 text-white dark:bg-blue-500">
            <th className="px-4 py-2 text-left">Nama Device</th>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                Belum ada device
              </td>
            </tr>
          )}
          {devices.map((d) => (
            <tr
              key={d.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-4 py-2 font-medium">{d.name}</td>
              <td className="px-4 py-2">{d.device_id}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    d.online
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {d.online ? 'Online' : 'Offline'}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                <button className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded">
                  Edit
                </button>
                <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
