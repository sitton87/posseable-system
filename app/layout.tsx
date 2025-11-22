import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Posseable System",
  description: "Management System for Posseable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-100 flex">
        {/* Navbar גלובלי */}
        <Navbar />

        {/* תוכן הדפים */}
        <main className="flex-1 mr-16 md:mr-56 p-6 transition-all">
          {children}
        </main>
      </body>
    </html>
  );
}
