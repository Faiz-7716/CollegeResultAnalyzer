import { getAllStudents, getAllSemesters, getAllSubjects } from "@/lib/actions";
import DataEntryForms from "./DataEntryForms";

export default async function DataEntryPage() {
  const [students, semesters, subjects] = await Promise.all([
    getAllStudents(),
    getAllSemesters(),
    getAllSubjects(),
  ]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="h2 text-gradient">Data Management Portal</h2>
        <p className="text-muted">Add students, define subjects, and log exam results.</p>
      </div>

      <DataEntryForms 
        students={students} 
        semesters={semesters} 
        subjects={subjects} 
      />
    </div>
  );
}
