export type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "U";

export function calculateGrade(totalMarks: number): { grade: Grade; points: number; pass: boolean } {
  if (totalMarks >= 90) return { grade: "O", points: 10, pass: true };
  if (totalMarks >= 80) return { grade: "A+", points: 9, pass: true };
  if (totalMarks >= 70) return { grade: "A", points: 8, pass: true };
  if (totalMarks >= 60) return { grade: "B+", points: 7, pass: true };
  if (totalMarks >= 50) return { grade: "B", points: 6, pass: true };
  if (totalMarks >= 40) return { grade: "C", points: 5, pass: true };
  return { grade: "U", points: 0, pass: false };
}

export type SubjectResult = {
  credits: number;
  gradePoints: number;
};

export function calculateSGPA(results: SubjectResult[]): number {
  if (results.length === 0) return 0;

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const result of results) {
    totalCredits += result.credits;
    totalGradePoints += result.credits * result.gradePoints;
  }

  if (totalCredits === 0) return 0;
  return Number((totalGradePoints / totalCredits).toFixed(2));
}

export function calculateCGPA(semesters: { sgpa: number; totalCredits: number }[]): number {
  if (semesters.length === 0) return 0;

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const sem of semesters) {
    totalCredits += sem.totalCredits;
    totalGradePoints += sem.sgpa * sem.totalCredits;
  }

  if (totalCredits === 0) return 0;
  return Number((totalGradePoints / totalCredits).toFixed(2));
}
