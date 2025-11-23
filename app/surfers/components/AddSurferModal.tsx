"use client";

import { useState } from "react";

export default function AddSurferModal({ onSubmit }: { onSubmit: Function }) {
  const [open, setOpen] = useState(false);
  const [national_id, setNationalId] = useState("");
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const clear = () => {
    setNationalId("");
    setFullName("");
    setPhone("");
    setEmail("");
  };

  const handleSave = () => {
    onSubmit({ national_id, full_name, phone, email });
    clear();
    setOpen(false);
  };

  return (
    <>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        ➕ הוסף גולש
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">הוספת גולש חדש</h2>

            <div className="flex flex-col gap-2">
              <input
                className="border p-2 rounded"
                placeholder="תעודת זהות"
                value={national_id}
                onChange={(e) => setNationalId(e.target.value)}
              />

              <input
                className="border p-2 rounded"
                placeholder="שם מלא"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="border p-2 rounded"
                placeholder="טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                className="border p-2 rounded"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setOpen(false)}
              >
                ביטול
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSave}
              >
                שמירה
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
