"use client";

import React, { useState, useEffect } from "react";
import StudentAnalyticsDashboard from "@/app/components/StudentAnalyticsDashboard";
import { calculateSGPA } from "@/lib/grading";
import { IconFileText, IconBarChart3, IconPrinter, IconEdit, IconCheckCircle, IconX } from "@/app/components/Icons";
import { checkAdminSession } from "@/lib/loginActions";
import { updateResultMarks } from "@/lib/actions";

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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Edit Marks Modal State
  const [editingResult, setEditingResult] = useState<{
    id: string;
    subjectCode: string;
    subjectName: string;
    internalMarks: number;
    externalMarks: number;
  } | null>(null);
  const [editInternal, setEditInternal] = useState<number>(0);
  const [editExternal, setEditExternal] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Official Report Print Modal State
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await checkAdminSession();
      setIsAdmin(res.isAuthenticated);
    }
    checkAuth();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (result: any) => {
    setEditingResult({
      id: result.id,
      subjectCode: result.subject.code,
      subjectName: result.subject.name,
      internalMarks: result.internalMarks,
      externalMarks: result.externalMarks,
    });
    setEditInternal(result.internalMarks);
    setEditExternal(result.externalMarks);
  };

  // Submit Edited Marks
  const handleSaveMarks = async () => {
    if (!editingResult) return;
    setIsSaving(true);
    const res = await updateResultMarks(editingResult.id, editInternal, editExternal);
    setIsSaving(false);
    if (res.success) {
      setEditingResult(null);
      window.location.reload();
    } else {
      alert(res.error || "Failed to update marks");
    }
  };

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

  // Calculate Part-wise CGPAs
  let p1C = 0, p1P = 0;
  let p2C = 0, p2P = 0;
  let p3C = 0, p3P = 0;

  results.forEach((r: any) => {
    const code = r.subject.code.toUpperCase();
    const credits = r.subject.credits || 0;
    let gp = 0;
    switch (r.grade) {
      case "O": gp = 10; break;
      case "A+": gp = 9; break;
      case "A": gp = 8; break;
      case "B+": gp = 7; break;
      case "B": gp = 6; break;
      case "C": gp = 5; break;
      default: gp = 0;
    }

    const isLang = code.includes("ULE") || code.includes("ULT") || code.includes("ULU");
    const isCoreOrAllied = code.includes("UCS") || code.includes("UPCS") || code.includes("UECS") || code.includes("CC") || code.includes("EC");

    if (isLang) {
      p1C += credits; p1P += credits * gp;
    } else if (isCoreOrAllied) {
      p2C += credits; p2P += credits * gp;
    } else {
      p3C += credits; p3P += credits * gp;
    }
  });

  const part1CgpaStr = p1C > 0 ? (p1P / p1C).toFixed(2) : "0.00";
  const part2CgpaStr = p2C > 0 ? (p2P / p2C).toFixed(2) : "0.00";
  const part3CgpaStr = p3C > 0 ? (p3P / p3C).toFixed(2) : "0.00";

  return (
    <div>
      {/* Action Header Controls Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        {/* Tab Navigation */}
        <div className="tab-container" style={{ margin: 0 }}>
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

        {/* Official Report Generator Button */}
        <button
          className="btn btn-primary no-print"
          onClick={() => setShowReportModal(true)}
          style={{
            padding: "0.6rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: "var(--accent-primary)",
            color: "#FFFFFF",
            borderRadius: "999px",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <IconPrinter size={18} color="#FFFFFF" />
          <span>Generate Official Marksheet Report</span>
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
                            {isAdmin && <th>Action</th>}
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
                              {isAdmin && (
                                <td>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => handleOpenEdit(result)}
                                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                  >
                                    <IconEdit size={12} />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              )}
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
                      {part1CgpaStr}
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
                      {part2CgpaStr}
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
                      {part3CgpaStr}
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

      {/* Admin Edit Marks Modal */}
      {editingResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="card glass-panel" style={{ width: "100%", maxWidth: "480px", padding: "2rem", background: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 className="h3" style={{ color: "var(--accent-primary)" }}>Edit Subject Marks</h3>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>{editingResult.subjectCode} - {editingResult.subjectName}</p>
              </div>
              <button onClick={() => setEditingResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <IconX size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="input-label">Internal Marks (Max 25)</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  className="input-field"
                  value={editInternal}
                  onChange={(e) => setEditInternal(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="input-label">External Marks (Max 75)</label>
                <input
                  type="number"
                  min={0}
                  max={75}
                  className="input-field"
                  value={editExternal}
                  onChange={(e) => setEditExternal(Number(e.target.value))}
                />
              </div>

              <div style={{ padding: "0.85rem", background: "rgba(241, 245, 249, 0.8)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Calculated Total: <strong>{editInternal + editExternal} / 100</strong></span>
                <span className={`badge ${editInternal + editExternal >= 40 && editExternal >= 30 ? 'badge-success' : 'badge-error'}`}>
                  {editInternal + editExternal >= 40 && editExternal >= 30 ? "PASS" : "ARREAR"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button className="btn btn-secondary" onClick={() => setEditingResult(null)} disabled={isSaving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveMarks} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Updated Marks"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Marksheet Report Modal & Printable View */}
      {showReportModal && (
        <div className="report-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: "850px", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            {/* Modal Controls Bar */}
            <div className="no-print" style={{ padding: "1rem 1.5rem", background: "#0F172A", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Official Student Marksheet Report Preview</div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", background: "var(--status-success)", border: "none" }}
                >
                  <IconPrinter size={16} color="#FFFFFF" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}
                >
                  <IconX size={22} />
                </button>
              </div>
            </div>

            {/* Printable Official Document Body */}
            <div id="printable-official-report" style={{ padding: "2.5rem", overflowY: "auto", color: "#000000", background: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
              {/* College Official Letterhead With Logo */}
              <div style={{ textAlign: "center", borderBottom: "3px double #000000", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", marginBottom: "0.75rem" }}>
                  <img src="/logo.png" alt="Mazharul Uloom College Logo" style={{ height: "64px", objectFit: "contain" }} />
                  <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", color: "#000000", margin: 0 }}>
                      MAZHARUL ULOOM COLLEGE
                    </h1>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333333", margin: "0.25rem 0 0 0" }}>
                      Recognized by UGC under Section 2(f) & 12(B) | Affiliated to Thiruvalluvar University
                    </p>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B", margin: "0.15rem 0 0 0" }}>
                      AMBUR - 635 802, TIRUPATTUR DISTRICT, TAMIL NADU
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#000000", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.5rem", borderTop: "1px solid #000000", borderBottom: "1px solid #000000", padding: "0.4rem 0" }}>
                  DEPARTMENT OF COMPUTER SCIENCE — CONSOLIDATED STATEMENT OF MARKS
                </div>
              </div>

              {/* Student Metadata Box */}
              <table className="meta-report-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: "0.875rem", border: "1px solid #000000" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.5rem 0.75rem", width: "18%", fontWeight: 700, background: "#F8FAFC", borderRight: "1px solid #000000" }}>Candidate Name</td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "32%", fontWeight: 800, fontSize: "1rem", borderRight: "1px solid #000000" }}>{student.name}</td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "18%", fontWeight: 700, background: "#F8FAFC", borderRight: "1px solid #000000" }}>Register Number</td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "32%", fontWeight: 800, fontSize: "1rem" }}>{student.registerNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 700, background: "#F8FAFC", borderRight: "1px solid #000000" }}>Degree & Course</td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, borderRight: "1px solid #000000" }}>B.Sc. Computer Science</td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 700, background: "#F8FAFC", borderRight: "1px solid #000000" }}>Batch / Year</td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{student.batch} (2023 - 2026)</td>
                  </tr>
                </tbody>
              </table>

              {/* Semesters & Marks Table */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.75rem" }}>
                {sortedSemesters.map(([semNumber, semResults], idx) => {
                  const semSgpa = sgpas[idx]?.sgpa || 0;
                  return (
                    <div key={semNumber} className="sem-report-block" style={{ border: "1px solid #000000", overflow: "hidden" }}>
                      <div className="sem-header" style={{ background: "#F1F5F9", padding: "0.5rem 0.75rem", borderBottom: "1px solid #000000", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                        <span>SEMESTER {semNumber} EXAMINATIONS</span>
                        <span>SEMESTER SGPA: {semSgpa.toFixed(2)}</span>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
                        <thead>
                          <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #000000", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 700 }}>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "left", borderRight: "1px solid #CBD5E1" }}>Subject Code</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "left", borderRight: "1px solid #CBD5E1" }}>Subject Title</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #CBD5E1" }}>Credits</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #CBD5E1" }}>Internal (25)</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #CBD5E1" }}>External (75)</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #CBD5E1" }}>Total (100)</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #CBD5E1" }}>Grade</th>
                            <th style={{ padding: "0.4rem 0.5rem", textAlign: "center" }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResults.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                              <td style={{ padding: "0.4rem 0.5rem", fontWeight: 700, borderRight: "1px solid #E2E8F0" }}>{r.subject.code}</td>
                              <td style={{ padding: "0.4rem 0.5rem", borderRight: "1px solid #E2E8F0" }}>{r.subject.name}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>{r.subject.credits}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>{r.internalMarks}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>{r.externalMarks}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", fontWeight: 700, borderRight: "1px solid #E2E8F0" }}>{r.total}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", fontWeight: 800, borderRight: "1px solid #E2E8F0" }}>{r.grade}</td>
                              <td style={{ padding: "0.4rem 0.5rem", textAlign: "center", fontWeight: 800, color: r.passStatus ? "#000000" : "#DC2626" }}>
                                {r.passStatus ? "PASS" : "RA"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>

              {/* Summary Performance Grid */}
              <table className="summary-report-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", border: "1px solid #000000", textAlign: "center", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #000000", fontWeight: 800, textTransform: "uppercase" }}>
                    <td style={{ padding: "0.5rem", borderRight: "1px solid #000000" }}>Overall CGPA</td>
                    <td style={{ padding: "0.5rem", borderRight: "1px solid #000000" }}>Part 1 (Language) CGPA</td>
                    <td style={{ padding: "0.5rem", borderRight: "1px solid #000000" }}>Part 2 (Allied + Core) CGPA</td>
                    <td style={{ padding: "0.5rem", borderRight: "1px solid #000000" }}>Part 3 (Others) CGPA</td>
                    <td style={{ padding: "0.5rem" }}>Classification</td>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontWeight: 800 }}>
                    <td style={{ padding: "0.6rem", fontSize: "1.25rem", borderRight: "1px solid #000000" }}>{cgpa.toFixed(2)}</td>
                    <td style={{ padding: "0.6rem", fontSize: "1.25rem", borderRight: "1px solid #000000" }}>{part1CgpaStr}</td>
                    <td style={{ padding: "0.6rem", fontSize: "1.25rem", borderRight: "1px solid #000000" }}>{part2CgpaStr}</td>
                    <td style={{ padding: "0.6rem", fontSize: "1.25rem", borderRight: "1px solid #000000" }}>{part3CgpaStr}</td>
                    <td style={{ padding: "0.6rem", fontSize: "0.95rem" }}>
                      {(() => {
                        const hasArrears = results.some((r: any) => !r.passStatus);
                        if (hasArrears) return "RE-APPEAR (ARREAR)";
                        if (cgpa >= 7.5) return "FIRST CLASS WITH DISTINCTION";
                        if (cgpa >= 6.0) return "FIRST CLASS";
                        return "SECOND CLASS";
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Official Signatures & Verification Block */}
              <div className="signature-report-block" style={{ display: "flex", justifyContent: "space-between", marginTop: "4rem", paddingTop: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "#000000" }}>
                <div>
                  <div style={{ borderTop: "1px stroke #000000", width: "160px", marginBottom: "0.5rem" }}></div>
                  <div>Verified By</div>
                </div>
                <div>
                  <div style={{ borderTop: "1px stroke #000000", width: "160px", marginBottom: "0.5rem" }}></div>
                  <div>Head of Department</div>
                </div>
                <div>
                  <div style={{ borderTop: "1px stroke #000000", width: "160px", marginBottom: "0.5rem" }}></div>
                  <div>Controller of Examinations</div>
                </div>
                <div>
                  <div style={{ borderTop: "1px stroke #000000", width: "160px", marginBottom: "0.5rem" }}></div>
                  <div>Principal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
