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
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
            <Link href="/" className="btn btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <IconArrowLeft size={14} /> Back
            </Link>
            <span className="badge badge-success" style={{ padding: "0.35rem 0.75rem" }}>
              ✨ {filteredStudents.length} All-Clear Students Found
            </span>
          </div>
          <h2 className="h2 text-gradient" style={{ fontSize: "1.75rem" }}>
            All Students Result Reports
          </h2>
          <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.2rem" }}>
            MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR • Core & Allied Academic Ledger
          </p>
        </div>

        {/* Filter Controls & Bulk Action */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Department Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconFilter size={16} color="var(--accent-primary)" />
            <select
              className="input-field"
              style={{ width: "auto", marginBottom: 0, padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
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

          {/* Search Field */}
          <input
            type="text"
            className="input-field"
            style={{ width: "200px", marginBottom: 0, padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            placeholder="🔍 Search Student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Bulk Download / Print All Button */}
          <button
            onClick={handlePrintAll}
            className="btn btn-primary"
            style={{
              padding: "0.6rem 1.25rem",
              fontSize: "0.9rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
            }}
          >
            <IconPrinter size={18} />
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
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {filteredStudents.map((student) => {
            // Determine if this single student is target for printing
            const isSinglePrintTarget = printingStudentId === student.id;
            const hideInSinglePrint = printingStudentId && !isSinglePrintTarget;

            if (hideInSinglePrint) return null;

            // Extract ONLY Core & Allied Subjects
            const allResults = student.results || [];
            const coreAndAlliedResults = allResults.filter((r: any) => {
              const code = r.subject.code.toUpperCase();
              const isLang = code.includes("ULE") || code.includes("ULT") || code.includes("ULU");
              const isGeneralSkill = code.includes("EVS") || code.includes("VALUE") || code.includes("VE") || code.includes("PE");
              return !isLang && !isGeneralSkill;
            });

            // Group by Semester (1, 2, 3, 4...)
            const semGroupMap: Record<number, any[]> = {};
            coreAndAlliedResults.forEach((r: any) => {
              const semNum = r.subject.semester.number;
              if (!semGroupMap[semNum]) semGroupMap[semNum] = [];
              semGroupMap[semNum].push(r);
            });

            const sortedSemesters = Object.keys(semGroupMap).map(Number).sort((a, b) => a - b);

            // Compute Core & Allied Summary Metrics
            let totalCoreAlliedScored = 0;
            let totalCoreAlliedMax = coreAndAlliedResults.length * 100;
            coreAndAlliedResults.forEach((r: any) => {
              totalCoreAlliedScored += r.total;
            });

            const coreAlliedPercentage = totalCoreAlliedMax > 0
              ? Number(((totalCoreAlliedScored / totalCoreAlliedMax) * 100).toFixed(2))
              : 0;

            const coreAlliedCgpa = student.metrics?.part2Cgpa || student.metrics?.cgpa || 0;

            let overallGrade = "O";
            if (coreAlliedPercentage >= 90) overallGrade = "O (Outstanding)";
            else if (coreAlliedPercentage >= 80) overallGrade = "A+ (Excellent)";
            else if (coreAlliedPercentage >= 70) overallGrade = "A (Very Good)";
            else if (coreAlliedPercentage >= 60) overallGrade = "B+ (Good)";
            else if (coreAlliedPercentage >= 50) overallGrade = "B (Above Average)";
            else overallGrade = "C (Pass)";

            return (
              <div
                key={student.id}
                className="a4-report-page card glass-panel"
                style={{
                  padding: "2rem",
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
              >
                {/* Individual Action Bar (No Print) */}
                <div
                  className="no-print"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
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
                    style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <IconPrinter size={14} /> Print This A4 Report
                  </button>
                </div>

                {/* ========================================================= */}
                {/* OFFICIAL A4 REPORT HEADER                                */}
                {/* ========================================================= */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem", borderBottom: "2px solid #000000", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <img
                      src="/logo.png"
                      alt="College Logo"
                      style={{ height: "52px", width: "auto", objectFit: "contain" }}
                    />
                    <div>
                      <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#000000", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
                        MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR
                      </h1>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#4F46E5", letterSpacing: "0.04em", margin: "0.2rem 0 0 0" }}>
                        ALL STUDENTS RESULT REPORT
                      </h2>
                    </div>
                  </div>

                  {/* Student Bio Metadata Table Strip */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: "0.5rem",
                      marginTop: "1rem",
                      background: "#F8FAFC",
                      padding: "0.6rem 1rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Class Rank</span>
                      <strong style={{ color: "#4F46E5", fontSize: "1rem" }}>Rank #{student.rank}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Roll No / Reg No</span>
                      <strong style={{ color: "#0F172A" }}>{student.registerNumber}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Student Name</span>
                      <strong style={{ color: "#0F172A" }}>{student.name}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Department / Batch</span>
                      <strong style={{ color: "#0F172A" }}>{student.department?.code || "CS"} ({student.batchYear || student.batch})</strong>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 2. STUDENT RESULT TABLE (CORE & ALLIED SUBJECTS ONLY)     */}
                {/* ========================================================= */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    📋 Core & Allied Subjects Performance Table
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                      border: "1.5px solid #000000",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#F1F5F9", borderBottom: "1.5px solid #000000" }}>
                        <th style={{ padding: "0.6rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "60px" }}>RANK</th>
                        <th style={{ padding: "0.6rem", borderRight: "1px solid #CBD5E1", textAlign: "left", width: "220px" }}>ROLL NO & NAME</th>
                        <th style={{ padding: "0.6rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "80px" }}>SEMESTER</th>
                        <th style={{ padding: "0.6rem", borderRight: "1px solid #CBD5E1", textAlign: "left" }}>CORE / ALLIED SUBJECT</th>
                        <th style={{ padding: "0.6rem", textAlign: "center", width: "90px" }}>MARK</th>
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
                              {/* Rank Column (Spans All Rows) */}
                              {showStudentHeaderInfo ? (
                                <td
                                  rowSpan={coreAndAlliedResults.length}
                                  style={{
                                    padding: "0.6rem",
                                    borderRight: "1px solid #000000",
                                    textAlign: "center",
                                    fontWeight: 900,
                                    fontSize: "1rem",
                                    color: "#4F46E5",
                                    verticalAlign: "middle",
                                    background: "#FFFFFF",
                                  }}
                                >
                                  #{student.rank}
                                </td>
                              ) : null}

                              {/* Roll No & Name Column (Spans All Rows) */}
                              {showStudentHeaderInfo ? (
                                <td
                                  rowSpan={coreAndAlliedResults.length}
                                  style={{
                                    padding: "0.6rem",
                                    borderRight: "1px solid #000000",
                                    verticalAlign: "middle",
                                    background: "#FFFFFF",
                                  }}
                                >
                                  <div style={{ fontWeight: 800, color: "#0F172A" }}>{student.registerNumber}</div>
                                  <div style={{ color: "#334155", fontSize: "0.8rem", fontWeight: 600 }}>{student.name}</div>
                                </td>
                              ) : null}

                              {/* Semester Column (Spans Semester Rows) */}
                              {isFirstRowInSem ? (
                                <td
                                  rowSpan={semResults.length}
                                  style={{
                                    padding: "0.6rem",
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
                              <td style={{ padding: "0.5rem 0.6rem", borderRight: "1px solid #CBD5E1" }}>
                                <span style={{ fontWeight: 700, color: "#4F46E5", marginRight: "0.4rem" }}>[{r.subject.code}]</span>
                                <span style={{ color: "#0F172A", fontWeight: 600 }}>{r.subject.name}</span>
                              </td>

                              {/* Individual Mark Column */}
                              <td style={{ padding: "0.5rem 0.6rem", textAlign: "center", fontWeight: 800, color: "#0F172A" }}>
                                {r.total} / 100
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================= */}
                {/* 5. OVERALL RESULT FOOTER SUMMARY TABLE                   */}
                {/* ========================================================= */}
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    📊 Overall Core & Allied Result Summary
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                      border: "1.5px solid #000000",
                      background: "#F8FAFC",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#E2E8F0", borderBottom: "1px solid #000000" }}>
                        <th style={{ padding: "0.5rem", textAlign: "left", borderRight: "1px solid #CBD5E1", width: "40%" }}>RESULT COMPONENT</th>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.5rem 0.6rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Total Core & Allied Marks Obtained</td>
                        <td style={{ padding: "0.5rem 0.6rem", fontWeight: 850, color: "#0F172A" }}>
                          {totalCoreAlliedScored} / {totalCoreAlliedMax}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.5rem 0.6rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Overall Core & Allied Percentage</td>
                        <td style={{ padding: "0.5rem 0.6rem", fontWeight: 850, color: "#2563EB" }}>
                          {coreAlliedPercentage.toFixed(2)}%
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                        <td style={{ padding: "0.5rem 0.6rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Overall Classification Grade</td>
                        <td style={{ padding: "0.5rem 0.6rem", fontWeight: 850, color: "#059669" }}>
                          {overallGrade}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0.5rem 0.6rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Cumulative Grade Point Average (CGPA)</td>
                        <td style={{ padding: "0.5rem 0.6rem", fontWeight: 900, color: "#4F46E5", fontSize: "1rem" }}>
                          {coreAlliedCgpa.toFixed(2)} CGPA
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
                    marginTop: "1.5rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #CBD5E1",
                    fontSize: "0.75rem",
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

      {/* Global CSS for Print Optimization */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          body {
            background: #FFFFFF !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header, nav, .no-print, footer, .main-header, .mobile-sidebar, .mobile-backdrop {
            display: none !important;
          }

          .a4-report-page {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: 1.5px solid #000000 !important;
            margin: 0 0 0 0 !important;
            padding: 1.25rem !important;
            border-radius: 0 !important;
            background: #FFFFFF !important;
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
