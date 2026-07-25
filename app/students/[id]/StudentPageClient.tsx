"use client";

import React, { useState } from "react";
import StudentAnalyticsDashboard from "@/app/components/StudentAnalyticsDashboard";
import { calculateSGPA } from "@/lib/grading";
import { IconFileText, IconBarChart3 } from "@/app/components/Icons";

interface StudentPageClientProps {
  student: any;
  results: any[];
  cgpa: number;
  classRank: { rank: number; totalStudents: number };
}

export default function StudentPageClient({
  student,
  results,
  cgpa,
  classRank,
}: StudentPageClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger">("dashboard");

  // Group results by semester
  const semestersMap = new Map<number, any[]>();
  results.forEach((result: any) => {
    const semNumber = result.subject.semester.number;
    if (!semestersMap.has(semNumber)) {
      semestersMap.set(semNumber, []);
    }
    semestersMap.get(semNumber)?.push(result);
  });

  const sortedSemesters = Array.from(semestersMap.entries()).sort((a, b) => a[0] - b[0]);

  const sgpas: { sgpa: number; totalCredits: number }[] = [];

  let coreAlliedTotal = 0;
  let coreAlliedCount = 0;

  results.forEach((r: any) => {
    const code = r.subject.code;
    const isCore = code.includes('UCS') || code.includes('UPCS') || code.includes('CC');
    const isAllied = code.includes('UECS') || code.includes('EC');
    
    if (isCore || isAllied) {
      coreAlliedTotal += r.total;
      coreAlliedCount++;
    }
  });

  const coreAlliedPercentage = coreAlliedCount > 0 ? (coreAlliedTotal / (coreAlliedCount * 100)) * 100 : 0;

  // Compute SGPA for each semester
  sortedSemesters.forEach(([_, semResults]) => {
    const subjectResults = semResults.map((r) => {
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
    const semCredits = semResults.reduce((acc, r) => acc + r.subject.credits, 0);
    sgpas.push({ sgpa: semSgpa, totalCredits: semCredits });
  });

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <IconBarChart3 size={18} />
          <span>Visual Analytics Dashboard</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          <IconFileText size={18} />
          <span>Detailed Marksheet Ledger</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "dashboard" ? (
        <StudentAnalyticsDashboard
          student={student}
          results={results}
          cgpa={cgpa}
          classRank={classRank}
        />
      ) : (
        <div>
          {sortedSemesters.length === 0 ? (
            <div className="card glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
              <p className="text-muted">No academic records found for this student.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {sortedSemesters.map(([semNumber, semResults], idx) => {
                const semSgpa = sgpas[idx]?.sgpa || 0;

                return (
                  <div key={semNumber} className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="responsive-flex" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 className="h3" style={{ fontSize: "1.2rem" }}>Semester {semNumber} Examination Results</h3>
                      <div className="badge badge-primary" style={{ fontSize: "0.95rem", padding: "0.35rem 0.85rem" }}>
                        SGPA: <strong style={{ color: "#FFFFFF", marginLeft: "0.4rem" }}>{semSgpa.toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Credits</th>
                            <th>Internal / External</th>
                            <th>Total Marks</th>
                            <th>Grade</th>
                            <th>Result Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResults.map((result: any) => (
                            <tr key={result.id}>
                              <td style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{result.subject.code}</td>
                              <td style={{ fontWeight: 500 }}>{result.subject.name}</td>
                              <td style={{ fontWeight: 600 }}>{result.subject.credits}</td>
                              <td className="text-muted">{result.internalMarks} / {result.externalMarks}</td>
                              <td style={{ fontWeight: 800, fontSize: "1.05rem" }}>{result.total}</td>
                              <td>
                                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--accent-primary)" }}>
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

              {/* Part-wise CGPA & Summary Cards */}
              <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                <div className="card glass-panel" style={{ textAlign: "center", padding: "1.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                  <h4 className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Overall CGPA</h4>
                  <p className="h1" style={{ fontSize: "2.75rem", color: "var(--accent-primary)", fontWeight: 800, marginTop: "0.25rem" }}>
                    {cgpa.toFixed(2)}
                  </p>
                </div>

                <div className="card glass-panel" style={{ textAlign: "center", padding: "1.5rem", borderLeft: "4px solid #10B981" }}>
                  <h4 className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Part 1: Language CGPA</h4>
                  <p className="h1" style={{ fontSize: "2.75rem", color: "#10B981", fontWeight: 800, marginTop: "0.25rem" }}>
                    {(() => {
                      let p1C = 0, p1P = 0;
                      results.forEach((r: any) => {
                        const code = r.subject.code.toUpperCase();
                        if (code.includes("ULE") || code.includes("ULT") || code.includes("ULU")) {
                          let gp = 0;
                          switch (r.grade) { case "O": gp = 10; break; case "A+": gp = 9; break; case "A": gp = 8; break; case "B+": gp = 7; break; case "B": gp = 6; break; case "C": gp = 5; break; default: gp = 0; }
                          p1C += r.subject.credits;
                          p1P += r.subject.credits * gp;
                        }
                      });
                      return p1C > 0 ? (p1P / p1C).toFixed(2) : "0.00";
                    })()}
                  </p>
                </div>

                <div className="card glass-panel" style={{ textAlign: "center", padding: "1.5rem", borderLeft: "4px solid #3B82F6" }}>
                  <h4 className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Part 2: Allied + Core CGPA</h4>
                  <p className="h1" style={{ fontSize: "2.75rem", color: "#3B82F6", fontWeight: 800, marginTop: "0.25rem" }}>
                    {(() => {
                      let p2C = 0, p2P = 0;
                      results.forEach((r: any) => {
                        const code = r.subject.code.toUpperCase();
                        if (code.includes("UCS") || code.includes("UPCS") || code.includes("UECS") || code.includes("CC") || code.includes("EC")) {
                          let gp = 0;
                          switch (r.grade) { case "O": gp = 10; break; case "A+": gp = 9; break; case "A": gp = 8; break; case "B+": gp = 7; break; case "B": gp = 6; break; case "C": gp = 5; break; default: gp = 0; }
                          p2C += r.subject.credits;
                          p2P += r.subject.credits * gp;
                        }
                      });
                      return p2C > 0 ? (p2P / p2C).toFixed(2) : "0.00";
                    })()}
                  </p>
                </div>

                <div className="card glass-panel" style={{ textAlign: "center", padding: "1.5rem", borderLeft: "4px solid #F59E0B" }}>
                  <h4 className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Part 3: Others CGPA</h4>
                  <p className="h1" style={{ fontSize: "2.75rem", color: "#F59E0B", fontWeight: 800, marginTop: "0.25rem" }}>
                    {(() => {
                      let p3C = 0, p3P = 0;
                      results.forEach((r: any) => {
                        const code = r.subject.code.toUpperCase();
                        const isLang = code.includes("ULE") || code.includes("ULT") || code.includes("ULU");
                        const isCoreOrAllied = code.includes("UCS") || code.includes("UPCS") || code.includes("UECS") || code.includes("CC") || code.includes("EC");
                        if (!isLang && !isCoreOrAllied) {
                          let gp = 0;
                          switch (r.grade) { case "O": gp = 10; break; case "A+": gp = 9; break; case "A": gp = 8; break; case "B+": gp = 7; break; case "B": gp = 6; break; case "C": gp = 5; break; default: gp = 0; }
                          p3C += r.subject.credits;
                          p3P += r.subject.credits * gp;
                        }
                      });
                      return p3C > 0 ? (p3P / p3C).toFixed(2) : "0.00";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
