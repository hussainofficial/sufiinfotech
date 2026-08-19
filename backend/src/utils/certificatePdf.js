// Draws the Sufi Infotech certificate layout onto an already-created PDFKit document.
// Kept separate from the controller so the layout can be tweaked without touching the DB/route logic.

const NAVY = '#12235c';
const RED = '#d31414';
const BLUE = '#0b63b8';
const ORANGE = '#e8850f';
const INK = '#1a1a1a';

const GRADE_SCALE = [
  { grade: 'A+', label: 'Excellent', min: 85 },
  { grade: 'A', label: 'Very Good', min: 75 },
  { grade: 'B+', label: 'Good', min: 65 },
  { grade: 'B', label: 'Fair', min: 55 },
];

function gradeForPercentage(pct) {
  if (pct == null) return null;
  for (const g of GRADE_SCALE) if (pct >= g.min) return g.grade;
  return 'C';
}

function drawLogo(doc, x, y) {
  // Orange swoosh behind the wordmark.
  doc.save();
  doc.moveTo(x, y + 18)
    .bezierCurveTo(x + 15, y - 8, x + 55, y - 8, x + 78, y + 4)
    .lineWidth(5)
    .strokeColor(ORANGE)
    .stroke();
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text('SUFI', x, y + 6);
  doc.rect(x, y + 30, 70, 13).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('white').text('INFOTECH', x + 4, y + 33);
}

function drawCertifiedBadge(doc, cx, cy, year) {
  doc.save();
  // Ribbon tails
  doc.polygon([cx - 10, cy + 20], [cx - 2, cy + 45], [cx - 14, cy + 42]).fill(RED);
  doc.polygon([cx + 10, cy + 20], [cx + 2, cy + 45], [cx + 14, cy + 42]).fill(RED);
  // Star burst circle
  doc.circle(cx, cy, 22).fillAndStroke('#fdf2f2', RED);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(RED).text('CERTIFIED', cx - 20, cy - 8, { width: 40, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(RED).text(String(year), cx - 20, cy + 2, { width: 40, align: 'center' });
  doc.restore();
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {string} data.studentName
 * @param {string} data.courseTitle
 * @param {number} data.durationWeeks
 * @param {string} data.certificateCode
 * @param {string} data.enrollmentNo
 * @param {Date} data.issuedDate
 * @param {number|null} data.percentage
 */
function drawCertificate(doc, data) {
  const { studentName, courseTitle, durationWeeks, certificateCode, enrollmentNo, issuedDate, percentage } = data;
  const grade = gradeForPercentage(percentage);
  const pageW = doc.page.width;
  const pageH = doc.page.height;

  // Outer + inner border
  doc.rect(14, 14, pageW - 28, pageH - 28).lineWidth(3).stroke(NAVY);
  doc.rect(20, 20, pageW - 40, pageH - 40).lineWidth(1).stroke(BLUE);

  // Header
  drawLogo(doc, 40, 45);
  doc.font('Helvetica-Bold').fontSize(34).fillColor(RED).text('SUFI INFOTECH', 130, 45, { width: pageW - 170, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLUE)
    .text('An Autonomous Body Registered Under Society Registration Act 21-1860 (Government of India)', 130, 85, { width: pageW - 170, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#444')
    .text('Sufi Infotech Patna, Nawab Bahadur Road, Patna City - 800008', 130, 100, { width: pageW - 170, align: 'center' });

  doc.rect(40, 122, pageW - 80, 4).fill(BLUE);

  // "Certificate" script heading
  doc.font('Times-BoldItalic').fontSize(38).fillColor(RED).text('Certificate', 0, 140, { align: 'center' });

  // Enrollment / Certificate No / Date block
  const infoY = 195;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK)
    .text(`Enrollment No: ${enrollmentNo}`, 45, infoY)
    .text(`Certificate No: ${certificateCode}   Dated: ${issuedDate}`, 45, infoY + 15);

  // Grade legend
  const legendY = infoY + 45;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Grade:', 45, legendY);
  const legend = [
    ['A+', '(Excellent) => 85%'],
    ['B+', '(Good) => 65%'],
    ['A', '(Very Good) => 75%'],
    ['B', '(Fair) => 55%'],
  ];
  legend.forEach(([g, desc], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const lx = 45 + col * 140;
    const ly = legendY + 18 + row * 34;
    const isEarned = g === grade;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(isEarned ? RED : INK).text(g, lx, ly, { continued: false });
    doc.font('Helvetica').fontSize(9).fillColor('#444').text(desc, lx, ly + 15);
  });

  // Photo placeholder + certified badge (right side)
  const photoX = pageW - 175;
  doc.rect(photoX, infoY, 100, 120).lineWidth(1).stroke('#999');
  doc.font('Helvetica').fontSize(8).fillColor('#888')
    .text('Student Photo', photoX, infoY + 130, { width: 100, align: 'center' });
  drawCertifiedBadge(doc, photoX - 40, infoY + 40, new Date(issuedDate).getFullYear() || new Date().getFullYear());

  // Body text
  let y = 360;
  const centerText = (text, size, font, color, gap = 22) => {
    doc.font(font).fontSize(size).fillColor(color).text(text, 60, y, { width: pageW - 120, align: 'center' });
    y += gap;
  };

  centerText('This is to Certify that Mr. / Mrs. / Miss', 15, 'Times-Roman', INK, 30);
  centerText(studentName, 24, 'Helvetica-Bold', BLUE, 40);
  centerText('has Successfully Completed', 15, 'Times-Roman', INK, 26);
  centerText(`"${durationWeeks || '—'}" Weeks`, 15, 'Times-Bold', INK, 30);
  centerText(courseTitle, 20, 'Helvetica-Bold', BLUE, 38);
  centerText('from our Institution at', 15, 'Times-Roman', INK, 26);
  centerText('Sufi Infotech Patna', 18, 'Helvetica-Bold', BLUE, 34);
  centerText(grade ? `and he/she awarded Grade "${grade}"` : 'and we appreciate his/her dedication', 15, 'Times-Roman', RED, 30);
  centerText('we Wish Him/Her All Success.', 15, 'Times-Roman', INK, 40);

  // Footer: signatures
  const footY = pageH - 110;
  doc.font('Helvetica').fontSize(9).fillColor(INK)
    .text('For and Behalf of', pageW - 220, footY - 20, { width: 170, align: 'right' })
    .text('Q. E. M. Society', pageW - 220, footY - 8, { width: 170, align: 'right' });

  doc.moveTo(50, footY + 30).lineTo(180, footY + 30).stroke('#999');
  doc.font('Helvetica').fontSize(9).text('Institution Head', 50, footY + 34, { width: 130, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#666').text('Sufi Infotech Patna', 50, footY + 46, { width: 130, align: 'center' });

  doc.moveTo(pageW - 180, footY + 30).lineTo(pageW - 50, footY + 30).stroke('#999');
  doc.font('Helvetica').fontSize(9).fillColor(INK).text('Authorised Signatory', pageW - 180, footY + 34, { width: 130, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE)
    .text('Goals Designed for Success', 0, footY + 55, { align: 'center' });

  doc.font('Helvetica').fontSize(7).fillColor('#999')
    .text(`Verify this certificate at sufiinfotech.in/verify/${certificateCode}`, 0, pageH - 30, { align: 'center' });
}

module.exports = { drawCertificate, gradeForPercentage };
