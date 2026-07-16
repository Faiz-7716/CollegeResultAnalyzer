import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calculateSGPA, calculateCGPA } from "@/lib/grading";

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

  // Group results by semester
  const semestersMap = new Map<number, any[]>();
  student.results.forEach((result: any) => {
    const semNumber = result.subject.semester.number;
    if (!semestersMap.has(semNumber)) {
      semestersMap.set(semNumber, []);
    }
    semestersMap.get(semNumber)?.push(result);
  });

  const sortedSemesters = Array.from(semestersMap.entries()).sort((a, b) => a[0] - b[0]);

  const sgpas: { sgpa: number; totalCredits: number }[] = [];
  
  const arrears = student.results.filter((r: any) => !r.passStatus);

  let coreAlliedTotal = 0;
  let coreAlliedCount = 0;

  student.results.forEach((r: any) => {
    const code = r.subject.code;
    const isCore = code.includes('UCS') || code.includes('UPCS') || code.includes('CC');
    const isAllied = code.includes('UECS') || code.includes('EC');
    
    if (isCore || isAllied) {
      coreAlliedTotal += r.total;
      coreAlliedCount++;
    }
  });

  const coreAlliedPercentage = coreAlliedCount > 0 ? (coreAlliedTotal / (coreAlliedCount * 100)) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/students" className="btn btn-secondary" style={{ marginBottom: "1rem" }}>
          &larr; Back to Roster
        </Link>
        <div className="card glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="h2 text-gradient">{student.name}</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
              Reg No: <strong>{student.registerNumber}</strong> | Batch: {student.batch}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>Total Arrears</p>
            <p className="h3 text-gradient" style={{ color: arrears.length > 0 ? "var(--status-error)" : "var(--status-success)" }}>
              {arrears.length}
            </p>
          </div>
        </div>
      </div>

      {sortedSemesters.length === 0 ? (
        <div className="card glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <p className="text-muted">No academic records found for this student.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {sortedSemesters.map(([semNumber, results]) => {
            const subjectResults = results.map((r) => {
              // Convert grade letter to points based on standard mapping
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
            const semCredits = results.reduce((acc, r) => acc + r.subject.credits, 0);
            sgpas.push({ sgpa: semSgpa, totalCredits: semCredits });

            return (
              <div key={semNumber} className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="h3">Semester {semNumber}</h3>
                  <div className="badge badge-primary" style={{ fontSize: "1rem", background: "rgba(59, 130, 246, 0.15)" }}>
                    SGPA: <span style={{ color: "var(--accent-primary)", marginLeft: "0.5rem" }}>{semSgpa.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credits</th>
                        <th>Int/Ext</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td style={{ fontWeight: 500 }}>{result.subject.code}</td>
                          <td>{result.subject.name}</td>
                          <td>{result.subject.credits}</td>
                          <td className="text-muted">{result.internalMarks} / {result.externalMarks}</td>
                          <td style={{ fontWeight: 600 }}>{result.total}</td>
                          <td>
                            <span className="text-gradient" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                              {result.grade}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${result.passStatus ? 'badge-success' : 'badge-error'}`}>
                              {result.passStatus ? "PASS" : "ARREAR"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="card glass-panel" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "center", padding: "3rem", background: "var(--bg-glass-hover)" }}>
            <div>
              <h3 className="h2 text-muted" style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Cumulative Grade Point Average</h3>
              <p className="h1 text-gradient" style={{ fontSize: "3.5rem" }}>
                {calculateCGPA(sgpas).toFixed(2)}
              </p>
            </div>
            <div style={{ borderLeft: "1px solid var(--border-color)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3 className="h2 text-muted" style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Core + Allied Percentage</h3>
              <p className="h1 text-gradient" style={{ fontSize: "3.5rem" }}>
                {coreAlliedPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
