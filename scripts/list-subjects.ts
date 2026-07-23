import prisma from "../lib/prisma";

async function main() {
  const subjects = await prisma.subject.findMany();
  console.log("ALL SUBJECTS:");
  subjects.forEach(s => console.log(`${s.code} - ${s.name}`));
}

main().finally(() => prisma.$disconnect());
