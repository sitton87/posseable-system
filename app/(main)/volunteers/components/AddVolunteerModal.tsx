"use client";

import React, { useState, useEffect } from "react";
import { Volunteer } from "@/type";
import {
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Switch,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

interface AddVolunteerModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingVolunteer: Volunteer | null;
  fetchVolunteers: () => void;
}

export default function AddVolunteerModal({
  showModal,
  setShowModal,
  editingVolunteer,
  fetchVolunteers,
}: AddVolunteerModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    kind: "",
    active: true,
    notes: "",
  });

  useEffect(() => {
    if (editingVolunteer) {
      setFormData({
        full_name: editingVolunteer.full_name,
        phone: editingVolunteer.phone || "",
        email: editingVolunteer.email || "",
        kind: editingVolunteer.kind || "",
        active: editingVolunteer.active,
        notes: editingVolunteer.notes || "",
      });
    } else {
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        kind: "",
        active: true,
        notes: "",
      });
    }
  }, [editingVolunteer, showModal]);

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      alert("שם מלא הוא שדה חובה");
      return;
    }

    try {
      const url = editingVolunteer
        ? "/api/volunteers/update"
        : "/api/volunteers/add";
      const method = editingVolunteer ? "PUT" : "POST";
      const body = editingVolunteer
        ? { id: editingVolunteer.national_id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingVolunteer ? "מתנדב עודכן בהצלחה!" : "מתנדב נוסף בהצלחה!");
        setShowModal(false);
        fetchVolunteers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving volunteer:", err);
      alert("שגיאה בשמירת מתנדב");
    }
  };

  return (
    <Dialog open={showModal} onClose={() => setShowModal(false)}>
      <DialogPanel className="max-w-md">
        <Title className="mb-6">
          {editingVolunteer ? "ערוך מתנדב" : "הוסף מתנדב חדש"}
        </Title>

        <div className="flex flex-col gap-4">
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              שם מלא <span style={{ color: cssVar.status.danger }}>*</span>
            </Text>
            <TextInput
              placeholder="הזן שם מלא"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                טלפון
              </Text>
              <TextInput
                type="tel"
                placeholder="050-1234567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                אימייל
              </Text>
              <TextInput
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              סוג מתנדב
            </Text>
            <TextInput
              placeholder="למשל: מדריך, רפרנט, וכו׳"
              value={formData.kind}
              onChange={(e) =>
                setFormData({ ...formData, kind: e.target.value })
              }
            />
          </div>

          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              הערות
            </Text>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="הערות נוספות..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.active}
              onChange={(val) =>
                setFormData({ ...formData, active: val })
              }
            />
            <Text className="font-semibold text-sm">
              מתנדב פעיל
            </Text>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>
            {editingVolunteer ? "עדכן" : "הוסף"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
