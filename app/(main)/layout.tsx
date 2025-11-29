import Navbar from "../components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <main
        className="flex-1 p-6 transition-[margin] duration-300"
        style={{ marginRight: "var(--sidebar-width, 224px)" }}
      >
        {children}
      </main>
    </div>
  );
}

