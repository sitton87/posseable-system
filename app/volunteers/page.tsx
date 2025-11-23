import { getAllVolunteers } from "./logic/volunteerService";
import VolunteersTable from "./components/VolunteersTable";
import AddVolunteerModal from "./components/AddVolunteerModal";

export default async function VolunteersPage() {
  const volunteers = await getAllVolunteers();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-4">מתנדבים</h1>

        {/* כפתור הוספה */}
        <AddVolunteerModal onSuccess={() => location.reload()} />
      </div>

      <VolunteersTable volunteers={volunteers} />
    </div>
  );
}
