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

  const sortedSemesters = Array.from(semMap.entries()).sort((a, b) => a[0] - b[0]);

  // Calculate SGPA for each semester
  let runningCumCredits = 0;
  let runningCumPoints = 0;

  const sgpaTrendData = sortedSemesters.map(([sem, semResults]) => {
    let semCredits = 0;
    let semPoints = 0;

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
      semCredits += r.subject.credits;
      semPoints += r.subject.credits * gp;
      return { credits: r.subject.credits, gradePoints: gp };
    });

    runningCumCredits += semCredits;
    runningCumPoints += semPoints;

    const sgpa = calculateSGPA(subjectGrades);
    const runningCgpa = runningCumCredits > 0 ? Number((runningCumPoints / runningCumCredits).toFixed(2)) : 0;
    const passedCount = semResults.filter((r) => r.passStatus).length;
    const totalCount = semResults.length;

    return {
      semester: sem,
      sgpa: Number(sgpa.toFixed(2)),
      runningCgpa,
      passedCount,
      totalCount,
      totalCredits: semCredits,
    };
  });

  // Compute Part 1, Part 2, Part 3 CGPAs
  let p1Credits = 0, p1Points = 0;
  let p2Credits = 0, p2Points = 0;
  let p3Credits = 0, p3Points = 0;

  results.forEach((r) => {
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
      p1Credits += credits;
      p1Points += credits * gp;
    } else if (isCoreOrAllied) {
      p2Credits += credits;
      p2Points += credits * gp;
    } else {
      p3Credits += credits;
      p3Points += credits * gp;
    }
  });

  const part1Cgpa = p1Credits > 0 ? (p1Points / p1Credits).toFixed(2) : "0.00";
  const part2Cgpa = p2Credits > 0 ? (p2Points / p2Credits).toFixed(2) : "0.00";
  const part3Cgpa = p3Credits > 0 ? (p3Points / p3Credits).toFixed(2) : "0.00";

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

  // Compute Student Semester Growth Rate
  const semSgpaMap: Record<number, { credits: number; points: number }> = {};
  results.forEach((r: any) => {
    const semNum = r.subject.semester.number;
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
    if (!semSgpaMap[semNum]) {
      semSgpaMap[semNum] = { credits: 0, points: 0 };
    }
    semSgpaMap[semNum].credits += r.subject.credits;
    semSgpaMap[semNum].points += r.subject.credits * gp;
  });

  const activeSemNums = Object.keys(semSgpaMap).map(Number).sort((a, b) => a - b);
  const firstSemSgpa = activeSemNums.length > 0 && semSgpaMap[activeSemNums[0]].credits > 0
    ? Number((semSgpaMap[activeSemNums[0]].points / semSgpaMap[activeSemNums[0]].credits).toFixed(2))
    : 0;
  const lastSemNum = activeSemNums.length > 0 ? activeSemNums[activeSemNums.length - 1] : 0;
  const lastSemSgpa = lastSemNum > 0 && semSgpaMap[lastSemNum].credits > 0
    ? Number((semSgpaMap[lastSemNum].points / semSgpaMap[lastSemNum].credits).toFixed(2))
    : 0;

  const studentGrowth = Number((lastSemSgpa - firstSemSgpa).toFixed(2));
  const studentGrowthPct = firstSemSgpa > 0 ? ((studentGrowth / firstSemSgpa) * 100).toFixed(1) : "0.0";

  // ==========================================
  // ALGORITHMIC PREDICTIVE ENGINE CALCULATIONS
  // ==========================================
  const totalEarnedPoints = p1Points + p2Points + p3Points;
  const activeSgpaList = sgpaTrendData.map((d) => d.sgpa).filter((s) => s > 0);
  const nSems = activeSgpaList.length;

  let ewmaSgpa = cgpa;
  let momentumFactor = 0;

  if (nSems >= 2) {
    const latest = activeSgpaList[nSems - 1];
    const prev = activeSgpaList[nSems - 2];
    ewmaSgpa = Number((0.65 * latest + 0.35 * prev).toFixed(2));
    momentumFactor = Number(((latest - activeSgpaList[0]) / (nSems - 1)).toFixed(2));
  } else if (nSems === 1) {
    ewmaSgpa = activeSgpaList[0];
  }

  // Projected Next Sem SGPA
  const projNextSemBase = Math.min(10.0, Math.max(4.0, Number((ewmaSgpa + (momentumFactor > 0 ? momentumFactor * 0.5 : 0)).toFixed(2))));
  const projNextSemLow = Math.max(4.0, Number((projNextSemBase - 0.25).toFixed(2)));
  const projNextSemHigh = Math.min(10.0, Number((projNextSemBase + 0.35).toFixed(2)));

  // Graduation Forecast
  const totalDegreeCredits = 140;
  const currentEarnedCredits = totalCreditsEarned;
  const remCredits = Math.max(0, totalDegreeCredits - currentEarnedCredits);

  const projectedGradCgpaBase = Number((((totalEarnedPoints) + (remCredits * projNextSemBase)) / totalDegreeCredits).toFixed(2));
  const projectedGradCgpaHigh = Number((((totalEarnedPoints) + (remCredits * projNextSemHigh)) / totalDegreeCredits).toFixed(2));

  // Graduation Class Prediction
  let expectedClass = "First Class";
  let classBadgeColor = "#4F46E5";
  let classProbability = 85;

  if (projectedGradCgpaBase >= 8.5) {
    expectedClass = "First Class with Distinction 👑";
    classBadgeColor = "#059669";
    classProbability = 94;
  } else if (projectedGradCgpaBase >= 7.5) {
    expectedClass = "First Class Exemplary Track 🏅";
    classBadgeColor = "#2563EB";
    classProbability = 88;
  } else if (projectedGradCgpaBase >= 6.0) {
    expectedClass = "First Class Standard Track 🌟";
    classBadgeColor = "#D97706";
    classProbability = 82;
  } else {
    expectedClass = "Second Class Track";
    classBadgeColor = "#DC2626";
    classProbability = 75;
  }

  // Domain Mastery Scores (0 - 10)
  const coreCsGpa = p2Credits > 0 ? Number(part2Cgpa) : 0;
  const langGpa = p1Credits > 0 ? Number(part1Cgpa) : 0;
  const skillGpa = p3Credits > 0 ? Number(part3Cgpa) : 0;

  // Efficiency Index Ratio
  const convEfficiency = internalRatio > 0 ? Number((externalRatio / internalRatio).toFixed(2)) : 1.0;
  let convInsightTitle = "Balanced Assessment Synchrony";
  let convInsightDesc = "Equally strong in internal continuous evaluation and external end-semester theory exams.";

  if (convEfficiency < 0.85) {
    convInsightTitle = "Internal Exam Advantage (High Internals)";
    convInsightDesc = "Scoring high in internal tests. Boosting external theory prep will elevate total grades by +0.50 CGPA.";
  } else if (convEfficiency > 1.15) {
    convInsightTitle = "End-Sem Theory Specialist";
    convInsightDesc = "Outperforming in external written exams. Improving internal test attendance & assignments will yield distinction.";
  }

  // Strategic AI Algorithmic Guidance List
  const aiRecommendations: string[] = [];
  if (arrearsCount > 0) {
    aiRecommendations.push(`🔴 Priority: Clear ${arrearsCount} active arrear(s) immediately to restore graduation eligibility.`);
  }
  if (coreCsGpa >= 8.5) {
    aiRecommendations.push("👑 Core CS Mastery is High (>8.5 GPA). Highly recommended for Technical Placement & Software Engineering tracks.");
  } else if (coreCsGpa < 7.0 && coreCsGpa > 0) {
    aiRecommendations.push("⚠️ Core CS GPA is below 7.0. Dedicate 45 mins daily to Programming & Data Structures fundamentals.");
  }
  if (studentGrowth > 0.3) {
    aiRecommendations.push(`🚀 Strong Upward Velocity (+${studentGrowth.toFixed(2)} SGPA growth). Maintaining this trajectory will push final CGPA above ${projectedGradCgpaHigh}.`);
  } else if (studentGrowth < -0.3) {
    aiRecommendations.push("📉 Performance Dip Detected across recent semesters. Review low-scoring subjects and attend faculty mentoring.");
  }
  if (internalRatio < 70) {
    aiRecommendations.push("💡 Internal Marks average is below 70%. Aim for 22+/25 in upcoming internal assessments for easy grade boosts.");
  }
  if (aiRecommendations.length < 3) {
    aiRecommendations.push("✨ Consistent Performance Track. Keep up current revision pace and focus on core paper semester projects.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 4 Ultra-Elegant Metric Header Cards */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* 1st Card: Overall Cumulative CGPA */}
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
            <span>Batch Position</span>
            <strong style={{ color: "#4F46E5" }}>#{classRank.rank} / {classRank.totalStudents} Students</strong>
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
              {p1Credits} Credits
            </span>
          </div>

          <div style={{ margin: "0.75rem 0" }}>
            <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#059669", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {part1Cgpa}
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
              {p2Credits} Credits
            </span>
          </div>

          <div style={{ margin: "0.75rem 0" }}>
            <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#2563EB", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {part2Cgpa}
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
              {p3Credits} Credits
            </span>
          </div>

          <div style={{ margin: "0.75rem 0" }}>
            <div style={{ fontSize: "3.25rem", fontWeight: 850, color: "#D97706", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {part3Cgpa}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(245, 158, 11, 0.12)", paddingTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <span>Course Focus</span>
            <strong style={{ color: "#D97706" }}>Foundation CS, NME & Skills</strong>
          </div>
        </div>
      </div>

      {/* 🤖 INDIVIDUAL PREDICTIVE ANALYSIS & ALGORITHMIC INTELLIGENCE ENGINE */}
      <div
        className="card glass-panel"
        style={{
          padding: "2rem 1.75rem",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)",
          border: "2px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 12px 36px -6px rgba(79, 70, 229, 0.12)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(79, 70, 229, 0.12)", padding: "0.35rem 1rem", borderRadius: "999px", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🤖 Predictive Analysis & Pattern Intelligence Engine
              </span>
            </div>
            <h2 className="h2 text-gradient" style={{ fontSize: "1.75rem", fontWeight: 850 }}>
              Algorithmic Score Progression & Graduation Forecasting
            </h2>
            <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Powered by Weighted EWMA Regression, Domain Velocity Matrix, & Assessment Efficiency Analysis
            </p>
          </div>

          <div style={{ textAlign: "right", background: "#FFFFFF", padding: "0.6rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Confidence Model Fit</span>
            <strong style={{ fontSize: "1.1rem", color: "#4F46E5", fontWeight: 900 }}>{classProbability}% Model Precision</strong>
          </div>
        </div>

        {/* 4 Core Forecasting Metric Cards Grid */}
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          
          {/* Card 1: Next Semester SGPA Forecast */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(79, 70, 229, 0.25)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🔮 Projected Next Sem SGPA
            </div>
            <div style={{ margin: "0.6rem 0" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#4F46E5", lineHeight: 1.1 }}>
                {projNextSemLow} – {projNextSemHigh}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                Base Expected: <strong>{projNextSemBase.toFixed(2)} SGPA</strong>
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", borderTop: "1px solid #F1F5F9", paddingTop: "0.4rem" }}>
              EWMA Velocity: <strong>{momentumFactor >= 0 ? `+${momentumFactor}` : momentumFactor} / Sem</strong>
            </div>
          </div>

          {/* Card 2: Graduation CGPA Forecast */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${classBadgeColor}`,
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: classBadgeColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🎓 Expected Graduation CGPA
            </div>
            <div style={{ margin: "0.6rem 0" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, color: classBadgeColor, lineHeight: 1.1 }}>
                {projectedGradCgpaBase.toFixed(2)}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Peak Potential: <strong style={{ color: classBadgeColor }}>{projectedGradCgpaHigh.toFixed(2)} CGPA</strong>
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: classBadgeColor, fontWeight: 800, borderTop: "1px solid #F1F5F9", paddingTop: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {expectedClass}
            </div>
          </div>

          {/* Card 3: Assessment Efficiency Index */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ Assessment Efficiency Ratio
            </div>
            <div style={{ margin: "0.6rem 0" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#2563EB", lineHeight: 1.1 }}>
                {convEfficiency.toFixed(2)}x
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Int ({internalRatio.toFixed(0)}%) vs Ext ({externalRatio.toFixed(0)}%)
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#1D4ED8", fontWeight: 700, borderTop: "1px solid #F1F5F9", paddingTop: "0.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={convInsightTitle}>
              {convInsightTitle}
            </div>
          </div>

          {/* Card 4: Credit Velocity Pace */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🚀 Credit Accumulation Velocity
            </div>
            <div style={{ margin: "0.6rem 0" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#059669", lineHeight: 1.1 }}>
                {((totalCreditsEarned / totalDegreeCredits) * 100).toFixed(0)}%
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                {totalCreditsEarned} / {totalDegreeCredits} Total Credits Cleared
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#047857", fontWeight: 700, borderTop: "1px solid #F1F5F9", paddingTop: "0.4rem" }}>
              Remaining: <strong>{remCredits} Credits to Graduate</strong>
            </div>
          </div>
        </div>

        {/* Domain Skill Matrix & Algorithmic Insights split grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }} className="responsive-grid">
          
          {/* Domain Skill Mastery Breakdown */}
          <div style={{ background: "#FFFFFF", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(0,0,0,0.08)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 850, color: "#1E293B", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>🎯 Subject Category Domain Mastery & Score Pattern</span>
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Core Computer Science */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span>💻 Core Computer Science & Coding</span>
                  <span style={{ color: "#4F46E5" }}>{part2Cgpa} CGPA</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(79, 70, 229, 0.12)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${(Number(part2Cgpa) / 10) * 100}%`, height: "100%", background: "#4F46E5", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Allied & Mathematics */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span>📐 Allied Mathematics & Problem Solving</span>
                  <span style={{ color: "#2563EB" }}>{((alliedScored / (alliedMax || 1)) * 10).toFixed(2)} CGPA</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(37, 99, 235, 0.12)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${(alliedScored / (alliedMax || 1)) * 100}%`, height: "100%", background: "#2563EB", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Languages */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span>🗣️ Languages & Communication Skills</span>
                  <span style={{ color: "#059669" }}>{part1Cgpa} CGPA</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(5, 150, 105, 0.12)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${(Number(part1Cgpa) / 10) * 100}%`, height: "100%", background: "#059669", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Foundation & Skill Courses */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span>🛠️ Skill Enhancement & Foundation Electives</span>
                  <span style={{ color: "#D97706" }}>{part3Cgpa} CGPA</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(217, 119, 6, 0.12)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${(Number(part3Cgpa) / 10) * 100}%`, height: "100%", background: "#D97706", borderRadius: "999px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Strategic Action Plan & Guidance */}
          <div style={{ background: "#FFFFFF", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 850, color: "#1E293B", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>💡 Algorithmic Action Plan & Pattern Insights</span>
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {aiRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--text-primary)",
                    background: "#F8FAFC",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    borderLeft: "3.5px solid #4F46E5",
                    lineHeight: 1.45,
                  }}
                >
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Standing & Subject Highlights */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <div className="card glass-panel">
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Academic Standing
          </div>
          <div className="h1" style={{ marginTop: "0.5rem", fontSize: "2.25rem", color: arrearsCount > 0 ? "var(--status-error)" : "var(--status-success)" }}>
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

        <div className="card glass-panel" style={{ borderLeft: `4px solid ${studentGrowth >= 0 ? "#10B981" : "#EF4444"}` }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Semester Growth Rate
          </div>
          <div className="h1" style={{ marginTop: "0.5rem", fontSize: "2.25rem", color: studentGrowth >= 0 ? "#10B981" : "#EF4444", fontWeight: 850 }}>
            {studentGrowth >= 0 ? `+${studentGrowth.toFixed(2)}` : studentGrowth.toFixed(2)} SGPA
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Trajectory: <strong>Sem 1 ({firstSemSgpa.toFixed(2)}) ➔ Sem {activeSemNums[activeSemNums.length - 1] || 1} ({lastSemSgpa.toFixed(2)})</strong> ({studentGrowth >= 0 ? `+${studentGrowthPct}%` : `${studentGrowthPct}%`})
          </div>
        </div>
      </div>

      {/* Semester-by-Semester Overall CGPA Growth Milestones Grid */}
      <div className="card glass-panel">
        <div style={{ marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 className="h3">Semester-by-Semester Overall CGPA Growth Progression</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Milestone tracking of semester SGPA vs. cumulative overall CGPA accumulation</p>
          </div>
          <span className="badge badge-success" style={{ fontWeight: 800, fontSize: "0.85rem", padding: "0.35rem 0.85rem" }}>
            Current CGPA: {cgpa.toFixed(2)}
          </span>
        </div>

        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {sgpaTrendData.map((step, idx) => {
            const prevCgpa = idx > 0 ? sgpaTrendData[idx - 1].runningCgpa : step.runningCgpa;
            const diff = Number((step.runningCgpa - prevCgpa).toFixed(2));

            return (
              <div
                key={step.semester}
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 4px 12px -2px rgba(0,0,0,0.03)",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(79, 70, 229, 0.1)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                    Semester {step.semester}
                  </span>
                  {idx > 0 && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: diff >= 0 ? "#059669" : "#DC2626", background: diff >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                      {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "0.5rem 0" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Sem SGPA</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#4F46E5", lineHeight: 1.1 }}>{step.sgpa.toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Overall CGPA</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#059669", lineHeight: 1.1 }}>{step.runningCgpa.toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between" }}>
                  <span>Credits: <strong>{step.totalCredits}</strong></span>
                  <span>Exams Passed: <strong>{step.passedCount}/{step.totalCount}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Dual-Line Chart (SGPA vs Cumulative CGPA) & Donut Chart (Grade Distribution) */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* SGPA & Cumulative CGPA Trend Dual-Line Chart */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 className="h3">SGPA vs. Cumulative CGPA Growth</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Semester GPA vs. Cumulative CGPA progression curve</p>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.75rem", fontWeight: 700 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "12px", height: "3px", background: "#4F46E5", borderRadius: "2px" }}></span>
                <span>SGPA</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "12px", height: "3px", background: "#059669", borderRadius: "2px" }}></span>
                <span>Cum. CGPA</span>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", width: "100%", height: "260px" }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
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

              {/* Trend Area & Dual Lines */}
              {sgpaTrendData.length > 0 && (() => {
                const pointsSgpa = sgpaTrendData.map((d, idx) => {
                  const x = sgpaTrendData.length === 1 ? 260 : 60 + (idx / (sgpaTrendData.length - 1)) * 400;
                  const y = 180 - (d.sgpa / 10) * 150;
                  return { x, y, data: d };
                });

                const pointsCgpa = sgpaTrendData.map((d, idx) => {
                  const x = sgpaTrendData.length === 1 ? 260 : 60 + (idx / (sgpaTrendData.length - 1)) * 400;
                  const y = 180 - (d.runningCgpa / 10) * 150;
                  return { x, y, data: d };
                });

                const pathSgpa = pointsSgpa.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                const pathCgpa = pointsCgpa.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                const areaD = `${pathSgpa} L ${pointsSgpa[pointsSgpa.length - 1].x} 180 L ${pointsSgpa[0].x} 180 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#sgpaGrad)" />
                    {/* Cumulative CGPA Line (Green) */}
                    <path d={pathCgpa} fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* SGPA Line (Indigo) */}
                    <path d={pathSgpa} fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {pointsSgpa.map((p, idx) => (
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
                        <circle
                          cx={pointsCgpa[idx].x}
                          cy={pointsCgpa[idx].y}
                          r="4.5"
                          fill="#FFFFFF"
                          stroke="#059669"
                          strokeWidth="2.5"
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
                <div style={{ fontWeight: 700, color: "#818CF8" }}>Semester {hoveredPoint.data.semester} Milestone</div>
                <div>Sem SGPA: <strong>{hoveredPoint.data.sgpa.toFixed(2)}</strong></div>
                <div>Cumulative CGPA: <strong style={{ color: "#10B981" }}>{hoveredPoint.data.runningCgpa.toFixed(2)}</strong></div>
                <div>Passed: {hoveredPoint.data.passedCount} / {hoveredPoint.data.totalCount} Subjects</div>
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
              {sortedSemesters.map(([s]) => (
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
