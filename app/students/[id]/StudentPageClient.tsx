"use client";

import React, { useState } from "react";
import StudentAnalyticsDashboard from "@/app/components/StudentAnalyticsDashboard";

interface StudentPageClientProps {
  student: any;
  results: any[];
  cgpa: number;
  classRank: { rank: number; totalStudents: number };
  ledgerView: React.ReactNode;
}

export default function StudentPageClient({
  student,
  results,
  cgpa,
  classRank,
  ledgerView,
}: StudentPageClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger">("dashboard");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Visual Analytics Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          📋 Detailed Marksheet Ledger
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "dashboard" ? (
        <StudentAnalyticsDashboard
          student={student}
          results={results}
          cgpa={cgpa}
          classRank={classRank}
        />
      ) : (
        ledgerView
      )}
    </div>
  );
}
