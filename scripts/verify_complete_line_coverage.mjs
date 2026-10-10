import fs from 'fs';
import path from 'path';

const origFile = path.resolve(process.cwd(), 'college-info.txt');
const newFile = path.resolve(process.cwd(), 'college-info-2.txt');

const origText = fs.readFileSync(origFile, 'utf-8');
const newText = fs.readFileSync(newFile, 'utf-8');

const origLines = origText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);

let missingCount = 0;
const missingSamples = [];

for (const line of origLines) {
  // If the line has markdown or tabs, check if trimmed key part is present
  if (!newText.includes(line)) {
    missingCount++;
    if (missingSamples.length < 10) {
      missingSamples.push(line);
    }
  }
}

console.log(`Total significant lines tested: ${origLines.length}`);
console.log(`Lines found directly: ${origLines.length - missingCount} / ${origLines.length}`);

if (missingCount === 0) {
  console.log('✅ 100% COMPLETE LINE COVERAGE: Every single significant line from college-info.txt is in college-info-2.txt!');
  process.exit(0);
} else {
  console.log(`❌ Missing lines (${missingCount}):`, missingSamples);
  process.exit(1);
}
