import prisma from "../lib/prisma";

const subjectNames: Record<string, string> = {
  // Semester 1
  '23ULE10': 'English I',
  '23ULT10': 'Tamil I',
  '23ULU10': 'Urdu I',
  '23UCS11': 'Object Oriented Programming Concepts Using C++',
  '23UPCS15': 'Object Oriented Programming Concepts Using C++ Lab',
  '23UECS12A': 'Numerical Methods-I',
  '23USCS13': 'Introduction to HTML',
  '23UFCS14': 'Problem Solving Technique',

  // Semester 2
  '23ULE20': 'English II',
  '23ULT20': 'Tamil II',
  '23ULU20': 'Urdu II',
  '23UCS21': 'Data Structures and Algorithm',
  '23UPCS25': 'Data Structures and Algorithm Lab',
  '23UECS22A': 'Numerical Methods-II',
  '23USCS23': 'Office Automation',
  '24UNM20': 'Non-Major Elective II',

  // Semester 3
  '23ULE30': 'English III',
  '23ULT30': 'Tamil III',
  '23ULU30': 'Urdu III',
  '23UCS31': 'Python Programming',
  '23UPCS35': 'Python Programming Lab',
  '23UECS32A': 'Statistical Methods and their Applications - I',
  '23USCS33': 'Understanding Internet',
  '23UES30': 'Environmental Studies',
  '23UNM30B': 'Non-Major Elective III',
  '24UNM30A': 'Non-Major Elective III',

  // Semester 4
  '23ULE40': 'English IV',
  '23ULT40': 'Tamil IV',
  '23ULU40': 'Urdu IV',
  '23UCS41': 'Java Programming',
  '23UPCS45': 'Java Programming Lab',
  '23UECS42A': 'Statistical Methods and their Applications - II',
  '23UPCS46': 'Statistical Methods Lab',
  '23USCS43': 'Web Designing',
  '24UNM40A': 'Cyber Forensics',

  // Semester 5
  '23UCS51': 'Operating Systems',
  '23UCS52': 'Database Management System',
  '23UPCS55': 'Operating System Lab',
  '23UPCS56': 'Database Management System Lab',
  '23UECS53A': 'Elective I',
  '23UVE50': 'Value Education',

  // Semester 6 (using common codes if applicable, just matching the user provided structure)
  'CC14': 'Machine Learning',
  'CC15': 'Machine Learning Lab',
  'CC16': 'Data Analytics using R Programming',
  'CC17': 'Data Analytics using R Programming Lab',
  'EC7': 'Elective III',
  'EC8': 'Elective IV',
  'SEC8': 'Open Source Software Technologies',
};

async function main() {
  console.log('Fetching subjects...');
  const subjects = await prisma.subject.findMany();

  for (const subject of subjects) {
    let newName = subjectNames[subject.code];

    if (!newName) {
        // Some fallback checks just in case the code is slightly off
        if (subject.code === '23USCS24') newName = 'Skill Enhancement Course III';
    }

    if (newName && subject.name !== newName) {
      await prisma.subject.update({
        where: { id: subject.id },
        data: { name: newName },
      });
      console.log(`Updated ${subject.code}: ${subject.name} -> ${newName}`);
    } else if (!newName) {
      console.log(`No mapping found for ${subject.code} (${subject.name})`);
    }
  }

  console.log('Finished updating subjects.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
