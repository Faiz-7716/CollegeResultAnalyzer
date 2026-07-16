import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

async function main() {
  const dataPath = path.join(__dirname, "data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("data.json not found!");
    return;
  }

  const students = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const s of students) {
    console.log(`Processing student: ${s.registerNumber} - ${s.name}`);

    // Upsert student
    const student = await prisma.student.upsert({
      where: { registerNumber: s.registerNumber },
      update: { name: s.name, batch: s.batch },
      create: { registerNumber: s.registerNumber, name: s.name, batch: s.batch },
    });

    for (const r of s.results) {
      // Infer semester from subject code (e.g., 23UCS31 -> 3)
      const match = r.code.match(/[A-Z]+(\d)/);
      const semNumber = match ? parseInt(match[1]) : 1;

      // Upsert semester
      const semester = await prisma.semester.upsert({
        where: { number: semNumber },
        update: {},
        create: { number: semNumber },
      });

      // Upsert subject (defaulting to 4 credits for now)
      const subject = await prisma.subject.upsert({
        where: { code: r.code },
        update: {}, // Don't override if already exists with real name/credits
        create: {
          code: r.code,
          name: r.code, // Fallback to code as name if unknown
          credits: 4,
          semesterId: semester.id,
        },
      });

      // Handle AAA or MP grades
      let internal = r.internalMarks;
      let external = r.externalMarks;
      if (typeof internal !== "number" || isNaN(internal)) internal = 0;
      if (typeof external !== "number" || isNaN(external)) external = 0;

      const total = internal + external;
      
      // Calculate grade unless it's explicitly given as AAA (Absent)
      let { grade, pass } = calculateGrade(total);
      if (r.internalMarks === "AAA" || r.externalMarks === "AAA" || r.internalMarks === "MP" || r.externalMarks === "MP") {
         grade = "U";
         pass = false;
      }

      // Upsert result
      await prisma.result.upsert({
        where: {
          studentId_subjectId: {
            studentId: student.id,
            subjectId: subject.id,
          },
        },
        update: {
          internalMarks: internal,
          externalMarks: external,
          total,
          grade,
          passStatus: pass,
        },
        create: {
          studentId: student.id,
          subjectId: subject.id,
          internalMarks: internal,
          externalMarks: external,
          total,
          grade,
          passStatus: pass,
        },
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
