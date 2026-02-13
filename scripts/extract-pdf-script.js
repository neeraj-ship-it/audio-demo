const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPDF() {
  const pdfPath = '/Users/neerajsachdeva/Desktop/SCRIPTS/Kaand 2010 Shoot Script (1).pdf';

  try {
    const dataBuffer = fs.readFileSync(pdfPath);

    // pdf-parse returns a promise
    pdf(dataBuffer).then(function(data) {
      console.log('📄 PDF Script Extracted Successfully!');
      console.log('='.repeat(70));
      console.log(`Pages: ${data.numpages}`);
      console.log(`Characters: ${data.text.length}`);
      console.log('='.repeat(70));
      console.log('\n');

      // Print first 2000 characters
      console.log(data.text.substring(0, 2000));
      console.log('\n...\n');

      // Save to text file
      fs.writeFileSync('/Users/neerajsachdeva/Desktop/audio-demo/scripts/kaand-2010-script.txt', data.text);
      console.log('\n✅ Script saved to: scripts/kaand-2010-script.txt');
    });

  } catch (error) {
    console.error('❌ Error extracting PDF:', error.message);
  }
}

extractPDF();
