import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const updates = [
  // Saif Ali I
  { reg: "31924U18024", name: "SAIF ALI I", code: "23UECS12A", internal: 16, external: 58, total: 74, pass: true, sem: 1 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23UCS21", internal: 20, external: 49, total: 69, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23UECS22A", internal: 18, external: 59, total: 77, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23USCS23", internal: 18, external: 41, total: 59, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23ULT20", internal: 23, external: 54, total: 77, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23ULE20", internal: 24, external: 39, total: 63, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "23UPCS25", internal: 24, external: 68, total: 92, pass: true, sem: 2 },
  { reg: "31924U18024", name: "SAIF ALI I", code: "24UNM20", internal: 25, external: 66, total: 91, pass: true, sem: 2 },

  // Saranraj S
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UECS12A", internal: 0, external: 57, total: 57, pass: true, sem: 1 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UCS11", internal: 16, external: 1, total: 17, pass: false, sem: 1 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UFCS14", internal: 14, external: 5, total: 19, pass: false, sem: 1 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23ULE10", internal: 14, external: 19, total: 33, pass: false, sem: 1 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23ULT10", internal: 22, external: 10, total: 32, pass: false, sem: 1 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23USCS13", internal: 13, external: 0, total: 13, pass: false, forceU: true, sem: 1 }, // AAA means absent, definitely U grade
  
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UCS21", internal: 22, external: 54, total: 76, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UECS22A", internal: 22, external: 61, total: 83, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23USCS23", internal: 18, external: 48, total: 66, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23ULT20", internal: 25, external: 40, total: 65, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23UPCS25", internal: 25, external: 75, total: 100, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "24UNM20", internal: 25, external: 73, total: 98, pass: true, sem: 2 },
  { reg: "31924U18027", name: "SARANRAJ S", code: "23ULE20", internal: 24, external: 6, total: 30, pass: false, sem: 2 },
];

async function main() {
  for (const u of updates) {
    const student = await prisma.student.upsert({
      where: { registerNumber: u.reg },
      update: {},
      create: { registerNumber: u.reg, name: u.name, batch: "2024-2027" }
    });

    const semester = await prisma.semester.upsert({
      where: { number: u.sem },
      update: {},
      create: { number: u.sem },
    });

    const subject = await prisma.subject.upsert({
      where: { code: u.code },
      update: {},
      create: { code: u.code, name: u.code, credits: 4, semesterId: semester.id },
    });

    let grade = "U";
    if (u.pass && !u.forceU) {
      grade = calculateGrade(u.total).grade;
    }

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
        passStatus: u.pass,
      },
      create: {
        studentId: student.id,
        subjectId: subject.id,
        internalMarks: u.internal,
        externalMarks: u.external,
        total: u.total,
        grade: grade,
        passStatus: u.pass,
      },
    });

    console.log(`Updated ${u.reg} ${u.code} to ${u.total} (Pass: ${u.pass})`);
  }

  console.log("Specific updates complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
