import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const rawData = `
31924U18001 — AKASH C23UCS41: Internal: 20 | External: 32 | Total: 52 | PASS  23UECS12A: Internal: 14 | External: 40 | Total: 54 | PASS  23UECS32A: Internal: 21 | External: 30 | Total: 51 | PASS  23UECS42A: Internal: 21 | External: 18 | Total: 39 | RA  23UFCS14: Internal: 13 | External: 40 | Total: 53 | PASS  23ULE30: Internal: 17 | External: 10 | Total: 27 | RA  23ULE40: Internal: 17 | External: 20 | Total: 37 | RA  23ULT10: Internal: 20 | External: 12 | Total: 32 | RA  23ULT40: Internal: 24 | External: 35 | Total: 59 | PASS  23UPCS45: Internal: 22 | External: 42 | Total: 64 | PASS  23UPCS46: Internal: 22 | External: 30 | Total: 52 | PASS  23USCS13: Internal: 15 | External: 38 | Total: 53 | PASS  23USCS33: Internal: 21 | External: 33 | Total: 54 | PASS  23USCS43: Internal: 22 | External: 8 | Total: 30 | RA  24UNM40A: Internal: 22 | External: 55 | Total: 77 | PASS  31924U18003 — FAREED AHMED V23UCS41: Internal: 19 | External: 34 | Total: 53 | PASS  23UECS12A: Internal: 17 | External: 6 | Total: 23 | RA  23UECS22A: Internal: 14 | External: AAA | Total: AAA | AAA  23UECS42A: Internal: 21 | External: 6 | Total: 27 | RA  23ULE30: Internal: 16 | External: 38 | Total: 54 | PASS  23ULE40: Internal: 17 | External: 30 | Total: 47 | PASS  23ULU40: Internal: 17 | External: 34 | Total: 51 | PASS  23UPCS45: Internal: 23 | External: 48 | Total: 71 | PASS  23UPCS46: Internal: 23 | External: 51 | Total: 74 | PASS  23USCS43: Internal: 22 | External: 5 | Total: 27 | RA  24UNM40A: Internal: 23 | External: 55 | Total: 78 | PASS  31924U18004 — LITHISHWARAN V23UCS21: Internal: 17 | External: 3 | Total: 20 | RA  23UCS31: Internal: 14 | External: 15 | Total: 29 | RA  23UCS41: Internal: 19 | External: 0 | Total: 19 | RA  23UECS22A: Internal: 14 | External: AAA | Total: AAA | AAA  23UECS32A: Internal: 20 | External: 5 | Total: 25 | RA  23UECS42A: Internal: 20 | External: 30 | Total: 50 | PASS  23ULE40: Internal: 16 | External: 15 | Total: 31 | RA  23ULT30: Internal: 24 | External: 34 | Total: 58 | PASS  23ULT40: Internal: 24 | External: 47 | Total: 71 | PASS  23UPCS45: Internal: 23 | External: 34 | Total: 57 | PASS  23UPCS46: Internal: 22 | External: 30 | Total: 52 | PASS  23USCS23: Internal: 17 | External: 11 | Total: 28 | RA  23USCS43: Internal: 23 | External: 5 | Total: 28 | RA  24UNM40A: Internal: 22 | External: 43 | Total: 65 | PASS  31924U18005 — MAAZ M G23UCS41: Internal: 24 | External: 46 | Total: 70 | PASS  23UECS42A: Internal: 25 | External: 48 | Total: 73 | PASS  23ULE40: Internal: 22 | External: 32 | Total: 54 | PASS  23ULU40: Internal: 22 | External: 30 | Total: 52 | PASS  23UPCS45: Internal: 25 | External: 75 | Total: 100 | PASS  23UPCS46: Internal: 25 | External: 70 | Total: 95 | PASS  23USCS43: Internal: 24 | External: 43 | Total: 67 | PASS  24UNM40A: Internal: 25 | External: 71 | Total: 96 | PASS  31924U18006 — MANIKANDAN S23UCS41: Internal: 20 | External: 12 | Total: 32 | RA  23UECS42A: Internal: 21 | External: 11 | Total: 32 | RA  23ULE40: Internal: 20 | External: 9 | Total: 29 | RA  23ULT40: Internal: 25 | External: 35 | Total: 60 | PASS  23UPCS45: Internal: 23 | External: 38 | Total: 61 | PASS  23UPCS46: Internal: 23 | External: 30 | Total: 53 | PASS  23USCS43: Internal: 23 | External: 32 | Total: 55 | PASS  24UNM40A: Internal: 20 | External: 45 | Total: 65 | PASS  31924U18007 — MOHAMAD ZABIULLA S23UCS41: Internal: 20 | External: 16 | Total: 36 | RA  23UECS42A: Internal: 23 | External: 30 | Total: 53 | PASS  23ULE40: Internal: 19 | External: 46 | Total: 65 | PASS  23ULU40: Internal: 19 | External: 30 | Total: 49 | PASS  23UPCS45: Internal: 24 | External: 38 | Total: 62 | PASS  23UPCS46: Internal: 24 | External: 42 | Total: 66 | PASS  23USCS43: Internal: 22 | External: 11 | Total: 33 | RA  24UNM40A: Internal: 22 | External: 58 | Total: 80 | PASS  31924U18008 — MOHAMED THAHA V I23UCS11: Internal: 14 | External: AAA | Total: AAA | AAA  23UCS41: Internal: 18 | External: 11 | Total: 29 | RA  23UECS42A: Internal: 20 | External: 1 | Total: 21 | RA  23ULE10: Internal: 15 | External: 38 | Total: 53 | PASS  23ULE30: Internal: 17 | External: 30 | Total: 47 | PASS  23ULE40: Internal: 13 | External: 30 | Total: 43 | PASS  23ULU40: Internal: 14 | External: 32 | Total: 46 | PASS  23UPCS46: Internal: 21 | External: 30 | Total: 51 | PASS  23USCS43: Internal: 21 | External: 5 | Total: 26 | RA  24UNM40A: Internal: 20 | External: 52 | Total: 72 | PASS  31924U18009 — MOHAMMED ARQUM V23UCS11: Internal: 18 | External: AAA | Total: AAA | AAA  23UCS41: Internal: 20 | External: 19 | Total: 39 | RA  23UECS12A: Internal: 15 | External: 2 | Total: 17 | RA  23UECS42A: Internal: 21 | External: 7 | Total: 28 | RA  23ULE30: Internal: 16 | External: 11 | Total: 27 | RA  23ULE40: Internal: 15 | External: 7 | Total: 22 | RA  23ULU40: Internal: 19 | External: 30 | Total: 49 | PASS  23UPCS45: Internal: 24 | External: 68 | Total: 92 | PASS  23UPCS46: Internal: 23 | External: 40 | Total: 63 | PASS  23USCS23: Internal: 14 | External: 31 | Total: 45 | PASS  23USCS33: Internal: 22 | External: 32 | Total: 54 | PASS  23USCS43: Internal: 23 | External: 16 | Total: 39 | RA  24UNM40A: Internal: 22 | External: 63 | Total: 85 | PASS  31924U18010 — MOHAMMED AZHAN T23UCS41: Internal: 24 | External: 46 | Total: 70 | PASS  23UECS42A: Internal: 23 | External: 37 | Total: 60 | PASS  23ULE40: Internal: 21 | External: 35 | Total: 56 | PASS  23ULU40: Internal: 22 | External: 45 | Total: 67 | PASS  23UPCS45: Internal: 25 | External: 72 | Total: 97 | PASS  23UPCS46: Internal: 24 | External: 41 | Total: 65 | PASS  23USCS43: Internal: 24 | External: 31 | Total: 55 | PASS  24UNM40A: Internal: 25 | External: 73 | Total: 98 | PASS  31924U18011 — MOHAMMED FAIZ P23UCS41: Internal: 25 | External: 48 | Total: 73 | PASS  23UECS42A: Internal: 25 | External: 30 | Total: 55 | PASS  23ULE40: Internal: 25 | External: 30 | Total: 55 | PASS  23ULU40: Internal: 25 | External: 59 | Total: 84 | PASS  23UPCS45: Internal: 25 | External: 75 | Total: 100 | PASS  23UPCS46: Internal: 25 | External: 59 | Total: 84 | PASS  23USCS43: Internal: 25 | External: 46 | Total: 71 | PASS  24UNM40A: Internal: 25 | External: 72 | Total: 97 | PASS  31924U18012 — MOHAMMED FARHAN H S23UCS41: Internal: 17 | External: 23 | Total: 40 | RA  23UECS42A: Internal: 20 | External: 10 | Total: 30 | RA  23ULE40: Internal: 15 | External: 30 | Total: 45 | PASS  23ULU40: Internal: 16 | External: 14 | Total: 30 | RA  23UPCS46: Internal: 22 | External: 30 | Total: 52 | PASS  23USCS43: Internal: 21 | External: 11 | Total: 32 | RA  24UNM40A: Internal: 19 | External: 53 | Total: 72 | PASS  31924U18013 — MOHAMMED IMRAN A23UCS41: Internal: 24 | External: 39 | Total: 63 | PASS  23UECS42A: Internal: 24 | External: 30 | Total: 54 | PASS  23ULE40: Internal: 21 | External: 30 | Total: 51 | PASS  23ULU40: Internal: 20 | External: 35 | Total: 55 | PASS  23UPCS45: Internal: 25 | External: 75 | Total: 100 | PASS  23UPCS46: Internal: 24 | External: 65 | Total: 89 | PASS  23USCS43: Internal: 23 | External: 31 | Total: 54 | PASS  24UNM40A: Internal: 25 | External: 74 | Total: 99 | PASS  31924U18014 — MOHAMMED IRBAZ I23UCS11: Internal: 15 | External: 9 | Total: 24 | RA  23UCS41: Internal: 18 | External: 10 | Total: 28 | RA  23UECS42A: Internal: 20 | External: 10 | Total: 30 | RA  23UFCS14: Internal: 15 | External: 44 | Total: 59 | PASS  23ULE40: Internal: 19 | External: 17 | Total: 36 | RA  23ULU40: Internal: 19 | External: 35 | Total: 54 | PASS  23UPCS25: Internal: 22 | External: 41 | Total: 63 | PASS  23UPCS45: Internal: 22 | External: 38 | Total: 60 | PASS  23UPCS46: Internal: 22 | External: 30 | Total: 52 | PASS  23USCS43: Internal: 22 | External: 9 | Total: 31 | RA  24UNM40A: Internal: 20 | External: 50 | Total: 70 | PASS  31924U18015 — MOHAMMED NAHIR A23UCS41: Internal: 23 | External: 34 | Total: 57 | PASS  23UECS42A: Internal: 22 | External: 6 | Total: 28 | RA  23ULE40: Internal: 20 | External: 32 | Total: 52 | PASS  23ULU40: Internal: 23 | External: 54 | Total: 77 | PASS  23UPCS45: Internal: 24 | External: 52 | Total: 76 | PASS  23UPCS46: Internal: 23 | External: 66 | Total: 89 | PASS  23USCS43: Internal: 23 | External: 30 | Total: 53 | PASS  24UNM40A: Internal: 23 | External: 66 | Total: 89 | PASS  31924U18016 — MOHAMMED RASHID R23UCS11: Internal: 14 | External: AAA | Total: AAA | AAA  23UCS41: Internal: 22 | External: 6 | Total: 28 | RA  23UECS12A: Internal: 13 | External: AAA | Total: AAA | AAA  23UECS32A: Internal: 19 | External: 3 | Total: 22 | RA  23UECS42A: Internal: 20 | External: 6 | Total: 26 | RA  23ULE40: Internal: 15 | External: 3 | Total: 18 | RA  23ULU40: Internal: 20 | External: 46 | Total: 66 | PASS  23UPCS45: Internal: 24 | External: 35 | Total: 59 | PASS  23UPCS46: Internal: 21 | External: 11 | Total: 32 | RA  23USCS33: Internal: 21 | External: 13 | Total: 34 | RA  23USCS43: Internal: 23 | External: 5 | Total: 28 | RA  24UNM40A: Internal: 21 | External: 58 | Total: 79 | PASS  31924U18017 — MOHAMMED RAZI T23UCS41: Internal: 23 | External: 46 | Total: 69 | PASS  23UECS32A: Internal: 25 | External: 34 | Total: 59 | PASS  23UECS42A: Internal: 22 | External: 30 | Total: 52 | PASS  23ULE40: Internal: 25 | External: 54 | Total: 79 | PASS  23ULU40: Internal: 24 | External: 56 | Total: 80 | PASS  23UPCS45: Internal: 24 | External: 74 | Total: 98 | PASS  23UPCS46: Internal: 23 | External: 60 | Total: 83 | PASS  23USCS43: Internal: 24 | External: 43 | Total: 67 | PASS  24UNM40A: Internal: 23 | External: 71 | Total: 94 | PASS  31924U18018 — MOHAMMED SAMEER A23UCS41: Internal: 20 | External: 70 | Total: 90 | PASS  23UECS42A: Internal: 21 | External: 42 | Total: 63 | PASS  23ULE40: Internal: 21 | External: 60 | Total: 81 | PASS  23ULU40: Internal: 21 | External: 60 | Total: 81 | PASS  23UPCS45: Internal: 23 | External: 48 | Total: 71 | PASS  23UPCS46: Internal: 21 | External: 49 | Total: 70 | PASS  23USCS43: Internal: 24 | External: 42 | Total: 66 | PASS  24UNM40A: Internal: 22 | External: 50 | Total: 72 | PASS  31924U18019 — MOHAMMED SIDDIQUE S23UCS41: Internal: 23 | External: 52 | Total: 75 | PASS  23UECS42A: Internal: 21 | External: 30 | Total: 51 | PASS  23ULE40: Internal: 21 | External: 47 | Total: 68 | PASS  23ULU40: Internal: 23 | External: 49 | Total: 72 | PASS  23UPCS45: Internal: 24 | External: 45 | Total: 69 | PASS  23UPCS46: Internal: 23 | External: 66 | Total: 89 | PASS  23USCS43: Internal: 23 | External: 43 | Total: 66 | PASS  24UNM40A: Internal: 23 | External: 62 | Total: 85 | PASS  31924U18020 — MOHAMMED SUFIYAN A23UCS41: Internal: 23 | External: 33 | Total: 56 | PASS  23UECS22A: Internal: 18 | External: 30 | Total: 48 | PASS  23UECS42A: Internal: 22 | External: 30 | Total: 52 | PASS  23ULE40: Internal: 21 | External: 18 | Total: 39 | RA  23ULU40: Internal: 22 | External: 11 | Total: 33 | RA  23UPCS45: Internal: 24 | External: 50 | Total: 74 | PASS  23UPCS46: Internal: 23 | External: 60 | Total: 83 | PASS  23USCS43: Internal: 24 | External: 40 | Total: 64 | PASS  24UNM40A: Internal: 23 | External: 70 | Total: 93 | PASS  31924U18022 — MOHAMMED YASER C23UCS41: Internal: 20 | External: 31 | Total: 51 | PASS  23UECS12A: Internal: 14 | External: 10 | Total: 24 | RA  23UECS32A: Internal: 20 | External: 6 | Total: 26 | RA  23UECS42A: Internal: 20 | External: 7 | Total: 27 | RA  23ULE30: Internal: 15 | External: 11 | Total: 26 | RA  23ULE40: Internal: 14 | External: 41 | Total: 55 | PASS  23ULU30: Internal: 17 | External: 35 | Total: 52 | PASS  23ULU40: Internal: 18 | External: 30 | Total: 48 | PASS  23UPCS45: Internal: 22 | External: 40 | Total: 62 | PASS  23UPCS46: Internal: 21 | External: 31 | Total: 52 | PASS  23USCS43: Internal: 21 | External: 31 | Total: 52 | PASS  24UNM40A: Internal: 21 | External: 44 | Total: 65 | PASS  31924U18023 — MUHAMMAD S23UCS11: Internal: 14 | External: 48 | Total: 62 | PASS  23UCS21: Internal: 16 | External: 20 | Total: 36 | RA  23UCS41: Internal: 20 | External: 41 | Total: 61 | PASS  23UECS22A: Internal: 13 | External: 42 | Total: 55 | PASS  23UECS32A: Internal: 19 | External: 12 | Total: 31 | RA  23UECS42A: Internal: 20 | External: 3 | Total: 23 | RA  23ULE20: Internal: 13 | External: 35 | Total: 48 | PASS  23ULE40: Internal: 18 | External: 33 | Total: 51 | PASS  23ULU40: Internal: 17 | External: 42 | Total: 59 | PASS  23UPCS45: Internal: 23 | External: 46 | Total: 69 | PASS  23UPCS46: Internal: 22 | External: 30 | Total: 52 | PASS  23USCS43: Internal: 22 | External: 33 | Total: 55 | PASS  24UNM40A: Internal: 22 | External: 58 | Total: 80 | PASS  31924U18024 — SAIF ALI I23UCS41: Internal: 20 | External: 36 | Total: 56 | PASS  23UECS42A: Internal: 24 | External: 30 | Total: 54 | PASS  23ULE40: Internal: 23 | External: 36 | Total: 59 | PASS  23ULT40: Internal: 25 | External: 49 | Total: 74 | PASS  23UPCS45: Internal: 23 | External: 70 | Total: 93 | PASS  23UPCS46: Internal: 25 | External: 58 | Total: 83 | PASS  23USCS43: Internal: 23 | External: 46 | Total: 69 | PASS  24UNM40A: Internal: 21 | External: 57 | Total: 78 | PASS  31924U18025 — SAIRAJ M23UCS41: Internal: 24 | External: 35 | Total: 59 | PASS  23UECS32A: Internal: 25 | External: 30 | Total: 55 | PASS  23UECS42A: Internal: 25 | External: 36 | Total: 61 | PASS  23ULE40: Internal: 20 | External: 11 | Total: 31 | RA  23ULT40: Internal: 25 | External: 36 | Total: 61 | PASS  23UPCS45: Internal: 25 | External: 75 | Total: 100 | PASS  23UPCS46: Internal: 25 | External: 75 | Total: 100 | PASS  23USCS43: Internal: 24 | External: 35 | Total: 59 | PASS  24UNM40A: Internal: 25 | External: 72 | Total: 97 | PASS  31924U18026 — SANJAY S23UCS41: Internal: 19 | External: AAA | Total: AAA | AAA  23UECS42A: Internal: 20 | External: AAA | Total: AAA | AAA  23ULE40: Internal: 13 | External: AAA | Total: AAA | AAA  23ULT40: Internal: 23 | External: AAA | Total: AAA | AAA  23UPCS45: Internal: 22 | External: 31 | Total: 53 | PASS  23USCS43: Internal: 21 | External: AAA | Total: AAA | AAA  24UNM40A: Internal: 19 | External: 48 | Total: 67 | PASS  31924U18027 — SARANRAJ S23UCS41: Internal: 24 | External: 39 | Total: 63 | PASS  23UECS42A: Internal: 25 | External: 45 | Total: 70 | PASS  23ULE40: Internal: 24 | External: 44 | Total: 68 | PASS  23ULT40: Internal: 25 | External: 38 | Total: 63 | PASS  23UPCS45: Internal: 25 | External: 75 | Total: 100 | PASS  23UPCS46: Internal: 25 | External: 61 | Total: 86 | PASS  23USCS43: Internal: 24 | External: 45 | Total: 69 | PASS  24UNM40A: Internal: 25 | External: 72 | Total: 97 | PASS  31924U18028 — SAYED MUHAMMED MOHATHASEEM23UCS21: Internal: 16 | External: 15 | Total: 31 | RA  23UCS41: Internal: 22 | External: 1 | Total: 23 | RA  23UECS22A: Internal: 13 | External: 30 | Total: 43 | PASS  23UECS42A: Internal: 20 | External: 7 | Total: 27 | RA  23UFCS14: Internal: 14 | External: 54 | Total: 68 | PASS  23ULE40: Internal: 19 | External: 47 | Total: 66 | PASS  23ULU40: Internal: 22 | External: 30 | Total: 52 | PASS  23UPCS45: Internal: 24 | External: 72 | Total: 96 | PASS  23UPCS46: Internal: 21 | External: 30 | Total: 51 | PASS  23USCS43: Internal: 24 | External: 38 | Total: 62 | PASS  24UNM40A: Internal: 24 | External: 72 | Total: 96 | PASS  31924U18029 — SEHAL AHMED T23UCS41: Internal: 22 | External: 44 | Total: 66 | PASS  23UECS42A: Internal: 20 | External: 30 | Total: 50 | PASS  23ULE40: Internal: 24 | External: 40 | Total: 64 | PASS  23ULU40: Internal: 24 | External: 30 | Total: 54 | PASS  23UPCS45: Internal: 24 | External: 58 | Total: 82 | PASS  23UPCS46: Internal: 21 | External: 33 | Total: 54 | PASS  23USCS43: Internal: 24 | External: 33 | Total: 57 | PASS  24UNM40A: Internal: 24 | External: 68 | Total: 92 | PASS  31924U18030 — SHARIF UMER N23UCS41: Internal: 21 | External: 46 | Total: 67 | PASS  23UECS42A: Internal: 21 | External: 14 | Total: 35 | RA  23ULE20: Internal: 17 | External: 28 | Total: 45 | RA  23ULE30: Internal: 19 | External: 9 | Total: 28 | RA  23ULE40: Internal: 17 | External: 25 | Total: 42 | RA  23ULU40: Internal: 21 | External: 30 | Total: 51 | PASS  23UPCS45: Internal: 24 | External: 42 | Total: 66 | PASS  23UPCS46: Internal: 23 | External: 40 | Total: 63 | PASS  23USCS43: Internal: 23 | External: 31 | Total: 54 | PASS  24UNM40A: Internal: 22 | External: 61 | Total: 83 | PASS
`;

async function main() {
  console.log("Starting to parse raw data...");
  let count = 0;
  
  // Find all students
  const studentRegex = /(31924U180\d{2}) — ([A-Z\s]+?)([A-Z0-9]{6,10}):/g;
  const matchArr = [...rawData.matchAll(studentRegex)];
  
  for (let i = 0; i < matchArr.length; i++) {
    const regNo = matchArr[i][1];
    const name = matchArr[i][2].trim();
    
    // The section of string for this student is from the end of their name up to the start of the next student (or end of string)
    const startIndex = rawData.indexOf(matchArr[i][0]) + matchArr[i][1].length + 3 + matchArr[i][2].length;
    const endIndex = i + 1 < matchArr.length ? rawData.indexOf(matchArr[i+1][0]) : rawData.length;
    
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
      
      // Handle AAA (Absent)
      const internal = intStr === "AAA" ? 0 : parseInt(intStr);
      const external = extStr === "AAA" ? 0 : parseInt(extStr);
      const total = totStr === "AAA" ? 0 : parseInt(totStr);
      const passStatus = passStatusStr === "PASS";
      
      // Upsert subject
      let subject = await prisma.subject.findUnique({ where: { code } });
      if (!subject) {
        // Infer semester from code
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
