import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard.jsx';
import LiveFeed from '../components/LiveFeed.jsx';
import LiveBubble from '../components/LiveBubble.jsx';
import SyncBanner from '../components/SyncBanner.jsx';
import DeviceList from '../components/DeviceList.jsx';
import useSSE from '../hooks/useSSE.js';
import api from '../services/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    hadir: 0,
    terlambat: 0,
    devicesOnline: 0,
  });
  const [feed, setFeed] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');

  // Subscribe ke SSE untuk update realtime
  useSSE((event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'attendance') {
      // Tambah feed baru di atas
      setFeed((prev) => [data.record, ...prev].slice(0, 50));

      // Bubble notif
      setBubbles((prev) => [
        { id: Date.now(), status: data.record.status, name: data.record.name },
        ...prev,
      ]);
    }

    if (data.type === 'sync') {
      setSyncMessage(`Sync berhasil dari device ${data.device}`);
      setTimeout(() => setSyncMessage(''), 4000);
    }

    if (data.type === 'stats') {
      setStats(data.stats);
    }
  });

  // Fetch stats awal
  useEffect(() => {
    api.getStats().then((res) => setStats(res.data));
  }, []);

  return (
    <div className="space-y-6">
      {syncMessage && <SyncBanner message={syncMessage} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Siswa" value={stats.totalStudents} color="blue" />
        <StatsCard label="Hadir" value={stats.hadir} color="hadir" />
        <StatsCard label="Terlambat" value={stats.terlambat} color="terlambat" />
        <StatsCard label="Device Online" value={stats.devicesOnline} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveFeed records={feed} />
        <DeviceList />
      </div>

      {/* Bubble Notification Overlay */}
      <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none space-y-2">
        {bubbles.slice(0, 3).map((b) => (
          <LiveBubble
            key={b.id}
            status={b.status}
            name={b.name}
            onHide={() => setBubbles((prev) => prev.filter((x) => x.id !== b.id))}
          />
        ))}
      </div>
    </div>
  );
}
