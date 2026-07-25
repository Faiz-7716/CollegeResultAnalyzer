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

              <div className="card glass-panel responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "center", padding: "2.5rem", background: "#FFFFFF", border: "2px solid var(--accent-primary)" }}>
                <div>
                  <h3 className="h3 text-muted" style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>Cumulative Grade Point Average (CGPA)</h3>
                  <p className="h1" style={{ fontSize: "3.5rem", color: "var(--accent-primary)", fontWeight: 800 }}>
                    {cgpa.toFixed(2)}
                  </p>
                </div>
                <div className="mobile-no-border" style={{ borderLeft: "1px solid var(--border-color)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h3 className="h3 text-muted" style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>Core + Allied Percentage</h3>
                  <p className="h1" style={{ fontSize: "3.5rem", color: "var(--status-success)", fontWeight: 800 }}>
                    {coreAlliedPercentage.toFixed(2)}%
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
