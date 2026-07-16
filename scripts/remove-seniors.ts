import prisma from "../lib/prisma";

async function main() {
  // Delete results for non-31924U180 students
  await prisma.result.deleteMany({
    where: {
      student: {
        NOT: {
          registerNumber: {
            startsWith: '31924U180'
          }
        }
      }
    }
  });

  // Then delete the students
  const result = await prisma.student.deleteMany({
    where: {
      NOT: {
        registerNumber: {
          startsWith: '31924U180'
        }
      }
    }
  });
  console.log(`Deleted ${result.count} students that are not in the 31924U180 batch.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
