import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const subjects = [
  "23UCS31", // Python Theory
  "23UPCS35", // Python Lab
  "23UECS32A", // Stats I
  "23ULE30", // English III
  "LANG3", // Placeholder for ULU/ULT30
  "23UES30", // EVS
  "23USCS33", // Internet
  "24UNM30A", // NME
];

async function main() {
  const lines = fs.readFileSync(path.join(__dirname, "sem3.txt"), "utf-8").trim().split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    // Pattern: RegNo (11 chars), Name (letters/spaces/dots), 8 scores (max 100, optional " (RA)")
    const scorePattern = `(100|\\d{1,2})(?:\\s*\\(RA\\))?`;
    const regex = new RegExp(`^(31924U180\\d\\d)([A-Z\\s\\.]+?)${scorePattern}${scorePattern}${scorePattern}${scorePattern}${scorePattern}${scorePattern}${scorePattern}${scorePattern}$`);

    const match = line.match(regex);
    if (!match) {
      console.error("Failed to parse line:", line);
      continue;
    }

    const registerNumber = match[1];
    const name = match[2].trim();
    const scores = match.slice(3, 11).map((s, i) => {
      // Look at the original string slice to check if it had (RA)
      const isRA = line.includes(`${s} (RA)`); // rough check, but better to match the full group
      return s;
    });

    // Actually, match array gives the captured group, which is JUST the number because `(100|\\d{1,2})` is the capturing group, and `(?:\\s*\\(RA\\))?` is outside!
    // Wait! Let's capture the whole score block to see if it has RA.
    // Let's use `((?:100|\\d{1,2})(?:\\s*\\(RA\\))?)`
    // Let me redefine regex:
    const betterScorePattern = `((?:100|\\d{1,2})(?:\\s*\\(RA\\))?)`;
    const betterRegex = new RegExp(`^(31924U180\\d\\d)([A-Z\\s\\.]+?)${betterScorePattern}${betterScorePattern}${betterScorePattern}${betterScorePattern}${betterScorePattern}${betterScorePattern}${betterScorePattern}${betterScorePattern}$`);
    
    const betterMatch = line.match(betterRegex);
    if (!betterMatch) {
       console.error("Failed better match:", line);
       continue;
    }

    const studentScores = betterMatch.slice(3, 11).map(s => {
      return {
        total: parseInt(s.replace("(RA)", "").trim(), 10),
        isRA: s.includes("RA")
      };
    });

    console.log(`Parsed ${registerNumber} - ${name}`);

    // Upsert Student
    const student = await prisma.student.upsert({
      where: { registerNumber },
      update: {},
      create: { registerNumber, name, batch: "2024-2027" },
    });

    // Upsert Semester
    const semester = await prisma.semester.upsert({
      where: { number: 3 },
      update: {},
      create: { number: 3 },
    });

    // Check student's previous language subject to determine ULU30 vs ULT30
    let langCode = "23ULT30"; // default
    const existingLang = await prisma.result.findFirst({
        where: {
            studentId: student.id,
            subject: {
                code: { in: ['23ULU10', '23ULU20', '23ULT10', '23ULT20'] }
            }
        },
        include: { subject: true }
    });

    if (existingLang && existingLang.subject.code.includes('ULU')) {
        langCode = "23ULU30";
    }

    // Insert results
    for (let i = 0; i < 8; i++) {
        let subjectCode = subjects[i];
        if (subjectCode === "LANG3") subjectCode = langCode;

        const scoreObj = studentScores[i];
        
        const subject = await prisma.subject.upsert({
            where: { code: subjectCode },
            update: {},
            create: { code: subjectCode, name: subjectCode, credits: 4, semesterId: semester.id }
        });

        // Calculate pass/fail. Since these are totals, we can't accurately split internal/external.
        // We'll set external to the total and internal to 0. 
        // Pass status is determined by RA.
        let pass = !scoreObj.isRA;
        let grade = "U";
        
        if (pass) {
            const calculated = calculateGrade(scoreObj.total);
            grade = calculated.grade;
        }

        await prisma.result.upsert({
            where: {
                studentId_subjectId: {
                    studentId: student.id,
                    subjectId: subject.id,
                }
            },
            update: {
                total: scoreObj.total,
                externalMarks: scoreObj.total,
                internalMarks: 0,
                grade: grade,
                passStatus: pass,
            },
            create: {
                studentId: student.id,
                subjectId: subject.id,
                total: scoreObj.total,
                externalMarks: scoreObj.total,
                internalMarks: 0,
                grade: grade,
                passStatus: pass,
            }
        });
    }
  }

  console.log("Semester 3 specific seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
