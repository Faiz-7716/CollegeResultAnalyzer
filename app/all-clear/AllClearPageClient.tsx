"use client";

import { useState } from "react";
import Link from "next/link";
import { IconPrinter, IconFilter, IconArrowLeft, IconSparkles } from "../components/Icons";

type Props = {
  students: any[];
  departments: any[];
};

export default function AllClearPageClient({ students, departments }: Props) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [printingStudentId, setPrintingStudentId] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const sDeptCode = s.department?.code || "CS";
    if (selectedDept !== "all" && sDeptCode !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle printing all reports at once
  const handlePrintAll = () => {
    setPrintingStudentId(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Handle printing a single student's report
  const handlePrintSingle = (studentId: string) => {
    setPrintingStudentId(studentId);
    setTimeout(() => {
      window.print();
      setPrintingStudentId(null);
    }, 150);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. Header Control Bar (No Print) */}
      <div
        className="card glass-panel no-print"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
            <Link href="/" className="btn btn-secondary" style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <IconArrowLeft size={14} /> Back
            </Link>
            <span className="badge badge-success" style={{ padding: "0.3rem 0.65rem" }}>
              ✨ {filteredStudents.length} All-Clear Students Found
            </span>
          </div>
          <h2 className="h2 text-gradient" style={{ fontSize: "1.6rem" }}>
            All Students Result Reports
          </h2>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.15rem" }}>
            MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR • Core & Allied Academic Ledger
          </p>
        </div>

        {/* Filter Controls & Bulk Action */}
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <IconFilter size={16} color="var(--accent-primary)" />
            <select
              className="input-field"
              style={{ width: "auto", marginBottom: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            className="input-field"
            style={{ width: "190px", marginBottom: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
            placeholder="🔍 Search Student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={handlePrintAll}
            className="btn btn-primary"
            style={{
              padding: "0.55rem 1.15rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
            }}
          >
            <IconPrinter size={16} />
            <span>Download All Reports (Bulk A4 Print/PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. List of A4 Student Reports */}
      {filteredStudents.length === 0 ? (
        <div className="card glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <h3 className="h3">No All-Clear Students Found</h3>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>No students matching the selected department filter currently have zero arrears.</p>
        </div>
      ) : (
        <div className="all-clear-reports-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filteredStudents.map((student) => {
            const isSinglePrintTarget = printingStudentId === student.id;
            const hideInSinglePrint = printingStudentId && !isSinglePrintTarget;

            if (hideInSinglePrint) return null;

            // Extract Core & Allied Subjects (Exclude Language and General Skill Electives)
            const allResults = student.results || [];
            let coreAndAlliedResults = allResults.filter((r: any) => {
              if (!r.subject || !r.subject.code) return false;
              const code = r.subject.code.toUpperCase();
              const isLang = code.includes("ULE") || code.includes("ULT") || code.includes("ULU");
              const isGeneralSkill = code.includes("EVS") || code.includes("VALUE") || code.includes("VE") || code.includes("PE");
              return !isLang && !isGeneralSkill;
            });

            // Fallback if filter is empty
            if (coreAndAlliedResults.length === 0 && allResults.length > 0) {
              coreAndAlliedResults = allResults;
            }

            // Group by Semester (1, 2, 3, 4...)
            const semGroupMap: Record<number, any[]> = {};
            coreAndAlliedResults.forEach((r: any) => {
              const semNum = r.subject?.semester?.number || 1;
              if (!semGroupMap[semNum]) semGroupMap[semNum] = [];
              semGroupMap[semNum].push(r);
            });

            const sortedSemesters = Object.keys(semGroupMap).map(Number).sort((a, b) => a - b);
            let finalCoreAlliedResults: any[] = [];

            // Sort subjects inside each semester by Subject Code & slice to exact quota:
            // Sem 1, Sem 2, Sem 3 -> max 3 Core/Allied subjects
            // Sem 4 -> max 4 Core/Allied subjects
            sortedSemesters.forEach((semNum) => {
              semGroupMap[semNum].sort((a: any, b: any) => {
                const codeA = a.subject?.code || "";
                const codeB = b.subject?.code || "";
                return codeA.localeCompare(codeB);
              });

              const maxQuota = semNum <= 3 ? 3 : 4;
              const semSliced = semGroupMap[semNum].slice(0, maxQuota);
              semGroupMap[semNum] = semSliced;
              finalCoreAlliedResults.push(...semSliced);
            });

            // Compute Summary Metrics for Core & Allied subjects
            let coreScored = 0;
            let coreMax = 0;
            let alliedScored = 0;
            let alliedMax = 0;

            finalCoreAlliedResults.forEach((r: any) => {
              const code = (r.subject?.code || "").toUpperCase();
              const mark = (r.total || (r.internalMarks + r.externalMarks));
              const isCore = code.includes("UCS") || code.includes("UPCS") || code.includes("CC");

              if (isCore) {
                coreScored += mark;
                coreMax += 100;
              } else {
                alliedScored += mark;
                alliedMax += 100;
              }
            });

            let totalCoreAlliedScored = coreScored + alliedScored;
            let totalCoreAlliedMax = coreMax + alliedMax;
            if (totalCoreAlliedMax === 0) totalCoreAlliedMax = finalCoreAlliedResults.length * 100;

            const coreAlliedPercentage = totalCoreAlliedMax > 0
              ? Number(((totalCoreAlliedScored / totalCoreAlliedMax) * 100).toFixed(2))
              : 0;

            const corePct = coreMax > 0 ? Number(((coreScored / coreMax) * 100).toFixed(2)) : 0;
            const alliedPct = alliedMax > 0 ? Number(((alliedScored / alliedMax) * 100).toFixed(2)) : 0;

            const coreAlliedCgpa = student.metrics?.part2Cgpa || student.metrics?.cgpa || 0;

            // University Degree Classification Norms
            let universityClassification = "FIRST CLASS WITH DISTINCTION 👑";
            let classificationColor = "#059669";

            if (coreAlliedCgpa >= 7.50 && coreAlliedPercentage >= 75.00) {
              universityClassification = "FIRST CLASS WITH DISTINCTION 👑";
              classificationColor = "#059669";
            } else if (coreAlliedCgpa >= 6.00 && coreAlliedPercentage >= 60.00) {
              universityClassification = "FIRST CLASS 🏅";
              classificationColor = "#2563EB";
            } else if (coreAlliedCgpa >= 5.00 && coreAlliedPercentage >= 50.00) {
              universityClassification = "SECOND CLASS 🌟";
              classificationColor = "#D97706";
            } else {
              universityClassification = "PASS CLASS";
              classificationColor = "#475569";
            }

            return (
              <div
                key={student.id}
                className="a4-report-page card glass-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                {/* Individual Action Bar (No Print) */}
                <div
                  className="no-print"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.85rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px dashed var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge badge-primary" style={{ fontWeight: 800 }}>
                      RANK #{student.rank}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      {student.registerNumber} • {student.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePrintSingle(student.id)}
                    className="btn btn-secondary"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.775rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <IconPrinter size={14} /> Print This A4 Report
                  </button>
                </div>

                {/* ========================================================= */}
                {/* 1. OFFICIAL A4 REPORT HEADER                              */}
                {/* ========================================================= */}
                <div style={{ textAlign: "center", marginBottom: "0.85rem", borderBottom: "1.5px solid #000000", paddingBottom: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.85rem", marginBottom: "0.35rem" }}>
                    <img
                      src="/logo.png"
                      alt="College Logo"
                      style={{ height: "42px", width: "auto", objectFit: "contain" }}
                    />
                    <div>
                      <h1 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#000000", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
                        MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR
                      </h1>
                      <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#4F46E5", letterSpacing: "0.03em", margin: "0.15rem 0 0 0" }}>
                        ALL STUDENTS RESULT REPORT
                      </h2>
                    </div>
                  </div>

                  {/* Student Bio Metadata Table Strip */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1.2fr 1fr",
                      gap: "0.35rem",
                      marginTop: "0.5rem",
                      background: "#F8FAFC",
                      padding: "0.4rem 0.75rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Class Rank</span>
                      <strong style={{ color: "#4F46E5", fontSize: "0.9rem" }}>Rank #{student.rank}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Roll No / Reg No</span>
                      <strong style={{ color: "#0F172A" }}>{student.registerNumber}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Student Name</span>
                      <strong style={{ color: "#0F172A" }}>{student.name}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Department / Batch</span>
                      <strong style={{ color: "#0F172A" }}>{student.department?.code || "CS"} ({student.batchYear || student.batch})</strong>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 2. STUDENT RESULT TABLE (CORE & ALLIED SUBJECTS ONLY)     */}
                {/* ========================================================= */}
                <div style={{ marginBottom: "0.85rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                    📋 Core & Allied Subjects Performance Table
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.775rem",
                      border: "1.5px solid #000000",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#F1F5F9", borderBottom: "1.5px solid #000000" }}>
                        <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "50px" }}>RANK</th>
                        <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "left", width: "190px" }}>ROLL NO & NAME</th>
                        <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "70px" }}>SEMESTER</th>
                        <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "left" }}>CORE / ALLIED SUBJECT</th>
                        <th style={{ padding: "0.35rem 0.5rem", textAlign: "center", width: "80px" }}>MARK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSemesters.map((semNum, semIdx) => {
                        const semResults = semGroupMap[semNum];
                        const isFirstSem = semIdx === 0;

                        return semResults.map((r: any, rIdx: number) => {
                          const isFirstRowInSem = rIdx === 0;
                          const showStudentHeaderInfo = isFirstSem && isFirstRowInSem;

                          return (
                            <tr
                              key={r.id}
                              style={{
                                borderBottom: rIdx === semResults.length - 1 ? "1.5px solid #000000" : "1px solid #E2E8F0",
                                background: semIdx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                              }}
                            >
                              {/* Rank Column */}
                              {showStudentHeaderInfo ? (
                                <td
                                  rowSpan={finalCoreAlliedResults.length}
                                  style={{
                                    padding: "0.4rem 0.5rem",
                                    borderRight: "1px solid #000000",
                                    textAlign: "center",
                                    fontWeight: 900,
                                    fontSize: "0.9rem",
                                    color: "#4F46E5",
                                    verticalAlign: "middle",
                                    background: "#FFFFFF",
                                  }}
                                >
                                  #{student.rank}
                                </td>
                              ) : null}

                              {/* Roll No & Name Column */}
                              {showStudentHeaderInfo ? (
                                <td
                                  rowSpan={finalCoreAlliedResults.length}
                                  style={{
                                    padding: "0.4rem 0.5rem",
                                    borderRight: "1px solid #000000",
                                    verticalAlign: "middle",
                                    background: "#FFFFFF",
                                  }}
                                >
                                  <div style={{ fontWeight: 800, color: "#0F172A" }}>{student.registerNumber}</div>
                                  <div style={{ color: "#334155", fontSize: "0.75rem", fontWeight: 600 }}>{student.name}</div>
                                </td>
                              ) : null}

                              {/* Semester Column */}
                              {isFirstRowInSem ? (
                                <td
                                  rowSpan={semResults.length}
                                  style={{
                                    padding: "0.35rem 0.5rem",
                                    borderRight: "1px solid #CBD5E1",
                                    textAlign: "center",
                                    fontWeight: 800,
                                    color: "#1E293B",
                                    verticalAlign: "middle",
                                    background: "#F1F5F9",
                                  }}
                                >
                                  Sem {semNum}
                                </td>
                              ) : null}

                              {/* Subject Name Column */}
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1" }}>
                                <span style={{ fontWeight: 700, color: "#4F46E5", marginRight: "0.35rem" }}>[{r.subject?.code}]</span>
                                <span style={{ color: "#0F172A", fontWeight: 600 }}>{r.subject?.name}</span>
                              </td>

                              {/* Individual Mark Column */}
                              <td style={{ padding: "0.3rem 0.5rem", textAlign: "center", fontWeight: 800, color: "#0F172A" }}>
                                {(r.total || (r.internalMarks + r.externalMarks))} / 100
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================= */}
                {/* 3. OVERALL RESULT FOOTER SUMMARY TABLE                    */}
                {/* ========================================================= */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                    📊 Overall Core & Allied Result Summary (University Norms)
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.775rem",
                      border: "1.5px solid #000000",
                      background: "#F8FAFC",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#E2E8F0", borderBottom: "1px solid #000000" }}>
                        <th style={{ padding: "0.35rem 0.5rem", textAlign: "left", borderRight: "1px solid #CBD5E1", width: "45%" }}>RESULT COMPONENT</th>
                        <th style={{ padding: "0.35rem 0.5rem", textAlign: "left" }}>VALUE & CLASSIFICATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Total Core Subjects Marks</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 850, color: "#0F172A" }}>
                          {student.metrics?.coreMarks || coreScored} Marks
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Total Allied Subjects Marks</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 850, color: "#0F172A" }}>
                          {student.metrics?.alliedMarks || alliedScored} Marks
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Combined Core & Allied Total Marks</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 850, color: "#2563EB" }}>
                          {student.metrics?.coreAndAllied || totalCoreAlliedScored} / 1300 ({coreAlliedPercentage.toFixed(1)}%)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Core & Allied Grade Point Average (Core + Allied CGPA)</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 900, color: "#4F46E5", fontSize: "0.875rem" }}>
                          {coreAlliedCgpa.toFixed(2)} CGPA
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Overall Total Marks (All 4 Semesters)</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 850, color: "#0F172A" }}>
                          {student.metrics?.totalMarks || 0} Marks
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>University Awarded Degree Classification</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 900, color: classificationColor }}>
                          {universityClassification}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Overall Cumulative Grade Point Average (Overall CGPA)</td>
                        <td style={{ padding: "0.3rem 0.5rem", fontWeight: 900, color: "#059669", fontSize: "0.875rem" }}>
                          {(student.metrics?.cgpa || coreAlliedCgpa).toFixed(2)} CGPA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Printable Footer Stamp */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.4rem",
                    borderTop: "1px solid #CBD5E1",
                    fontSize: "0.7rem",
                    color: "#64748B",
                  }}
                >
                  <div>Verified Official Record • Department of Computer Science</div>
                  <div>Page 1 of 1 • Generated via MUC Enterprise Ledger</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global CSS for Strict Single-Page A4 Print Optimization */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          html, body {
            background: #FFFFFF !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header, nav, .no-print, footer, .main-header, .mobile-sidebar, .mobile-backdrop {
            display: none !important;
          }

          .all-clear-reports-container,
          .all-clear-reports-container *,
          .a4-report-page,
          .a4-report-page * {
            visibility: visible !important;
          }

          .all-clear-reports-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .a4-report-page {
            position: relative !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: 1.5px solid #000000 !important;
            margin: 0 0 0 0 !important;
            padding: 0.85rem 1rem !important;
            border-radius: 0 !important;
            background: #FFFFFF !important;
            width: 100% !important;
            max-width: 210mm !important;
            height: 275mm !important;
            max-height: 275mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          .a4-report-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          table {
            page-break-inside: avoid !important;
          }

          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
