import { getAllClearStudentsWithReports, getDepartments } from "@/lib/actions";
import AllClearPageClient from "./AllClearPageClient";

export default async function AllClearPage() {
  const [allClearStudents, departments] = await Promise.all([
    getAllClearStudentsWithReports(),
    getDepartments(),
  ]);

  return (
    <div className="animate-fade-in">
      <AllClearPageClient 
        students={allClearStudents}
        departments={departments}
      />
    </div>
  );
}
