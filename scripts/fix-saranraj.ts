import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const saranrajUpdates = [
  // Semester 1 (Nov/Dec 2024)
  { code: "23UCS11", internal: 21, external: 39, total: 60, sem: 1 },
  { code: "23UFCS14", internal: 22, external: 52, total: 74, sem: 1 },
  { code: "23ULE10", internal: 21, external: 45, total: 66, sem: 1 },
  { code: "23ULT10", internal: 24, external: 37, total: 61, sem: 1 },
  { code: "23UPCS15", internal: 23, external: 73, total: 96, sem: 1 },
  { code: "23USCS13", internal: 24, external: 40, total: 64, sem: 1 },
  { code: "23UECS12A", internal: 23, external: 34, total: 57, sem: 1 },

  // Semester 2 (Apr/May 2025)
  { code: "23USCS23", internal: 18, external: 48, total: 66, sem: 2 },
  { code: "23UECS22A", internal: 22, external: 61, total: 83, sem: 2 },
  { code: "23UCS21", internal: 22, external: 54, total: 76, sem: 2 },
  { code: "23ULT20", internal: 25, external: 40, total: 65, sem: 2 },
  { code: "23UPCS25", internal: 25, external: 75, total: 100, sem: 2 },
  { code: "24UNM20", internal: 25, external: 73, total: 98, sem: 2 },
  { code: "23ULE20", internal: 24, external: 52, total: 76, sem: 2 },
];

async function main() {
  const reg = "31924U18027";
  const name = "SARANRAJ S";

  const student = await prisma.student.findUnique({
    where: { registerNumber: reg }
  });

  if (!student) {
    console.error("Student not found!");
    return;
  }

  for (const u of saranrajUpdates) {
    const subject = await prisma.subject.upsert({
      where: { code: u.code },
      update: {},
      create: { code: u.code, name: u.code, credits: 4, semesterId: (await prisma.semester.findUnique({where: {number: u.sem}}))!.id },
    });

    const { grade } = calculateGrade(u.total);

    await prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        },
      },
      update: {
        internalMarks: u.internal,
        externalMarks: u.external,
        total: u.total,
        grade: grade,
        passStatus: true,
      },
      create: {
        studentId: student.id,
        subjectId: subject.id,
        internalMarks: u.internal,
        externalMarks: u.external,
        total: u.total,
        grade: grade,
        passStatus: true,
      },
    });

    console.log(`Updated ${reg} ${u.code} to ${u.total} PASS`);
  }

  console.log("Saranraj updates complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
