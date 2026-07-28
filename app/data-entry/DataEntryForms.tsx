"use client";

import { useState } from "react";
import Link from "next/link";
import { addStudent, addSemester, addSubject, addResult, addDepartment } from "@/lib/actions";
import { IconPlusCircle, IconUsers, IconGraduationCap, IconFileText, IconFilter, IconSparkles } from "../components/Icons";

type Props = {
  students: any[];
  semesters: any[];
  subjects: any[];
  departments: any[];
  results?: any[];
};

export default function DataEntryForms({ students, semesters, subjects, departments, results = [] }: Props) {
  // Main View Switcher: "explorer" | "studio"
  const [mainView, setMainView] = useState<"explorer" | "studio">("explorer");

  // Explorer Sub-Tab: "students" | "depts" | "subjects" | "results"
  const [explorerTab, setExplorerTab] = useState<"students" | "depts" | "subjects" | "results">("students");

  // Studio Sub-Tab: "dept" | "student" | "result" | "subject"
  const [studioTab, setStudioTab] = useState<"dept" | "student" | "result" | "subject">("student");

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Extract unique batch years present in students
  const availableBatches = Array.from(
    new Set(students.map((s) => s.batchYear || s.batch).filter(Boolean))
  );

  // Filtered Students Data
  const filteredStudents = students.filter((s) => {
    const sDeptCode = s.department?.code || "CS";
    const sBatch = s.batchYear || s.batch;

    if (deptFilter !== "all" && sDeptCode !== deptFilter) return false;
    if (batchFilter !== "all" && sBatch !== batchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Subjects Data
  const filteredSubjects = subjects.filter((sub) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Results Data
  const filteredResults = results.filter((res) => {
    const sDeptCode = res.student?.department?.code || "CS";
    const sBatch = res.student?.batchYear || res.student?.batch;

    if (deptFilter !== "all" && sDeptCode !== deptFilter) return false;
    if (batchFilter !== "all" && sBatch !== batchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.student?.name.toLowerCase().includes(q) ||
        res.student?.registerNumber.toLowerCase().includes(q) ||
        res.subject?.code.toLowerCase().includes(q) ||
        res.subject?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Form Handlers
  const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addDepartment({
      code: fd.get("code") as string,
      name: fd.get("name") as string,
      degree: fd.get("degree") as string,
    });
    if (res.success) {
      setMsg({ text: "✨ New Department created successfully!", type: "success" });
      form.reset();
    } else {
      setMsg({ text: res.error || "Failed to create department", type: "error" });
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const deptId = fd.get("departmentId") as string;
    const selectedDept = departments.find((d) => d.id === deptId);

    const res = await addStudent({
      registerNumber: fd.get("registerNumber") as string,
      name: fd.get("name") as string,
      batch: fd.get("batch") as string,
      batchYear: fd.get("batchYear") as string,
      departmentId: deptId,
      degree: selectedDept ? selectedDept.degree : "B.Sc. Computer Science",
    });
    if (res.success) {
      setMsg({ text: "🎓 Student enrolled successfully!", type: "success" });
      form.reset();
    } else {
      setMsg({ text: res.error || "Failed to enroll student", type: "error" });
    }
  };

  const handleAddSemester = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addSemester(Number(fd.get("number")));
    if (res.success) {
      setMsg({ text: "📅 Semester created successfully!", type: "success" });
      form.reset();
    } else {
      setMsg({ text: res.error || "Error", type: "error" });
    }
  };

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addSubject({
      code: fd.get("code") as string,
      name: fd.get("name") as string,
      credits: Number(fd.get("credits")),
      semesterId: fd.get("semesterId") as string,
    });
    if (res.success) {
      setMsg({ text: "📚 Subject cataloged successfully!", type: "success" });
      form.reset();
    } else {
      setMsg({ text: res.error || "Error", type: "error" });
    }
  };

  const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addResult({
      studentId: fd.get("studentId") as string,
      subjectId: fd.get("subjectId") as string,
      internalMarks: Number(fd.get("internalMarks")),
      externalMarks: Number(fd.get("externalMarks")),
    });
    if (res.success) {
      setMsg({ text: "📝 Exam result logged successfully!", type: "success" });
      form.reset();
    } else {
      setMsg({ text: res.error || "Error logging result", type: "error" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. TOP METRICS OVERVIEW STRIP */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Metric 1: Departments */}
        <div
          className="card glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ padding: "0.75rem", background: "rgba(79, 70, 229, 0.12)", borderRadius: "var(--radius-md)", color: "#4F46E5" }}>
            <IconGraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Departments</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#4F46E5", lineHeight: 1.1 }}>{departments.length}</div>
          </div>
        </div>

        {/* Metric 2: Enrolled Students */}
        <div
          className="card glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ padding: "0.75rem", background: "rgba(37, 99, 235, 0.12)", borderRadius: "var(--radius-md)", color: "#2563EB" }}>
            <IconUsers size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Enrolled Students</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#2563EB", lineHeight: 1.1 }}>{students.length}</div>
          </div>
        </div>

        {/* Metric 3: Subjects Cataloged */}
        <div
          className="card glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.12)", borderRadius: "var(--radius-md)", color: "#059669" }}>
            <IconFileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Subjects Cataloged</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#059669", lineHeight: 1.1 }}>{subjects.length}</div>
          </div>
        </div>

        {/* Metric 4: Exam Results Logged */}
        <div
          className="card glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.12)", borderRadius: "var(--radius-md)", color: "#D97706" }}>
            <IconSparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Logged Exam Scores</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#D97706", lineHeight: 1.1 }}>{results.length}</div>
          </div>
        </div>
      </div>

      {/* 2. SYSTEM DUAL-MODE SEGMENTED SWITCHER CONTROL */}
      <div
        className="card glass-panel"
        style={{
          padding: "0.75rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "#FFFFFF",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", background: "#F1F5F9", padding: "0.35rem", borderRadius: "var(--radius-md)" }}>
          <button
            onClick={() => setMainView("explorer")}
            className="btn"
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              background: mainView === "explorer" ? "#4F46E5" : "transparent",
              color: mainView === "explorer" ? "#FFFFFF" : "var(--text-secondary)",
              borderRadius: "var(--radius-sm)",
              border: "none",
              boxShadow: mainView === "explorer" ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            📊 Master Data Explorer & Ledger
          </button>
          <button
            onClick={() => setMainView("studio")}
            className="btn"
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              background: mainView === "studio" ? "#4F46E5" : "transparent",
              color: mainView === "studio" ? "#FFFFFF" : "var(--text-secondary)",
              borderRadius: "var(--radius-sm)",
              border: "none",
              boxShadow: mainView === "studio" ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            ✍️ Administrative Action Studio
          </button>
        </div>

        {/* Status Toast / Banner */}
        {msg && (
          <div
            style={{
              padding: "0.45rem 1.15rem",
              background: msg.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: msg.type === "success" ? "#059669" : "#DC2626",
              border: `1px solid ${msg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>✕</button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODE 1: MASTER DATA EXPLORER & LEDGER                    */}
      {/* ======================================================== */}
      {mainView === "explorer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Global Filter Bar */}
          <div
            className="card glass-panel"
            style={{
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <IconFilter size={16} color="var(--accent-primary)" />
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Department:</label>
                <select
                  className="input-field"
                  style={{ width: "auto", marginBottom: 0, padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">All Departments ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Batch Year:</label>
                <select
                  className="input-field"
                  style={{ width: "auto", marginBottom: 0, padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                >
                  <option value="all">All Batches</option>
                  {availableBatches.map((b: any) => (
                    <option key={b} value={b}>
                      Batch {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ minWidth: "240px", flex: 1, maxWidth: "340px" }}>
              <input
                type="text"
                className="input-field"
                style={{ marginBottom: 0, padding: "0.45rem 0.95rem", fontSize: "0.85rem", width: "100%" }}
                placeholder="🔍 Search Student, Reg No, Subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Sub-Tabs for Explorer */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setExplorerTab("students")}
              className="btn"
              style={{
                padding: "0.5rem 1.15rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: explorerTab === "students" ? "rgba(79, 70, 229, 0.12)" : "transparent",
                color: explorerTab === "students" ? "#4F46E5" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              👥 Student Roster ({filteredStudents.length})
            </button>

            <button
              onClick={() => setExplorerTab("depts")}
              className="btn"
              style={{
                padding: "0.5rem 1.15rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: explorerTab === "depts" ? "rgba(79, 70, 229, 0.12)" : "transparent",
                color: explorerTab === "depts" ? "#4F46E5" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              🎓 Departments ({departments.length})
            </button>

            <button
              onClick={() => setExplorerTab("subjects")}
              className="btn"
              style={{
                padding: "0.5rem 1.15rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: explorerTab === "subjects" ? "rgba(79, 70, 229, 0.12)" : "transparent",
                color: explorerTab === "subjects" ? "#4F46E5" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              📚 Subjects Catalog ({filteredSubjects.length})
            </button>

            <button
              onClick={() => setExplorerTab("results")}
              className="btn"
              style={{
                padding: "0.5rem 1.15rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: explorerTab === "results" ? "rgba(79, 70, 229, 0.12)" : "transparent",
                color: explorerTab === "results" ? "#4F46E5" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              📝 Exam Results ({filteredResults.length})
            </button>
          </div>

          {/* Explorer Tab 1: Student Roster */}
          {explorerTab === "students" && (
            <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>REG NUMBER</th>
                      <th>STUDENT NAME</th>
                      <th>DEPARTMENT</th>
                      <th>BATCH / YEAR</th>
                      <th>EXAMS LOGGED</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
                          No student records match the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.registerNumber}</strong></td>
                          <td>{s.name}</td>
                          <td><span className="badge badge-secondary">{s.department?.code || "CS"}</span></td>
                          <td>{s.batchYear || s.batch}</td>
                          <td><strong>{s.results ? s.results.length : 0} Subjects</strong></td>
                          <td>
                            <Link href={`/students/${s.id}`} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", fontWeight: 600 }}>
                              View Marksheet Ledger
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explorer Tab 2: Departments */}
          {explorerTab === "depts" && (
            <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>DEPT CODE</th>
                      <th>DEPARTMENT NAME</th>
                      <th>DEGREE PROGRAM</th>
                      <th>ENROLLED STUDENTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => {
                      const count = students.filter((s) => (s.department?.code || "CS") === dept.code).length;
                      return (
                        <tr key={dept.id}>
                          <td><span className="badge badge-primary" style={{ fontSize: "0.85rem", padding: "0.3rem 0.65rem" }}>{dept.code}</span></td>
                          <td><strong>{dept.name}</strong></td>
                          <td>{dept.degree}</td>
                          <td><strong>{count} Students</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explorer Tab 3: Subjects Catalog */}
          {explorerTab === "subjects" && (
            <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>SUBJECT CODE</th>
                      <th>SUBJECT NAME</th>
                      <th>CREDITS</th>
                      <th>SEMESTER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
                          No subject records cataloged.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((sub) => (
                        <tr key={sub.id}>
                          <td><strong>{sub.code}</strong></td>
                          <td>{sub.name}</td>
                          <td><strong>{sub.credits} Credits</strong></td>
                          <td><span className="badge badge-secondary">Sem {sub.semester?.number || "-"}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explorer Tab 4: Exam Results Log */}
          {explorerTab === "results" && (
            <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>STUDENT NAME</th>
                      <th>REG NUMBER</th>
                      <th>SUBJECT</th>
                      <th>INTERNAL / EXTERNAL</th>
                      <th>TOTAL MARKS</th>
                      <th>GRADE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
                          No exam results logged for selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.student?.name || "N/A"}</strong></td>
                          <td>{r.student?.registerNumber || "N/A"}</td>
                          <td>{r.subject?.code} - {r.subject?.name}</td>
                          <td>{r.internalMarks} / {r.externalMarks}</td>
                          <td><strong>{r.total} / 100</strong></td>
                          <td><span className="badge" style={{ background: "rgba(79, 70, 229, 0.12)", color: "#4F46E5", fontWeight: 800 }}>{r.grade}</span></td>
                          <td>
                            <span className={`badge ${r.passStatus ? "badge-success" : "badge-error"}`}>
                              {r.passStatus ? "PASS" : "ARREAR"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: ADMINISTRATIVE ACTION STUDIO                     */}
      {/* ======================================================== */}
      {mainView === "studio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Studio Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setStudioTab("student")}
              className="btn"
              style={{
                padding: "0.55rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 800,
                background: studioTab === "student" ? "#4F46E5" : "transparent",
                color: studioTab === "student" ? "#FFFFFF" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              🎓 1. Student Enrollment Form
            </button>

            <button
              onClick={() => setStudioTab("result")}
              className="btn"
              style={{
                padding: "0.55rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 800,
                background: studioTab === "result" ? "#4F46E5" : "transparent",
                color: studioTab === "result" ? "#FFFFFF" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              📝 2. Log Exam Result
            </button>

            <button
              onClick={() => setStudioTab("dept")}
              className="btn"
              style={{
                padding: "0.55rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 800,
                background: studioTab === "dept" ? "#4F46E5" : "transparent",
                color: studioTab === "dept" ? "#FFFFFF" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              🏛️ 3. Create Department
            </button>

            <button
              onClick={() => setStudioTab("subject")}
              className="btn"
              style={{
                padding: "0.55rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 800,
                background: studioTab === "subject" ? "#4F46E5" : "transparent",
                color: studioTab === "subject" ? "#FFFFFF" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "none",
              }}
            >
              📚 4. Add Subject & Semester
            </button>
          </div>

          {/* STUDIO FORM 1: STUDENT ENROLLMENT */}
          {studioTab === "student" && (
            <div className="card glass-panel" style={{ maxWidth: "680px", margin: "0 auto", width: "100%", padding: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 className="h3 text-gradient">Student Enrollment Studio</h3>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>Enroll a student into a specific department and academic batch year</p>
              </div>

              <form onSubmit={handleAddStudent} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="input-group">
                  <label className="input-label">Department Assignment</label>
                  <select name="departmentId" className="input-field" required>
                    <option value="">Choose Target Department...</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code}) — {d.degree}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="responsive-grid">
                  <div className="input-group">
                    <label className="input-label">Register Number</label>
                    <input name="registerNumber" className="input-field" required placeholder="e.g. 31924U18001" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input name="name" className="input-field" required placeholder="e.g. John Doe" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="responsive-grid">
                  <div className="input-group">
                    <label className="input-label">Batch Code</label>
                    <input name="batch" className="input-field" required defaultValue="31924U180" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Academic Batch Year</label>
                    <input name="batchYear" className="input-field" required defaultValue="2023 - 2026" placeholder="e.g. 2023 - 2026" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.5rem" }}>
                  🎓 Complete Student Enrollment
                </button>
              </form>
            </div>
          )}

          {/* STUDIO FORM 2: EXAM RESULT LOGGING */}
          {studioTab === "result" && (
            <div className="card glass-panel" style={{ maxWidth: "680px", margin: "0 auto", width: "100%", padding: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 className="h3 text-gradient">Log Exam Result</h3>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>Record internal (max 25) and external (max 75) marks for automatic grade calculation</p>
              </div>

              <form onSubmit={handleAddResult} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="input-group">
                  <label className="input-label">Select Student</label>
                  <select name="studentId" className="input-field" required>
                    <option value="">Select Enrolled Student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.registerNumber} — {s.name} ({s.department?.code || "CS"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Select Subject</label>
                  <select name="subjectId" className="input-field" required>
                    <option value="">Select Subject Paper...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name} (Sem {s.semester?.number || "-"})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="responsive-grid">
                  <div className="input-group">
                    <label className="input-label">Internal Marks (Max 25)</label>
                    <input name="internalMarks" type="number" className="input-field" required min="0" max="25" placeholder="0 - 25" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">External Marks (Max 75)</label>
                    <input name="externalMarks" type="number" className="input-field" required min="0" max="75" placeholder="0 - 75" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.5rem" }}>
                  📝 Log Exam Result & Compute Grade
                </button>
              </form>
            </div>
          )}

          {/* STUDIO FORM 3: DEPARTMENT CREATION */}
          {studioTab === "dept" && (
            <div className="card glass-panel" style={{ maxWidth: "680px", margin: "0 auto", width: "100%", padding: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 className="h3" style={{ color: "#059669" }}>Create Academic Department</h3>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>Define a new college department and its degree program</p>
              </div>

              <form onSubmit={handleAddDepartment} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="input-group">
                  <label className="input-label">Department Code (Unique)</label>
                  <input name="code" className="input-field" required placeholder="e.g. BCA, BBA, BCOM, MICRO" style={{ textTransform: "uppercase" }} />
                </div>

                <div className="input-group">
                  <label className="input-label">Department Full Name</label>
                  <input name="name" className="input-field" required placeholder="e.g. Department of Business Administration" />
                </div>

                <div className="input-group">
                  <label className="input-label">Degree Title</label>
                  <input name="degree" className="input-field" required placeholder="e.g. Bachelor of Business Administration (BBA)" />
                </div>

                <button type="submit" className="btn" style={{ background: "#059669", color: "#FFFFFF", padding: "0.75rem", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.5rem" }}>
                  🏛️ Create & Register Department
                </button>
              </form>
            </div>
          )}

          {/* STUDIO FORM 4: SUBJECT & SEMESTER */}
          {studioTab === "subject" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "900px", margin: "0 auto", width: "100%" }} className="responsive-grid">
              {/* Subject Form */}
              <div className="card glass-panel" style={{ padding: "1.75rem" }}>
                <h4 className="h3" style={{ marginBottom: "1rem" }}>Catalog New Subject</h4>
                <form onSubmit={handleAddSubject} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label">Subject Code</label>
                    <input name="code" className="input-field" required placeholder="e.g. UCS201" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Subject Name</label>
                    <input name="name" className="input-field" required placeholder="e.g. Data Structures & Algorithms" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="input-group">
                      <label className="input-label">Credits</label>
                      <input name="credits" type="number" className="input-field" required min="1" max="10" defaultValue="4" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Semester</label>
                      <select name="semesterId" className="input-field" required>
                        <option value="">Select...</option>
                        {semesters.map((s) => (
                          <option key={s.id} value={s.id}>Sem {s.number}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ padding: "0.65rem", fontWeight: 700 }}>
                    📚 Add Subject
                  </button>
                </form>
              </div>

              {/* Semester Form */}
              <div className="card glass-panel" style={{ padding: "1.75rem" }}>
                <h4 className="h3" style={{ marginBottom: "1rem" }}>Create Semester</h4>
                <form onSubmit={handleAddSemester} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label">Semester Number (1 - 8)</label>
                    <input name="number" type="number" className="input-field" required min="1" max="8" placeholder="e.g. 5" />
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ padding: "0.65rem", fontWeight: 700, marginTop: "auto" }}>
                    📅 Create Semester
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
