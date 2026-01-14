# PosSEAble Design System

מערכת עיצוב מרכזית עבור פרויקט PosSEAble.

## 📁 מבנה הקבצים

```
app/styles/design-system/
├── design-tokens.css    # CSS Variables - כל ה-tokens
├── tailwind-theme.css   # הרחבת Tailwind עם ה-tokens
├── theme.ts             # TypeScript types, helpers, presets
├── DESIGN_SYSTEM.md     # תיעוד (קובץ זה)
└── index.ts             # Export מרכזי
```

---

## 🚀 התקנה והטמעה

### שלב 1: עדכון globals.css

הוסף את ה-imports בתחילת הקובץ:

```css
/* app/globals.css */
@import "./styles/design-system/design-tokens.css";
@import "./styles/design-system/tailwind-theme.css";
@import "tailwindcss";
/* ... שאר הקוד ... */
```

### שלב 2: שימוש בקומפוננטות

```tsx
// אפשרות 1: Tailwind classes
<span className="text-ds-text-primary">טקסט ראשי</span>
<div className="bg-ds-bg-secondary border-ds-border">...</div>

// אפשרות 2: TypeScript helpers
import { tw, cssVar, presets } from '@/app/styles/design-system/theme';

<span className={tw.text.primary}>טקסט ראשי</span>
<div style={{ color: cssVar.text.primary }}>...</div>
<button className={presets.buttonPrimary.className}>לחץ כאן</button>
```

---

## 🎨 צבעים

### צבעי טקסט

| Token                    | Tailwind Class           | שימוש                    |
| ------------------------ | ------------------------ | ------------------------ |
| `--color-text-primary`   | `text-ds-text-primary`   | כותרות ראשיות            |
| `--color-text-secondary` | `text-ds-text-secondary` | טקסט גוף רגיל            |
| `--color-text-muted`     | `text-ds-text-muted`     | טקסט משני                |
| `--color-text-subtle`    | `text-ds-text-subtle`    | טקסט עמום (placeholders) |
| `--color-text-inverted`  | `text-ds-text-inverted`  | טקסט על רקע כהה          |

### צבעי רקע

| Token                  | Tailwind Class       | שימוש                |
| ---------------------- | -------------------- | -------------------- |
| `--color-bg-primary`   | `bg-ds-bg-primary`   | רקע ראשי (לבן)       |
| `--color-bg-secondary` | `bg-ds-bg-secondary` | רקע משני (אפור בהיר) |
| `--color-bg-tertiary`  | `bg-ds-bg-tertiary`  | רקע שלישוני          |
| `--color-bg-hover`     | `bg-ds-bg-hover`     | מצב hover            |
| `--color-bg-active`    | `bg-ds-bg-active`    | מצב active           |

### צבעי מותג

| Token                         | Tailwind Class       | שימוש     |
| ----------------------------- | -------------------- | --------- |
| `--color-brand-primary`       | `bg-ds-brand`        | כחול ראשי |
| `--color-brand-primary-hover` | `bg-ds-brand-hover`  | hover     |
| `--color-brand-primary-light` | `bg-ds-brand-light`  | רקע בהיר  |
| `--color-brand-primary-text`  | `text-ds-brand-text` | טקסט כחול |

### צבעים סמנטיים

| סוג     | רקע             | טקסט                   | רקע בהיר              |
| ------- | --------------- | ---------------------- | --------------------- |
| Success | `bg-ds-success` | `text-ds-success-text` | `bg-ds-success-light` |
| Warning | `bg-ds-warning` | `text-ds-warning-text` | `bg-ds-warning-light` |
| Danger  | `bg-ds-danger`  | `text-ds-danger-text`  | `bg-ds-danger-light`  |
| Info    | `bg-ds-info`    | `text-ds-info-text`    | `bg-ds-info-light`    |

---

## 📝 טיפוגרפיה

### גדלי פונט

| Token              | ערך  | שימוש         |
| ------------------ | ---- | ------------- |
| `--font-size-xs`   | 12px | labels קטנים  |
| `--font-size-sm`   | 14px | טקסט משני     |
| `--font-size-base` | 16px | טקסט רגיל     |
| `--font-size-lg`   | 18px | כותרות משנה   |
| `--font-size-xl`   | 20px | כותרות        |
| `--font-size-2xl`  | 24px | כותרות גדולות |
| `--font-size-3xl`  | 30px | כותרות ראשיות |
| `--font-size-4xl`  | 36px | hero          |

### משקלי פונט

| Token                     | ערך | שימוש         |
| ------------------------- | --- | ------------- |
| `--font-weight-normal`    | 400 | טקסט רגיל     |
| `--font-weight-medium`    | 500 | טקסט מודגש קל |
| `--font-weight-semibold`  | 600 | כותרות משנה   |
| `--font-weight-bold`      | 700 | כותרות        |
| `--font-weight-extrabold` | 800 | כותרות ראשיות |

---

## 📐 ריווח (Spacing)

סקאלת ריווח מבוססת על 4px:

| Token          | ערך     | פיקסלים |
| -------------- | ------- | ------- |
| `--spacing-1`  | 0.25rem | 4px     |
| `--spacing-2`  | 0.5rem  | 8px     |
| `--spacing-3`  | 0.75rem | 12px    |
| `--spacing-4`  | 1rem    | 16px    |
| `--spacing-5`  | 1.25rem | 20px    |
| `--spacing-6`  | 1.5rem  | 24px    |
| `--spacing-8`  | 2rem    | 32px    |
| `--spacing-10` | 2.5rem  | 40px    |
| `--spacing-12` | 3rem    | 48px    |
| `--spacing-16` | 4rem    | 64px    |

---

## 🔲 פינות מעוגלות (Border Radius)

| Token           | ערך    | שימוש          |
| --------------- | ------ | -------------- |
| `--radius-sm`   | 4px    | inputs קטנים   |
| `--radius-md`   | 6px    | buttons        |
| `--radius-lg`   | 8px    | cards          |
| `--radius-xl`   | 12px   | modals         |
| `--radius-2xl`  | 16px   | cards גדולים   |
| `--radius-full` | 9999px | pills, avatars |

---

## 🌫️ צללים (Shadows)

| Token          | שימוש            |
| -------------- | ---------------- |
| `--shadow-sm`  | קומפוננטות קטנות |
| `--shadow-md`  | cards            |
| `--shadow-lg`  | dropdowns        |
| `--shadow-xl`  | modals           |
| `--shadow-2xl` | overlays         |

---

## ⏱️ מעברים (Transitions)

| Token               | משך   | שימוש            |
| ------------------- | ----- | ---------------- |
| `--duration-fast`   | 100ms | hover states     |
| `--duration-normal` | 200ms | רוב המעברים      |
| `--duration-slow`   | 300ms | פתיחת תפריטים    |
| `--duration-slower` | 500ms | אנימציות מורכבות |

---

## 📦 קומפוננטות

### Card

```tsx
// CSS Variables
--card-padding: var(--spacing-4);
--card-radius: var(--radius-lg);
--card-shadow: var(--shadow-sm);

// שימוש
<div className="bg-ds-bg-primary border border-ds-border rounded-ds-card shadow-ds-card p-4">
  ...
</div>

// או עם preset
import { presets } from '@/app/styles/design-system/theme';
<div className={presets.card.className}>...</div>
```

### Modal

```tsx
// CSS Variables
--modal-padding: var(--spacing-6);
--modal-radius: var(--radius-xl);
--modal-width-sm: 400px;
--modal-width-md: 500px;
--modal-width-lg: 700px;

// שימוש
<div className="rounded-ds-modal shadow-ds-modal" style={{ maxWidth: 'var(--modal-width-lg)' }}>
  ...
</div>
```

### Button

```tsx
// Primary
<button className={presets.buttonPrimary.className}>
  שמור
</button>

// Secondary
<button className={presets.buttonSecondary.className}>
  ביטול
</button>

// Danger
<button className={presets.buttonDanger.className}>
  מחק
</button>
```

### Badge

```tsx
import { presets } from '@/app/styles/design-system/theme';

<span className={`px-2 py-0.5 rounded-full text-xs ${presets.badge.success}`}>
  פעיל
</span>

<span className={`px-2 py-0.5 rounded-full text-xs ${presets.badge.danger}`}>
  לא פעיל
</span>
```

---

## 🔄 מיגרציה מהקוד הקיים

### לפני (Tailwind ישיר)

```tsx
<span className="text-slate-600 hover:text-slate-800">טקסט</span>
<div className="bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
  ...
</div>
<button className="bg-blue-500 hover:bg-blue-600 text-white rounded-md">
  כפתור
</button>
```

### אחרי (Design System)

```tsx
<span className="text-ds-text-secondary hover:text-ds-text-primary">טקסט</span>
<div className="bg-ds-bg-secondary border border-ds-border rounded-ds-card shadow-ds-card">
  ...
</div>
<button className="bg-ds-brand hover:bg-ds-brand-hover text-ds-text-inverted rounded-ds-button">
  כפתור
</button>
```

### טבלת המרה מהירה

| Tailwind ישן       | Design System חדש        |
| ------------------ | ------------------------ |
| `text-slate-800`   | `text-ds-text-primary`   |
| `text-slate-600`   | `text-ds-text-secondary` |
| `text-slate-500`   | `text-ds-text-muted`     |
| `text-slate-400`   | `text-ds-text-subtle`    |
| `bg-white`         | `bg-ds-bg-primary`       |
| `bg-slate-50`      | `bg-ds-bg-secondary`     |
| `bg-slate-100`     | `bg-ds-bg-tertiary`      |
| `bg-blue-500`      | `bg-ds-brand`            |
| `bg-blue-600`      | `bg-ds-brand-hover`      |
| `bg-blue-50`       | `bg-ds-brand-light`      |
| `text-blue-700`    | `text-ds-brand-text`     |
| `border-slate-200` | `border-ds-border`       |
| `rounded-lg`       | `rounded-ds-lg`          |
| `shadow-sm`        | `shadow-ds-sm`           |

---

## 🃏 כרטיסים (Cards)

### ייבוא

```tsx
import { card } from "@/app/styles/design-system";
```

### מבנה כרטיס בסיסי

```tsx
<div className={card.base}>
  <div className={card.header}>
    <h3 className={card.title}>כותרת הכרטיס</h3>
    <span className={card.subtitle}>כותרת משנה</span>
  </div>
  <div className={card.body}>{/* תוכן הכרטיס */}</div>
  <div className={card.footer}>{/* פעולות */}</div>
</div>
```

### סוגי כרטיסים

| Class              | תיאור                  |
| ------------------ | ---------------------- |
| `card.base`        | כרטיס בסיסי            |
| `card.interactive` | כרטיס עם אפקט hover    |
| `card.selected`    | כרטיס נבחר (גבול כחול) |
| `card.disabled`    | כרטיס מושבת            |

### חלקי כרטיס

| Class                    | תיאור                      |
| ------------------------ | -------------------------- |
| `card.header`            | Header עם רקע אפור         |
| `card.headerTransparent` | Header ללא רקע             |
| `card.body`              | תוכן הכרטיס (padding רגיל) |
| `card.bodySm`            | תוכן עם padding קטן        |
| `card.bodyLg`            | תוכן עם padding גדול       |
| `card.footer`            | Footer עם רקע אפור         |
| `card.footerTransparent` | Footer ללא רקע             |

### שורות מידע (Info Rows)

```tsx
// שורת מידע בודדת
<div className={card.infoRow}>
  <span className={card.infoLabel}>טלפון</span>
  <span className={card.infoValue}>050-1234567</span>
</div>

// רשימת שורות מידע
<div className={card.body}>
  <div className={card.infoRow}>
    <span className={card.infoLabel}>שם</span>
    <span className={card.infoValue}>יוסי כהן</span>
  </div>
  <div className={card.infoRow}>
    <span className={card.infoLabel}>טלפון</span>
    <span className={card.infoValue}>050-1234567</span>
  </div>
  <div className={card.infoRow}>
    <span className={card.infoLabel}>קבוצה</span>
    <span className={card.infoValue}>קבוצה א</span>
  </div>
</div>
```

### Grid של שדות מידע

```tsx
<div className={card.infoGrid2}>
  <div className={card.infoField}>
    <span className={card.infoFieldLabel}>טלפון</span>
    <span className={card.infoFieldValue}>050-1234567</span>
  </div>
  <div className={card.infoField}>
    <span className={card.infoFieldLabel}>אימייל</span>
    <span className={card.infoFieldValue}>user@email.com</span>
  </div>
</div>
```

### אינדיקטורים של סטטוס

```tsx
// נקודת סטטוס
<span className={card.statusDotActive} />
<span className={card.statusDotInactive} />
<span className={card.statusDotWarning} />
<span className={card.statusDotDanger} />

// Badge סטטוס
<span className={card.statusBadgeActive}>פעיל</span>
<span className={card.statusBadgeInactive}>לא פעיל</span>
<span className={card.statusBadgeWarning}>ממתין</span>
<span className={card.statusBadgeDanger}>בעיה</span>
```

### כפתורי פעולה

```tsx
<div className={card.actions}>
  <button className={card.actionPrimary}>שמור</button>
  <button className={card.actionSecondary}>ביטול</button>
  <button className={card.actionDanger}>מחק</button>
  <button className={card.actionIcon}>
    <EditIcon size={16} />
  </button>
</div>
```

### Avatars ואייקונים

```tsx
// אייקון כרטיס
<div className={card.iconMd}>
  <UserIcon size={20} />
</div>
<div className={card.iconBrand}>
  <StarIcon size={20} />
</div>

// Avatar
<div className={card.avatarMd}>יכ</div>
```

### Layouts

```tsx
// Header עם אייקון
<div className={card.header}>
  <div className={card.headerWithIcon}>
    <div className={card.iconMd}><UserIcon /></div>
    <div>
      <h3 className={card.title}>יוסי כהן</h3>
      <span className={card.subtitle}>גולש</span>
    </div>
  </div>
</div>

// Header עם פעולות
<div className={card.header}>
  <div className={card.headerWithActions}>
    <h3 className={card.title}>כותרת</h3>
    <div className={card.actions}>
      <button className={card.actionIcon}><EditIcon /></button>
    </div>
  </div>
</div>

// רשימת כרטיסים
<div className={card.list}>
  <div className={card.base}>...</div>
  <div className={card.base}>...</div>
</div>

// Grid של כרטיסים
<div className={card.grid3}>
  <div className={card.base}>...</div>
  <div className={card.base}>...</div>
  <div className={card.base}>...</div>
</div>
```

### דוגמה מלאה - כרטיס גולש

```tsx
import { card } from "@/app/styles/design-system";

function SurferCard({ surfer }) {
  return (
    <div className={card.interactive}>
      <div className={card.header}>
        <div className={card.headerWithIcon}>
          <div className={card.avatarMd}>{surfer.name[0]}</div>
          <div>
            <h3 className={card.title}>{surfer.name}</h3>
            <span className={card.subtitle}>{surfer.group}</span>
          </div>
        </div>
      </div>

      <div className={card.body}>
        <div className={card.infoRow}>
          <span className={card.infoLabel}>טלפון</span>
          <span className={card.infoValue}>{surfer.phone}</span>
        </div>
        <div className={card.infoRow}>
          <span className={card.infoLabel}>סטטוס</span>
          <span
            className={
              surfer.active ? card.statusBadgeActive : card.statusBadgeInactive
            }
          >
            {surfer.active ? "פעיל" : "לא פעיל"}
          </span>
        </div>
      </div>

      <div className={card.footer}>
        <div className={card.headerWithActions}>
          <span className={card.statusDotActive} />
          <div className={card.actions}>
            <button className={card.actionSecondary}>צפייה</button>
            <button className={card.actionPrimary}>עריכה</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 טיוטות (Drafts)

### ייבוא

```tsx
import { draft } from "@/app/styles/design-system";
```

### מבנה רשימת טיוטות

```tsx
<div className={draft.container}>
  <div className={draft.header}>
    <strong className={draft.title}>טיוטות</strong>
    <p className={draft.description}>טיוטות שנשמרו אוטומטית</p>
  </div>

  {drafts.map((d) => (
    <div className={draft.row} key={d.id}>
      <div className={draft.rowContent}>
        <div className={draft.rowHeader}>
          <span className={draft.badge}>טיוטה</span>
          <span className={draft.itemTitle}>{d.name}</span>
        </div>
        <span className={draft.itemSubtitle}>{d.date}</span>
      </div>
      <div className={draft.actions}>
        <button>המשך</button>
        <button>מחק</button>
      </div>
    </div>
  ))}
</div>
```

### Classes זמינים

| Class                | תיאור                          |
| -------------------- | ------------------------------ |
| `draft.container`    | Container ראשי (רקע ירוק בהיר) |
| `draft.header`       | Header של הרשימה               |
| `draft.title`        | כותרת                          |
| `draft.description`  | תיאור                          |
| `draft.row`          | שורת טיוטה בודדת               |
| `draft.badge`        | Badge ירוק                     |
| `draft.itemTitle`    | כותרת הטיוטה                   |
| `draft.itemSubtitle` | תאריך/subtitle                 |
| `draft.actions`      | Container של כפתורים           |
| `draft.empty`        | הודעת ריק                      |

---

## ✅ משימות (Tasks)

### ייבוא

```tsx
import { task } from "@/app/styles/design-system";
```

### Task Card (Grid View)

```tsx
<div className={task.card}>
  <div className={task.cardHeader}>
    <span className={task.cardTitle}>כותרת המשימה</span>
    <span className={task.statusOpen}>פתוח</span>
  </div>

  <div className={task.cardBody}>
    <p className={task.cardText}>תוכן המשימה...</p>

    <div className={task.metaGrid}>
      <div className={task.metaItem}>
        <UserIcon size={14} />
        <span>נוצר ע"י: יוסי</span>
      </div>
    </div>
  </div>

  <div className={task.cardFooter}>
    <button className={task.actionPrimary}>
      <HistoryIcon size={14} /> היסטוריה
    </button>
    <button className={task.action}>
      <EditIcon size={14} /> ערוך
    </button>
    <button className={task.actionDanger}>
      <TrashIcon size={14} /> מחק
    </button>
  </div>
</div>
```

### Task List Item (Compact View)

```tsx
<div className={task.listItem}>
  <div className={task.checkbox}>
    <SquareIcon size={20} />
  </div>
  <span className={task.listTitle}>כותרת המשימה</span>
  <span className={task.listAssignee}>יוסי כהן</span>
  <span className={task.dueDate}>
    <CalendarIcon size={12} />
    15/01
  </span>
  <div>
    <button className={task.actionIcon}>
      <HistoryIcon />
    </button>
    <button className={task.actionIcon}>
      <TrashIcon />
    </button>
  </div>
</div>
```

### Status Badges

```tsx
<span className={task.statusNotStarted}>טרם התחיל</span>
<span className={task.statusOpen}>פתוח</span>
<span className={task.statusInProgress}>בתהליך</span>
<span className={task.statusPostponed}>נדחה</span>
<span className={task.statusDone}>הסתיים</span>
<span className={task.statusCancelled}>בוטל</span>
```

### Due Date

```tsx
// תאריך רגיל
<span className={task.dueDate}>
  <CalendarIcon size={12} />
  15/01/2026
</span>

// תאריך שעבר
<span className={task.dueDateOverdue}>
  <CalendarIcon size={12} />
  01/01/2026
  <AlertIcon size={12} />
</span>
```

### Classes זמינים

| קטגוריה       | Classes                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Card**      | `task.card`, `task.cardCompleted`, `task.cardHeader`, `task.cardBody`, `task.cardFooter`                                               |
| **Card Text** | `task.cardTitle`, `task.cardTitleCompleted`, `task.cardText`, `task.cardTextCompleted`                                                 |
| **List Item** | `task.listItem`, `task.listItemCompleted`, `task.listTitle`, `task.listTitleCompleted`                                                 |
| **Checkbox**  | `task.checkbox`, `task.checkboxChecked`                                                                                                |
| **Status**    | `task.statusNotStarted`, `task.statusOpen`, `task.statusInProgress`, `task.statusPostponed`, `task.statusDone`, `task.statusCancelled` |
| **Due Date**  | `task.dueDate`, `task.dueDateOverdue`                                                                                                  |
| **Actions**   | `task.action`, `task.actionPrimary`, `task.actionDanger`, `task.actionIcon`                                                            |
| **Meta**      | `task.metaGrid`, `task.metaItem`                                                                                                       |
| **Form**      | `task.form`, `task.formGrid`, `task.formActions`                                                                                       |
| **Layout**    | `task.cardList`, `task.itemList`, `task.sectionTitle`, `task.sectionDivider`                                                           |
| **Empty**     | `task.empty`                                                                                                                           |

---

## 🌙 Dark Mode

ה-Design System כולל תמיכה מובנית ב-Dark Mode.
הצבעים מוגדרים ב-`@media (prefers-color-scheme: dark)`.

לאקטיבציה ידנית, הוסף class `dark` ל-html:

```html
<html class="dark"></html>
```

---

## 📚 TypeScript API

### cssVar - גישה ל-CSS Variables

```tsx
import { cssVar } from "@/app/styles/design-system/theme";

// שימוש ב-inline styles
<div
  style={{
    color: cssVar.text.primary,
    backgroundColor: cssVar.bg.secondary,
    padding: cssVar.spacing[4],
  }}
>
  ...
</div>;
```

### tw - Tailwind Classes

```tsx
import { tw } from '@/app/styles/design-system/theme';

<span className={tw.text.primary}>טקסט</span>
<div className={`${tw.bg.secondary} ${tw.border.primary}`}>...</div>
```

### numericValues - ערכים נומריים

```tsx
import { numericValues, getIconSize } from "@/app/styles/design-system/theme";

// לשימוש עם אייקונים
<Icon size={getIconSize("md")} />; // 20px

// לחישובים
const totalWidth = numericValues.navbar.width + numericValues.spacing[4];
```

### presets - סגנונות מוכנים

```tsx
import { presets } from "@/app/styles/design-system/theme";

<div className={presets.card.className}>
  <h2 className={presets.text.heading}>כותרת</h2>
  <p className={presets.text.body}>תוכן</p>
  <button className={presets.buttonPrimary.className}>פעולה</button>
</div>;
```

---

## ✅ Best Practices

1. **תמיד השתמש ב-tokens** - לא ב-hardcoded values
2. **השתמש ב-presets** - לקומפוננטות נפוצות
3. **בדוק עקביות** - וודא שהצבעים מתאימים לסמנטיקה
4. **תעד שינויים** - אם מוסיפים tokens חדשים

---

## 🔧 הוספת Tokens חדשים

1. הוסף את ה-CSS Variable ב-`design-tokens.css`
2. הוסף מיפוי ב-`tailwind-theme.css` (אם צריך)
3. הוסף type ו-reference ב-`theme.ts`
4. עדכן תיעוד זה

---

## 📞 תמיכה

לשאלות או הצעות, פנה לצוות הפיתוח.
