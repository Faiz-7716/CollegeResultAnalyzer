import { getStudentsWithMetrics, getAllClearStudentsWithReports } from "../lib/actions";

async function main() {
  console.log("=== SYSTEM-WIDE STUDENT CGPA & PART 2 CGPA AUDIT ===");
  const allStudents = await getStudentsWithMetrics();
  const allClearStudents = await getAllClearStudentsWithReports();

  console.log(`Total Students: ${allStudents.length}`);
  console.log(`All-Clear Students: ${allClearStudents.length}\n`);

  console.log("RANK | REG NUMBER   | STUDENT NAME         | OVERALL CGPA | PART 2 (CORE+ALLIED) CGPA | CORE+ALLIED MARKS | TOTAL MARKS");
  console.log("------------------------------------------------------------------------------------------------------------------");

  allClearStudents.forEach((s: any) => {
    console.log(
      `#${String(s.rank).padEnd(3)} | ${s.registerNumber.padEnd(12)} | ${s.name.padEnd(20)} | ${String(s.metrics.cgpa.toFixed(2)).padEnd(12)} | ${String(s.metrics.part2Cgpa.toFixed(2)).padEnd(25)} | ${String(s.metrics.coreAndAllied + ' / 1300').padEnd(17)} | ${s.metrics.totalMarks}`
    );
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
