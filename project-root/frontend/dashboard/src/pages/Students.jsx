import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', kelas: '' });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await api.getStudents(filter);
    setStudents(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (form.id) {
      await api.updateStudent(form);
    } else {
      await api.addStudent(form);
    }
    setForm({ id: null, name: '', kelas: '' });
    fetchStudents();
  };

  const handleEdit = (student) => setForm(student);
  const handleDelete = async (id) => {
    if (confirm('Yakin hapus siswa ini?')) {
      await api.deleteStudent(id);
      fetchStudents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter kelas…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-48"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Nama siswa"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Kelas"
          value={form.kelas}
          onChange={(e) => setForm({ ...form, kelas: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {form.id ? 'Update' : 'Tambah'}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={() => setForm({ id: null, name: '', kelas: '' })}
            className="ml-2 bg-gray-300 px-4 py-2 rounded"
          >
            Batal
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Kelas</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.kelas}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
