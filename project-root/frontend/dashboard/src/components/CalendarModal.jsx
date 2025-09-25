import React, { useState } from "react";

export default function CalendarModal({ isOpen, onClose, onSave, holidays }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [type, setType] = useState("full"); // full = libur penuh, half = setengah hari

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    onSave({ date: selectedDate, type });
    setSelectedDate("");
    setType("full");
  };

  const handleRemove = (date) => {
    if (window.confirm(`Hapus libur pada ${date}?`)) {
      onSave({ date, remove: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Kalender Libur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
              Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
              Jenis
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="full">Libur Penuh</option>
              <option value="half">Setengah Hari</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Simpan
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Daftar Libur
          </h3>
          {holidays.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {holidays.map((h, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded"
                >
                  <span className="text-gray-800 dark:text-gray-100">
                    {h.date} – {h.type === "full" ? "Libur Penuh" : "Setengah Hari"}
                  </span>
                  <button
                    onClick={() => handleRemove(h.date)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              Belum ada tanggal libur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
