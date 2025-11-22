"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [nationalId, setNationalId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        national_id: nationalId,
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "שגיאה");
      return;
    }

    window.location.href = data.redirect;
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[350px] p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">החלפת סיסמה</h1>

        <label>תעודת זהות</label>
        <input
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <label>סיסמה נוכחית</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <label>סיסמה חדשה</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          החלף סיסמה
        </button>
      </div>
    </div>
  );
}
