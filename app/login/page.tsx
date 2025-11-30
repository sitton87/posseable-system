"use client";

import { useState } from "react";

export default function LoginPage() {
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetNationalId, setResetNationalId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleForgotSubmit = async () => {
    setResetError("");
    setResetMessage("");

    if (!resetNationalId || !resetEmail) {
      setResetError("יש למלא את כל השדות");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: resetNationalId.trim(),
          email: resetEmail.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "בקשת האיפוס נכשלה");
      } else {
        setResetMessage(
          data.message ||
            "אם הפרטים תואמים, תישלח אליך סיסמה זמנית לכתובת הדוא\"ל שהוזנה."
        );
        setResetNationalId("");
        setResetEmail("");
      }
    } catch (err) {
      setResetError("אירעה שגיאה, נסה שוב מאוחר יותר");
    } finally {
      setResetLoading(false);
    }
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

        <button
          type="button"
          className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => {
            setShowForgotModal(true);
            setResetError("");
            setResetMessage("");
          }}
        >
          שכחתי סיסמה
        </button>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              איפוס סיסמה
            </h2>

            <label className="text-sm">תעודת זהות</label>
            <input
              value={resetNationalId}
              onChange={(e) => setResetNationalId(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              inputMode="numeric"
              maxLength={9}
            />

            <label className="text-sm">אימייל</label>
            <input
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              type="email"
            />

            {resetError && (
              <div className="text-red-600 text-sm mb-3 text-center">
                {resetError}
              </div>
            )}
            {resetMessage && (
              <div className="text-green-600 text-sm mb-3 text-center">
                {resetMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                disabled={resetLoading}
              >
                סגירה
              </button>
              <button
                type="button"
                onClick={handleForgotSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                disabled={resetLoading}
              >
                {resetLoading ? "שולח..." : "שלח סיסמה זמנית"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
