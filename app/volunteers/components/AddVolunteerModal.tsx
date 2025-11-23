"use client";

import { useState } from "react";

export default function AddVolunteerModal({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [national_id, setNationalId] = useState("");
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState("Water");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const res = await fetch("/api/volunteers/add", {
      method: "POST",
      body: JSON.stringify({
        national_id,
        full_name,
        phone,
        email,
        kind,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setOpen(false);
    setNationalId("");
    setFullName("");
    setPhone("");
    setEmail("");
    setKind("Water");
    onSuccess();
  };

  return (
    <>
      {/* כפתור פתיחה */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        ➕ הוסף מתנדב
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[380px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">הוספת מתנדב</h2>

            <div className="flex flex-col gap-3">
              <input
                placeholder="תעודת זהות"
                className="border p-2 rounded"
                value={national_id}
                onChange={(e) => setNationalId(e.target.value)}
              />

              <input
                placeholder="שם מלא"
                className="border p-2 rounded"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                placeholder="טלפון"
                className="border p-2 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                placeholder="אימייל"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <select
                className="border p-2 rounded"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="Water">⛵ מתנדב מים</option>
                <option value="Media">📷 מתנדב מדיה</option>
              </select>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  ביטול
                </button>

                <button
                  onClick={submit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  שמירה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
