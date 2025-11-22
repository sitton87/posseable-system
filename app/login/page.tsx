"use client";

import { useState } from "react";

export default function LoginPage() {
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        national_id: nationalId,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    window.location.href = data.redirect;
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[350px] p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">כניסה למערכת</h1>

        <label>תעודת זהות</label>
        <input
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <label>אימייל</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full border p-2 rounded mb-3"
        />

        <label>סיסמה</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full border p-2 rounded mb-3"
        />

        {error && (
          <div className="text-red-600 text-sm mb-3 text-center">{error}</div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          כניסה
        </button>
      </div>
    </div>
  );
}
