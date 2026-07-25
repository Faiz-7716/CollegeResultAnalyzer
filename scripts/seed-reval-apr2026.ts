import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

interface RevalEntry {
  reg: string;
  name: string;
  code: string;
  internal: number;
  external: number;
  total: number;
  sem: number;
  credits: number;
  subjectName: string;
}

const revalUpdates: RevalEntry[] = [
  // 31924U18001 AKASH C
  {
    reg: "31924U18001",
    name: "AKASH C",
    code: "23USCS43",
    internal: 22,
    external: 30,
    total: 52,
    sem: 4,
    credits: 2,
    subjectName: "SKILL BASED SUBJECT III",
  },
  // 31924U18004 LITHISHWARAN V
  {
    reg: "31924U18004",
    name: "LITHISHWARAN V",
    code: "23ULE40",
    internal: 16,
    external: 30,
    total: 46,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION ENGLISH IV",
  },
  // 31924U18007 MOHAMAD ZABIULLA S
  {
    reg: "31924U18007",
    name: "MOHAMAD ZABIULLA S",
    code: "23UCS41",
    internal: 20,
    external: 30,
    total: 50,
    sem: 4,
    credits: 4,
    subjectName: "JAVA PROGRAMMING",
  },
  {
    reg: "31924U18007",
    name: "MOHAMAD ZABIULLA S",
    code: "23USCS43",
    internal: 22,
    external: 31,
    total: 53,
    sem: 4,
    credits: 2,
    subjectName: "SKILL BASED SUBJECT III",
  },
  // 31924U18014 MOHAMMED IRBAZ I
  {
    reg: "31924U18014",
    name: "MOHAMMED IRBAZ I",
    code: "23UCS41",
    internal: 18,
    external: 31,
    total: 49,
    sem: 4,
    credits: 4,
    subjectName: "JAVA PROGRAMMING",
  },
  {
    reg: "31924U18014",
    name: "MOHAMMED IRBAZ I",
    code: "23ULE40",
    internal: 19,
    external: 30,
    total: 49,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION ENGLISH IV",
  },
  // 31924U18020 MOHAMMED SUFIYAN A
  {
    reg: "31924U18020",
    name: "MOHAMMED SUFIYAN A",
    code: "23ULE40",
    internal: 21,
    external: 32,
    total: 53,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION ENGLISH IV",
  },
  {
    reg: "31924U18020",
    name: "MOHAMMED SUFIYAN A",
    code: "23ULU40",
    internal: 22,
    external: 30,
    total: 52,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION URDU IV",
  },
  // 31924U18025 SAIRAJ M
  {
    reg: "31924U18025",
    name: "SAIRAJ M",
    code: "23ULE40",
    internal: 20,
    external: 32,
    total: 52,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION ENGLISH IV",
  },
  // 31924U18030 SHARIF UMER N
  {
    reg: "31924U18030",
    name: "SHARIF UMER N",
    code: "23ULE40",
    internal: 17,
    external: 35,
    total: 52,
    sem: 4,
    credits: 3,
    subjectName: "FOUNDATION ENGLISH IV",
  },
];

async function main() {
  console.log("🚀 Starting Revaluation Updates - April/May 2026 Examinations...");

  // 1. Ensure Semester 4 exists
  let sem4 = await prisma.semester.findUnique({ where: { number: 4 } });
  if (!sem4) {
    sem4 = await prisma.semester.create({ data: { number: 4 } });
    console.log("✨ Created Semester 4 in database.");
  }

  let updateCount = 0;

  for (const item of revalUpdates) {
    // 2. Find Student
    const student = await prisma.student.findUnique({
      where: { registerNumber: item.reg },
    });

    if (!student) {
      console.log(`⚠️ Student not found: ${item.reg} (${item.name})`);
      continue;
    }

    // 3. Find or Create Subject
    let subject = await prisma.subject.findUnique({
      where: { code: item.code },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          code: item.code,
          name: item.subjectName,
          credits: item.credits,
          semesterId: sem4.id,
        },
      });
      console.log(`✨ Created Subject: ${item.code} - ${item.subjectName}`);
    }

    // 4. Calculate Grade & Pass Status
    const { grade } = calculateGrade(item.total);

    // 5. Upsert Result Record
    await prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        },
      },
      update: {
        internalMarks: item.internal,
        externalMarks: item.external,
        total: item.total,
        grade: grade,
        passStatus: true,
      },
      create: {
        studentId: student.id,
        subjectId: subject.id,
        internalMarks: item.internal,
        externalMarks: item.external,
        total: item.total,
        grade: grade,
        passStatus: true,
      },
    });

    console.log(
      `✅ Updated ${item.reg} (${item.name}) -> ${item.code} | Int: ${item.internal} | Ext: ${item.external} | Total: ${item.total} | Grade: ${grade} | PASS`
    );
    updateCount++;
  }

  console.log(`\n🎉 Revaluation processing complete! ${updateCount} paper results updated to PASS.`);
}

main()
  .catch((e) => {
    console.error("❌ Error applying revaluation updates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
