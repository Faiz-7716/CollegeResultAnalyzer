import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const updates = [
  // Semester 1
  { reg: "31924U18005", code: "23USCS13", marks: 53 },
  { reg: "31924U18007", code: "23UECS12A", marks: 52 },
  { reg: "31924U18010", code: "23UCS11", marks: 51 },
  { reg: "31924U18013", code: "23USCS13", marks: 50 },
  { reg: "31924U18022", code: "23UFCS14", marks: 47 },
  { reg: "31924U18027", code: "23UECS12A", marks: 57 },
  { reg: "31924U18028", code: "23UCS11", marks: 46 },
  { reg: "31924U18029", code: "23UFCS14", marks: 63 },
  { reg: "31924U18029", code: "23USCS13", marks: 50 },

  // Semester 2
  { reg: "31924U18001", code: "23UCS21", marks: 47 },
  { reg: "31924U18014", code: "23UCS21", marks: 49 },
  { reg: "31924U18015", code: "23ULE20", marks: 47 },
  { reg: "31924U18020", code: "23USCS23", marks: 49 },
  { reg: "31924U18022", code: "23UCS21", marks: 47 },
  { reg: "31924U18030", code: "23UCS21", marks: 49 },

  // Semester 3
  { reg: "31924U18001", code: "23ULT30", marks: 54 },
  { reg: "31924U18010", code: "23UECS32A", marks: 51 },
  { reg: "31924U18014", code: "23UECS32A", marks: 49 },
  { reg: "31924U18028", code: "23UECS32A", marks: 53 },
  { reg: "31924U18030", code: "23UCS31", marks: 49 },
];

const seniors = [
  // Sem 5
  { name: "Inamul Hasan P M", code: "23UCS51", marks: 44, sem: 5 },
  { name: "Md Zabeehullah Roomy S", code: "23UCS51", marks: 44, sem: 5 },
  { name: "Mohammed Aqueel S", code: "23UCS51", marks: 66, sem: 5 },
  { name: "Mohammed Maaz N", code: "23UCS51", marks: 56, sem: 5 },
  { name: "Yoga V", code: "23UCS51", marks: 48, sem: 5 },
  
  { name: "Adnan Yasar N", code: "23UCS52", marks: 49, sem: 5 },
  { name: "Gokula Krishnan R", code: "23UCS52", marks: 57, sem: 5 },
  { name: "Mohammed Hannan N", code: "23UCS52", marks: 58, sem: 5 },
  { name: "Mohammed Maaz N", code: "23UCS52", marks: 55, sem: 5 },
  { name: "Mohammed Samman V", code: "23UCS52", marks: 53, sem: 5 },
  
  { name: "Mohammed Hamaas N", code: "23UECS53A", marks: 67, sem: 5 },

  // Sem 4
  { name: "Yoga V", code: "23UECS42A", marks: 51, sem: 4 },
  { name: "Yoga V", code: "23USCS43", marks: 53, sem: 4 },
  { name: "Tajudeen M", code: "23ULT40", marks: 51, sem: 4 },

  // Sem 3
  { name: "Kamran K", code: "23UCS31", marks: 63, sem: 3 },
  { name: "Adnan Yasar N", code: "23UECS32A", marks: 49, sem: 3 },
  { name: "Chiya Mohammed Saihaan", code: "23UECS32A", marks: 63, sem: 3 },
  { name: "Md Faizan V", code: "23USCS33", marks: 64, sem: 3 },
  { name: "Md Zabeehullah Roomy S", code: "23ULE30", marks: 53, sem: 3 },
  { name: "Mohammed Rashid H", code: "23ULE30", marks: 51, sem: 3 },
  { name: "Shahid Afridi C", code: "23UES30", marks: 53, sem: 3 },
  { name: "Tajudeen M", code: "23ULT30", marks: 49, sem: 3 },
  { name: "Mohammed Moinuddin M", code: "23ULU30", marks: 46, sem: 3 },
];

async function main() {
  // 1. Process 31924U Batch Revaluations
  for (const u of updates) {
    const student = await prisma.student.findUnique({ where: { registerNumber: u.reg } });
    if (!student) {
      console.log("Student not found:", u.reg);
      continue;
    }

    const subject = await prisma.subject.findUnique({ where: { code: u.code } });
    if (!subject) {
      console.log("Subject not found:", u.code);
      continue;
    }

    const { grade } = calculateGrade(u.marks);

    await prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        },
      },
      update: {
        total: u.marks,
        externalMarks: u.marks,
        grade: grade,
        passStatus: true,
      },
      create: {
        studentId: student.id,
        subjectId: subject.id,
        total: u.marks,
        externalMarks: u.marks,
        internalMarks: 0,
        grade: grade,
        passStatus: true,
      },
    });

    console.log(`Updated ${u.reg} ${u.code} to ${u.marks} PASS`);
  }

  // 2. Process 31923U Batch (Seniors)
  // We'll auto-generate a Reg No starting with 31923U18001
  let seniorRegCounter = 1;
  const seniorNameToReg: Record<string, string> = {};

  for (const s of seniors) {
    if (!seniorNameToReg[s.name]) {
      seniorNameToReg[s.name] = `31923U180${seniorRegCounter.toString().padStart(2, '0')}`;
      seniorRegCounter++;
    }
    const regNo = seniorNameToReg[s.name];

    const student = await prisma.student.upsert({
      where: { registerNumber: regNo },
      update: {},
      create: { registerNumber: regNo, name: s.name, batch: "2023-2026" },
    });

    const semester = await prisma.semester.upsert({
      where: { number: s.sem },
      update: {},
      create: { number: s.sem },
    });

    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: { code: s.code, name: s.code, credits: 4, semesterId: semester.id },
    });

    const { grade } = calculateGrade(s.marks);

    await prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        },
      },
      update: {
        total: s.marks,
        externalMarks: s.marks,
        grade: grade,
        passStatus: true,
      },
      create: {
        studentId: student.id,
        subjectId: subject.id,
        total: s.marks,
        externalMarks: s.marks,
        internalMarks: 0,
        grade: grade,
        passStatus: true,
      },
    });

    console.log(`Added Senior: ${student.name} (${regNo}) - ${s.code} ${s.marks}`);
  }

  console.log("Revaluation processing complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
