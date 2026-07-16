import fs from "fs";
import path from "path";

const rawPath = path.join(__dirname, "raw.txt");
const outPath = path.join(__dirname, "data.json");

const content = fs.readFileSync(rawPath, "utf-8");
const lines = content.split("\n");

const studentsMap = new Map<string, any>();

let currentStudent: any = null;

const studentRegex = /^(31924U180\d{2})\s+(.+)$/;
const resultRegex = /([0-9]{2}[A-Z]+[0-9A-Z]*)\s+([0-9]+|AAA|MP)\s+([0-9]+|AAA|MP)\s+([0-9]+|AAA|MP)\s+(PASS|RA|FAIL)/g;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  const studentMatch = trimmed.match(studentRegex);
  if (studentMatch) {
    const registerNumber = studentMatch[1];
    const name = studentMatch[2].trim();
    
    if (!studentsMap.has(registerNumber)) {
      studentsMap.set(registerNumber, {
        registerNumber,
        name,
        batch: "31924U180",
        results: []
      });
    }
    currentStudent = studentsMap.get(registerNumber);
    continue;
  }

  if (currentStudent) {
    let match;
    while ((match = resultRegex.exec(trimmed)) !== null) {
      const code = match[1];
      const internalMarks = match[2] === "AAA" || match[2] === "MP" ? match[2] : parseInt(match[2]);
      const externalMarks = match[3] === "AAA" || match[3] === "MP" ? match[3] : parseInt(match[3]);
      
      // We don't want to duplicate if the student already has this result from another page
      // but in this raw.txt we have results from Sem 1 and Sem 4 for the same students!
      // So we just append them.
      
      const existing = currentStudent.results.find((r: any) => r.code === code);
      if (!existing) {
        currentStudent.results.push({
          code,
          internalMarks,
          externalMarks
        });
      } else {
        // Update if the new marks are better or if previously it was AAA/RA? 
        // Actually since we combine Sem 1 and Sem 4, they are different subjects usually.
        // If it's a re-appear, we can just overwrite.
        existing.internalMarks = internalMarks;
        existing.externalMarks = externalMarks;
      }
    }
  }
}

const finalData = Array.from(studentsMap.values());
fs.writeFileSync(outPath, JSON.stringify(finalData, null, 2));

console.log(`Successfully parsed ${finalData.length} students into data.json`);
