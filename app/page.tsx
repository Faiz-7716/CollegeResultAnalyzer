import { getDashboardStats, getStudentsWithMetrics } from "@/lib/actions";
import Link from "next/link";
import HomeAnalyticsCharts from "@/app/components/HomeAnalyticsCharts";
import {
  IconGraduationCap,
  IconUsers,
  IconTrendingUp,
  IconAward,
  IconBookOpen,
  IconTrophy,
  IconCheckCircle,
  IconAlertTriangle,
  IconPlusCircle,
  IconChevronRight,
  IconFileText,
} from "@/app/components/Icons";

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const students = await getStudentsWithMetrics();

  // Top 5 Honor Roll students sorted by CGPA
  const honorRoll = [...students]
    .sort((a, b) => b.metrics.cgpa - a.metrics.cgpa)
    .slice(0, 5);

  // Department Average CGPA
  const totalCGPA = students.reduce((sum, s) => sum + s.metrics.cgpa, 0);
  const avgCGPA = students.length > 0 ? (totalCGPA / students.length).toFixed(2) : "0.00";

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* 1. Hero Command Bar */}
      <div
        className="card glass-panel"
        style={{
          padding: "2.5rem 2rem",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(59, 130, 246, 0.04) 100%)",
          border: "1px solid rgba(79, 70, 229, 0.15)",
        }}
      >
        <div style={{ display: "inline-flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="MUC CS Logo"
            style={{ height: "42px", width: "auto", objectFit: "contain", borderRadius: "var(--radius-sm)" }}
          />
          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            Batch 31924U180
          </span>
          <span className="badge badge-primary" style={{ background: "rgba(79, 70, 229, 0.15)", color: "var(--accent-primary)" }}>
            B.Sc. Computer Science
          </span>
        </div>

        <h1 className="h1" style={{ fontSize: "2.85rem" }}>
          MUC CS <span className="text-gradient">Result & Academic Ledger</span>
        </h1>
        <p className="text-muted" style={{ maxWidth: "700px", margin: "1rem auto", fontSize: "1.1rem" }}>
          Mazharul Uloom College. Real-time academic tracking, credit accumulation analytics, SGPA trends, and arrear intelligence.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
          <Link href="/students" className="btn btn-primary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <IconUsers size={18} color="#FFFFFF" />
            <span>Access Roster Matrix</span>
            <IconChevronRight size={16} color="#FFFFFF" />
          </Link>
          <Link href="/data-entry" className="btn btn-secondary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <IconPlusCircle size={18} color="var(--accent-primary)" />
            <span>Data Entry Hub</span>
          </Link>
        </div>
      </div>

      {/* 2. High-Level KPI Metric Cards */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="card glass-panel delay-100" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Enrolled
            </div>
            <div style={{ padding: "0.4rem", background: "rgba(79, 70, 229, 0.1)", borderRadius: "var(--radius-sm)" }}>
              <IconUsers size={20} color="var(--accent-primary)" />
            </div>
          </div>
          <div className="h1 text-gradient" style={{ fontSize: "3rem", margin: "0.5rem 0" }}>
            {stats.totalStudents}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
            <span className="badge badge-success">{stats.allClearCount} All Clear</span>
            <span className="badge badge-error">{stats.arrearCount} Arrears</span>
          </div>
        </div>

        <div className="card glass-panel delay-200" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Overall Pass Rate
            </div>
            <div style={{ padding: "0.4rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-sm)" }}>
              <IconTrendingUp size={20} color="var(--status-success)" />
            </div>
          </div>
          <div className="h1 text-gradient" style={{ fontSize: "3rem", margin: "0.5rem 0" }}>
            {stats.passPercentage}%
          </div>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Aggregate pass ratio across all subjects
          </div>
        </div>

        <div className="card glass-panel delay-300" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Average Batch CGPA
            </div>
            <div style={{ padding: "0.4rem", background: "rgba(99, 102, 241, 0.1)", borderRadius: "var(--radius-sm)" }}>
              <IconAward size={20} color="var(--accent-secondary)" />
            </div>
          </div>
          <div className="h1 text-gradient" style={{ fontSize: "3rem", margin: "0.5rem 0" }}>
            {avgCGPA}
          </div>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Core Avg: <strong>{stats.coreAvg}%</strong> | Lang: <strong>{stats.langAvg}%</strong>
          </div>
        </div>

        <div className="card glass-panel delay-300" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Exams Logged
            </div>
            <div style={{ padding: "0.4rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-sm)" }}>
              <IconBookOpen size={20} color="var(--status-warning)" />
            </div>
          </div>
          <div className="h1 text-gradient" style={{ fontSize: "3rem", margin: "0.5rem 0" }}>
            {stats.totalResults}
          </div>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Across 4 Semesters of Examinations
          </div>
        </div>
      </div>

      {/* 3. Batch Visual Performance Charts & Difficulty Matrix */}
      <HomeAnalyticsCharts
        semPassStats={stats.semPassStats}
        subjectLeaderboard={stats.subjectLeaderboard}
      />

      {/* 4. Top 5 Honor Roll Leaderboard */}
      <div className="card glass-panel">
        <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <IconTrophy size={26} color="var(--accent-primary)" />
            <h2 className="h2 text-gradient">Batch Honor Roll (Top 5 Performers)</h2>
          </div>
          <p className="text-muted" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Highest achieving students ranked by Cumulative Grade Point Average
          </p>
        </div>

        <div
          className="responsive-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {honorRoll.map((student, idx) => {
            const rankBadgeColors = [
              "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", // Gold #1
              "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)", // Silver #2
              "linear-gradient(135deg, #B45309 0%, #78350F 100%)", // Bronze #3
              "var(--accent-gradient)",
              "var(--accent-gradient)",
            ];

            const coreAlliedPct = student.metrics.coreAlliedSubjectsCount > 0
              ? ((student.metrics.coreAndAllied / (student.metrics.coreAlliedSubjectsCount * 100)) * 100).toFixed(1)
              : "0.0";

            return (
              <div
                key={student.id}
                className="card glass-panel"
                style={{
                  padding: "1.5rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: rankBadgeColors[idx],
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.75rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  #{idx + 1}
                </div>

                <h3 className="h3" style={{ fontSize: "1.1rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {student.name}
                </h3>
                <p className="text-muted" style={{ fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  {student.registerNumber}
                </p>

                <div className="badge badge-success" style={{ fontSize: "0.95rem", padding: "0.35rem 0.85rem", marginBottom: "0.5rem" }}>
                  CGPA: {student.metrics.cgpa.toFixed(2)}
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Core+Allied: <strong>{coreAlliedPct}%</strong>
                </div>

                <Link
                  href={`/students/${student.id}`}
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "1rem", padding: "0.4rem 0.75rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                >
                  <span>View Profile</span>
                  <IconChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Academic Standing Matrix (All Clear vs Arrears List) */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* All Clear Students */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <h3 className="h3" style={{ color: "var(--status-success)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconCheckCircle size={22} color="var(--status-success)" />
              <span>All Clear Roster ({stats.allClearCount})</span>
            </h3>
            <span className="badge badge-success">Zero Arrears</span>
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto" }} className="custom-scrollbar">
            {stats.allClearStudents.map((s) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.65rem 0.5rem",
                  borderBottom: "1px solid var(--border-color)",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  transition: "background var(--transition-fast)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.registerNumber}</div>
                  <div className="text-muted" style={{ fontSize: "0.825rem" }}>{s.name}</div>
                </div>
                <span className="btn btn-secondary" style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <IconFileText size={12} />
                  <span>Ledger</span>
                  <IconChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Arrear Students */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <h3 className="h3" style={{ color: "var(--status-error)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconAlertTriangle size={22} color="var(--status-error)" />
              <span>Active Arrears List ({stats.arrearCount})</span>
            </h3>
            <span className="badge badge-error">Needs Intervention</span>
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto" }} className="custom-scrollbar">
            {stats.arrearStudents.map((s) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.65rem 0.5rem",
                  borderBottom: "1px solid var(--border-color)",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  transition: "background var(--transition-fast)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.registerNumber}</div>
                  <div className="text-muted" style={{ fontSize: "0.825rem" }}>{s.name}</div>
                </div>
                <span className="btn btn-secondary" style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", borderColor: "rgba(239, 68, 68, 0.3)", color: "var(--status-error)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <IconFileText size={12} color="var(--status-error)" />
                  <span>Review</span>
                  <IconChevronRight size={12} color="var(--status-error)" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
