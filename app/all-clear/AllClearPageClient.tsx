"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconPrinter,
  IconFilter,
  IconArrowLeft,
  IconSparkles,
  IconCrown,
  IconMedal,
  IconStar,
  IconClipboardList,
  IconBarChart3
} from "../components/Icons";

type Props = {
  students: any[];
  departments: any[];
};

export default function AllClearPageClient({ students, departments }: Props) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [printingStudentId, setPrintingStudentId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [printingMode, setPrintingMode] = useState<"all" | "single" | "selected" | "summary">("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Filter students
  const filteredStudents = students.filter((s) => {
    const sDeptCode = s.department?.code || "CS";
    if (selectedDept !== "all" && sDeptCode !== selectedDept) return false;
    
    const coreAlliedCgpa = s.metrics?.part2Cgpa || s.metrics?.cgpa || 0;
    let cls = "pass";
    if (coreAlliedCgpa >= 7.50) cls = "distinction";
    else if (coreAlliedCgpa >= 6.00) cls = "first";
    else if (coreAlliedCgpa >= 5.00) cls = "second";

    if (selectedClass !== "all" && cls !== selectedClass) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredIds = filteredStudents.map((s) => s.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedStudentIds.includes(id));
  const selectedCount = selectedStudentIds.filter((id) => filteredIds.includes(id)).length;

  // Toggle selection for a single student
  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Toggle select all filtered students
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => !filteredIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedStudentIds, ...filteredIds]));
      setSelectedStudentIds(combined);
    }
  };

  // Handle printing all reports
  const handlePrintAll = () => {
    setPrintingMode("all");
    setPrintingStudentId(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Handle printing selected reports batch
  const handlePrintSelected = () => {
    if (selectedCount === 0) return;
    setPrintingMode("selected");
    setPrintingStudentId(null);
    setTimeout(() => {
      window.print();
      setPrintingMode("all");
    }, 150);
  };

  // Handle printing a single student's report
  const handlePrintSingle = (studentId: string) => {
    setPrintingMode("single");
    setPrintingStudentId(studentId);
    setTimeout(() => {
      window.print();
      setPrintingStudentId(null);
      setPrintingMode("all");
    }, 150);
  };

  // Handle printing summary report
  const handlePrintSummary = () => {
    setPrintingMode("summary");
    setPrintingStudentId(null);
    setTimeout(() => {
      window.print();
      setPrintingMode("all");
    }, 150);
  };

  // Helper to compute exact metrics for summary matching individual cards
  const computeStudentMetrics = (student: any) => {
    const allResults = student.results || [];
    let coreAndAlliedResults = allResults.filter((r: any) => {
      if (!r.subject || !r.subject.code) return false;
      const code = r.subject.code.toUpperCase();
      const name = r.subject.name ? r.subject.name.toUpperCase() : "";
      const isLang = code.includes("ULE") || code.includes("ULT") || code.includes("ULU");
      const isEVS = code.includes("EVS") || code.includes("VALUE") || code.includes("VE") || code.includes("PE") || name.includes("ENVIRONMENT");
      const isPythonOrCore = code.includes("UPCS") || code.includes("UCS") || name.includes("PYTHON") || name.includes("LAB") || name.includes("PRACTICAL");
      if (isPythonOrCore) return true;
      return !isLang && !isEVS;
    });

    if (coreAndAlliedResults.length === 0 && allResults.length > 0) {
      coreAndAlliedResults = allResults;
    }

    const semGroupMap: Record<number, any[]> = {};
    coreAndAlliedResults.forEach((r: any) => {
      const semNum = r.subject?.semester?.number || 1;
      if (!semGroupMap[semNum]) semGroupMap[semNum] = [];
      semGroupMap[semNum].push(r);
    });

    const sortedSemesters = Object.keys(semGroupMap).map(Number).sort((a, b) => a - b);
    let finalCoreAlliedResults: any[] = [];
    sortedSemesters.forEach((semNum) => {
      semGroupMap[semNum].sort((a: any, b: any) => {
        const codeA = a.subject?.code || "";
        const codeB = b.subject?.code || "";
        const nameA = (a.subject?.name || "").toUpperCase();
        const nameB = (b.subject?.name || "").toUpperCase();
        const isCoreA = codeA.includes("UCS") || codeA.includes("UPCS") || nameA.includes("PYTHON") || nameA.includes("LAB");
        const isCoreB = codeB.includes("UCS") || codeB.includes("UPCS") || nameB.includes("PYTHON") || nameB.includes("LAB");
        if (isCoreA && !isCoreB) return -1;
        if (!isCoreA && isCoreB) return 1;
        return codeA.localeCompare(codeB);
      });
      const maxQuota = semNum <= 3 ? 3 : 4;
      finalCoreAlliedResults.push(...semGroupMap[semNum].slice(0, maxQuota));
    });

    let coreScored = 0; let coreMax = 0;
    let alliedScored = 0; let alliedMax = 0;
    finalCoreAlliedResults.forEach((r: any) => {
      const code = (r.subject?.code || "").toUpperCase();
      const mark = (r.total || (r.internalMarks + r.externalMarks));
      const isCore = code.includes("UCS") || code.includes("UPCS") || code.includes("CC");
      if (isCore) { coreScored += mark; coreMax += 100; }
      else { alliedScored += mark; alliedMax += 100; }
    });

    let totalScored = coreScored + alliedScored;
    let totalMax = coreMax + alliedMax;
    if (totalMax === 0) totalMax = finalCoreAlliedResults.length * 100;
    const percentage = totalMax > 0 ? ((totalScored / totalMax) * 100).toFixed(2) : "0.00";
    
    return {
      sortedSemesters,
      semGroupMap,
      finalCoreAlliedResults,
      coreScored,
      alliedScored,
      totalScored,
      totalMax,
      percentage
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. Header Control Bar (No Print) */}
      <div
        className="card glass-panel no-print report-control-bar"
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
            <span className="badge badge-success" style={{ padding: "0.3rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <IconSparkles size={14} color="#059669" /> {filteredStudents.length} All-Clear Students Found
            </span>
          </div>
          <h2 className="h2 text-gradient" style={{ fontSize: "1.6rem" }}>
            Student Result Reports
          </h2>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.15rem" }}>
            MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR • Core & Allied Academic Ledger
          </p>
        </div>

        {/* Filter Controls & Select & Print Actions */}
        <div className="report-control-actions" style={{ display: "flex", gap: "0.85rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Department Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: "1 1 auto" }}>
            <IconFilter size={16} color="var(--accent-primary)" />
            <select
              className="input-field"
              style={{ width: "100%", marginBottom: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
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

          {/* Classification Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: "1 1 auto" }}>
            <IconFilter size={16} color="var(--accent-primary)" />
            <select
              className="input-field"
              style={{ width: "100%", marginBottom: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="distinction">First Class with Distinction (≥ 7.5 CGPA)</option>
              <option value="first">First Class (6.0 - 7.49 CGPA)</option>
              <option value="second">Second Class (5.0 - 5.99 CGPA)</option>
              <option value="pass">Pass Class (&lt; 5.0 CGPA)</option>
            </select>
          </div>

          {/* Search Student */}
          <input
            type="text"
            className="input-field"
            style={{ minWidth: "150px", flex: "1 1 auto", marginBottom: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
            placeholder="Search Student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* View Mode Toggle */}
          <div className="no-print" style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: "var(--radius-md)", border: "1px solid #CBD5E1", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("table")}
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", border: "none", background: viewMode === "table" ? "#FFFFFF" : "transparent", color: viewMode === "table" ? "var(--accent-primary)" : "#64748B", boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <IconClipboardList size={16} /> Table View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", border: "none", background: viewMode === "cards" ? "#FFFFFF" : "transparent", color: viewMode === "cards" ? "var(--accent-primary)" : "#64748B", boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <IconBarChart3 size={16} /> Card View
            </button>
          </div>

          {/* Select All Checkbox Control */}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: allFilteredSelected ? "var(--accent-primary)" : "var(--text-primary)",
              background: "#F1F5F9",
              padding: "0.45rem 0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #CBD5E1",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>Select All ({selectedCount}/{filteredStudents.length})</span>
          </label>

          {/* Print Selected Batch Button */}
          {selectedCount > 0 && (
            <button
              onClick={handlePrintSelected}
              className="btn btn-primary"
              style={{
                padding: "0.55rem 1.15rem",
                fontSize: "0.875rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
                whiteSpace: "nowrap",
              }}
            >
              <IconPrinter size={16} />
              <span>Print Selected ({selectedCount})</span>
            </button>
          )}

          {/* Download All Reports Button */}
          <button
            onClick={handlePrintAll}
            className="btn btn-secondary"
            style={{
              padding: "0.55rem 1.15rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            <IconPrinter size={16} />
            <span>Download All ({filteredStudents.length})</span>
          </button>

          {/* Download Summary Report Button */}
          <button
            onClick={handlePrintSummary}
            className="btn btn-primary"
            style={{
              padding: "0.55rem 1.15rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: "0 6px 16px rgba(5, 150, 105, 0.3)",
              border: "none",
              color: "white"
            }}
          >
            <IconClipboardList size={16} />
            <span>Summary Report</span>
          </button>
        </div>
      </div>

      {/* 2. List of A4 Student Reports OR Summary Report */}
      {filteredStudents.length === 0 ? (
        <div className="card glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <h3 className="h3">No All-Clear Students Found</h3>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>No students matching the selected department filter currently have zero arrears.</p>
        </div>
      ) : (printingMode === "summary" || viewMode === "table") ? (
        <div className="all-clear-reports-container summary-only" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="summary-report-page card glass-panel" style={{ padding: "1.25rem 1.5rem", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", position: "relative", boxSizing: "border-box" }}>
             {/* Official Header */}
             <div style={{ textAlign: "center", marginBottom: "0.85rem", borderBottom: "1.5px solid #000000", paddingBottom: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.85rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <img
                      src="/logo.png"
                      alt="College Logo"
                      style={{ height: "42px", width: "auto", objectFit: "contain" }}
                    />
                    <div>
                      <h1 className="report-header-title" style={{ fontSize: "1.15rem", fontWeight: 900, color: "#000000", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
                        MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR
                      </h1>
                      <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#4F46E5", letterSpacing: "0.03em", margin: "0.15rem 0 0 0" }}>
                        ALL CLEAR STUDENT SUMMARY REPORT
                      </h2>
                    </div>
                  </div>
              </div>

              {/* Summary Table */}
              <div style={{ overflowX: "auto", width: "100%", flexGrow: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.775rem", border: "1.5px solid #000000" }}>
                   <thead>
                     <tr style={{ background: "#F1F5F9", borderBottom: "1.5px solid #000000" }}>
                       <th className="no-print" style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "40px" }}>
                         <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} style={{ cursor: "pointer", accentColor: "var(--accent-primary)" }} />
                       </th>
                       <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "50px" }}>S.NO</th>
                       <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "left", width: "100px" }}>ROLL</th>
                       <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "left" }}>NAME</th>
                       <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "130px" }}>TOTAL MARK (ALLIED+CORE)</th>
                       <th style={{ padding: "0.35rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", width: "100px" }}>PERCENTAGE</th>
                       <th style={{ padding: "0.35rem 0.5rem", textAlign: "center", width: "70px" }}>CGPA</th>
                     </tr>
                   </thead>
                   <tbody>
                     {(() => {
                        const summaryStudents = (printingMode === "summary" && selectedCount > 0)
                          ? filteredStudents.filter(s => selectedStudentIds.includes(s.id))
                          : filteredStudents;

                        return summaryStudents.map((student, idx) => {
                          const { totalScored, totalMax, percentage } = computeStudentMetrics(student);
                          const cgpa = student.metrics?.part2Cgpa || student.metrics?.cgpa || 0;
                          const isChecked = selectedStudentIds.includes(student.id);

                          return (
                            <tr key={student.id} style={{ borderBottom: "1px solid #E2E8F0", background: idx % 2 === 0 ? "#FFFFFF" : (isChecked ? "#F0F9FF" : "#F8FAFC") }}>
                              <td className="no-print" style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center" }}>
                                <input type="checkbox" checked={isChecked} onChange={() => toggleSelectStudent(student.id)} style={{ cursor: "pointer", accentColor: "var(--accent-primary)" }} />
                              </td>
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", fontWeight: 800, color: "#1E293B" }}>{idx + 1}</td>
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700, color: "#0F172A" }}>{student.registerNumber}</td>
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 600, color: "#334155" }}>{student.name}</td>
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", fontWeight: 800, color: "#2563EB" }}>{totalScored} / {totalMax}</td>
                              <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", textAlign: "center", fontWeight: 800, color: "#059669" }}>{percentage}%</td>
                              <td style={{ padding: "0.3rem 0.5rem", textAlign: "center", fontWeight: 800, color: "#4F46E5" }}>{cgpa.toFixed(2)}</td>
                            </tr>
                          );
                        });
                     })()}
                   </tbody>
                </table>
              </div>

              {/* Summary Aggregate Footer */}
              {(() => {
                // Instantly react to checkboxes in the UI for the footer stats
                const footerStudents = selectedCount > 0
                  ? filteredStudents.filter(s => selectedStudentIds.includes(s.id))
                  : filteredStudents;

                let totalDistinction = 0;
                let totalFirst = 0;
                let totalSecond = 0;
                let totalPass = 0;
            
                footerStudents.forEach(student => {
                   const cgpa = student.metrics?.part2Cgpa || student.metrics?.cgpa || 0;
                   if (cgpa >= 7.50) totalDistinction++;
                   else if (cgpa >= 6.00) totalFirst++;
                   else if (cgpa >= 5.00) totalSecond++;
                   else totalPass++;
                });

                return (
                  <div style={{ marginTop: "1.5rem", border: "1.5px solid #000000", padding: "1rem", background: "#F8FAFC" }}>
                     <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0F172A", marginBottom: "0.75rem", textTransform: "uppercase", borderBottom: "1px solid #CBD5E1", paddingBottom: "0.4rem" }}>Filtered Class Summary</h3>
                     <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", textAlign: "center" }}>
                        <div style={{ borderRight: "1px solid #CBD5E1" }}>
                          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Total Students</div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0F172A", marginTop: "0.2rem" }}>{footerStudents.length}</div>
                        </div>
                        <div style={{ borderRight: "1px solid #CBD5E1" }}>
                          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Distinction</div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#059669", marginTop: "0.2rem" }}>{totalDistinction}</div>
                        </div>
                        <div style={{ borderRight: "1px solid #CBD5E1" }}>
                          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>First Class</div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#2563EB", marginTop: "0.2rem" }}>{totalFirst}</div>
                        </div>
                        <div style={{ borderRight: "1px solid #CBD5E1" }}>
                          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Second Class</div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#D97706", marginTop: "0.2rem" }}>{totalSecond}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Pass Class</div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#475569", marginTop: "0.2rem" }}>{totalPass}</div>
                        </div>
                     </div>
                  </div>
                );
              })()}
          </div>
        </div>
      ) : (
        <div className="all-clear-reports-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filteredStudents.map((student) => {
            // Check if this student is hidden during printing
            let isHiddenInPrint = false;
            if (printingMode === "single" && printingStudentId !== student.id) {
              isHiddenInPrint = true;
            } else if (printingMode === "selected" && !selectedStudentIds.includes(student.id)) {
              isHiddenInPrint = true;
            }

            if (isHiddenInPrint) return null;

            const isChecked = selectedStudentIds.includes(student.id);

            // Compute Summary Metrics for Core & Allied subjects using helper
            const { 
              sortedSemesters, 
              semGroupMap, 
              finalCoreAlliedResults, 
              coreScored, 
              alliedScored,
              totalScored: totalCoreAlliedScored,
              totalMax: totalCoreAlliedMax,
              percentage
            } = computeStudentMetrics(student);

            const coreAlliedPercentage = Number(percentage);

            // const corePct = coreMax > 0 ? Number(((coreScored / coreMax) * 100).toFixed(2)) : 0;
            // const alliedPct = alliedMax > 0 ? Number(((alliedScored / alliedMax) * 100).toFixed(2)) : 0;

            // Core & Allied CGPA matching official student ledger metrics (Part 2 CGPA)
            const coreAlliedCgpa = student.metrics?.part2Cgpa || student.metrics?.cgpa || 0;
            const overallCgpa = student.metrics?.cgpa || 0;

            // University Degree Classification Norms (Based Strictly on Core & Allied CGPA)
            let universityClassificationNode = (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <IconCrown size={15} color="#059669" /> FIRST CLASS WITH DISTINCTION
              </span>
            );
            let classificationColor = "#059669";

            if (coreAlliedCgpa >= 7.50) {
              universityClassificationNode = (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <IconCrown size={15} color="#059669" /> FIRST CLASS WITH DISTINCTION
                </span>
              );
              classificationColor = "#059669";
            } else if (coreAlliedCgpa >= 6.00) {
              universityClassificationNode = (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <IconMedal size={15} color="#2563EB" /> FIRST CLASS
                </span>
              );
              classificationColor = "#2563EB";
            } else if (coreAlliedCgpa >= 5.00) {
              universityClassificationNode = (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <IconStar size={15} color="#D97706" /> SECOND CLASS
                </span>
              );
              classificationColor = "#D97706";
            } else {
              universityClassificationNode = <span>PASS CLASS</span>;
              classificationColor = "#475569";
            }

            return (
              <div
                key={student.id}
                className="a4-report-page card glass-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "#FFFFFF",
                  border: isChecked ? "2px solid var(--accent-primary)" : "1px solid rgba(0,0,0,0.15)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: isChecked ? "0 8px 24px rgba(79, 70, 229, 0.12)" : "0 4px 16px rgba(0,0,0,0.04)",
                  position: "relative",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {/* Individual Action Bar (No Print) */}
                <div
                  className="no-print student-action-bar"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.85rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px dashed var(--border-color)",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {/* Checkbox for Select and Print */}
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: isChecked ? "var(--accent-primary)" : "var(--text-secondary)",
                        background: isChecked ? "rgba(79, 70, 229, 0.08)" : "#F1F5F9",
                        padding: "0.3rem 0.65rem",
                        borderRadius: "var(--radius-sm)",
                        border: isChecked ? "1px solid var(--accent-primary)" : "1px solid #CBD5E1",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectStudent(student.id)}
                        style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span>{isChecked ? "Selected" : "Select"}</span>
                    </label>

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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.85rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <img
                      src="/logo.png"
                      alt="College Logo"
                      style={{ height: "42px", width: "auto", objectFit: "contain" }}
                    />
                    <div>
                      <h1 className="report-header-title" style={{ fontSize: "1.15rem", fontWeight: 900, color: "#000000", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
                        MAZHARUL ULOOM COLLEGE (AUTONOMOUS) – AMBUR
                      </h1>
                      <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#4F46E5", letterSpacing: "0.03em", margin: "0.15rem 0 0 0" }}>
                        STUDENT RESULT REPORT
                      </h2>
                    </div>
                  </div>

                  {/* Student Bio Metadata Table Strip */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <IconClipboardList size={15} color="#4F46E5" /> Core & Allied Subjects Performance Table
                  </div>

                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.775rem",
                        border: "1.5px solid #000000",
                        minWidth: "480px",
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
                </div>

                {/* ========================================================= */}
                {/* 3. OVERALL RESULT FOOTER SUMMARY TABLE                    */}
                {/* ========================================================= */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <IconBarChart3 size={15} color="#4F46E5" /> Overall Core & Allied Result Summary (University Norms)
                  </div>

                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.775rem",
                        border: "1.5px solid #000000",
                        background: "#F8FAFC",
                        minWidth: "480px",
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
                          <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>University Awarded Degree Classification (Core & Allied Only)</td>
                          <td style={{ padding: "0.3rem 0.5rem", fontWeight: 900, color: classificationColor }}>
                            {universityClassificationNode}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "0.3rem 0.5rem", borderRight: "1px solid #CBD5E1", fontWeight: 700 }}>Overall Cumulative Grade Point Average (Overall CGPA)</td>
                          <td style={{ padding: "0.3rem 0.5rem", fontWeight: 900, color: "#059669", fontSize: "0.875rem" }}>
                            {overallCgpa.toFixed(2)} CGPA
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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

      {/* Global CSS for Strict Single-Page A4 Print & Responsive Screens */}
      <style jsx global>{`
        @media screen and (max-width: 768px) {
          .report-control-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .report-control-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .report-control-actions button,
          .report-control-actions label,
          .report-control-actions input,
          .report-control-actions select {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .student-action-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .a4-report-page {
            padding: 0.85rem 0.75rem !important;
          }
        }

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
          .a4-report-page *,
          .summary-report-page,
          .summary-report-page * {
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

          .summary-report-page {
            position: relative !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            background: #FFFFFF !important;
            width: 100% !important;
            max-width: 210mm !important;
            box-sizing: border-box !important;
            display: block !important;
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
