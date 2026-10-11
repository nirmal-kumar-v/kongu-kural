import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const collegeInfoPath = path.resolve(projectRoot, 'college-info.txt');
const collegeInfo2Path = path.resolve(projectRoot, 'college-info-2.txt');

const raw1 = fs.readFileSync(collegeInfoPath, 'utf-8');
const raw2 = fs.readFileSync(collegeInfo2Path, 'utf-8');

// The new content starts at line 3885 (0-indexed 3884)
const lines1 = raw1.split(/\r?\n/);
console.log(`college-info.txt total lines: ${lines1.length}`);

const calendarLines = lines1.slice(3884).filter((l) => l.trim().length > 0);
console.log(`Extracted calendar non-empty lines: ${calendarLines.length}`);

// Let's inspect the first 20 and last 20 lines of the extracted calendar text
console.log('\n--- FIRST 10 LINES ---');
console.log(calendarLines.slice(0, 10).join('\n'));

console.log('\n--- LAST 10 LINES ---');
console.log(calendarLines.slice(-10).join('\n'));
