import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const updates = [
  { reg: "31924U18001", code: "23UCS21", marks: 47 },
  { reg: "31924U18001", code: "23ULT30", marks: 54 },
  { reg: "31924U18005", code: "23USCS13", marks: 53 },
  { reg: "31924U18007", code: "23UECS12A", marks: 52 },
  { reg: "31924U18010", code: "23UCS11", marks: 51 },
  { reg: "31924U18010", code: "23UECS32A", marks: 51 },
  { reg: "31924U18013", code: "23USCS13", marks: 50 },
  { reg: "31924U18014", code: "23UCS21", marks: 49 },
  { reg: "31924U18014", code: "23UECS32A", marks: 49 },
  { reg: "31924U18015", code: "23ULE20", marks: 47 },
  { reg: "31924U18020", code: "23USCS23", marks: 49 },
  { reg: "31924U18022", code: "23UFCS14", marks: 47 },
  { reg: "31924U18022", code: "23UCS21", marks: 47 },
  { reg: "31924U18027", code: "23UECS12A", marks: 57 },
  { reg: "31924U18028", code: "23UCS11", marks: 46 },
  { reg: "31924U18028", code: "23UECS32A", marks: 53 },
  { reg: "31924U18029", code: "23UFCS14", marks: 63 },
  { reg: "31924U18029", code: "23USCS13", marks: 50 },
  { reg: "31924U18030", code: "23UCS21", marks: 49 },
  { reg: "31924U18030", code: "23UCS31", marks: 49 }
];

async function main() {
  console.log("Applying final revaluation clearances...");
  let count = 0;
  for (const u of updates) {
    const student = await prisma.student.findUnique({ where: { registerNumber: u.reg } });
    if (!student) {
      console.log("⚠️ Student not found:", u.reg);
      continue;
    }

    const subject = await prisma.subject.findUnique({ where: { code: u.code } });
    if (!subject) {
      console.log("⚠️ Subject not found:", u.code);
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

    console.log(`✅ Updated ${u.reg} - ${u.code} to ${u.marks} PASS`);
    count++;
  }
  console.log(`Successfully applied ${count} revaluation updates!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
