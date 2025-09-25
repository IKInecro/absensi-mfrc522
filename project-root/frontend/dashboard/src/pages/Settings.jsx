import { useState, useEffect } from "react";
import DeviceTable from "../components/DeviceTable";
import DarkModeToggle from "../components/DarkModeToggle";
import TimePicker from "../components/TimePicker";

export default function Settings() {
  const [devices, setDevices] = useState([]);
  const [registerMode, setRegisterMode] = useState(false);
  const [jamMasuk, setJamMasuk] = useState("07:00");

  useEffect(() => {
    fetch("http://localhost/backend/api/devices.php")
      .then(res => res.json())
      .then(data => setDevices(data));
  }, []);

  const handleSave = async () => {
    await fetch("http://localhost/backend/api/settings.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registerMode,
        jamMasuk
      })
    });
    alert("✅ Pengaturan disimpan!");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">⚙️ Pengaturan</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Jam Masuk</h2>
        <TimePicker value={jamMasuk} onChange={setJamMasuk} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center justify-between">
        <span className="font-semibold">Mode Register</span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={registerMode}
          onChange={() => setRegisterMode(!registerMode)}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Dark Mode</h2>
        <DarkModeToggle />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Daftar Device</h2>
        <DeviceTable devices={devices} />
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        💾 Simpan
      </button>
    </div>
  );
}
