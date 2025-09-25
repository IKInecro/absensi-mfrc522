import React from "react";

export default function ScheduleTable({ schedules, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Jadwal Kehadiran
      </h2>

      {schedules.length > 0 ? (
        <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="px-3 py-2 border-b">Hari</th>
              <th className="px-3 py-2 border-b">Jam Masuk</th>
              <th className="px-3 py-2 border-b">Jam Pulang</th>
              <th className="px-3 py-2 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-2 border-b text-center">{s.day}</td>
                <td className="px-3 py-2 border-b text-center">{s.start_time}</td>
                <td className="px-3 py-2 border-b text-center">{s.end_time}</td>
                <td className="px-3 py-2 border-b text-center space-x-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          Belum ada jadwal yang disimpan.
        </p>
      )}
    </div>
  );
}
