"use client";

import { useState } from "react";
import Link from "next/link";
import { IconFilter, IconArrowUpDown, IconFileText } from "../components/Icons";

type StudentData = {
  id: string;
  registerNumber: string;
  name: string;
  batch: string;
  metrics: {
    cgpa: number;
    part1Cgpa?: number;
    part2Cgpa?: number;
    part3Cgpa?: number;
    totalMarks: number;
    coreMarks: number;
    alliedMarks: number;
    coreAndAllied: number;
    languageMarks: number;
    coreAlliedSubjectsCount: number;
    totalSubjectsCount: number;
    hasArrear: boolean;
    semMarks: Record<number, number>;
  };
};

export default function StudentRoster({ initialStudents }: { initialStudents: StudentData[] }) {
  const [sortOption, setSortOption] = useState<string>("registerNumber");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filterOption, setFilterOption] = useState<string>("all");

  const filteredStudents = initialStudents.filter(student => {
    if (filterOption === "allClear") return !student.metrics.hasArrear;
    if (filterOption === "arrears") return student.metrics.hasArrear;
    return true;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let result = 0;
    switch (sortOption) {
      case "registerNumber":
        result = a.registerNumber.localeCompare(b.registerNumber);
        break;
      case "cgpa":
        result = b.metrics.cgpa - a.metrics.cgpa;
        break;
      case "part1Cgpa":
        result = (b.metrics.part1Cgpa || 0) - (a.metrics.part1Cgpa || 0);
        break;
      case "part2Cgpa":
        result = (b.metrics.part2Cgpa || 0) - (a.metrics.part2Cgpa || 0);
        break;
      case "part3Cgpa":
        result = (b.metrics.part3Cgpa || 0) - (a.metrics.part3Cgpa || 0);
        break;
      case "totalMarks":
        result = b.metrics.totalMarks - a.metrics.totalMarks;
        break;
      case "coreMarks":
        result = b.metrics.coreMarks - a.metrics.coreMarks;
        break;
      case "alliedMarks":
        result = b.metrics.alliedMarks - a.metrics.alliedMarks;
        break;
      case "coreAndAllied":
        result = b.metrics.coreAndAllied - a.metrics.coreAndAllied;
        break;
      case "languageMarks":
        result = b.metrics.languageMarks - a.metrics.languageMarks;
        break;
      case "sem1":
        result = (b.metrics.semMarks[1] || 0) - (a.metrics.semMarks[1] || 0);
        break;
      case "sem2":
        result = (b.metrics.semMarks[2] || 0) - (a.metrics.semMarks[2] || 0);
        break;
      case "sem3":
        result = (b.metrics.semMarks[3] || 0) - (a.metrics.semMarks[3] || 0);
        break;
      case "sem4":
        result = (b.metrics.semMarks[4] || 0) - (a.metrics.semMarks[4] || 0);
        break;
      default:
        result = 0;
    }
    return sortDir === "desc" ? result : -result;
  });

  // High-Quality Excel / CSV Export Generator
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Register Number",
      "Student Name",
      "Batch",
      "Academic Standing",
      "Overall CGPA",
      "Part 1 Language CGPA",
      "Part 2 Allied + Core CGPA",
      "Part 3 Others CGPA",
      "Sem 1 Total",
      "Sem 2 Total",
      "Sem 3 Total",
      "Sem 4 Total",
      "Core Marks",
      "Allied Marks",
      "Core + Allied Total",
      "Core + Allied %",
      "Language Marks",
      "Overall Total Marks",
      "Average %"
    ];

    const rows = sortedStudents.map((student, index) => {
      const coreAlliedPct = student.metrics.coreAlliedSubjectsCount > 0 
        ? ((student.metrics.coreAndAllied / (student.metrics.coreAlliedSubjectsCount * 100)) * 100).toFixed(2) 
        : "0.00";
      const totalAvgPct = student.metrics.totalSubjectsCount > 0 
        ? ((student.metrics.totalMarks / (student.metrics.totalSubjectsCount * 100)) * 100).toFixed(2) 
        : "0.00";
      const status = student.metrics.hasArrear ? "ACTIVE ARREAR" : "ALL CLEAR";

      const p1 = (student.metrics.part1Cgpa || 0).toFixed(2);
      const p2 = (student.metrics.part2Cgpa || 0).toFixed(2);
      const p3 = (student.metrics.part3Cgpa || 0).toFixed(2);

      return [
        index + 1,
        `="${student.registerNumber}"`, // Forces Excel text format for Register Numbers
        `"${student.name.replace(/"/g, '""')}"`,
        `"${student.batch}"`,
        `"${status}"`,
        student.metrics.cgpa.toFixed(2),
        p1,
        p2,
        p3,
        student.metrics.semMarks[1] || 0,
        student.metrics.semMarks[2] || 0,
        student.metrics.semMarks[3] || 0,
        student.metrics.semMarks[4] || 0,
        student.metrics.coreMarks,
        student.metrics.alliedMarks,
        student.metrics.coreAndAllied,
        `${coreAlliedPct}%`,
        student.metrics.languageMarks,
        student.metrics.totalMarks,
        `${totalAvgPct}%`
      ];
    });

    // Add UTF-8 BOM (\uFEFF) for crisp Excel column rendering
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const filterLabel = filterOption === "allClear" ? "All_Clear_Rankings" : filterOption === "arrears" ? "Arrears_List" : "All_Students";
    const dateStr = new Date().toISOString().split("T")[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `MUC_CS_Results_${filterLabel}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Controls Bar: Filter, Sort, and Excel Export */}
      <div className="responsive-flex" style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Filter Dropdown */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <IconFilter size={18} color="var(--accent-primary)" />
            <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Filter By:</label>
            <select 
              className="input-field" 
              style={{ width: "auto", marginBottom: 0 }}
              value={filterOption}
              onChange={(e) => {
                const val = e.target.value;
                setFilterOption(val);
                if (val === "allClear") {
                  setSortOption("part2Cgpa");
                }
              }}
            >
              <option value="all">All Students ({initialStudents.length})</option>
              <option value="allClear">All Clear Ranking</option>
              <option value="arrears">Students with Arrears</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <IconArrowUpDown size={18} color="var(--accent-primary)" />
            <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Sort By:</label>
            <select 
              className="input-field" 
              style={{ width: "auto", marginBottom: 0 }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="registerNumber">Register Number (Default)</option>
              <option value="cgpa">Overall CGPA</option>
              <option value="part1Cgpa">Part 1: Language CGPA</option>
              <option value="part2Cgpa">Part 2: Allied + Core CGPA</option>
              <option value="part3Cgpa">Part 3: Others CGPA</option>
              <option value="totalMarks">Total Marks (Everything)</option>
              <option value="coreMarks">Only Core</option>
              <option value="alliedMarks">Only Allied</option>
              <option value="coreAndAllied">Allied + Core Marks</option>
              <option value="languageMarks">Only Language Marks</option>
              <option value="sem1">Semester 1 Marks</option>
              <option value="sem2">Semester 2 Marks</option>
              <option value="sem3">Semester 3 Marks</option>
              <option value="sem4">Semester 4 Marks</option>
            </select>

            <button 
              className="btn btn-secondary" 
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            >
              <IconArrowUpDown size={14} />
              <span>{sortDir === "desc" ? "Descending" : "Ascending"}</span>
            </button>
          </div>
        </div>

        {/* High-Quality Excel / CSV Export Button */}
        <button
          className="btn btn-primary"
          onClick={handleExportCSV}
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            background: "var(--status-success)",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <IconFileText size={18} color="#FFFFFF" />
          <span>Export Excel / CSV ({sortedStudents.length})</span>
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {sortedStudents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p className="text-muted">No students found matching the selected filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive desktop-roster-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Register Number</th>
                    <th>Name</th>
                    <th>Overall CGPA</th>
                    <th style={{ color: "#059669" }}>Part 1 (Lang) CGPA</th>
                    <th style={{ color: "var(--accent-primary)" }}>Part 2 (Allied+Core) CGPA</th>
                    <th style={{ color: "#D97706" }}>Part 3 (Others) CGPA</th>
                    <th>Sem 1-4 Totals</th>
                    <th>Total Marks</th>
                    <th>Core + Allied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, index) => {
                    const p1 = (student.metrics.part1Cgpa || 0).toFixed(2);
                    const p2 = (student.metrics.part2Cgpa || 0).toFixed(2);
                    const p3 = (student.metrics.part3Cgpa || 0).toFixed(2);

                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: "bold", color: "var(--accent-primary)" }}>#{index + 1}</td>
                        <td style={{ fontWeight: 500 }}>{student.registerNumber}</td>
                        <td style={{ fontWeight: 600 }}>{student.name}</td>
                        <td style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{student.metrics.cgpa.toFixed(2)}</td>
                        <td style={{ fontWeight: 700, color: "#059669" }}>{p1}</td>
                        <td style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{p2}</td>
                        <td style={{ fontWeight: 700, color: "#D97706" }}>{p3}</td>
                        <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {student.metrics.semMarks[1] || "-"} / {student.metrics.semMarks[2] || "-"} / {student.metrics.semMarks[3] || "-"} / {student.metrics.semMarks[4] || "-"}
                        </td>
                        <td style={{ fontWeight: 600 }}>{student.metrics.totalMarks}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{student.metrics.coreAndAllied}</div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            {student.metrics.coreAlliedSubjectsCount > 0 
                              ? ((student.metrics.coreAndAllied / (student.metrics.coreAlliedSubjectsCount * 100)) * 100).toFixed(1) 
                              : "0.0"}%
                          </div>
                        </td>
                        <td>
                          <Link href={`/students/${student.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                            View Ledger
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="mobile-roster-cards">
              {sortedStudents.map((student, index) => {
                const p1 = (student.metrics.part1Cgpa || 0).toFixed(2);
                const p2 = (student.metrics.part2Cgpa || 0).toFixed(2);
                const p3 = (student.metrics.part3Cgpa || 0).toFixed(2);

                return (
                  <div
                    key={student.id}
                    className="card glass-panel"
                    style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 800, color: "var(--accent-primary)", fontSize: "1.1rem" }}>
                            #{index + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{student.name}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.15rem" }}>
                          Reg No: <strong>{student.registerNumber}</strong>
                        </div>
                      </div>
                      <span className={`badge ${student.metrics.hasArrear ? "badge-error" : "badge-success"}`}>
                        {student.metrics.hasArrear ? "ARREAR" : "ALL CLEAR"}
                      </span>
                    </div>

                    {/* 3 Part CGPA Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", background: "rgba(248, 250, 252, 0.8)", padding: "0.75rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Part 1 (Lang)</div>
                        <div style={{ fontWeight: 800, color: "#059669", fontSize: "1.05rem" }}>{p1}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Part 2 (Allied+Core)</div>
                        <div style={{ fontWeight: 800, color: "var(--accent-primary)", fontSize: "1.05rem" }}>{p2}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Part 3 (Others)</div>
                        <div style={{ fontWeight: 800, color: "#D97706", fontSize: "1.05rem" }}>{p3}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem" }}>
                      <div>
                        Overall CGPA: <strong style={{ color: "var(--accent-primary)", fontSize: "0.95rem" }}>{student.metrics.cgpa.toFixed(2)}</strong>
                      </div>
                      <Link href={`/students/${student.id}`} className="btn btn-secondary" style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}>
                        View Ledger &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
