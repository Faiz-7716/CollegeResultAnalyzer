"use client";

import { useState } from "react";
import Link from "next/link";
import { addStudent, addSemester, addSubject, addResult, addDepartment } from "@/lib/actions";

type Props = {
  students: any[];
  semesters: any[];
  subjects: any[];
  departments: any[];
  results?: any[];
};

export default function DataEntryForms({ students, semesters, subjects, departments, results = [] }: Props) {
  const [activeTab, setActiveTab] = useState<"forms" | "depts" | "students" | "subjects" | "results">("forms");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [msg, setMsg] = useState("");

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

  const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addDepartment({
      code: fd.get("code") as string,
      name: fd.get("name") as string,
      degree: fd.get("degree") as string,
    });
    setMsg(res.success ? "New Department created successfully!" : res.error || "Error");
    if (res.success) form.reset();
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
    setMsg(res.success ? "Student added successfully!" : res.error || "Error");
    if (res.success) form.reset();
  };

  const handleAddSemester = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addSemester(Number(fd.get("number")));
    setMsg(res.success ? "Semester added!" : res.error || "Error");
    if (res.success) form.reset();
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
    setMsg(res.success ? "Subject added!" : res.error || "Error");
    if (res.success) form.reset();
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
    setMsg(res.success ? "Result logged!" : res.error || "Error");
    if (res.success) form.reset();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Global Filter & Department Selection Command Bar */}
      <div
        className="card glass-panel"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Department Selector */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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

          {/* Academic Batch Year Selector */}
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

        {/* Real-time Search Box */}
        <div style={{ minWidth: "240px", flex: 1, maxWidth: "340px" }}>
          <input
            type="text"
            className="input-field"
            style={{ marginBottom: 0, padding: "0.45rem 0.95rem", fontSize: "0.85rem", width: "100%" }}
            placeholder="🔍 Search Student Name, Reg No, Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notification Banner */}
      {msg && (
        <div style={{ padding: "1rem", background: "#4F46E5", color: "white", borderRadius: "var(--radius-md)", textAlign: "center", fontWeight: 700, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
          {msg}
        </div>
      )}

      {/* 2. Management Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("forms")}
          className="btn"
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: activeTab === "forms" ? "#4F46E5" : "transparent",
            color: activeTab === "forms" ? "#FFFFFF" : "var(--text-secondary)",
            borderRadius: "var(--radius-md)",
            border: activeTab === "forms" ? "none" : "1px solid var(--border-color)",
          }}
        >
          ➕ Data Entry Forms
        </button>

        <button
          onClick={() => setActiveTab("depts")}
          className="btn"
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: activeTab === "depts" ? "#4F46E5" : "transparent",
            color: activeTab === "depts" ? "#FFFFFF" : "var(--text-secondary)",
            borderRadius: "var(--radius-md)",
            border: activeTab === "depts" ? "none" : "1px solid var(--border-color)",
          }}
        >
          🎓 Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className="btn"
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: activeTab === "students" ? "#4F46E5" : "transparent",
            color: activeTab === "students" ? "#FFFFFF" : "var(--text-secondary)",
            borderRadius: "var(--radius-md)",
            border: activeTab === "students" ? "none" : "1px solid var(--border-color)",
          }}
        >
          👥 Enrolled Students ({filteredStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className="btn"
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: activeTab === "subjects" ? "#4F46E5" : "transparent",
            color: activeTab === "subjects" ? "#FFFFFF" : "var(--text-secondary)",
            borderRadius: "var(--radius-md)",
            border: activeTab === "subjects" ? "none" : "1px solid var(--border-color)",
          }}
        >
          📚 Subjects Catalog ({filteredSubjects.length})
        </button>

        <button
          onClick={() => setActiveTab("results")}
          className="btn"
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: activeTab === "results" ? "#4F46E5" : "transparent",
            color: activeTab === "results" ? "#FFFFFF" : "var(--text-secondary)",
            borderRadius: "var(--radius-md)",
            border: activeTab === "results" ? "none" : "1px solid var(--border-color)",
          }}
        >
          📝 Exam Results ({filteredResults.length})
        </button>
      </div>

      {/* TAB 1: DATA ENTRY FORMS */}
      {activeTab === "forms" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {/* 1. Add Department Card */}
          <div className="card glass-panel" style={{ borderLeft: "4px solid #10B981" }}>
            <h3 className="h3" style={{ marginBottom: "1.5rem", color: "#059669" }}>Create New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="input-group">
                <label className="input-label">Department Code</label>
                <input name="code" className="input-field" required placeholder="e.g. BCA, BBA, BCOM, MICRO" />
              </div>
              <div className="input-group">
                <label className="input-label">Department Name</label>
                <input name="name" className="input-field" required placeholder="e.g. Department of Computer Applications" />
              </div>
              <div className="input-group">
                <label className="input-label">Degree Title</label>
                <input name="degree" className="input-field" required placeholder="e.g. Bachelor of Computer Applications (BCA)" />
              </div>
              <button type="submit" className="btn" style={{ width: "100%", background: "#059669", color: "#FFFFFF", fontWeight: 700 }}>Create Department</button>
            </form>
          </div>

          {/* 2. Add Student Form */}
          <div className="card glass-panel">
            <h3 className="h3" style={{ marginBottom: "1.5rem" }}>Add New Student</h3>
            <form onSubmit={handleAddStudent}>
              <div className="input-group">
                <label className="input-label">Department</label>
                <select name="departmentId" className="input-field" required>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Register Number</label>
                <input name="registerNumber" className="input-field" required placeholder="e.g. 31924U18001" />
              </div>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input name="name" className="input-field" required placeholder="e.g. John Doe" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Batch Code</label>
                  <input name="batch" className="input-field" required defaultValue="31924U180" />
                </div>
                <div className="input-group">
                  <label className="input-label">Batch Year</label>
                  <input name="batchYear" className="input-field" required defaultValue="2023 - 2026" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Student</button>
            </form>
          </div>

          {/* 3. Add Result Form */}
          <div className="card glass-panel">
            <h3 className="h3" style={{ marginBottom: "1.5rem" }}>Log Exam Result</h3>
            <form onSubmit={handleAddResult}>
              <div className="input-group">
                <label className="input-label">Student</label>
                <select name="studentId" className="input-field" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.registerNumber} - {s.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Subject</label>
                <select name="subjectId" className="input-field" required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Internal Marks</label>
                  <input name="internalMarks" type="number" className="input-field" required min="0" max="25" />
                </div>
                <div className="input-group">
                  <label className="input-label">External Marks</label>
                  <input name="externalMarks" type="number" className="input-field" required min="0" max="75" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Log Result</button>
            </form>
          </div>

          {/* 4. Add Subject & Semester */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="card glass-panel">
              <h3 className="h3" style={{ marginBottom: "1.5rem" }}>Add Subject</h3>
              <form onSubmit={handleAddSubject}>
                <div className="input-group">
                  <label className="input-label">Subject Code & Name</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input name="code" className="input-field" required placeholder="Code" style={{ flex: 1 }} />
                    <input name="name" className="input-field" required placeholder="Name" style={{ flex: 2 }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label">Credits</label>
                    <input name="credits" type="number" className="input-field" required min="1" max="10" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Semester</label>
                    <select name="semesterId" className="input-field" required>
                      <option value="">Select...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>Sem {s.number}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>Add Subject</button>
              </form>
            </div>

            <div className="card glass-panel">
              <h3 className="h3" style={{ marginBottom: "1.5rem" }}>Add Semester</h3>
              <form onSubmit={handleAddSemester}>
                <div className="input-group">
                  <label className="input-label">Semester Number</label>
                  <input name="number" type="number" className="input-field" required min="1" max="8" />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>Add Semester</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS EXPLORER */}
      {activeTab === "depts" && (
        <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 className="h3">College Departments ({departments.length})</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Registered academic departments and degree programs</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>DEPARTMENT NAME</th>
                  <th>DEGREE OFFERED</th>
                  <th>ENROLLED STUDENTS</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const studentCount = students.filter(s => (s.department?.code || "CS") === dept.code).length;
                  return (
                    <tr key={dept.id}>
                      <td><span className="badge badge-primary">{dept.code}</span></td>
                      <td><strong>{dept.name}</strong></td>
                      <td>{dept.degree}</td>
                      <td><strong>{studentCount} Students</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENROLLED STUDENTS ROSTER */}
      {activeTab === "students" && (
        <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className="h3">Enrolled Students Directory ({filteredStudents.length})</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>List of registered students with department, batch year, and records status</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>REG NUMBER</th>
                  <th>NAME</th>
                  <th>DEPARTMENT</th>
                  <th>BATCH / YEAR</th>
                  <th>EXAMS LOGGED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No student records match the selected filters.</td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.registerNumber}</strong></td>
                      <td>{s.name}</td>
                      <td><span className="badge badge-secondary">{s.department?.code || "CS"}</span></td>
                      <td>{s.batchYear || s.batch}</td>
                      <td>{s.results ? s.results.length : 0} Subjects</td>
                      <td>
                        <Link href={`/students/${s.id}`} className="btn btn-secondary" style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}>
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

      {/* TAB 4: SUBJECTS CATALOG */}
      {activeTab === "subjects" && (
        <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 className="h3">Subjects Catalog ({filteredSubjects.length})</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Defined courses, credits, and semester distribution</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>SUBJECT NAME</th>
                  <th>CREDITS</th>
                  <th>SEMESTER</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>No subject records found.</td>
                  </tr>
                ) : (
                  filteredSubjects.map((sub) => (
                    <tr key={sub.id}>
                      <td><strong>{sub.code}</strong></td>
                      <td>{sub.name}</td>
                      <td><strong>{sub.credits} Credits</strong></td>
                      <td>Sem {sub.semester?.number || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EXAM RESULTS LOG */}
      {activeTab === "results" && (
        <div className="card glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 className="h3">Log of All Exam Results ({filteredResults.length})</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Complete record of internal, external, and total marks logged</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>REG NUMBER</th>
                  <th>SUBJECT</th>
                  <th>INTERNAL / EXTERNAL</th>
                  <th>TOTAL</th>
                  <th>GRADE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No exam results match the selected filters.</td>
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
  );
}
