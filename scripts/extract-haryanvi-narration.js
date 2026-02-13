/**
 * Extract Haryanvi narration from PHAANS script
 * Keeps dialogues, VO, and story - removes only technical directions
 */

const fs = require('fs');

const scriptPath = '/tmp/kaand-short-script.txt';
const fullScript = fs.readFileSync(scriptPath, 'utf8');

// Clean and extract narration
let narration = fullScript;

// Remove page numbers
narration = narration.replace(/^\d+\/\d+$/gm, '');

// Remove copyright/registration lines
narration = narration.replace(/Script-Phaans/g, '');
narration = narration.replace(/Registered@www\.swaindia\.org.*/g, '');
narration = narration.replace(/©Subhash Jangid/g, '');
narration = narration.replace(/SWA Membership Number:.*/g, '');
narration = narration.replace(/FINAL DRAFT SCRIPT.*/g, '');
narration = narration.replace(/Written by/g, '');
narration = narration.replace(/Story & Screenplay:.*/g, '');
narration = narration.replace(/Additional Screenplay.*/g, '');
narration = narration.replace(/Director:.*/g, '');
narration = narration.replace(/Episode \d+/g, '');
narration = narration.replace(/Blue \(mm\/dd\/yyyy\)/g, '');

// Remove technical scene directions but keep the scene number
narration = narration.replace(/^(EXT\.|INT\.).*$/gm, '');
narration = narration.replace(/FADE IN:/g, '');
narration = narration.replace(/CUT TO:/g, '');
narration = narration.replace(/Opening Credits start/g, '');
narration = narration.replace(/Opening Credits end/g, '');
narration = narration.replace(/With Opening Credits/g, '');

// Remove parenthetical notes but keep dialogue
narration = narration.replace(/\(MORE\)/g, '');
narration = narration.replace(/\(CONT'D\)/g, '');
narration = narration.replace(/\(Note:.*?\)/g, '');

// Remove asterisk marks
narration = narration.replace(/^\s*\*\s*$/gm, '');

// Remove shot descriptions
narration = narration.replace(/^Shot:.*$/gm, '');
narration = narration.replace(/^Different montage shots.*$/gm, '');

// Clean excessive whitespace
narration = narration.replace(/\n{3,}/g, '\n\n');
narration = narration.trim();

// Count words (excluding technical stuff)
const wordCount = narration.split(/\s+/).filter(w => w.length > 0).length;

console.log('═══════════════════════════════════════════════════════════');
console.log('📝 HARYANVI NARRATION EXTRACTED');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Words: ${wordCount}`);
console.log(`Characters: ${narration.length}`);
console.log(`Estimated duration: ~${Math.round(wordCount/150)} minutes`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Show preview
console.log('PREVIEW (first 1000 chars):');
console.log('─'.repeat(60));
console.log(narration.substring(0, 1000));
console.log('─'.repeat(60));
console.log('');

// Save cleaned narration
const outputPath = '/tmp/phaans-haryanvi-narration.txt';
fs.writeFileSync(outputPath, narration);

console.log(`✅ Saved to: ${outputPath}`);
console.log(`   Word count: ${wordCount} words`);

// If still too long, create a shorter version
if (wordCount > 2800) {
  const words = narration.split(/\s+/);
  const shortNarration = words.slice(0, 2800).join(' ') + '... (continued)';
  fs.writeFileSync('/tmp/phaans-short-narration.txt', shortNarration);
  console.log(`✅ Short version (2800 words): /tmp/phaans-short-narration.txt`);
}
