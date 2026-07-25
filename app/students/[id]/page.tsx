import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calculateSGPA, calculateCGPA } from "@/lib/grading";
import { getStudentsWithMetrics } from "@/lib/actions";
import StudentPageClient from "./StudentPageClient";

export default async function StudentLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      results: {
        include: {
          subject: {
            include: { semester: true },
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Serialize Prisma student object to avoid Date serialization errors in Client Component
  const serializedStudent = JSON.parse(JSON.stringify(student));

  // Calculate batch class rank
  const allStudents = await getStudentsWithMetrics();
  const sortedByCgpa = [...allStudents].sort((a, b) => b.metrics.cgpa - a.metrics.cgpa);
  const rankIndex = sortedByCgpa.findIndex((s) => s.id === id);
  const classRank = {
    rank: rankIndex !== -1 ? rankIndex + 1 : 1,
    totalStudents: allStudents.length,
  };

  // Group results by semester for CGPA calculation
  const semestersMap = new Map<number, any[]>();
  serializedStudent.results.forEach((result: any) => {
    const semNumber = result.subject.semester.number;
    if (!semestersMap.has(semNumber)) {
      semestersMap.set(semNumber, []);
    }
    semestersMap.get(semNumber)?.push(result);
  });

  const sortedSemesters = Array.from(semestersMap.entries()).sort((a, b) => a[0] - b[0]);
  const sgpas: { sgpa: number; totalCredits: number }[] = [];
  const arrears = serializedStudent.results.filter((r: any) => !r.passStatus);

  // Compute SGPA for each semester
  sortedSemesters.forEach(([_, results]) => {
    const subjectResults = results.map((r: any) => {
      let gradePoints = 0;
      switch (r.grade) {
        case "O": gradePoints = 10; break;
        case "A+": gradePoints = 9; break;
        case "A": gradePoints = 8; break;
        case "B+": gradePoints = 7; break;
        case "B": gradePoints = 6; break;
        case "C": gradePoints = 5; break;
        default: gradePoints = 0;
      }
      return { credits: r.subject.credits, gradePoints };
    });

    const semSgpa = calculateSGPA(subjectResults);
    const semCredits = results.reduce((acc: number, r: any) => acc + r.subject.credits, 0);
    sgpas.push({ sgpa: semSgpa, totalCredits: semCredits });
  });

  const calculatedCgpa = calculateCGPA(sgpas);

  return (
    <div className="animate-fade-in">
      {/* Student Profile Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/students" className="btn btn-secondary" style={{ marginBottom: "1rem" }}>
          &larr; Back to Roster
        </Link>
        <div className="card glass-panel responsive-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="h2 text-gradient">{serializedStudent.name}</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
              Reg No: <strong>{serializedStudent.registerNumber}</strong> | Batch: {serializedStudent.batch}
            </p>
          </div>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>Batch Rank</p>
              <p className="h3 text-gradient" style={{ fontWeight: 700 }}>
                #{classRank.rank} <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>/ {classRank.totalStudents}</span>
              </p>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-color)", paddingLeft: "1.5rem" }}>
              <p className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>Total Arrears</p>
              <p className="h3" style={{ color: arrears.length > 0 ? "var(--status-error)" : "var(--status-success)" }}>
                {arrears.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Client Component */}
      <StudentPageClient
        student={serializedStudent}
        results={serializedStudent.results}
        cgpa={calculatedCgpa}
        classRank={classRank}
      />
    </div>
  );
}
