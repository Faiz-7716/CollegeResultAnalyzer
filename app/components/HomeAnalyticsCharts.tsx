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

        <div style={{ position: "relative", width: "100%", height: "320px" }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 260" preserveAspectRatio="none">
            {/* Y-Axis Gridlines 0%, 25%, 50%, 75%, 100% */}
            {[100, 75, 50, 25, 0].map((val) => {
              const y = 220 - (val / 100) * 190;
              return (
                <g key={val}>
                  <line x1="45" y1={y} x2="955" y2={y} stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
                  <text x="35" y={y + 4} fill="var(--text-secondary)" fontSize="11" fontWeight="600" textAnchor="end">{val}%</text>
                </g>
              );
            })}

            {/* Spacious Semester Bar Groups (Sem 1 to 4) */}
            {semPassStats.map((sem, idx) => {
              const slotWidth = 900 / 4; // 225px per semester slot
              const centerX = 50 + (idx + 0.5) * slotWidth;

              const barW = 38;
              const passX = centerX - barW - 6;
              const avgX = centerX + 6;

              const passH = (sem.passRate / 100) * 190;
              const avgH = (sem.avgMarks / 100) * 190;

              const passY = 220 - passH;
              const avgY = 220 - avgH;

              return (
                <g
                  key={sem.semester}
                  className="chart-bar-hover"
                  onMouseEnter={() => setHoveredSem(sem)}
                  onMouseLeave={() => setHoveredSem(null)}
                >
                  {/* Pass Rate Bar (Solid Indigo) */}
                  <rect x={passX} y={passY} width={barW} height={passH} fill="#4F46E5" rx="4" />
                  <text x={passX + barW / 2} y={Math.max(passY - 6, 20)} fill="#4F46E5" fontSize="11" fontWeight="800" textAnchor="middle">
                    {sem.passRate}%
                  </text>

                  {/* Avg Score Bar (Solid Emerald) */}
                  <rect x={avgX} y={avgY} width={barW} height={avgH} fill="#059669" rx="4" />
                  <text x={avgX + barW / 2} y={Math.max(avgY - 6, 20)} fill="#059669" fontSize="11" fontWeight="800" textAnchor="middle">
                    {sem.avgMarks}
                  </text>

                  {/* Semester Label */}
                  <text x={centerX} y="246" fill="var(--text-primary)" fontSize="13" fontWeight="800" textAnchor="middle">
                    Semester {sem.semester}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredSem && (
            <div className="chart-tooltip" style={{ top: "30px", left: `${(hoveredSem.semester - 1) * 23 + 12}%` }}>
              <div style={{ fontWeight: 800, color: "#818CF8", fontSize: "0.9rem" }}>Semester {hoveredSem.semester} Overview</div>
              <div>Pass Rate: <strong>{hoveredSem.passRate}%</strong></div>
              <div>Avg Score: <strong>{hoveredSem.avgMarks}</strong> / 100</div>
              <div>Total Exams: <strong>{hoveredSem.totalExams}</strong></div>
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
