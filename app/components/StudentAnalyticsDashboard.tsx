"use client";

import React, { useState } from "react";
import { calculateSGPA } from "@/lib/grading";

interface ResultItem {
  id: string;
  internalMarks: number;
  externalMarks: number;
  total: number;
  grade: string;
  passStatus: boolean;
  subject: {
    code: string;
    name: string;
    credits: number;
    semester: {
      number: number;
    };
  };
}

interface StudentAnalyticsDashboardProps {
  student: {
    id: string;
    name: string;
    registerNumber: string;
    batch: string;
  };
  results: ResultItem[];
  cgpa: number;
  classRank: { rank: number; totalStudents: number };
}

export default function StudentAnalyticsDashboard({
  student,
  results,
  cgpa,
  classRank,
}: StudentAnalyticsDashboardProps) {
  const [selectedSemFilter, setSelectedSemFilter] = useState<number | 0>(0);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [hoveredBar, setHoveredBar] = useState<any | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<any | null>(null);

  // Group results by semester
  const semMap = new Map<number, ResultItem[]>();
  results.forEach((r) => {
    const sem = r.subject.semester.number;
    if (!semMap.has(sem)) semMap.set(sem, []);
    semMap.get(sem)!.push(r);
  });

  const sortedSemesters = Array.from(semMap.keys()).sort((a, b) => a - b);

  // Calculate SGPA for each semester
  const sgpaTrendData = sortedSemesters.map((sem) => {
    const semResults = semMap.get(sem) || [];
    const subjectGrades = semResults.map((r) => {
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
      return { credits: r.subject.credits, gradePoints: gp };
    });

    const sgpa = calculateSGPA(subjectGrades);
    const passedCount = semResults.filter((r) => r.passStatus).length;
    const totalCount = semResults.length;

    return {
      semester: sem,
      sgpa: Number(sgpa.toFixed(2)),
      passedCount,
      totalCount,
      totalCredits: semResults.reduce((acc, curr) => acc + curr.subject.credits, 0),
    };
  });

  // Calculate trend direction
  let trendLabel = "Stable";
  let trendColor = "var(--accent-primary)";
  if (sgpaTrendData.length >= 2) {
    const first = sgpaTrendData[0].sgpa;
    const last = sgpaTrendData[sgpaTrendData.length - 1].sgpa;
    const diff = last - first;
    if (diff > 0.3) {
      trendLabel = "📈 Positive Upward Trajectory";
      trendColor = "var(--status-success)";
    } else if (diff < -0.3) {
      trendLabel = "📉 Requires Academic Intervention";
      trendColor = "var(--status-error)";
    } else {
      trendLabel = "📊 Consistent Performance";
      trendColor = "var(--accent-primary)";
    }
  }

  // Filtered results for subject breakdown bar chart
  const barChartResults = selectedSemFilter === 0
    ? results
    : results.filter((r) => r.subject.semester.number === selectedSemFilter);

  // Grade distribution counts
  const gradeCounts: Record<string, number> = {
    O: 0,
    "A+": 0,
    A: 0,
    "B+": 0,
    B: 0,
    C: 0,
    RA: 0,
    AAA: 0,
  };

  results.forEach((r) => {
    if (r.grade === "O") gradeCounts.O++;
    else if (r.grade === "A+") gradeCounts["A+"]++;
    else if (r.grade === "A") gradeCounts.A++;
    else if (r.grade === "B+") gradeCounts["B+"]++;
    else if (r.grade === "B") gradeCounts.B++;
    else if (r.grade === "C") gradeCounts.C++;
    else if (r.grade === "AAA") gradeCounts.AAA++;
    else gradeCounts.RA++;
  });

  const totalExams = results.length;
  const gradePalette: Record<string, string> = {
    O: "#4F46E5",
    "A+": "#3B82F6",
    A: "#06B6D4",
    "B+": "#10B981",
    B: "#84CC16",
    C: "#F59E0B",
    RA: "#EF4444",
    AAA: "#64748B",
  };

  const donutSegments = Object.entries(gradeCounts)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => ({
      grade,
      count,
      percent: totalExams > 0 ? (count / totalExams) * 100 : 0,
      color: gradePalette[grade] || "#94A3B8",
    }));

  // Category breakdown
  let coreScored = 0, coreMax = 0;
  let alliedScored = 0, alliedMax = 0;
  let langScored = 0, langMax = 0;
  let skillScored = 0, skillMax = 0;

  results.forEach((r) => {
    const code = r.subject.code;
    if (code.includes("UCS") || code.includes("UPCS") || code.includes("CC")) {
      coreScored += r.total;
      coreMax += 100;
    } else if (code.includes("UECS") || code.includes("EC")) {
      alliedScored += r.total;
      alliedMax += 100;
    } else if (code.includes("ULE") || code.includes("ULT") || code.includes("ULU")) {
      langScored += r.total;
      langMax += 100;
    } else {
      skillScored += r.total;
      skillMax += 100;
    }
  });

  const categoryData = [
    { label: "Core Computer Science", scored: coreScored, max: coreMax, color: "#4F46E5" },
    { label: "Allied & Mathematics", scored: alliedScored, max: alliedMax, color: "#3B82F6" },
    { label: "Languages (Eng/Tamil/Urdu)", scored: langScored, max: langMax, color: "#10B981" },
    { label: "Skill & Elective Courses", scored: skillScored, max: skillMax, color: "#F59E0B" },
  ].filter((c) => c.max > 0);

  // Algorithmic Insights
  const validTotalResults = results.filter((r) => r.grade !== "AAA");
  let highestSub = validTotalResults.length > 0
    ? [...validTotalResults].sort((a, b) => b.total - a.total)[0]
    : null;
  let lowestSub = validTotalResults.length > 0
    ? [...validTotalResults].sort((a, b) => a.total - b.total)[0]
    : null;

  let totalInternalPossible = results.length * 25;
  let totalInternalScored = results.reduce((a, c) => a + c.internalMarks, 0);
  let totalExternalPossible = results.length * 75;
  let totalExternalScored = results.reduce((a, c) => a + c.externalMarks, 0);

  const internalRatio = totalInternalPossible > 0 ? (totalInternalScored / totalInternalPossible) * 100 : 0;
  const externalRatio = totalExternalPossible > 0 ? (totalExternalScored / totalExternalPossible) * 100 : 0;

  let efficiencyInsight = "Balanced Performance";
  if (internalRatio - externalRatio > 12) {
    efficiencyInsight = "Strong Continuous Internal Assessor (High Internal Marks)";
  } else if (externalRatio - internalRatio > 12) {
    efficiencyInsight = "Exam Specialist (Stronger External Performance)";
  }

  const arrearsCount = results.filter((r) => !r.passStatus).length;
  const totalCreditsEarned = results.filter((r) => r.passStatus).reduce((a, c) => a + c.subject.credits, 0);
  const totalCreditsAttempted = results.reduce((a, c) => a + c.subject.credits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 4 Algorithmic Metric Header Cards */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="card glass-panel" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cumulative CGPA
          </div>
          <div className="h1 text-gradient" style={{ marginTop: "0.5rem", fontSize: "2.75rem" }}>
            {cgpa.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Class Rank: <strong style={{ color: "var(--accent-primary)" }}>#{classRank.rank}</strong> of {classRank.totalStudents}
          </div>
        </div>

        <div className="card glass-panel">
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Academic Standing
          </div>
          <div className="h1" style={{ marginTop: "0.5rem", fontSize: "2.5rem", color: arrearsCount > 0 ? "var(--status-error)" : "var(--status-success)" }}>
            {arrearsCount === 0 ? "ALL CLEAR" : `${arrearsCount} ARREAR${arrearsCount > 1 ? "S" : ""}`}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Credits: {totalCreditsEarned} / {totalCreditsAttempted} Earned
          </div>
        </div>

        <div className="card glass-panel">
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Peak Subject
          </div>
          <div className="h3 text-gradient" style={{ marginTop: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {highestSub ? highestSub.subject.name : "N/A"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {highestSub ? `${highestSub.subject.code} (${highestSub.total}/100)` : "No records"}
          </div>
        </div>

        <div className="card glass-panel">
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Focus Area
          </div>
          <div className="h3" style={{ marginTop: "0.5rem", color: lowestSub && !lowestSub.passStatus ? "var(--status-error)" : "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {lowestSub ? lowestSub.subject.name : "N/A"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {lowestSub ? `${lowestSub.subject.code} (${lowestSub.total}/100 - ${lowestSub.passStatus ? 'Pass' : 'Arrear'})` : "No records"}
          </div>
        </div>
      </div>

      {/* Grid: Line Chart (SGPA Progression) & Donut Chart (Grade Distribution) */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* SGPA Trend Area Line Chart */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <div>
              <h3 className="h3">SGPA Semester Progression</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Academic performance across semesters</p>
            </div>
            <span className="badge" style={{ background: "rgba(79, 70, 229, 0.1)", color: trendColor, fontWeight: 600 }}>
              {trendLabel}
            </span>
          </div>

          <div style={{ position: "relative", width: "100%", height: "260px" }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Gridlines (SGPA 0 to 10) */}
              {[10, 8, 6, 4, 2, 0].map((val) => {
                const y = 180 - (val / 10) * 150;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
                    <text x="32" y={y + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {/* Trend Area & Line */}
              {sgpaTrendData.length > 0 && (() => {
                const points = sgpaTrendData.map((d, idx) => {
                  const x = sgpaTrendData.length === 1 ? 260 : 60 + (idx / (sgpaTrendData.length - 1)) * 400;
                  const y = 180 - (d.sgpa / 10) * 150;
                  return { x, y, data: d };
                });

                const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#sgpaGrad)" />
                    <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5.5"
                          fill="#FFFFFF"
                          stroke="#4F46E5"
                          strokeWidth="3"
                          className="chart-data-node"
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <text x={p.x} y="202" fill="var(--text-secondary)" fontSize="11" fontWeight="600" textAnchor="middle">
                          Sem {p.data.semester}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Hover Tooltip for Line Chart */}
            {hoveredPoint && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(hoveredPoint.x / 500) * 85 + 5}%`,
                  top: `${(hoveredPoint.y / 220) * 70}%`,
                }}
              >
                <div style={{ fontWeight: 700, color: "#818CF8" }}>Semester {hoveredPoint.data.semester}</div>
                <div>SGPA: <strong>{hoveredPoint.data.sgpa}</strong></div>
                <div>Passed: {hoveredPoint.data.passedCount} / {hoveredPoint.data.totalCount} Subjects</div>
                <div>Credits: {hoveredPoint.data.totalCredits}</div>
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution Donut Chart */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", textAlign: "center" }}>
            <h3 className="h3">Grade Distribution</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Overall letter grades earned</p>
          </div>

          <div style={{ position: "relative", width: "180px", height: "180px" }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              {(() => {
                let cumulativeAngle = 0;
                return donutSegments.map((seg, idx) => {
                  const angle = (seg.percent / 100) * 360;
                  const startAngle = cumulativeAngle;
                  const endAngle = cumulativeAngle + angle;
                  cumulativeAngle += angle;

                  const x1 = 90 + 70 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 90 + 70 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 90 + 70 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 90 + 70 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const largeArcFlag = angle > 180 ? 1 : 0;
                  const pathData =
                    seg.percent >= 99.9
                      ? "M 90 20 A 70 70 0 1 1 89.99 20"
                      : `M ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`;

                  return (
                    <path
                      key={idx}
                      d={pathData}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="24"
                      className="chart-donut-segment"
                      onMouseEnter={() => setHoveredDonut(seg)}
                      onMouseLeave={() => setHoveredDonut(null)}
                    />
                  );
                });
              })()}
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: "1.75rem", fontWeight: 700 }} className="text-gradient">
                {totalExams}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Exams</div>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", marginTop: "1rem", justifyContent: "center", width: "100%" }}>
            {donutSegments.map((seg, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: seg.color }}></span>
                <span>{seg.grade}: <strong>{seg.count}</strong></span>
              </div>
            ))}
          </div>

          {hoveredDonut && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 600 }}>
              Grade {hoveredDonut.grade}: {hoveredDonut.count} subject{hoveredDonut.count > 1 ? "s" : ""} ({hoveredDonut.percent.toFixed(1)}%)
            </div>
          )}
        </div>
      </div>

      {/* Grid: Internal vs External Bar Chart & Category Mastery */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Subject Internal vs External Grouped Bar Chart */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div className="responsive-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <div>
              <h3 className="h3">Internal vs. External Marks</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Assessment breakdown per subject (Internal max 25, External max 75)</p>
            </div>
            <select
              className="input-field"
              style={{ width: "auto", padding: "0.35rem 0.75rem", fontSize: "0.85rem", marginBottom: 0 }}
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(Number(e.target.value))}
            >
              <option value={0}>All Semesters</option>
              {sortedSemesters.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "100%", height: "260px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 240" preserveAspectRatio="none">
              {/* Threshold line for 40 total pass mark */}
              <line x1="40" y1="122" x2="960" y2="122" stroke="var(--status-error)" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.75" />
              <text x="45" y="115" fill="var(--status-error)" fontSize="10" fontWeight="600">Min Pass Threshold (40 Total)</text>

              {(() => {
                const totalItems = barChartResults.length;
                if (totalItems === 0) return null;

                const availableWidth = 900; // from x=50 to x=950
                const slotWidth = availableWidth / totalItems;
                const barWidth = Math.max(Math.min(slotWidth * 0.32, 16), 3);
                const rotateLabels = totalItems > 10;

                return barChartResults.map((r, idx) => {
                  const centerX = 50 + (idx + 0.5) * slotWidth;
                  const intX = centerX - barWidth - 1;
                  const extX = centerX + 1;

                  const intHeight = (r.internalMarks / 100) * 170;
                  const extHeight = (r.externalMarks / 100) * 170;
                  const intY = 190 - intHeight;
                  const extY = 190 - extHeight;

                  return (
                    <g
                      key={r.id}
                      className="chart-bar-hover"
                      onMouseEnter={() => setHoveredBar(r)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Internal Bar (Max 25) */}
                      <rect x={intX} y={intY} width={barWidth} height={intHeight} fill="#6366F1" rx="2" />
                      {/* External Bar (Max 75) */}
                      <rect x={extX} y={extY} width={barWidth} height={extHeight} fill="#3B82F6" rx="2" />

                      {/* Subject Code Label */}
                      <text
                        x={centerX}
                        y={rotateLabels ? "202" : "210"}
                        fill="var(--text-secondary)"
                        fontSize={totalItems > 15 ? "8" : "10"}
                        fontWeight="600"
                        textAnchor={rotateLabels ? "end" : "middle"}
                        transform={rotateLabels ? `rotate(-40, ${centerX}, 202)` : undefined}
                      >
                        {r.subject.code}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>

            {hoveredBar && (
              <div className="chart-tooltip" style={{ bottom: "60px", left: "50%", transform: "translateX(-50%)" }}>
                <div style={{ fontWeight: 700, color: "#818CF8" }}>{hoveredBar.subject.code}: {hoveredBar.subject.name}</div>
                <div>Internal: <strong>{hoveredBar.internalMarks}</strong> / 25</div>
                <div>External: <strong>{hoveredBar.externalMarks}</strong> / 75</div>
                <div>Total: <strong>{hoveredBar.total}</strong> / 100 ({hoveredBar.passStatus ? "PASS" : "ARREAR"})</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "12px", height: "12px", background: "#6366F1", borderRadius: "3px" }}></span>
              <span>Internal Marks (Max 25)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "12px", height: "12px", background: "#3B82F6", borderRadius: "3px" }}></span>
              <span>External Marks (Max 75)</span>
            </div>
          </div>
        </div>

        {/* Category Mastery Progress Gauges & Assessment Insight */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <h3 className="h3">Subject Category Mastery</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Performance across academic domains</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {categoryData.map((cat, idx) => {
                const pct = cat.max > 0 ? (cat.scored / cat.max) * 100 : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                      <span>{cat.label}</span>
                      <span style={{ color: cat.color }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(226, 232, 240, 0.8)", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          height: "100%",
                          background: cat.color,
                          borderRadius: "999px",
                          transition: "width 0.6s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(79, 70, 229, 0.05)",
              border: "1px solid rgba(79, 70, 229, 0.15)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              💡 Assessment Efficiency Insight
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.35rem" }}>
              {efficiencyInsight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
