"use client";

import { useState } from "react";
import { addStudent, addSemester, addSubject, addResult } from "@/lib/actions";

type Props = {
  students: any[];
  semesters: any[];
  subjects: any[];
};

export default function DataEntryForms({ students, semesters, subjects }: Props) {
  const [msg, setMsg] = useState("");

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addStudent({
      registerNumber: fd.get("registerNumber") as string,
      name: fd.get("name") as string,
      batch: fd.get("batch") as string,
    });
    setMsg(res.success ? "Student added!" : res.error || "Error");
    if(res.success) form.reset();
  };

  const handleAddSemester = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await addSemester(Number(fd.get("number")));
    setMsg(res.success ? "Semester added!" : res.error || "Error");
    if(res.success) form.reset();
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
    if(res.success) form.reset();
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
    setMsg(res.success ? "Result added!" : res.error || "Error");
    if(res.success) form.reset();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
      {msg && (
        <div style={{ gridColumn: "1 / -1", padding: "1rem", background: "var(--accent-primary)", color: "white", borderRadius: "8px", textAlign: "center" }}>
          {msg}
        </div>
      )}

      {/* Add Student Form */}
      <div className="card glass-panel delay-100">
        <h3 className="h3" style={{ marginBottom: "1.5rem" }}>Add New Student</h3>
        <form onSubmit={handleAddStudent}>
          <div className="input-group">
            <label className="input-label">Register Number</label>
            <input name="registerNumber" className="input-field" required placeholder="e.g. 31924U18001" />
          </div>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input name="name" className="input-field" required placeholder="e.g. John Doe" />
          </div>
          <div className="input-group">
            <label className="input-label">Batch</label>
            <input name="batch" className="input-field" required defaultValue="31924U180" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Student</button>
        </form>
      </div>

      {/* Add Result Form */}
      <div className="card glass-panel delay-200">
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

      {/* Add Subject & Semester */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div className="card glass-panel delay-300">
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

        <div className="card glass-panel delay-300">
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
  );
}
