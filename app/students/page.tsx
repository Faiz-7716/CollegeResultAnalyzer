import { getStudentsWithMetrics } from "@/lib/actions";
import Link from "next/link";
import StudentRoster from "./StudentRoster";

export default async function StudentsPage() {
  const students = await getStudentsWithMetrics();

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 className="h2 text-gradient">Student Ledger Roster</h2>
        <Link href="/data-entry" className="btn btn-primary">
          + Add New Student
        </Link>
      </div>

      <StudentRoster initialStudents={students} />
    </div>
  );
}
