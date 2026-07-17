import prisma from "../lib/prisma";
import { calculateGrade } from "../lib/grading";

const rawData = `
31924U18001 — AKASH C
23UCS31: Internal: 15 | External: 38 | Total: 53 | PASS
23UECS12A: Internal: 14 | External: 0 | Total: 14 | RA
23UECS32A: Internal: 21 | External: 14 | Total: 35 | RA
23UES30: Internal: 22 | External: 30 | Total: 52 | PASS
23UFCS14: Internal: 13 | External: 4 | Total: 17 | RA
23ULE10: Internal: 13 | External: 34 | Total: 47 | PASS
23ULE20: Internal: 14 | External: 30 | Total: 44 | PASS
23ULE30: Internal: 17 | External: 15 | Total: 32 | RA
23ALT30: Internal: 24 | External: 19 | Total: 43 | RA
23UPCS35: Internal: 25 | External: 40 | Total: 65 | PASS
23USCS33: Internal: 21 | External: 3 | Total: 24 | RA
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18003 — FAREED AHMED V
23UCS31: Internal: 15 | External: 30 | Total: 45 | PASS
23UECS12A: Internal: 17 | External: 13 | Total: 30 | RA
23UECS32A: Internal: 21 | External: 17 | Total: 38 | RA
23UES30: Internal: 21 | External: 30 | Total: 51 | PASS
23ULE30: Internal: 16 | External: 7 | Total: 23 | RA
23ULU30: Internal: 15 | External: 35 | Total: 50 | PASS
23UPCS35: Internal: 24 | External: 50 | Total: 74 | PASS
23USCS13: Internal: 16 | External: 31 | Total: 47 | PASS
23USCS33: Internal: 20 | External: 47 | Total: 67 | PASS
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18004 — LITHISHWARAN V
23UCS21: Internal: 17 | External: 16 | Total: 33 | RA
23UCS31: Internal: 14 | External: 18 | Total: 32 | RA
23UECS22A: Internal: 14 | External: 18 | Total: 32 | RA
23UECS32A: Internal: 20 | External: 9 | Total: 29 | RA
23UES30: Internal: 21 | External: 30 | Total: 51 | PASS
23ULE20: Internal: 13 | External: 30 | Total: 43 | PASS
23ULE30: Internal: 16 | External: 30 | Total: 46 | PASS
23ULT30: Internal: 24 | External: 25 | Total: 49 | RA
23UPCS35: Internal: 24 | External: 32 | Total: 56 | PASS
23USCS13: Internal: 16 | External: 31 | Total: 47 | PASS
23USCS23: Internal: 17 | External: 21 | Total: 38 | RA
23USCS33: Internal: 21 | External: 30 | Total: 51 | PASS
24UNM30A: Internal: 21 | External: 60 | Total: 81 | PASS

31924U18005 — MAAZ M G
23UCS31: Internal: 24 | External: 32 | Total: 56 | PASS
23UECS32A: Internal: 24 | External: 55 | Total: 79 | PASS
23UES30: Internal: 24 | External: 55 | Total: 79 | PASS
23ULE30: Internal: 24 | External: 39 | Total: 63 | PASS
23ULU30: Internal: 20 | External: 30 | Total: 50 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 24 | External: 46 | Total: 70 | PASS
24UNM30A: Internal: 24 | External: 67 | Total: 91 | PASS

31924U18006 — MANIKANDAN S
23UCS31: Internal: 15 | External: 31 | Total: 46 | PASS
23UECS32A: Internal: 23 | External: 15 | Total: 38 | RA
23UES30: Internal: 20 | External: 30 | Total: 50 | PASS
23ULE30: Internal: 22 | External: 30 | Total: 52 | PASS
23ULT30: Internal: 25 | External: 30 | Total: 55 | PASS
23UPCS35: Internal: 25 | External: 70 | Total: 95 | PASS
23USCS33: Internal: 22 | External: 30 | Total: 52 | PASS
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18007 — MOHAMAD ZABIULLA S
23UCS31: Internal: 19 | External: 41 | Total: 60 | PASS
23UECS32A: Internal: 22 | External: 37 | Total: 59 | PASS
23UES30: Internal: 20 | External: 49 | Total: 69 | PASS
23ULE30: Internal: 20 | External: 43 | Total: 63 | PASS
23ULU30: Internal: 18 | External: 35 | Total: 53 | PASS
23UPCS35: Internal: 24 | External: 65 | Total: 89 | PASS
23USCS33: Internal: 20 | External: 30 | Total: 50 | PASS
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18008 — MOHAMED THAHA V I
23UCS31: Internal: 16 | External: 17 | Total: 33 | RA
23UECS32A: Internal: 21 | External: 13 | Total: 34 | RA
23UES30: Internal: 19 | External: 30 | Total: 49 | PASS
23ULE30: Internal: 17 | External: 9 | Total: 26 | RA
23ULU30: Internal: 15 | External: 45 | Total: 60 | PASS
23UPCS15: Internal: 20 | External: 33 | Total: 53 | PASS
23UPCS35: Internal: 24 | External: 33 | Total: 57 | PASS
23USCS33: Internal: 19 | External: 21 | Total: 40 | RA
24UNM30A: Internal: 21 | External: 60 | Total: 81 | PASS

31924U18009 — MOHAMMED ARQUM V
23UCS21: Internal: 17 | External: 30 | Total: 47 | PASS
23UCS31: Internal: 15 | External: 39 | Total: 54 | PASS
23UECS32A: Internal: 21 | External: 8 | Total: 29 | RA
23UES30: Internal: 21 | External: 30 | Total: 51 | PASS
23ULE20: Internal: 14 | External: 33 | Total: 47 | PASS
23ULE30: Internal: 16 | External: 7 | Total: 23 | RA
23ULU30: Internal: 15 | External: 39 | Total: 54 | PASS
23UPCS35: Internal: 24 | External: 72 | Total: 96 | PASS
23USCS23: Internal: 14 | External: 19 | Total: 33 | RA
23USCS33: Internal: 22 | External: 10 | Total: 32 | RA
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18010 — MOHAMMED AZHAN T
23UCS31: Internal: 21 | External: 53 | Total: 74 | PASS
23UECS32A: Internal: 21 | External: 14 | Total: 35 | RA
23UES30: Internal: 24 | External: 50 | Total: 74 | PASS
23ULE30: Internal: 22 | External: 52 | Total: 74 | PASS
23ULU30: Internal: 22 | External: 57 | Total: 79 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 23 | External: 34 | Total: 57 | PASS
24UNM30A: Internal: 24 | External: 65 | Total: 89 | PASS

31924U18011 — MOHAMMED FAIZ P
23UCS31: Internal: 25 | External: 38 | Total: 63 | PASS
23UECS32A: Internal: 25 | External: 45 | Total: 70 | PASS
23UES30: Internal: 25 | External: 44 | Total: 69 | PASS
23ULE30: Internal: 25 | External: 42 | Total: 67 | PASS
23ULU30: Internal: 25 | External: 60 | Total: 85 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 25 | External: 54 | Total: 79 | PASS
24UNM30A: Internal: 25 | External: 75 | Total: 100 | PASS

31924U18012 — MOHAMMED FARHAN H S
23UCS31: Internal: 17 | External: 31 | Total: 48 | PASS
23UECS32A: Internal: 23 | External: 10 | Total: 33 | RA
23UES30: Internal: 20 | External: 39 | Total: 59 | PASS
23ULE30: Internal: 18 | External: 8 | Total: 26 | RA
23ULU30: Internal: 15 | External: 38 | Total: 53 | PASS
23UPCS15: Internal: 20 | External: 34 | Total: 54 | PASS
23UPCS35: Internal: 24 | External: 42 | Total: 66 | PASS
23USCS33: Internal: 19 | External: 30 | Total: 49 | PASS
24UNM30A: Internal: 20 | External: 60 | Total: 80 | PASS

31924U18013 — MOHAMMED IMRAN A
23UCS31: Internal: 22 | External: 32 | Total: 54 | PASS
23UECS32A: Internal: 22 | External: 41 | Total: 63 | PASS
23UES30: Internal: 23 | External: 41 | Total: 64 | PASS
23ULE30: Internal: 22 | External: 33 | Total: 55 | PASS
23ULU30: Internal: 19 | External: 36 | Total: 55 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 23 | External: 51 | Total: 74 | PASS
24UNM30A: Internal: 24 | External: 70 | Total: 94 | PASS

31924U18014 — MOHAMMED IRBAZ I
23UCS31: Internal: 16 | External: 33 | Total: 49 | PASS
23UECS32A: Internal: 19 | External: 10 | Total: 29 | RA
23UES30: Internal: 21 | External: 37 | Total: 58 | PASS
23ULE30: Internal: 18 | External: 32 | Total: 50 | PASS
23ULU30: Internal: 18 | External: 36 | Total: 54 | PASS
23UPCS35: Internal: 24 | External: 48 | Total: 72 | PASS
23USCS33: Internal: 22 | External: 45 | Total: 67 | PASS
24UNM30A: Internal: 21 | External: 60 | Total: 81 | PASS

31924U18015 — MOHAMMED NAHIR A
23UCS11: Internal: 18 | External: 43 | Total: 61 | PASS
23UCS31: Internal: 16 | External: 34 | Total: 50 | PASS
23UECS32A: Internal: 21 | External: 34 | Total: 55 | PASS
23UES30: Internal: 21 | External: 36 | Total: 57 | PASS
23ULE30: Internal: 18 | External: 30 | Total: 48 | PASS
23ULU30: Internal: 19 | External: 56 | Total: 75 | PASS
23UPCS35: Internal: 25 | External: 60 | Total: 85 | PASS
23USCS33: Internal: 22 | External: 30 | Total: 52 | PASS
24UNM30A: Internal: 21 | External: 70 | Total: 91 | PASS

31924U18016 — MOHAMMED RASHID R
23UCS21: Internal: 17 | External: 17 | Total: 34 | RA
23UCS31: Internal: 16 | External: 7 | Total: 23 | RA
23UECS22A: Internal: 14 | External: 0 | Total: 14 | RA
23UECS32A: Internal: 19 | External: 4 | Total: 23 | RA
23UES30: Internal: 22 | External: 2 | Total: 24 | RA
23ULE20: Internal: 14 | External: 18 | Total: 32 | RA
23ULE30: Internal: 17 | External: 32 | Total: 49 | PASS
23ULU30: Internal: 17 | External: 30 | Total: 47 | PASS
23UPCS35: Internal: 24 | External: 40 | Total: 64 | PASS
23USCS23: Internal: 17 | External: 21 | Total: 38 | RA
23USCS33: Internal: 21 | External: 13 | Total: 34 | RA
24UNM30A: Internal: 21 | External: 65 | Total: 86 | PASS

31924U18017 — MOHAMMED RAZI T
23UCS31: Internal: 22 | External: 46 | Total: 68 | PASS
23UECS32A: Internal: 25 | External: 22 | Total: 47 | RA
23UES30: Internal: 23 | External: 61 | Total: 84 | PASS
23ULE30: Internal: 25 | External: 56 | Total: 81 | PASS
23ULU30: Internal: 23 | External: 52 | Total: 75 | PASS
23UPCS35: Internal: 24 | External: 75 | Total: 99 | PASS
23USCS33: Internal: 23 | External: 62 | Total: 85 | PASS
24UNM30A: Internal: 23 | External: 65 | Total: 88 | PASS

31924U18018 — MOHAMMED SAMEER A
23UCS31: Internal: 22 | External: 56 | Total: 78 | PASS
23UECS32A: Internal: 21 | External: 53 | Total: 74 | PASS
23UES30: Internal: 23 | External: 62 | Total: 85 | PASS
23ULE30: Internal: 22 | External: 46 | Total: 68 | PASS
23ULU30: Internal: 21 | External: 58 | Total: 79 | PASS
23UPCS35: Internal: 25 | External: 65 | Total: 90 | PASS
23USCS33: Internal: 23 | External: 62 | Total: 85 | PASS
24UNM30A: Internal: 23 | External: 55 | Total: 78 | PASS

31924U18019 — MOHAMMED SIDDIQUE S
23UCS31: Internal: 20 | External: 48 | Total: 68 | PASS
23UECS22A: Internal: 19 | External: 30 | Total: 49 | PASS
23UECS32A: Internal: 23 | External: 41 | Total: 64 | PASS
23UES30: Internal: 22 | External: 43 | Total: 65 | PASS
23ULE30: Internal: 19 | External: 34 | Total: 53 | PASS
23ULU30: Internal: 21 | External: 58 | Total: 79 | PASS
23UPCS35: Internal: 25 | External: 70 | Total: 95 | PASS
23USCS33: Internal: 21 | External: 35 | Total: 56 | PASS
24UNM30A: Internal: 22 | External: 65 | Total: 87 | PASS

31924U18020 — MOHAMMED SUFIYAN A
23UCS31: Internal: 21 | External: 64 | Total: 85 | PASS
23UECS22A: Internal: 18 | External: 19 | Total: 37 | RA
23UECS32A: Internal: 23 | External: 37 | Total: 60 | PASS
23UES30: Internal: 23 | External: 44 | Total: 67 | PASS
23ULE30: Internal: 22 | External: 36 | Total: 58 | PASS
23ULU30: Internal: 20 | External: 40 | Total: 60 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 23 | External: 35 | Total: 58 | PASS
24UNM30A: Internal: 23 | External: 70 | Total: 93 | PASS

31924U18021 — MOHAMMED YASEER E Y
23UCS21: Internal: 17 | External: 42 | Total: 59 | PASS
23UCS31: Internal: 17 | External: 55 | Total: 72 | PASS
23UECS32A: Internal: 19 | External: 30 | Total: 49 | PASS
23UES30: Internal: 20 | External: 33 | Total: 53 | PASS
23ULE30: Internal: 18 | External: 48 | Total: 66 | PASS
23ULU30: Internal: 20 | External: 30 | Total: 50 | PASS
23UPCS35: Internal: 24 | External: 65 | Total: 89 | PASS
23USCS33: Internal: 21 | External: 31 | Total: 52 | PASS
24UNM30A: Internal: 22 | External: 65 | Total: 87 | PASS

31924U18022 — MOHAMMED YASER C
23UCS31: Internal: 16 | External: 30 | Total: 46 | PASS
23UECS12A: Internal: 14 | External: 11 | Total: 25 | RA
23UECS32A: Internal: 20 | External: 11 | Total: 31 | RA
23UES30: Internal: 21 | External: 30 | Total: 51 | PASS
23ULE30: Internal: 15 | External: 20 | Total: 35 | RA
23ULU30: Internal: 17 | External: 12 | Total: 29 | RA
23UPCS35: Internal: 23 | External: 40 | Total: 63 | PASS
23USCS13: Internal: 17 | External: 41 | Total: 58 | PASS
23USCS33: Internal: 21 | External: 34 | Total: 55 | PASS
24UNM30A: Internal: 21 | External: 60 | Total: 81 | PASS

31924U18023 — MUHAMMAD S
23UCS11: Internal: 14 | External: 10 | Total: 24 | RA
23UCS21: Internal: 16 | External: 19 | Total: 35 | RA
23UCS31: Internal: 15 | External: 36 | Total: 51 | PASS
23UECS12A: Internal: 13 | External: 30 | Total: 43 | PASS
23UECS22A: Internal: 13 | External: 10 | Total: 23 | RA
23UECS32A: Internal: 19 | External: 5 | Total: 24 | RA
23UES30: Internal: 20 | External: 30 | Total: 50 | PASS
23ULE20: Internal: 13 | External: 16 | Total: 29 | RA
23ULE30: Internal: 16 | External: 36 | Total: 52 | PASS
23ULU30: Internal: 14 | External: 49 | Total: 63 | PASS
23UPCS35: Internal: 24 | External: 35 | Total: 59 | PASS
23USCS33: Internal: 21 | External: 30 | Total: 51 | PASS
24UNM30A: Internal: 21 | External: 60 | Total: 81 | PASS

31924U18024 — SAIF ALI I
23UCS31: Internal: 24 | External: 53 | Total: 77 | PASS
23UECS32A: Internal: 25 | External: 40 | Total: 65 | PASS
23UES30: Internal: 23 | External: 42 | Total: 65 | PASS
23ULE30: Internal: 23 | External: 43 | Total: 66 | PASS
23ULT30: Internal: 25 | External: 30 | Total: 55 | PASS
23UPCS35: Internal: 25 | External: 70 | Total: 95 | PASS
23USCS33: Internal: 23 | External: 55 | Total: 78 | PASS
24UNM30A: Internal: 24 | External: 65 | Total: 89 | PASS

31924U18025 — SAIRAJ M
23UCS31: Internal: 24 | External: 43 | Total: 67 | PASS
23UECS32A: Internal: 25 | External: 16 | Total: 41 | RA
23UES30: Internal: 23 | External: 50 | Total: 73 | PASS
23ULE30: Internal: 24 | External: 35 | Total: 59 | PASS
23ULT30: Internal: 24 | External: 37 | Total: 61 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 23 | External: 39 | Total: 62 | PASS
24UNM30A: Internal: 24 | External: 75 | Total: 99 | PASS

31924U18026 — SANJAY S
23UCS11: Internal: 16 | External: 1 | Total: 17 | RA
23UCS21: Internal: 14 | External: 0 | Total: 14 | RA
23UCS31: Internal: 15 | External: 0 | Total: 15 | RA
23UECS12A: Internal: 13 | External: 1 | Total: 14 | RA
23UECS22A: Internal: 13 | External: 2 | Total: 15 | RA
23UECS32A: Internal: 19 | External: 5 | Total: 24 | RA
23UES30: Internal: 21 | External: 33 | Total: 54 | PASS
23UFCS14: Internal: 14 | External: 1 | Total: 15 | RA
23ULE20: Internal: 14 | External: 2 | Total: 16 | RA
23ULE30: Internal: 15 | External: 14 | Total: 29 | RA
23ULT10: Internal: 22 | External: 2 | Total: 24 | RA
23ULT30: Internal: 21 | External: 1 | Total: 22 | RA
23UPCS35: Internal: 23 | External: 32 | Total: 55 | PASS
23USCS13: Internal: 13 | External: 30 | Total: 43 | PASS
23USCS23: Internal: 15 | External: 0 | Total: 15 | RA
23USCS33: Internal: 21 | External: 30 | Total: 51 | PASS
24UNM30A: Internal: 20 | External: 55 | Total: 75 | PASS

31924U18027 — SARANRAJ S
23UCS31: Internal: 24 | External: 64 | Total: 88 | PASS
23UECS32A: Internal: 21 | External: 53 | Total: 74 | PASS
23UES30: Internal: 24 | External: 40 | Total: 64 | PASS
23ULE30: Internal: 23 | External: 30 | Total: 53 | PASS
23ULT30: Internal: 25 | External: 54 | Total: 79 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS33: Internal: 23 | External: 42 | Total: 65 | PASS
24UNM30A: Internal: 23 | External: 75 | Total: 98 | PASS

31924U18028 — SAYED MUHAMMED MOHATHASEEM
23UCS21: Internal: 16 | External: 14 | Total: 30 | RA
23UCS31: Internal: 19 | External: 30 | Total: 49 | PASS
23UECS22A: Internal: 13 | External: 4 | Total: 17 | RA
23UECS32A: Internal: 23 | External: 11 | Total: 34 | RA
23UES30: Internal: 23 | External: 31 | Total: 54 | PASS
23UFCS14: Internal: 14 | External: 10 | Total: 24 | RA
23ULE30: Internal: 17 | External: 38 | Total: 55 | PASS
23ULU30: Internal: 19 | External: 45 | Total: 64 | PASS
23UPCS35: Internal: 25 | External: 75 | Total: 100 | PASS
23USCS23: Internal: 18 | External: 46 | Total: 64 | PASS
23USCS33: Internal: 24 | External: 30 | Total: 54 | PASS
24UNM30A: Internal: 23 | External: 65 | Total: 88 | PASS

31924U18029 — SEHAL AHMED T
23UCS31: Internal: 19 | External: 39 | Total: 58 | PASS
23UECS32A: Internal: 21 | External: 43 | Total: 64 | PASS
23UES30: Internal: 23 | External: 41 | Total: 64 | PASS
23ULE30: Internal: 21 | External: 45 | Total: 66 | PASS
23ULU30: Internal: 22 | External: 30 | Total: 52 | PASS
23UPCS35: Internal: 25 | External: 70 | Total: 95 | PASS
23USCS33: Internal: 23 | External: 52 | Total: 75 | PASS
24UNM30A: Internal: 23 | External: 65 | Total: 88 | PASS

31924U18030 — SHARIF UMER N
23UCS31: Internal: 17 | External: 19 | Total: 36 | RA
23UECS22A: Internal: 15 | External: 40 | Total: 55 | PASS
23UECS32A: Internal: 20 | External: 30 | Total: 50 | PASS
23UES30: Internal: 23 | External: 53 | Total: 76 | PASS
23ULE20: Internal: 17 | External: 15 | Total: 32 | RA
23ULE30: Internal: 19 | External: 9 | Total: 28 | RA
23ULU30: Internal: 21 | External: 32 | Total: 53 | PASS
23UPCS35: Internal: 24 | External: 60 | Total: 84 | PASS
23USCS13: Internal: 15 | External: 42 | Total: 57 | PASS
23USCS23: Internal: 17 | External: 30 | Total: 47 | PASS
23USCS33: Internal: 22 | External: 41 | Total: 63 | PASS
24UNM30A: Internal: 22 | External: 67 | Total: 89 | PASS
`;

async function main() {
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentRegNo = "";
  let count = 0;

  for (const line of lines) {
    // Check if it's a student header line (e.g. "31924U18001 — AKASH C")
    if (line.match(/^31924U18\d{3}\s+—/)) {
      currentRegNo = line.split(" ")[0].trim();
      continue;
    }

    // Otherwise it's a mark line: "23UCS31: Internal: 15 | External: 38 | Total: 53 | PASS"
    const match = line.match(/^([A-Z0-9]+):\s*Internal:\s*(\d+)\s*\|\s*External:\s*(\d+)\s*\|\s*Total:\s*(\d+)\s*\|\s*(PASS|RA)$/);
    
    if (match && currentRegNo) {
      const code = match[1];
      const internal = parseInt(match[2]);
      const external = parseInt(match[3]);
      const total = parseInt(match[4]);
      const passStatus = match[5] === "PASS";
      
      const student = await prisma.student.findUnique({ where: { registerNumber: currentRegNo } });
      if (!student) {
        console.log(`⚠️ Student not found: ${currentRegNo}`);
        continue;
      }
  
      const subject = await prisma.subject.findUnique({ where: { code } });
      if (!subject) {
        console.log(`⚠️ Subject not found: ${code}`);
        continue;
      }
  
      const { grade } = calculateGrade(total);
  
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
  
      console.log(`✅ Updated ${currentRegNo} - ${code}`);
      count++;
    }
  }

  console.log(`Successfully processed ${count} mark entries!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
