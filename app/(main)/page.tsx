import Link from "next/link";

const quickLinks = [
  {
    title: "כניסה לדשבורד",
    description: "תצוגה מרוכזת של כל היחידות והמדדים החיים.",
    href: "/dashboard",
  },
  {
    title: "ניהול מתנדבים",
    description: "טיפול בסוגי מתנדבים, סינון ומעקב אחר פעילות.",
    href: "/volunteers",
  },
  {
    title: "ניהול גולשים",
    description: "כל הנתונים הקליניים והתפעוליים עבור המשתתפים.",
    href: "/surfers",
  },
  {
    title: "פעילויות ולו״ז",
    description: "יצירה ותיאום של מפגשי הים, כולל הצמדות.",
    href: "/activities",
  },
];

const highlightCards = [
  {
    title: "מתנדבים",
    description: "ניהול מלא של מתנדבי מים, מדיה ותומכי שטח עם סטטוס חי.",
    emoji: "🤝",
  },
  {
    title: "גולשים",
    description: "התאמה אישית לקבוצות, תוכניות ושיקולים רפואיים.",
    emoji: "🏄",
  },
  {
    title: "משאבים",
    description: "ציוד, ספקים, תורמים ותזרים כספי במקום אחד.",
    emoji: "⚙️",
  },
];

const relationBenefits = [
  "מעקב מדויק אחר אילו מתנדבי מים תמכו בכל גולש.",
  "שיוך הפעילות מאפשר להבין עומסים וזמינות.",
  "שכבת נתונים אחת שמשרתת גם את הגולשים וגם את המתנדבים.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 text-gray-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <p className="text-sm font-semibold text-sky-600">POSSEABLE SYSTEM</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            ברוכים הבאים למרכז השליטה של Posseable
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            כל המודולים — מתנדבים, גולשים, פעילויות, ציוד ותורמים — מרוכזים כאן
            עם חוויית RTL מלאה. התחילו בדשבורד כדי לקבל תמונת מצב, או קפצו
            ישירות למודול שאותו תרצו לעדכן.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="text-sm font-semibold text-sky-600">
                  {link.title}
                </div>
                <p className="mt-2 text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl" aria-hidden>
                {card.emoji}
              </div>
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-lg">
          <p className="text-sm font-semibold text-emerald-600">
            עדכון סכימה חדש
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            volunteer_surfer_activity: שכבת קשר מתנדב ↔ גולש ↔ פעילות
          </h2>
          <p className="mt-3 text-gray-600">
            בהתאם לקובץ{" "}
            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
              create_volunteer_surfer_relation.sql
            </code>{" "}
            הוספנו טבלה ייעודית שמתעדת לכל פעילות מי המתנדבים שליוו את הגולשים.
            הנתונים זמינים לאנליזה, לבקרת עומסים ולמדידת תדירות הליווי.
          </p>
          <ul className="mt-4 list-disc space-y-1 pr-5 text-sm text-gray-700">
            {relationBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/volunteers"
              className="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              ניהול שיוכים של מתנדבים
            </Link>
            <Link
              href="/surfers"
              className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
            >
              צפייה בתמיכת הגולשים
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
