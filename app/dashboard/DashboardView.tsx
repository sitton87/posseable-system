"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";

// Styles
const muted = "#6b7280";
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 6px 18px rgba(12,18,31,0.06)",
  border: "1px solid rgba(15,23,42,0.06)",
};

type DashboardStats = {
  volunteers: { total: number; active: number };
  surfers: { total: number; active: number; byProgram: Record<string, number> };
  activities: { total: number; upcoming: number; byKind: Record<string, number> };
  equipment: { total: number; needsRepair: number };
  donors: { total: number; active: number };
  suppliers: { total: number; active: number };
};

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">טוען נתונים...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">שגיאה בטעינת נתונים</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          ברוך הבא למערכת Posseable! 👋
        </h1>
        <p className="text-gray-600 mt-2">סקירה כללית של המערכת</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Volunteers */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🏃 מתנדבים</h3>
            <span className="text-3xl font-bold text-blue-600">
              {stats.volunteers.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>פעילים:</span>
              <span className="font-semibold text-green-600">
                {stats.volunteers.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span>לא פעילים:</span>
              <span className="font-semibold text-gray-500">
                {stats.volunteers.total - stats.volunteers.active}
              </span>
            </div>
          </div>
        </div>

        {/* Surfers */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🏄 גולשים</h3>
            <span className="text-3xl font-bold text-cyan-600">
              {stats.surfers.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>פעילים:</span>
              <span className="font-semibold text-green-600">
                {stats.surfers.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span>לא פעילים:</span>
              <span className="font-semibold text-gray-500">
                {stats.surfers.total - stats.surfers.active}
              </span>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">📅 פעילויות</h3>
            <span className="text-3xl font-bold text-purple-600">
              {stats.activities.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>קרובות:</span>
              <span className="font-semibold text-orange-600">
                {stats.activities.upcoming}
              </span>
            </div>
            <div className="flex justify-between">
              <span>סה"כ:</span>
              <span className="font-semibold">{stats.activities.total}</span>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🛠️ ציוד</h3>
            <span className="text-3xl font-bold text-green-600">
              {stats.equipment.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>תקין:</span>
              <span className="font-semibold text-green-600">
                {stats.equipment.total - stats.equipment.needsRepair}
              </span>
            </div>
            <div className="flex justify-between">
              <span>דורש תיקון:</span>
              <span className="font-semibold text-red-600">
                {stats.equipment.needsRepair}
              </span>
            </div>
          </div>
        </div>

        {/* Donors */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">❤️ תורמים</h3>
            <span className="text-3xl font-bold text-pink-600">
              {stats.donors.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>פעילים:</span>
              <span className="font-semibold text-green-600">
                {stats.donors.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span>לא פעילים:</span>
              <span className="font-semibold text-gray-500">
                {stats.donors.total - stats.donors.active}
              </span>
            </div>
          </div>
        </div>

        {/* Suppliers */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🤝 ספקים</h3>
            <span className="text-3xl font-bold text-indigo-600">
              {stats.suppliers.total}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>פעילים:</span>
              <span className="font-semibold text-green-600">
                {stats.suppliers.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span>לא פעילים:</span>
              <span className="font-semibold text-gray-500">
                {stats.suppliers.total - stats.suppliers.active}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Surfers by Program */}
        <div style={cardStyle}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            גולשים לפי תוכנית
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.surfers.byProgram).map(([program, count]) => (
              <div
                key={program}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700">{program}</span>
                <span className="text-lg font-bold text-cyan-600">{count}</span>
              </div>
            ))}
            {Object.keys(stats.surfers.byProgram).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                אין נתונים זמינים
              </div>
            )}
          </div>
        </div>

        {/* Activities by Kind */}
        <div style={cardStyle}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            פעילויות לפי סוג
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.activities.byKind).map(([kind, count]) => (
              <div
                key={kind}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700">{kind}</span>
                <span className="text-lg font-bold text-purple-600">
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(stats.activities.byKind).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                אין נתונים זמינים
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">פעולות מהירות</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/volunteers"
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold text-blue-900">הוסף מתנדב</div>
          </a>
          <a
            href="/surfers"
            className="p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg text-center transition"
          >
            <div className="text-2xl mb-2">🏄</div>
            <div className="font-semibold text-cyan-900">הוסף גולש</div>
          </a>
          <a
            href="/activities"
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold text-purple-900">תזמן פעילות</div>
          </a>
          <a
            href="/equipment"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
          >
            <div className="text-2xl mb-2">🛠️</div>
            <div className="font-semibold text-green-900">נהל ציוד</div>
          </a>
        </div>
      </div>
    </div>
  );
}
