const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, 'architecture_blueprint.html');
const pdfPath = path.join(__dirname, '..', 'Byzid_Apparels_Platform_Construction_Details_and_Flowcharts.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Compiling PDF from:', htmlPath);
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const command = `"${edgePath}" --headless=new --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${fileUrl}"`;

try {
  execSync(command);
  console.log('PDF successfully generated at:', pdfPath);
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('PDF File Size:', stats.size, 'bytes');
    const rootCopyPath = 'd:\\Sinking Voyage\\Byzid_Apparels_Platform_Construction_Details_and_Flowcharts.pdf';
    fs.copyFileSync(pdfPath, rootCopyPath);
    console.log('PDF successfully copied to root at:', rootCopyPath);
  }
} catch (error) {
  console.error('Error generating PDF:', error.message);
}
