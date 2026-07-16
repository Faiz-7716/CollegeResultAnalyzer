"use client";

import { useState } from "react";
import Link from "next/link";

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
    semMarks: Record<number, number>;
  };
};

export default function StudentRoster({ initialStudents }: { initialStudents: StudentData[] }) {
  const [sortOption, setSortOption] = useState<string>("registerNumber");

  const sortedStudents = [...initialStudents].sort((a, b) => {
    switch (sortOption) {
      case "registerNumber":
        return a.registerNumber.localeCompare(b.registerNumber);
      case "cgpa":
        return b.metrics.cgpa - a.metrics.cgpa;
      case "totalMarks":
        return b.metrics.totalMarks - a.metrics.totalMarks;
      case "coreMarks":
        return b.metrics.coreMarks - a.metrics.coreMarks;
      case "alliedMarks":
        return b.metrics.alliedMarks - a.metrics.alliedMarks;
      case "coreAndAllied":
        return b.metrics.coreAndAllied - a.metrics.coreAndAllied;
      case "languageMarks":
        return b.metrics.languageMarks - a.metrics.languageMarks;
      case "sem1":
        return (b.metrics.semMarks[1] || 0) - (a.metrics.semMarks[1] || 0);
      case "sem2":
        return (b.metrics.semMarks[2] || 0) - (a.metrics.semMarks[2] || 0);
      case "sem3":
        return (b.metrics.semMarks[3] || 0) - (a.metrics.semMarks[3] || 0);
      case "sem4":
        return (b.metrics.semMarks[4] || 0) - (a.metrics.semMarks[4] || 0);
      default:
        return 0;
    }
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <label className="input-label" style={{ margin: 0 }}>Sort By:</label>
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
      </div>

      <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {sortedStudents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p className="text-muted">No students found in the database.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
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
        )}
      </div>
    </div>
  );
}
