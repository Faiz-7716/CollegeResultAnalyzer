import { getDashboardStats, getStudentsWithMetrics } from "@/lib/actions";
import Link from "next/link";

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const students = await getStudentsWithMetrics();
  
  // Sort students by CGPA descending to get top scorers
  const topScorers = [...students].sort((a, b) => b.metrics.cgpa - a.metrics.cgpa).slice(0, 3);
  
  // Calculate average batch CGPA
  const totalCGPA = students.reduce((sum: number, s: { metrics: { cgpa: number } }) => sum + s.metrics.cgpa, 0);
  const avgCGPA = students.length > 0 ? (totalCGPA / students.length).toFixed(2) : "0.00";

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "3rem", marginTop: "2rem" }}>
        <div className="badge badge-success" style={{ marginBottom: "1rem" }}>Batch 31924U180</div>
        <h1 className="h1">
          Academic <span className="text-gradient">Performance Ledger</span>
        </h1>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "1rem auto", fontSize: "1.1rem" }}>
          Department of B.Sc. Computer Science, Mazharul Uloom College. Track student progression, GPAs, and arrears efficiently.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
          <Link href="/students" className="btn btn-primary">
            View All Students
          </Link>
          <Link href="/data-entry" className="btn btn-secondary">
            Manage Data
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card glass-panel delay-100" style={{ textAlign: "center" }}>
          <h3 className="h3 text-muted">Total Students</h3>
          <p className="h1 text-gradient" style={{ marginTop: "1rem" }}>{stats.totalStudents}</p>
        </div>
        
        <div className="card glass-panel delay-200" style={{ textAlign: "center" }}>
          <h3 className="h3 text-muted">Exams Logged</h3>
          <p className="h1 text-gradient" style={{ marginTop: "1rem" }}>{stats.totalResults}</p>
        </div>
        
        <div className="card glass-panel delay-300" style={{ textAlign: "center" }}>
          <h3 className="h3 text-muted">Overall Pass Rate</h3>
          <p className="h1 text-gradient" style={{ marginTop: "1rem" }}>{stats.passPercentage}%</p>
        </div>
        
        <div className="card glass-panel delay-300" style={{ textAlign: "center" }}>
          <h3 className="h3 text-muted">Average CGPA</h3>
          <p className="h1 text-gradient" style={{ marginTop: "1rem" }}>{avgCGPA}</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        {/* Academic Status Breakdown */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="h2" style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", textAlign: "center" }}>Academic Status</h3>
          <div className="responsive-flex" style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
            <div style={{ flex: 1, paddingRight: "1rem" }}>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>All Clear</p>
              <p className="h1" style={{ color: "var(--status-success)", marginTop: "0.5rem" }}>{stats.allClearCount}</p>
              <div style={{ marginTop: "1rem", maxHeight: "200px", overflowY: "auto", textAlign: "left", fontSize: "0.85rem" }} className="custom-scrollbar">
                {stats.allClearStudents.map(s => (
                  <div key={s.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
                    <Link href={`/students/${s.id}`} style={{ textDecoration: "none", color: "var(--text-primary)" }}>
                      <span style={{ fontWeight: 600 }}>{s.registerNumber}</span> <br/>
                      <span className="text-muted">{s.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, borderLeft: "1px solid var(--border-color)", paddingLeft: "1rem" }}>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>Active Arrears</p>
              <p className="h1" style={{ color: "var(--status-error)", marginTop: "0.5rem" }}>{stats.arrearCount}</p>
              <div style={{ marginTop: "1rem", maxHeight: "200px", overflowY: "auto", textAlign: "left", fontSize: "0.85rem" }} className="custom-scrollbar">
                {stats.arrearStudents.map(s => (
                  <div key={s.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
                    <Link href={`/students/${s.id}`} style={{ textDecoration: "none", color: "var(--text-primary)" }}>
                      <span style={{ fontWeight: 600 }}>{s.registerNumber}</span> <br/>
                      <span className="text-muted">{s.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core vs Language */}
        <div className="card glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 className="h2" style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Category Performance</h3>
          <div className="responsive-flex" style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>Core & Allied</p>
              <p className="h1 text-gradient" style={{ marginTop: "0.5rem" }}>{stats.coreAvg}%</p>
            </div>
            <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "2rem" }}>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>Language</p>
              <p className="h1 text-gradient" style={{ marginTop: "0.5rem" }}>{stats.langAvg}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card glass-panel" style={{ marginBottom: "3rem" }}>
        <h3 className="h2" style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Subject Insights</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <p className="text-muted" style={{ marginBottom: "0.5rem", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Hardest Subject (Lowest Pass Rate)</p>
            <h3 className="h3" style={{ color: "var(--status-error)" }}>{stats.hardestSubject.name}</h3>
            <p style={{ marginTop: "0.25rem", fontWeight: 600 }}>{stats.hardestSubject.code} <span className="badge badge-error" style={{ marginLeft: "0.5rem" }}>{stats.hardestSubject.passRate.toFixed(1)}% Pass</span></p>
          </div>
          <div className="mobile-no-border" style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "2rem" }}>
            <p className="text-muted" style={{ marginBottom: "0.5rem", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Top Subject (Highest Pass Rate)</p>
            <h3 className="h3" style={{ color: "var(--status-success)" }}>{stats.easiestSubject.name}</h3>
            <p style={{ marginTop: "0.25rem", fontWeight: 600 }}>{stats.easiestSubject.code} <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>{stats.easiestSubject.passRate.toFixed(1)}% Pass</span></p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="h2" style={{ marginBottom: "1.5rem", textAlign: "center" }}>Top Scorers (CGPA)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {topScorers.map((scorer, index) => (
            <div key={scorer.id} className="card glass-panel" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-primary)", opacity: 0.8 }}>
                #{index + 1}
              </div>
              <div>
                <h3 className="h3" style={{ marginBottom: "0.25rem" }}>{scorer.name}</h3>
                <p className="text-muted" style={{ marginBottom: "0.5rem" }}>{scorer.registerNumber}</p>
                <div className="badge badge-success">CGPA: {scorer.metrics.cgpa.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
