"use client";

import { useState } from "react";
import { Title, Text, TextInput, Button } from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { PlusIcon } from "@heroicons/react/24/outline";

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
      <Button icon={PlusIcon} onClick={() => setOpen(true)}>
        הוסף גולש
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogPanel className="max-w-md">
          <Title className="mb-4">הוספת גולש חדש</Title>

          <div className="flex flex-col gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>תעודת זהות</Text>
              <TextInput
                placeholder="תעודת זהות"
                value={national_id}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>שם מלא</Text>
              <TextInput
                placeholder="שם מלא"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>טלפון</Text>
              <TextInput
                placeholder="טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>אימייל</Text>
              <TextInput
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSave}>
              שמירה
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
