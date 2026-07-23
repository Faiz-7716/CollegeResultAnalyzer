"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { calculateGrade } from "./grading";
import { verifyAdminSession } from "./auth";

export async function addStudent(data: { registerNumber: string; name: string; batch: string }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const student = await prisma.student.create({ data });
    revalidatePath("/students");
    return { success: true, student };
  } catch (error) {
    return { success: false, error: "Failed to add student." };
  }
}

export async function addSemester(number: number) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const sem = await prisma.semester.create({ data: { number } });
    return { success: true, semester: sem };
  } catch (error) {
    return { success: false, error: "Failed to add semester." };
  }
}

export async function addSubject(data: { code: string; name: string; credits: number; semesterId: string }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const subject = await prisma.subject.create({ data });
    return { success: true, subject };
  } catch (error) {
    return { success: false, error: "Failed to add subject." };
  }
}

export async function addResult(data: {
  studentId: string;
  subjectId: string;
  internalMarks: number;
  externalMarks: number;
}) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const total = data.internalMarks + data.externalMarks;
    const { grade, pass } = calculateGrade(total);

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: data.studentId,
          subjectId: data.subjectId,
        },
      },
      update: {
        internalMarks: data.internalMarks,
        externalMarks: data.externalMarks,
        total,
        grade,
        passStatus: pass,
      },
      create: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        internalMarks: data.internalMarks,
        externalMarks: data.externalMarks,
        total,
        grade,
        passStatus: pass,
      },
    });

    revalidatePath(`/students/${data.studentId}`);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: "Failed to add result." };
  }
}

export async function getAllStudents() {
  return await prisma.student.findMany({
    orderBy: { registerNumber: "asc" },
  });
}

export async function getAllSemesters() {
  return await prisma.semester.findMany({
    orderBy: { number: "asc" },
  });
}

export async function getAllSubjects() {
  return await prisma.subject.findMany({
    orderBy: { code: "asc" },
  });
}

export async function getDashboardStats() {
  const totalStudents = await prisma.student.count();
  const totalResults = await prisma.result.count();
  const passedResults = await prisma.result.count({ where: { passStatus: true } });

  const passPercentage = totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(1) : "0.0";

  // 1. All Clear vs Arrear Count
  const students = await prisma.student.findMany({
    include: { results: true }
  });

  let allClearCount = 0;
  let arrearCount = 0;
  let allClearStudents: { id: string; name: string; registerNumber: string }[] = [];
  let arrearStudents: { id: string; name: string; registerNumber: string }[] = [];

  students.forEach((s: any) => {
    if (s.results.length === 0) return; // Ignore students with no results
    const hasArrear = s.results.some((r: any) => !r.passStatus);
    
    const studentInfo = { id: s.id, name: s.name, registerNumber: s.registerNumber };
    
    if (hasArrear) {
      arrearCount++;
      arrearStudents.push(studentInfo);
    } else {
      allClearCount++;
      allClearStudents.push(studentInfo);
    }
  });

  // 2. Subject Performance & Subject Leaderboard
  const subjects = await prisma.subject.findMany({
    include: {
      results: true,
      semester: true,
    }
  });

  let hardestSubject = { name: "N/A", passRate: 100, code: "" };
  let easiestSubject = { name: "N/A", passRate: 0, code: "" };

  let totalCoreMarks = 0;
  let coreCount = 0;
  let totalLangMarks = 0;
  let langCount = 0;

  const subjectLeaderboard: { id: string; code: string; name: string; totalEnrolled: number; passed: number; passRate: number; semNumber: number }[] = [];
  const semMap: Record<number, { totalExams: number; passedExams: number; totalMarks: number }> = {};

  subjects.forEach((sub: any) => {
    if (sub.results.length === 0) return;

    const totalEnrolled = sub.results.length;
    const passes = sub.results.filter((r: any) => r.passStatus).length;
    const passRate = Number(((passes / totalEnrolled) * 100).toFixed(1));
    const semNumber = sub.semester.number;

    subjectLeaderboard.push({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      totalEnrolled,
      passed: passes,
      passRate,
      semNumber,
    });

    if (!semMap[semNumber]) {
      semMap[semNumber] = { totalExams: 0, passedExams: 0, totalMarks: 0 };
    }

    sub.results.forEach((r: any) => {
      semMap[semNumber].totalExams++;
      if (r.passStatus) semMap[semNumber].passedExams++;
      semMap[semNumber].totalMarks += r.total;
    });

    if (passRate < hardestSubject.passRate || hardestSubject.name === "N/A") {
      hardestSubject = { name: sub.name, passRate, code: sub.code };
    }
    if (passRate > easiestSubject.passRate || easiestSubject.name === "N/A") {
      easiestSubject = { name: sub.name, passRate, code: sub.code };
    }

    // Core vs Language aggregates
    const isCoreOrAllied = sub.code.includes('UCS') || sub.code.includes('UPCS') || sub.code.includes('UECS') || sub.code.includes('CC') || sub.code.includes('EC');
    const isLang = sub.code.includes('ULE') || sub.code.includes('ULT') || sub.code.includes('ULU');

    sub.results.forEach((r: any) => {
      if (isCoreOrAllied) {
        totalCoreMarks += r.total;
        coreCount++;
      } else if (isLang) {
        totalLangMarks += r.total;
        langCount++;
      }
    });
  });

  // Sort subjects by passRate ascending (hardest to easiest)
  subjectLeaderboard.sort((a, b) => a.passRate - b.passRate);

  // Semesters summary stats
  const semPassStats = [1, 2, 3, 4].map((semNum) => {
    const data = semMap[semNum] || { totalExams: 0, passedExams: 0, totalMarks: 0 };
    const passRate = data.totalExams > 0 ? Number(((data.passedExams / data.totalExams) * 100).toFixed(1)) : 0;
    const avgMarks = data.totalExams > 0 ? Number((data.totalMarks / data.totalExams).toFixed(1)) : 0;
    return {
      semester: semNum,
      passRate,
      avgMarks,
      totalExams: data.totalExams,
    };
  });

  const coreAvg = coreCount > 0 ? (totalCoreMarks / (coreCount * 100) * 100).toFixed(1) : "0.0";
  const langAvg = langCount > 0 ? (totalLangMarks / (langCount * 100) * 100).toFixed(1) : "0.0";

  return { 
    totalStudents, 
    totalResults, 
    passPercentage,
    allClearCount,
    arrearCount,
    allClearStudents,
    arrearStudents,
    hardestSubject,
    easiestSubject,
    subjectLeaderboard,
    semPassStats,
    coreAvg,
    langAvg
  };
}

export async function getStudentsWithMetrics() {
  const students = await prisma.student.findMany({
    include: {
      results: {
        include: {
          subject: {
            include: {
              semester: true,
            }
          },
        },
      },
    },
  });

  return students.map((student: any) => {
    let totalMarks = 0;
    let coreMarks = 0;
    let alliedMarks = 0;
    let languageMarks = 0;
    let totalSubjectsCount = 0;
    let coreAlliedSubjectsCount = 0;
    let hasArrear = false;
    const semMarks: Record<number, number> = {};

    // Group results by semester for SGPA/CGPA calculation
    const semResultsMap: Record<number, { credits: number; gradePoints: number }[]> = {};

    student.results.forEach((result: any) => {
      const sub = result.subject;
      const semNumber = sub.semester.number;
      const code = sub.code;
      const total = result.total;
      
      totalMarks += total;
      totalSubjectsCount++;
      if (!result.passStatus) {
        hasArrear = true;
      }

      // Group sem wise marks
      if (!semMarks[semNumber]) {
        semMarks[semNumber] = 0;
      }
      semMarks[semNumber] += total;

      // Categorize based on code
      if (code.includes('UCS') || code.includes('UPCS') || code.includes('CC')) {
        coreMarks += total;
        coreAlliedSubjectsCount++;
      } else if (code.includes('UECS') || code.includes('EC')) {
        alliedMarks += total;
        coreAlliedSubjectsCount++;
      } else if (code.includes('ULE') || code.includes('ULT') || code.includes('ULU')) {
        languageMarks += total;
      }

      // Prepare for CGPA
      if (!semResultsMap[semNumber]) {
        semResultsMap[semNumber] = [];
      }

      // Convert grade to grade points
      let gp = 0;
      switch (result.grade) {
        case 'O': gp = 10; break;
        case 'A+': gp = 9; break;
        case 'A': gp = 8; break;
        case 'B+': gp = 7; break;
        case 'B': gp = 6; break;
        case 'C': gp = 5; break;
        case 'U': gp = 0; break;
      }
      
      semResultsMap[semNumber].push({
        credits: sub.credits,
        gradePoints: gp
      });
    });

    // Calculate CGPA
    let totalCredits = 0;
    let totalEarnedPoints = 0;

    Object.values(semResultsMap).forEach((resultsArr: any) => {
      resultsArr.forEach((r: any) => {
        totalCredits += r.credits;
        totalEarnedPoints += (r.credits * r.gradePoints);
      });
    });

    const cgpa = totalCredits > 0 ? Number((totalEarnedPoints / totalCredits).toFixed(2)) : 0;

    return {
      id: student.id,
      registerNumber: student.registerNumber,
      name: student.name,
      batch: student.batch,
      metrics: {
        cgpa,
        totalMarks,
        coreMarks,
        alliedMarks,
        coreAndAllied: coreMarks + alliedMarks,
        languageMarks,
        semMarks,
        totalSubjectsCount,
        coreAlliedSubjectsCount,
        hasArrear,
      }
    };
  });
}
