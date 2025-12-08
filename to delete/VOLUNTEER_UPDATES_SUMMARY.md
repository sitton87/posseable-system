# סיכום עדכונים למערכת המתנדבים

## ✅ מה שכבר בוצע:

### 1. **מסד נתונים**
קבצי SQL שנוצרו:
- `add_volunteer_fields.sql` - הוספת שדות חדשים לטבלת volunteer
- `create_volunteer_surfer_relation.sql` - יצירת טבלת קשר בין מתנדבי מים לגולשים

**יש להריץ את שני הקבצים במסד הנתונים!**

```sql
-- הרץ את הקבצים בסדר הבא:
-- 1. add_volunteer_fields.sql
-- 2. create_volunteer_surfer_relation.sql
```

### 2. **Ty**pes (type.ts)**
✅ עודכן טייפ `Volunteer` עם שדות חדשים:
- `volunteer_type` - מים/מדיה/אחר
- `media_specialization` - צילום/וידאו/רחפן/סושיאל/אחר
- `availability` - זמינות
- `personal_website` - אתר אישי
- `documents` - JSON של מסמכים

✅ נוספו קבועים:
- `VOLUNTEER_TYPE_OPTIONS`
- `MEDIA_SPECIALIZATION_OPTIONS`

### 3. **API Routes**
✅ עודכנו כל ה-routes:
- `/api/volunteers/route.ts` - שליפה עם כל השדות
- `/api/volunteers/add/route.ts` - הוספה עם כל השדות
- `/api/volunteers/update/route.ts` - עדכון עם כל השדות

### 4. **דף המתנדבים (volunteers/page.tsx)**
✅ נוספו:
- State למודל צפייה (`showViewModal`, `viewingVolunteer`)
- פונקציה `handleView`
- כפתור צפייה (👁️) בטבלה
- עדכון `formData` עם כל השדות החדשים
- עדכון `handleSubmit` לשליחת כל השדות

---

## 📋 מה שנותר לעשות (ידנית):

### 1. **הוספת שדות למודל העריכה/הוספה**

יש להוסיף את הסקציה הבאה **לפני** סקציית ההערות במודל ההוספה/עריכה (שורה ~760):

```tsx
{/* סוג מתנדב ופרטים ספציפיים */}
<div
  style={{
    marginBottom: 20,
    padding: 16,
    background: "#f9fafb",
    borderRadius: 8,
  }}
>
  <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
    🏊 סוג מתנדב ופרטים ספציפיים
  </h4>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 12,
    }}
  >
    {/* סוג מתנדב */}
    <div>
      <label style={labelStyle}>סוג מתנדב</label>
      <select
        style={inputStyle}
        value={formData.volunteer_type}
        onChange={(e) =>
          setFormData({ ...formData, volunteer_type: e.target.value })
        }
      >
        <option value="">בחר...</option>
        {VOLUNTEER_TYPE_OPTIONS.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>

    {/* שדות למתנדבי מדיה */}
    {formData.volunteer_type === "מדיה" && (
      <>
        <div>
          <label style={labelStyle}>התמחות</label>
          <select
            style={inputStyle}
            value={formData.media_specialization}
            onChange={(e) =>
              setFormData({
                ...formData,
                media_specialization: e.target.value,
              })
            }
          >
            <option value="">בחר...</option>
            {MEDIA_SPECIALIZATION_OPTIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>זמינות</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
            value={formData.availability}
            onChange={(e) =>
              setFormData({ ...formData, availability: e.target.value })
            }
            placeholder="למשל: ימי שני-רביעי, 09:00-17:00"
          />
        </div>

        <div>
          <label style={labelStyle}>אתר אישי / פורטפוליו</label>
          <input
            type="url"
            style={inputStyle}
            value={formData.personal_website}
            onChange={(e) =>
              setFormData({
                ...formData,
                personal_website: e.target.value,
              })
            }
            placeholder="https://..."
          />
        </div>
      </>
    )}

    {/* מסמכים - לכל סוגי המתנדבים */}
    <div>
      <label style={labelStyle}>מסמכים (JSON)</label>
      <textarea
        style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
        value={formData.documents}
        onChange={(e) =>
          setFormData({ ...formData, documents: e.target.value })
        }
        placeholder='[{"name": "אישור רפואי", "url": "...", "uploadDate": "2024-01-01"}]'
      />
      <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
        פורמט JSON של מסמכים
      </div>
    </div>
  </div>
</div>
```

### 2. **הוספת מודל צפייה**

יש להוסיף את המודל הזה **אחרי** המודל הקיים (שורה ~870, לפני סוגר ה-div האחרון):

```tsx
{/* מודל צפייה */}
{showViewModal && viewingVolunteer && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.35)",
      display: "grid",
      placeItems: "center",
      zIndex: 1000,
      overflow: "auto",
      padding: "20px 0",
    }}
    onClick={() => setShowViewModal(false)}
  >
    <div
      style={{
        ...cardStyle,
        width: "min(900px, 95vw)",
        padding: 24,
        maxHeight: "90vh",
        overflow: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
          פרטי מתנדב - {viewingVolunteer.full_name}
        </h3>
        <button
          style={btnSecondary}
          onClick={() => setShowViewModal(false)}
        >
          ✕ סגור
        </button>
      </div>

      {/* פרטים אישיים */}
      <div style={{ marginBottom: 20 }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: muted,
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: 8,
          }}
        >
          📋 פרטים אישיים
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 24px",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: muted }}>תעודת זהות</div>
            <div style={{ fontWeight: 600, fontFamily: "monospace" }}>
              {viewingVolunteer.national_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>שם מלא</div>
            <div style={{ fontWeight: 600 }}>
              {viewingVolunteer.full_name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>טלפון</div>
            <div>{viewingVolunteer.phone || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>אימייל</div>
            <div>{viewingVolunteer.email || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>סוג</div>
            <div>{viewingVolunteer.kind || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>מקצוע</div>
            <div>{viewingVolunteer.profession || "—"}</div>
          </div>
        </div>
      </div>

      {/* כתובת */}
      {(viewingVolunteer.street ||
        viewingVolunteer.house_number ||
        viewingVolunteer.city) && (
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              color: muted,
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: 8,
            }}
          >
            📍 כתובת
          </h4>
          <div>
            {viewingVolunteer.street} {viewingVolunteer.house_number},{" "}
            {viewingVolunteer.city}
          </div>
        </div>
      )}

      {/* סוג מתנדב ופרטים ספציפיים */}
      {viewingVolunteer.volunteer_type && (
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              color: muted,
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: 8,
            }}
          >
            🏊 סוג מתנדב
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 24px",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>סוג</div>
              <div style={{ fontWeight: 600 }}>
                {viewingVolunteer.volunteer_type}
              </div>
            </div>

            {viewingVolunteer.volunteer_type === "מדיה" && (
              <>
                {viewingVolunteer.media_specialization && (
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      התמחות
                    </div>
                    <div>{viewingVolunteer.media_specialization}</div>
                  </div>
                )}
                {viewingVolunteer.availability && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 12, color: muted }}>
                      זמינות
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {viewingVolunteer.availability}
                    </div>
                  </div>
                )}
                {viewingVolunteer.personal_website && (
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      אתר אישי
                    </div>
                    <a
                      href={viewingVolunteer.personal_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0ea5e9" }}
                    >
                      {viewingVolunteer.personal_website}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* פרטי התנדבות */}
      <div style={{ marginBottom: 20 }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: muted,
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: 8,
          }}
        >
          🏄 פרטי התנדבות
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 24px",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: muted }}>תאריך הצטרפות</div>
            <div>
              {viewingVolunteer.join_date
                ? new Date(viewingVolunteer.join_date).toLocaleDateString(
                    "he-IL"
                  )
                : "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>תאריך הדרכה</div>
            <div>
              {viewingVolunteer.training_date
                ? new Date(
                    viewingVolunteer.training_date
                  ).toLocaleDateString("he-IL")
                : "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>
              סה"כ פעילויות
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>
              {viewingVolunteer.total_activities || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>רמת קשר לים</div>
            <div>
              {viewingVolunteer.sea_connection_level !== null &&
              viewingVolunteer.sea_connection_level !== undefined
                ? SEA_CONNECTION_LEVEL_OPTIONS[
                    viewingVolunteer.sea_connection_level
                  ]?.label || "—"
                : "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: viewingVolunteer.active
                    ? "#d1fae5"
                    : "#fee2e2",
                  color: viewingVolunteer.active ? "#065f46" : "#991b1b",
                }}
              >
                {viewingVolunteer.active ? "פעיל" : "לא פעיל"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* מסמכים */}
      {viewingVolunteer.documents && (
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              color: muted,
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: 8,
            }}
          >
            📄 מסמכים
          </h4>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>
            {viewingVolunteer.documents}
          </div>
        </div>
      )}

      {/* הערות */}
      {viewingVolunteer.notes && (
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              color: muted,
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: 8,
            }}
          >
            📝 הערות
          </h4>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {viewingVolunteer.notes}
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

---

## 🎯 סיכום מהיר

### קבצי SQL להרצה:
1. `add_volunteer_fields.sql`
2. `create_volunteer_surfer_relation.sql`

### קוד להוסיף ל-`volunteers/page.tsx`:
1. **שדות חדשים במודל ההוספה/עריכה** (סקציה לפני ההערות)
2. **מודל צפייה חדש** (בסוף הקובץ לפני הסגירה)

### תכונות חדשות שיהיו זמינות:
✅ סוג מתנדב (מים/מדיה/אחר)
✅ שדות ספציפיים למתנדבי מדיה (התמחות, זמינות, אתר אישי)
✅ מסמכים (JSON)
✅ כפתור צפייה מפורטת למתנדב
✅ טבלת קשר למתנדבי מים-גולשים (לשימוש עתידי)

---

## 🔄 שלבים הבאים (אופציונלי):

1. **ממשק להעלאת מסמכים** - במקום JSON ידני, ניתן להוסיף העלאת קבצים
2. **דף סטטיסטיקות למתנדבי מים** - הצגת הגולשים איתם עבדו
3. **גלריה למתנדבי מדיה** - הצגת עבודות וקישורים
4. **ניהול זמינות חכם** - לוח שנה לבחירת זמינות
