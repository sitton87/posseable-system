import "./globals.css";

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
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
