import prisma from "../lib/prisma";

const subjectUpdates = [
  // Semester 1
  { code: '23ULE10', name: 'English I', credits: 3 },
  { code: '23ULT10', name: 'Tamil I', credits: 3 },
  { code: '23ULU10', name: 'Urdu I', credits: 3 },
  { code: '23UCS11', name: 'Core Course I', credits: 5 },
  { code: '23UPCS15', name: 'Core Practical I', credits: 5 },
  { code: '23UECS12A', name: 'Elective I', credits: 3 },
  { code: '23USCS13', name: 'Skill Enhancement Course I', credits: 2 },
  { code: '23UFCS14', name: 'Foundation Course I', credits: 2 },

  // Semester 3
  { code: '23ULE30', name: 'English III', credits: 3 },
  { code: '23ULT30', name: 'Tamil III', credits: 3 },
  { code: '23ULU30', name: 'Urdu III', credits: 3 },
  { code: '23UCS31', name: 'Python Programming', credits: 5 },
  { code: '23UPCS35', name: 'Python Programming Lab', credits: 5 },
  { code: '23UECS32A', name: 'Statistical Methods and their Applications - I', credits: 3 },
  { code: '23USCS33', name: 'Fundamentals of Information Technology', credits: 2 },
  { code: '23UES30', name: 'Environmental Studies', credits: 2 },
  { code: '23UNM30B', name: 'Non-Major Elective', credits: 2 },

  // Semester 4
  { code: '23ULE40', name: 'English IV', credits: 3 },
  { code: '23ULT40', name: 'Tamil IV', credits: 3 },
  { code: '23ULU40', name: 'Urdu IV', credits: 3 },
  { code: '23UCS41', name: 'Java Programming', credits: 5 },
  { code: '23UPCS45', name: 'Java Programming Lab', credits: 5 },
  { code: '23UECS42A', name: 'Statistical Methods and their Applications - II', credits: 3 },
  { code: '23USCS43', name: 'Web Designing', credits: 2 },
  { code: '23UPCS46', name: 'Skill Enhancement Practical', credits: 2 },
  { code: '24UNM40A', name: 'Non-Major Elective', credits: 2 },
];

async function main() {
  console.log("Starting data training and cleanup...");

  // 1. Delete results of students not in 31924U180 first, then the students
  const nonTargetStudents = await prisma.student.findMany({
    where: { batch: { not: "31924U180" } },
    select: { id: true }
  });

  if (nonTargetStudents.length > 0) {
    const studentIds = nonTargetStudents.map(s => s.id);
    
    await prisma.result.deleteMany({
      where: { studentId: { in: studentIds } }
    });

    const deletedStudents = await prisma.student.deleteMany({
      where: { id: { in: studentIds } }
    });
    console.log(`Deleted ${deletedStudents.count} students not belonging to batch 31924U180.`);
  } else {
    console.log("No students outside of 31924U180 batch found.");
  }

  // 2. Update subject configurations
  let updatedSubjects = 0;
  for (const sub of subjectUpdates) {
    // Only update if the subject actually exists in the DB right now
    const existing = await prisma.subject.findUnique({
      where: { code: sub.code }
    });
    
    if (existing) {
      await prisma.subject.update({
        where: { code: sub.code },
        data: {
          name: sub.name,
          credits: sub.credits
        }
      });
      updatedSubjects++;
      console.log(`Updated subject: ${sub.code} - ${sub.name} (${sub.credits} credits)`);
    } else {
      // Create it just in case we need it for later
      // We need a semester ID, so let's try to infer it.
      const match = sub.code.match(/[A-Z]+(\d)/);
      const semNumber = match ? parseInt(match[1]) : 1;
      
      const semester = await prisma.semester.upsert({
        where: { number: semNumber },
        update: {},
        create: { number: semNumber }
      });

      await prisma.subject.create({
        data: {
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          semesterId: semester.id
        }
      });
      updatedSubjects++;
      console.log(`Created missing subject: ${sub.code} - ${sub.name} (${sub.credits} credits)`);
    }
  }

  console.log(`Successfully trained and configured ${updatedSubjects} subjects.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
