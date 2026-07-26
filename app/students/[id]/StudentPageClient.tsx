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

              {/* Ultra-Elegant Part-wise CGPA & Summary Cards */}
              <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
                {/* 1st Card: Overall CGPA */}
                <div
                  className="card glass-panel"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    boxShadow: "0 8px 24px -4px rgba(79, 70, 229, 0.08)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Overall CGPA
                    </span>
                    <span className="badge" style={{ background: "rgba(79, 70, 229, 0.12)", color: "#4F46E5", fontWeight: 700, fontSize: "0.8rem" }}>
                      Rank #{classRank.rank}
                    </span>
                  </div>
                  <div style={{ margin: "0.75rem 0" }}>
                    <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#4F46E5", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                      {cgpa.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(79, 70, 229, 0.12)", paddingTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>Cumulative Grade</span>
                    <strong style={{ color: "#4F46E5" }}>Scale 10.00</strong>
                  </div>
                </div>

                {/* 2nd Card: Part 1 Language CGPA */}
                <div
                  className="card glass-panel"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    boxShadow: "0 8px 24px -4px rgba(16, 185, 129, 0.08)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Part 1: Language
                    </span>
                    <span className="badge badge-success" style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                      Lang Pass
                    </span>
                  </div>
                  <div style={{ margin: "0.75rem 0" }}>
                    <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#059669", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
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
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(16, 185, 129, 0.12)", paddingTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>Languages</span>
                    <strong style={{ color: "#059669" }}>Tamil / English / Urdu</strong>
                  </div>
                </div>

                {/* 3rd Card: Part 2 Allied + Core CGPA */}
                <div
                  className="card glass-panel"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)",
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                    boxShadow: "0 8px 24px -4px rgba(59, 130, 246, 0.08)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Part 2: Allied + Core
                    </span>
                    <span className="badge" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#2563EB", fontWeight: 700, fontSize: "0.8rem" }}>
                      Core CS
                    </span>
                  </div>
                  <div style={{ margin: "0.75rem 0" }}>
                    <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#2563EB", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
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
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(59, 130, 246, 0.12)", paddingTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>Domain Scope</span>
                    <strong style={{ color: "#2563EB" }}>CS Core & Allied Math</strong>
                  </div>
                </div>

                {/* 4th Card: Part 3 Others CGPA */}
                <div
                  className="card glass-panel"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    boxShadow: "0 8px 24px -4px rgba(245, 158, 11, 0.08)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Part 3: Others CGPA
                    </span>
                    <span className="badge" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706", fontWeight: 700, fontSize: "0.8rem" }}>
                      Skills
                    </span>
                  </div>
                  <div style={{ margin: "0.75rem 0" }}>
                    <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#D97706", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
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
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(245, 158, 11, 0.12)", paddingTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>Course Focus</span>
                    <strong style={{ color: "#D97706" }}>Foundation CS, NME & Skills</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
