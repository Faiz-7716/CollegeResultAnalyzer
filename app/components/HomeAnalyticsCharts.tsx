"use client";

import React, { useState } from "react";

interface SemStat {
  semester: number;
  passRate: number;
  avgMarks: number;
  totalExams: number;
}

interface SubjectStat {
  id: string;
  code: string;
  name: string;
  totalEnrolled: number;
  passed: number;
  passRate: number;
  semNumber: number;
}

interface HomeAnalyticsChartsProps {
  semPassStats: SemStat[];
  subjectLeaderboard: SubjectStat[];
}

export default function HomeAnalyticsCharts({
  semPassStats,
  subjectLeaderboard,
}: HomeAnalyticsChartsProps) {
  const [hoveredSem, setHoveredSem] = useState<SemStat | null>(null);

  // Take top 4 hardest and top 4 highest subjects for difficulty matrix
  const hardest4 = subjectLeaderboard.slice(0, 4);
  const highest4 = [...subjectLeaderboard].sort((a, b) => b.passRate - a.passRate).slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Semester Performance Chart Card */}
      <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
        <div className="responsive-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
          <div>
            <h3 className="h3">Batch Semester Performance Matrix</h3>
            <p className="text-muted" style={{ fontSize: "0.875rem" }}>
              Pass Rate (%) & Average Score progression across Semesters 1 to 4
            </p>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "12px", height: "12px", background: "#4F46E5", borderRadius: "3px" }}></span>
              <span>Pass Rate (%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "12px", height: "12px", background: "#10B981", borderRadius: "3px" }}></span>
              <span>Average Marks</span>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", height: "240px" }}>
          <svg width="100%" height="100%" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Gridlines 0%, 25%, 50%, 75%, 100% */}
            {[100, 75, 50, 25, 0].map((val) => {
              const y = 180 - (val / 100) * 150;
              return (
                <g key={val}>
                  <line x1="40" y1={y} x2="570" y2={y} stroke="var(--border-color)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
                  <text x="32" y={y + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end">{val}%</text>
                </g>
              );
            })}

            {/* Bars for Sem 1, 2, 3, 4 */}
            {semPassStats.map((sem, idx) => {
              const x = 70 + idx * 130;
              const passHeight = (sem.passRate / 100) * 150;
              const avgHeight = (sem.avgMarks / 100) * 150;

              const passY = 180 - passHeight;
              const avgY = 180 - avgHeight;

              return (
                <g
                  key={sem.semester}
                  className="chart-bar-hover"
                  onMouseEnter={() => setHoveredSem(sem)}
                  onMouseLeave={() => setHoveredSem(null)}
                >
                  {/* Pass Rate Bar */}
                  <rect x={x} y={passY} width="26" height={passHeight} fill="#4F46E5" rx="3" />
                  {/* Avg Marks Bar */}
                  <rect x={x + 30} y={avgY} width="26" height={avgHeight} fill="#10B981" rx="3" />

                  {/* Label */}
                  <text x={x + 28} y="202" fill="var(--text-secondary)" fontSize="11" fontWeight="700" textAnchor="middle">
                    Semester {sem.semester}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredSem && (
            <div className="chart-tooltip" style={{ top: "40px", left: `${(hoveredSem.semester - 1) * 22 + 15}%` }}>
              <div style={{ fontWeight: 700, color: "#818CF8" }}>Semester {hoveredSem.semester} Overview</div>
              <div>Pass Rate: <strong>{hoveredSem.passRate}%</strong></div>
              <div>Avg Score: <strong>{hoveredSem.avgMarks}</strong> / 100</div>
              <div>Total Exams: {hoveredSem.totalExams}</div>
            </div>
          )}
        </div>
      </div>

      {/* Subject Pass Rate Leaders (Hardest vs Highest) */}
      <div className="card glass-panel">
        <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
          <h3 className="h3">Department Subject Difficulty Matrix</h3>
          <p className="text-muted" style={{ fontSize: "0.875rem" }}>
            Comparative pass rate performance across academic subjects
          </p>
        </div>

        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
          {/* Hardest Subjects Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="badge badge-error" style={{ fontSize: "0.8rem" }}>⚠️ High-Arrear Focus Areas</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {hardest4.map((sub) => (
                <div key={sub.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    <span>{sub.code}: {sub.name}</span>
                    <span style={{ color: "var(--status-error)" }}>{sub.passRate}% Pass</span>
                  </div>
                  <div style={{ width: "100%", height: "7px", background: "rgba(239, 68, 68, 0.15)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${sub.passRate}%`, height: "100%", background: "var(--status-error)", borderRadius: "999px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Subjects Column */}
          <div className="mobile-no-border" style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="badge badge-success" style={{ fontSize: "0.8rem" }}>🌟 High-Performance Subjects</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {highest4.map((sub) => (
                <div key={sub.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    <span>{sub.code}: {sub.name}</span>
                    <span style={{ color: "var(--status-success)" }}>{sub.passRate}% Pass</span>
                  </div>
                  <div style={{ width: "100%", height: "7px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${sub.passRate}%`, height: "100%", background: "var(--status-success)", borderRadius: "999px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
