import { getAllSurfers, addSurfer } from "./logic/surferService";
import SurferTable from "./components/SurferTable";
import AddSurferModal from "./components/AddSurferModal";

export default async function SurfersPage() {
  const surfers = await getAllSurfers();

  async function handleAdd(data: any) {
    "use server";
    await addSurfer(data);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ניהול גולשים</h1>

      <AddSurferModal onSubmit={handleAdd} />

      <SurferTable surfers={surfers} />
    </div>
  );
}
