import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data absensi dari backend
  useEffect(() => {
    axios.get('/api/attendance.php')
      .then(res => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat absensi:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Riwayat Absensi</h1>

      {loading ? (
        <p className="text-gray-500">Memuat data absensi...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nama Siswa</th>
                <th className="px-4 py-2 text-left">UID Kartu</th>
                <th className="px-4 py-2 text-left">Waktu</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{row.id}</td>
                  <td className="px-4 py-2">{row.student_name || '-'}</td>
                  <td className="px-4 py-2 font-mono">{row.card_uid}</td>
                  <td className="px-4 py-2">{row.timestamp}</td>
                  <td className="px-4 py-2">
                    {row.status === 'in' ? (
                      <span className="text-green-600">Masuk</span>
                    ) : (
                      <span className="text-red-500">Keluar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
