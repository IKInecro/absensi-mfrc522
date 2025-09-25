import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeviceTable from '../components/DeviceTable.jsx';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // ambil data kartu dari API backend
  useEffect(() => {
    axios.get('/api/cards.php')
      .then(res => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat data kartu:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Manajemen Kartu</h1>

      {loading ? (
        <p className="text-gray-500">Memuat data kartu...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">UID</th>
                <th className="px-4 py-2 text-left">Nama Siswa</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{card.id}</td>
                  <td className="px-4 py-2 font-mono">{card.uid}</td>
                  <td className="px-4 py-2">{card.student_name || '-'}</td>
                  <td className="px-4 py-2">
                    {card.active ? (
                      <span className="text-green-600">Aktif</span>
                    ) : (
                      <span className="text-red-500">Nonaktif</span>
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
