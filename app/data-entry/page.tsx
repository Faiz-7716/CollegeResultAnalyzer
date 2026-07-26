import { getAllStudents, getAllSemesters, getAllSubjects, getDepartments, getAllResultsDetailed } from "@/lib/actions";
import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DataEntryForms from "./DataEntryForms";

export default async function DataEntryPage() {
  const session = await verifyAdminSession();
  if (!session) {
    redirect("/login?redirectTo=/data-entry");
  }

  const [students, semesters, subjects, departments, results] = await Promise.all([
    getAllStudents(),
    getAllSemesters(),
    getAllSubjects(),
    getDepartments(),
    getAllResultsDetailed(),
  ]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="h2 text-gradient">Data & Department Management Hub</h2>
        <p className="text-muted">Manage college departments, add students, define subjects, explore & manage existing records.</p>
      </div>

      <DataEntryForms 
        students={students} 
        semesters={semesters} 
        subjects={subjects}
        departments={departments}
        results={results}
      />
    </div>
  );
}
