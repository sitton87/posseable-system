import { cookies } from "next/headers";

export default async function Dashboard() {
  // חובה: await
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const user = session ? JSON.parse(session.value) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">מערכת Posseable</h1>
        <div className="text-lg">
          שלום, {user?.national_id} – {user?.role}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">דף הבית</h2>

        {/* Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">מתנדבים פעילים</h3>
            <p className="text-4xl font-bold text-blue-600">—</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">גולשים פעילים</h3>
            <p className="text-4xl font-bold text-green-600">—</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">פעילויות קרובות</h3>
            <p className="text-4xl font-bold text-purple-600">—</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/activities"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            פעילויות
          </a>
          <a
            href="/volunteers"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            מתנדבים
          </a>
          <a
            href="/surfers"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            גולשים
          </a>
          <a
            href="/season"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            עונות
          </a>
          <a
            href="/equipment"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            ציוד
          </a>
          <a
            href="/suppliers"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            ספקים
          </a>
          <a
            href="/donors"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            תורמים
          </a>
          <a
            href="/finance"
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-gray-50"
          >
            כספים
          </a>
        </div>
      </main>
    </div>
  );
}
