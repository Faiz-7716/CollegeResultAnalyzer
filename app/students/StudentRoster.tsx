"use client";

import { useState } from "react";
import Link from "next/link";
import { IconFilter, IconArrowUpDown, IconFileText, IconChevronRight } from "../components/Icons";

type StudentData = {
  id: string;
  registerNumber: string;
  name: string;
  batch: string;
  metrics: {
    cgpa: number;
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

  return (
    <div>
      <div className="responsive-flex" style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
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
                setSortOption("coreAndAllied");
              }
            }}
          >
            <option value="all">All Students</option>
            <option value="allClear">All Clear Ranking</option>
            <option value="arrears">Students with Arrears</option>
          </select>
        </div>

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
            <option value="cgpa">CGPA</option>
            <option value="totalMarks">Total Marks (Everything)</option>
            <option value="coreMarks">Only Core</option>
            <option value="alliedMarks">Only Allied</option>
            <option value="coreAndAllied">Allied + Core</option>
            <option value="languageMarks">Only Language</option>
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

      <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {sortedStudents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p className="text-muted">No students found in the database.</p>
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
                    <th>Sem 1</th>
                    <th>Sem 2</th>
                    <th>Sem 3</th>
                    <th>Sem 4</th>
                    <th>CGPA</th>
                    <th>Total</th>
                    <th>Core</th>
                    <th>Allied</th>
                    <th>Core + Allied</th>
                    <th>Average %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: "bold", color: "var(--accent-primary)" }}>#{index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{student.registerNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.metrics.semMarks[1] || "-"}</td>
                      <td>{student.metrics.semMarks[2] || "-"}</td>
                      <td>{student.metrics.semMarks[3] || "-"}</td>
                      <td>{student.metrics.semMarks[4] || "-"}</td>
                      <td style={{ fontWeight: "bold" }}>{student.metrics.cgpa.toFixed(2)}</td>
                      <td>{student.metrics.totalMarks}</td>
                      <td>{student.metrics.coreMarks}</td>
                      <td>{student.metrics.alliedMarks}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student.metrics.coreAndAllied}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {student.metrics.coreAlliedSubjectsCount > 0 
                            ? ((student.metrics.coreAndAllied / (student.metrics.coreAlliedSubjectsCount * 100)) * 100).toFixed(1) 
                            : "0.0"}%
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-primary)", fontSize: "0.9rem" }}>
                          {student.metrics.totalSubjectsCount > 0 
                            ? ((student.metrics.totalMarks / (student.metrics.totalSubjectsCount * 100)) * 100).toFixed(2) 
                            : "0.00"}%
                        </span>
                      </td>
                      <td>
                        <Link href={`/students/${student.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                          View Ledger
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="mobile-roster-cards">
              {sortedStudents.map((student, index) => {
                const coreAlliedPct = student.metrics.coreAlliedSubjectsCount > 0 
                  ? ((student.metrics.coreAndAllied / (student.metrics.coreAlliedSubjectsCount * 100)) * 100).toFixed(1) 
                  : "0.0";
                const totalAvgPct = student.metrics.totalSubjectsCount > 0 
                  ? ((student.metrics.totalMarks / (student.metrics.totalSubjectsCount * 100)) * 100).toFixed(2) 
                  : "0.00";

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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", background: "rgba(248, 250, 252, 0.6)", padding: "0.75rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>CGPA</div>
                        <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: "1.1rem" }}>{student.metrics.cgpa.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>Core+Allied</div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{student.metrics.coreAndAllied}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{coreAlliedPct}%</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>Average</div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent-secondary)" }}>{totalAvgPct}%</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem" }}>
                      <div className="text-muted">
                        Sem Marks: <strong>{student.metrics.semMarks[1] || "-"}</strong> / <strong>{student.metrics.semMarks[2] || "-"}</strong> / <strong>{student.metrics.semMarks[3] || "-"}</strong> / <strong>{student.metrics.semMarks[4] || "-"}</strong>
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
