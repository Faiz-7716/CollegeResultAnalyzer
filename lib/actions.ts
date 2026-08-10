"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { calculateGrade } from "./grading";
import { verifyAdminSession } from "./auth";

export async function ensureDefaultDepartments() {
  try {
    if (!prisma || !("department" in (prisma as any)) || !(prisma as any).department) {
      return;
    }
    const count = await (prisma as any).department.count();
    if (count === 0) {
      const defaultDepts = [
        { code: "CS", name: "Department of Computer Science", degree: "B.Sc. Computer Science" },
        { code: "BCA", name: "Department of Computer Applications", degree: "Bachelor of Computer Applications (BCA)" },
        { code: "BBA", name: "Department of Business Administration", degree: "Bachelor of Business Administration (BBA)" },
        { code: "BCOM", name: "Department of Commerce", degree: "Bachelor of Commerce (B.Com)" },
        { code: "MICRO", name: "Department of Microbiology", degree: "B.Sc. Microbiology" },
      ];

      for (const d of defaultDepts) {
        await (prisma as any).department.create({ data: d });
      }

      const csDept = await (prisma as any).department.findUnique({ where: { code: "CS" } });
      if (csDept) {
        await prisma.student.updateMany({
          where: { departmentId: null },
          data: { departmentId: csDept.id, degree: csDept.degree }
        });
      }
    }
  } catch (e) {
    console.error("Default departments check:", e);
  }
}

export async function getDepartments() {
  await ensureDefaultDepartments();
  if (!prisma || !("department" in (prisma as any)) || !(prisma as any).department) {
    return [];
  }
  return await (prisma as any).department.findMany({
    orderBy: { name: "asc" }
  });
}

export async function addDepartment(data: { code: string; name: string; degree: string }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const dept = await prisma.department.create({
      data: {
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        degree: data.degree.trim(),
      }
    });
    revalidatePath("/");
    revalidatePath("/students");
    revalidatePath("/data-entry");
    return { success: true, department: dept };
  } catch (error) {
    return { success: false, error: "Failed to add department (code must be unique)." };
  }
}

export async function addStudent(data: { registerNumber: string; name: string; batch: string; departmentId?: string; batchYear?: string; degree?: string }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    let deptId = data.departmentId;
    let degree = data.degree;

    if (!deptId) {
      await ensureDefaultDepartments();
      const defaultDept = await prisma.department.findFirst();
      if (defaultDept) {
        deptId = defaultDept.id;
        degree = defaultDept.degree;
      }
    }

    const student = await prisma.student.create({
      data: {
        registerNumber: data.registerNumber,
        name: data.name,
        batch: data.batch,
        batchYear: data.batchYear || "2023 - 2026",
        degree: degree || "B.Sc. Computer Science",
        departmentId: deptId,
      }
    });
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

export async function updateResultMarks(resultId: string, internalMarks: number, externalMarks: number) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    const total = internalMarks + externalMarks;
    const { grade, pass } = calculateGrade(total);

    const updated = await prisma.result.update({
      where: { id: resultId },
      data: {
        internalMarks,
        externalMarks,
        total,
        grade,
        passStatus: pass,
      },
    });

    revalidatePath(`/students/${updated.studentId}`);
    revalidatePath("/students");
    revalidatePath("/");
    return { success: true, result: updated };
  } catch (error) {
    return { success: false, error: "Failed to update marks." };
  }
}

export async function getAllStudents() {
  await ensureDefaultDepartments();
  try {
    return await prisma.student.findMany({
      include: {
        department: true,
        results: true,
      },
      orderBy: { registerNumber: "asc" },
    });
  } catch (e) {
    return await prisma.student.findMany({
      include: {
        results: true,
      },
      orderBy: { registerNumber: "asc" },
    });
  }
}

export async function getAllSemesters() {
  return await prisma.semester.findMany({
    orderBy: { number: "asc" },
  });
}

export async function getAllSubjects() {
  try {
    return await prisma.subject.findMany({
      include: {
        semester: true,
        department: true,
      },
      orderBy: { code: "asc" },
    });
  } catch (e) {
    return await prisma.subject.findMany({
      include: {
        semester: true,
      },
      orderBy: { code: "asc" },
    });
  }
}

export async function getAllResultsDetailed() {
  try {
    return await prisma.result.findMany({
      include: {
        student: {
          include: {
            department: true,
          }
        },
        subject: {
          include: {
            semester: true,
          }
        }
      },
      orderBy: [
        { student: { registerNumber: "asc" } },
        { subject: { code: "asc" } }
      ]
    });
  } catch (e) {
    return await prisma.result.findMany({
      include: {
        student: true,
        subject: {
          include: {
            semester: true,
          }
        }
      },
      orderBy: [
        { student: { registerNumber: "asc" } },
        { subject: { code: "asc" } }
      ]
    });
  }
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
  await ensureDefaultDepartments();
  let students: any[] = [];
  try {
    students = await prisma.student.findMany({
      include: {
        department: true,
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
  } catch (err) {
    students = await prisma.student.findMany({
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
  }

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

    // Calculate CGPA & Part-wise CGPAs
    let totalCredits = 0;
    let totalEarnedPoints = 0;

    let p1Credits = 0, p1Points = 0;
    let p2Credits = 0, p2Points = 0;
    let p3Credits = 0, p3Points = 0;

    student.results.forEach((result: any) => {
      const sub = result.subject;
      const code = sub.code.toUpperCase();
      const credits = sub.credits || 0;
      let gp = 0;
      switch (result.grade) {
        case 'O': gp = 10; break;
        case 'A+': gp = 9; break;
        case 'A': gp = 8; break;
        case 'B+': gp = 7; break;
        case 'B': gp = 6; break;
        case 'C': gp = 5; break;
        default: gp = 0;
      }

      totalCredits += credits;
      totalEarnedPoints += (credits * gp);

      const isLang = code.includes('ULE') || code.includes('ULT') || code.includes('ULU');
      const isCoreOrAllied = code.includes('UCS') || code.includes('UPCS') || code.includes('UECS') || code.includes('CC') || code.includes('EC');

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

    const cgpa = totalCredits > 0 ? Number((totalEarnedPoints / totalCredits).toFixed(2)) : 0;
    const part1Cgpa = p1Credits > 0 ? Number((p1Points / p1Credits).toFixed(2)) : 0;
    const part2Cgpa = p2Credits > 0 ? Number((p2Points / p2Credits).toFixed(2)) : 0;
    const part3Cgpa = p3Credits > 0 ? Number((p3Points / p3Credits).toFixed(2)) : 0;

    // Calculate Semester-over-Semester SGPA Growth
    const semSgpas: Record<number, number> = {};
    Object.keys(semResultsMap).forEach((semStr) => {
      const semNum = Number(semStr);
      const items = semResultsMap[semNum];
      const semCredits = items.reduce((acc, c) => acc + c.credits, 0);
      const semPoints = items.reduce((acc, c) => acc + (c.credits * c.gradePoints), 0);
      semSgpas[semNum] = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;
    });

    const activeSems = Object.keys(semSgpas).map(Number).sort((a, b) => a - b);
    let initialSemSgpa = activeSems.length > 0 ? semSgpas[activeSems[0]] : 0;
    let latestSemSgpa = activeSems.length > 0 ? semSgpas[activeSems[activeSems.length - 1]] : 0;
    
    let overallGrowth = Number((latestSemSgpa - initialSemSgpa).toFixed(2));
    let growthPercentage = initialSemSgpa > 0 ? Number(((overallGrowth / initialSemSgpa) * 100).toFixed(1)) : 0;

    let latestGrowth = 0;
    if (activeSems.length >= 2) {
      const prevSem = semSgpas[activeSems[activeSems.length - 2]];
      latestGrowth = Number((latestSemSgpa - prevSem).toFixed(2));
    }

    return {
      id: student.id,
      registerNumber: student.registerNumber,
      name: student.name,
      batch: student.batch,
      batchYear: student.batchYear || "2023 - 2026",
      degree: student.degree || "B.Sc. Computer Science",
      department: student.department,
      departmentId: student.departmentId,
      results: student.results,
      metrics: {
        cgpa,
        part1Cgpa,
        part2Cgpa,
        part3Cgpa,
        semSgpas,
        initialSemSgpa,
        latestSemSgpa,
        overallGrowth,
        latestGrowth,
        growthPercentage,
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

export async function getAllClearStudentsWithReports() {
  await ensureDefaultDepartments();
  const students = await getStudentsWithMetrics();

  // Filter only all-clear students (hasArrear === false and totalSubjectsCount > 0)
  const allClear = students.filter(
    (s: any) => s.metrics.totalSubjectsCount > 0 && !s.metrics.hasArrear
  );

  // Sort by CGPA descending
  allClear.sort((a: any, b: any) => b.metrics.cgpa - a.metrics.cgpa);

  // Assign Ranks
  allClear.forEach((s: any, idx: number) => {
    s.rank = idx + 1;
  });

  return allClear;
}
