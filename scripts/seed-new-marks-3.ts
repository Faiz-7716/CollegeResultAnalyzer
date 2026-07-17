import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const rawData = `
31924U18025 — SAIRAJ M
23UCS21: Internal: 25 | External: 30 | Total: 55 | PASS

23UECS22A: Internal: 21 | External: 32 | Total: 53 | PASS

23ULE20: Internal: 22 | External: 34 | Total: 56 | PASS

23ULT20: Internal: 25 | External: 35 | Total: 60 | PASS

23UPCS25: Internal: 25 | External: 75 | Total: 100 | PASS

23USCS23: Internal: 21 | External: 43 | Total: 64 | PASS

24UNM20: Internal: 25 | External: 73 | Total: 98 | PASS

31924U18026 — SANJAY S
23UCS11: Internal: 16 | External: 1 | Total: 17 | RA

23UCS21: Internal: 14 | External: 0 | Total: 14 | RA

23UECS12A: Internal: 13 | External: AAA | Total: AAA | AAA

23UECS22A: Internal: 13 | External: 1 | Total: 14 | RA

23UFCS14: Internal: 14 | External: 5 | Total: 19 | RA

23ULE10: Internal: 13 | External: 30 | Total: 43 | PASS

23ULE20: Internal: 14 | External: 8 | Total: 22 | RA

23ULT10: Internal: 22 | External: 10 | Total: 32 | RA

23ULT20: Internal: 21 | External: 30 | Total: 51 | PASS

23UPCS25: Internal: 21 | External: 30 | Total: 51 | PASS

23USCS13: Internal: 13 | External: AAA | Total: AAA | AAA

23USCS23: Internal: 15 | External: 9 | Total: 24 | RA

24UNM20: Internal: 21 | External: 66 | Total: 87 | PASS

31924U18027 — SARANRAJ S
23UCS21: Internal: 22 | External: 54 | Total: 76 | PASS

23UECS22A: Internal: 22 | External: 61 | Total: 83 | PASS

23ULE20: Internal: 24 | External: 44 | Total: 68 | PASS

23ULT20: Internal: 25 | External: 40 | Total: 65 | PASS

23UPCS25: Internal: 25 | External: 75 | Total: 100 | PASS

23USCS23: Internal: 21 | External: 66 | Total: 87 | PASS

24UNM20: Internal: 25 | External: 73 | Total: 98 | PASS

31924U18028 — SAYED MUHAMMED MOHATHASEEM
23UCS21: Internal: 16 | External: 3 | Total: 19 | RA

23UECS22A: Internal: 13 | External: 11 | Total: 24 | RA

23UFCS14: Internal: 14 | External: 10 | Total: 24 | RA

23ULE10: Internal: 15 | External: 35 | Total: 50 | PASS

23ULE20: Internal: 14 | External: 32 | Total: 46 | PASS

23ULU20: Internal: 20 | External: 37 | Total: 57 | PASS

23UPCS25: Internal: 24 | External: 38 | Total: 62 | PASS

23USCS23: Internal: 18 | External: 7 | Total: 25 | RA

24UNM20: Internal: 23 | External: 64 | Total: 87 | PASS

31924U18029 — SEHAL AHMED T
23UCS21: Internal: 16 | External: 54 | Total: 70 | PASS

23UECS22A: Internal: 14 | External: 37 | Total: 51 | PASS

23ULE20: Internal: 20 | External: 36 | Total: 56 | PASS

23ULU20: Internal: 24 | External: 51 | Total: 75 | PASS

23UPCS25: Internal: 24 | External: 70 | Total: 94 | PASS

23USCS23: Internal: 16 | External: 38 | Total: 54 | PASS

24UNM20: Internal: 23 | External: 67 | Total: 90 | PASS

31924U18030 — SHARIF UMER N
23UCS21: Internal: 17 | External: 17 | Total: 34 | RA

23UECS22A: Internal: 15 | External: 18 | Total: 33 | RA

23ULE20: Internal: 17 | External: 14 | Total: 31 | RA

23ULU20: Internal: 23 | External: 52 | Total: 75 | PASS

23UPCS25: Internal: 24 | External: 62 | Total: 86 | PASS

23USCS13: Internal: 15 | External: 9 | Total: 24 | RA

23USCS23: Internal: 17 | External: 11 | Total: 28 | RA

24UNM20: Internal: 21 | External: 61 | Total: 82 | PASS
`;

async function main() {
  console.log("Starting to parse raw data...");
  let count = 0;
  
  // Find all students
  const studentRegex = /(31924U180\d{2}) — (.*?)(?=\n|$)/g;
  const matchArr = [...rawData.matchAll(studentRegex)];
  
  for (let i = 0; i < matchArr.length; i++) {
    const regNo = matchArr[i][1];
    const name = matchArr[i][2].trim();
    
    // Extract block for this student
    const startIndex = matchArr[i].index! + matchArr[i][0].length;
    const endIndex = i + 1 < matchArr.length ? matchArr[i+1].index! : rawData.length;
    
    const studentData = rawData.substring(startIndex, endIndex);
    
    // Extract subject records
    const subjectRegex = /(\d{2}[A-Z0-9]+): Internal: (AAA|\d+) \| External: (AAA|\d+) \| Total: (AAA|\d+) \| (PASS|RA|AAA)/g;
    const records = [...studentData.matchAll(subjectRegex)];
    
    const student = await prisma.student.findUnique({ where: { registerNumber: regNo } });
    if (!student) {
      console.log(`⚠️ Student not found: ${regNo}`);
      continue;
    }
    
    for (const record of records) {
      const code = record[1];
      const intStr = record[2];
      const extStr = record[3];
      const totStr = record[4];
      const passStatusStr = record[5];
      
      const internal = intStr === "AAA" ? 0 : parseInt(intStr);
      const external = extStr === "AAA" ? 0 : parseInt(extStr);
      const total = totStr === "AAA" ? 0 : parseInt(totStr);
      const passStatus = passStatusStr === "PASS";
      
      // Upsert subject if not found
      let subject = await prisma.subject.findUnique({ where: { code } });
      if (!subject) {
        const match = code.match(/[A-Z]+(\d)/);
        const semNumber = match ? parseInt(match[1]) : 1;
        
        const semester = await prisma.semester.upsert({
          where: { number: semNumber },
          update: {},
          create: { number: semNumber },
        });

        subject = await prisma.subject.create({
          data: {
            code,
            name: code,
            credits: 4,
            semesterId: semester.id,
          }
        });
        console.log(`✨ Created new subject: ${code}`);
      }
      
      let grade = "U";
      if (passStatusStr === "AAA") {
        grade = "AAA";
      } else {
        const result = calculateGrade(total);
        grade = result.grade;
      }
      
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
          total: total,
          grade: grade,
          passStatus: passStatus,
        },
        create: {
          studentId: student.id,
          subjectId: subject.id,
          internalMarks: internal,
          externalMarks: external,
          total: total,
          grade: grade,
          passStatus: passStatus,
        },
      });
      
      console.log(`✅ Updated ${regNo} - ${code}`);
      count++;
    }
  }
  
  console.log(`Successfully processed ${count} mark entries!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
