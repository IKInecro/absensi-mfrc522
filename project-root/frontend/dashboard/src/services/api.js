/**
 * Service API – Semua panggilan endpoint backend
 * Memanfaatkan hook `useApi` untuk komunikasi dengan backend.
 * Dipakai di komponen/page untuk memanggil data atau melakukan CRUD.
 */

import useApi from "../hooks/useApi";

export default function useBackendApi() {
  const { request, loading, error } = useApi("/backend/api");

  return {
    loading,
    error,

    // === Students ===
    getStudents: () => request("/students.php"),
    createStudent: (payload) =>
      request("/students.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateStudent: (id, payload) =>
      request(`/students.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteStudent: (id) =>
      request(`/students.php?id=${id}`, { method: "DELETE" }),

    // === Cards ===
    getCards: () => request("/cards.php"),
    createCard: (payload) =>
      request("/cards.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateCard: (id, payload) =>
      request(`/cards.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteCard: (id) =>
      request(`/cards.php?id=${id}`, { method: "DELETE" }),

    // === Devices ===
    getDevices: () => request("/devices.php"),
    createDevice: (payload) =>
      request("/devices.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateDevice: (id, payload) =>
      request(`/devices.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteDevice: (id) =>
      request(`/devices.php?id=${id}`, { method: "DELETE" }),

    // === Attendance ===
    getAttendance: (params = "") => request(`/attendance.php${params}`),
    createAttendance: (payload) =>
      request("/attendance.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    // === Schedule ===
    getSchedule: () => request("/schedule.php"),
    updateSchedule: (payload) =>
      request("/schedule.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    // === Holidays ===
    getHolidays: () => request("/holidays.php"),
    updateHolidays: (payload) =>
      request("/holidays.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    // === Settings (jika dipakai) ===
    getSettings: () => request("/settings.php"),
    updateSettings: (payload) =>
      request("/settings.php", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  };
}
