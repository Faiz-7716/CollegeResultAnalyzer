import { getAllStudents, getAllSemesters, getAllSubjects, getDepartments } from "@/lib/actions";
import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DataEntryForms from "./DataEntryForms";

export default async function DataEntryPage() {
  const session = await verifyAdminSession();
  if (!session) {
    redirect("/login?redirectTo=/data-entry");
  }

  const [students, semesters, subjects, departments] = await Promise.all([
    getAllStudents(),
    getAllSemesters(),
    getAllSubjects(),
    getDepartments(),
  ]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="h2 text-gradient">Data & Department Management Hub</h2>
        <p className="text-muted">Manage college departments, add students, define subjects, and log exam results.</p>
      </div>

      <DataEntryForms 
        students={students} 
        semesters={semesters} 
        subjects={subjects}
        departments={departments}
      />
    </div>
  );
}
