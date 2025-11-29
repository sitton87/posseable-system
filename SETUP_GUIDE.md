# 🚀 Posseable System - מדריך התקנה והפעלה

## ✅ מה הושלם

כל הדפים והפיצ'רים הבאים **מוכנים ופועלים**:

### 📄 דפי ניהול (CRUD מלא)
- ✅ **Dashboard** - לוח בקרה עם סטטיסטיקות מלאות
- ✅ **Volunteers** - ניהול מתנדבים
- ✅ **Surfers** - ניהול גולשים (עם טפסים מורכבים)
- ✅ **Groups** - ניהול קבוצות
- ✅ **Activities** - ניהול פעילויות
- ✅ **Seasons** - ניהול עונות
- ✅ **Equipment** - ניהול ציוד
- ✅ **Donors** - ניהול תורמים
- ✅ **Suppliers** - ניהול ספקים
- ✅ **Finance** - ניהול כספים (הכנסות והוצאות)

### 🔐 מערכת אימות
- ✅ Login עם session cookies
- ✅ Middleware protection
- ✅ Reset password

---

## 📋 צעדים להפעלה

### 1️⃣ הכן את בסיס הנתונים

הרץ את הקובץ `database_schema.sql` בSQL Server שלך:

```sql
-- קובץ זה יוצר את הטבלה החסרה: finance_transaction
-- ויבדוק שכל שאר הטבלאות קיימות
```

**חשוב:** ודא שכל הטבלאות הבאות קיימות ב-DB:
- `app_user`
- `volunteer`
- `role`
- `volunteer_role`
- `surfer`
- `groups`
- `season_plan`
- `activity`
- `registration`
- `equipment`
- `activity_equipment`
- `donor`
- `supplier`
- `finance_transaction` ✨ (חדש!)

---

### 2️⃣ וודא את קובץ `.env.local`

צור/ערוך קובץ `.env.local` בשורש הפרויקט:

```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=posseable_db
DB_PORT=1433
```

---

### 3️⃣ התקן תלויות והרץ

```bash
# התקן חבילות
npm install

# הרץ את השרת
npm run dev
```

פתח דפדפן: `http://localhost:3000`

---

## 🗺️ מבנה הדפים

### דף הבית / Login
- `/` - מפנה ל-login
- `/login` - התחברות
- `/reset-password` - איפוס סיסמה

### Dashboard
- `/dashboard` - לוח בקרה עם:
  - סטטיסטיקות כלליות (מתנדבים, גולשים, פעילויות)
  - פילוח גולשים לפי תוכניות
  - פילוח פעילויות לפי סוג
  - קיצורי דרך לפעולות מהירות

### ניהול אנשים
- `/volunteers` - ניהול מתנדבים
  - הוספה, עריכה, מחיקה
  - פילטר פעיל/לא פעיל
- `/surfers` - ניהול גולשים
  - טופס מורכב: פרטים אישיים, רפואיים, חירום
  - פילטר לפי תוכנית וסטטוס
  - סטטיסטיקות לפי תוכנית

### ניהול פעילויות וקבוצות
- `/groups` - ניהול קבוצות
  - שם, תיאור, עונה
  - מינימום/מקסימום משתתפים
  - סטטוס: פעיל/סגור/מלא/הושהה
- `/activities` - ניהול פעילויות
  - סוג, תאריך, שעה, מיקום
  - קישור לקבוצה ועונה
  - קיבולת, סטטוס
- `/seasons` - ניהול עונות
  - שם, שנה, תאריך התחלה וסיום
  - חישוב משך העונה

### ניהול משאבים
- `/equipment` - ניהול ציוד
  - שם, קטגוריה, מידה
  - מצב הציוד
  - פילטר לפי קטגוריה ומצב
- `/suppliers` - ניהול ספקים
  - שם הספק, איש קשר
  - טלפון, אימייל
- `/donors` - ניהול תורמים
  - שם, ארגון
  - פרטי קשר

### ניהול כספים
- `/finance` - ניהול כספים
  - תנועות הכנסות והוצאות
  - סיכום: סה"כ הכנסות, הוצאות, יתרה
  - קטגוריות מותאמות לכל סוג
  - פילטר לפי סוג תנועה

---

## 🎨 עיצוב ו-UI

כל הדפים מעוצבים באופן זהה:
- **כרטיסים** עם shadow מודרני
- **גרדיאנטים** צבעוניים בכפתורים
- **Status badges** עם צבעים
- **מודלים** לעריכה והוספה
- **טבלאות responsive**
- **RTL** מלא (עברית)

---

## 🔌 API Routes

כל דף כולל API מלא:

### Volunteers
- `GET /api/volunteers` - שליפה
- `POST /api/volunteers/add` - הוספה
- `PUT /api/volunteers/update` - עדכון
- `DELETE /api/volunteers/update?id=` - מחיקה

### Surfers
- `GET /api/surfer?program=...&status=...` - שליפה עם פילטרים
- `POST /api/surfer/add` - הוספה
- `PUT /api/surfer/update` - עדכון
- `DELETE /api/surfer/update?national_id=` - מחיקה

### Groups
- `GET /api/groups` - שליפה
- `POST /api/groups/add` - הוספה
- `PUT /api/groups/update` - עדכון
- `DELETE /api/groups/update?id=` - מחיקה

### Activities
- `GET /api/activities?kind=...&status=...` - שליפה עם פילטרים
- `POST /api/activities/add` - הוספה
- `PUT /api/activities/update` - עדכון
- `DELETE /api/activities/update?id=` - מחיקה

### Seasons
- `GET /api/seasons` - שליפה
- `POST /api/seasons/add` - הוספה
- `PUT /api/seasons/update` - עדכון
- `DELETE /api/seasons/update?id=` - מחיקה

### Equipment
- `GET /api/equipment?category=...&condition=...` - שליפה עם פילטרים
- `POST /api/equipment/add` - הוספה
- `PUT /api/equipment/update` - עדכון
- `DELETE /api/equipment/update?id=` - מחיקה (soft delete)

### Donors
- `GET /api/donors` - שליפה
- `POST /api/donors/add` - הוספה
- `PUT /api/donors/update` - עדכון
- `DELETE /api/donors/update?id=` - מחיקה (soft delete)

### Suppliers
- `GET /api/suppliers` - שליפה
- `POST /api/suppliers/add` - הוספה
- `PUT /api/suppliers/update` - עדכון
- `DELETE /api/suppliers/update?id=` - מחיקה (soft delete)

### Finance
- `GET /api/finance?type=...` - שליפה עם פילטר
- `POST /api/finance/add` - הוספה
- `PUT /api/finance/update` - עדכון
- `DELETE /api/finance/update?id=` - מחיקה

### Dashboard
- `GET /api/dashboard/stats` - סטטיסטיקות מלאות

---

## 📦 תלויות

```json
{
  "next": "16.0.3",
  "react": "19.2.0",
  "mssql": "12.1.0",
  "bcrypt": "6.0.0",
  "lucide-react": "0.539.0",
  "clsx": "2.1.1",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

---

## 🎯 פיצ'רים מיוחדים

### Dashboard
- סטטיסטיקות בזמן אמת מה-DB
- גרפים של גולשים לפי תוכנית
- גרפים של פעילויות לפי סוג
- קיצורי דרך לפעולות נפוצות

### Navbar
- מתכווץ/מתרחב (hover)
- ניתן לנעיצה (pin)
- שומר מצב ב-localStorage
- 10 קישורים: Dashboard, Volunteers, Surfers, Groups, Activities, Seasons, Equipment, Suppliers, Donors, Finance

### Finance
- סיכום כולל: הכנסות, הוצאות, יתרה
- קטגוריות נפרדות להכנסות והוצאות
- פילטר לפי סוג
- תצוגה צבעונית (ירוק/אדום)

---

## 🔧 פתרון בעיות

### שגיאה: "Cannot connect to database"
- בדוק את קובץ `.env.local`
- ודא ש-SQL Server רץ
- בדוק firewall/ports

### שגיאה: "Table does not exist"
- הרץ את `database_schema.sql`
- ודא שכל הטבלאות נוצרו

### שגיאה: "Session expired"
- התחבר מחדש ב-`/login`

---

## 📞 תמיכה

אם יש בעיות:
1. בדוק את הקונסול ב-browser (F12)
2. בדוק את הלוגים בטרמינל של Next.js
3. ודא שכל הטבלאות ב-DB תואמות ל-types ב-`type.ts`

---

## ✨ הצלחה!

המערכת מוכנה לשימוש. כל הדפים עובדים עם CRUD מלא, עיצוב מודרני, ו-API מלא! 🎉

