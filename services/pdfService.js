const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const NAVY  = '#0a1628';
const GOLD  = '#c9a227';
const WHITE = '#ffffff';
const LIGHT = '#f5f5f5';
const GRAY  = '#666666';
const GREEN = '#2e7d32';
const RED   = '#c62828';

function addWatermark(doc) {
  doc.save();
  doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
  doc.font('Helvetica-Bold').fontSize(52)
    .fillColor(GOLD).opacity(0.06)
    .text('GLOBAL PATHWAY UNIVERSITY', 0, doc.page.height / 2 - 40, {
      align: 'center', width: doc.page.width,
    });
  doc.restore();
}

function addHeader(doc, title, subtitle = '') {
  doc.rect(0, 0, doc.page.width, 110).fill(NAVY);
  doc.rect(0, 108, doc.page.width, 3).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(GOLD)
    .text('GLOBAL PATHWAY UNIVERSITY', 40, 25, { align: 'center', width: doc.page.width - 80 });
  doc.font('Helvetica').fontSize(9).fillColor(WHITE).opacity(0.6)
    .text('Excellence in Education · Est. 2000', 40, 50, { align: 'center', width: doc.page.width - 80 });
  doc.opacity(1);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(WHITE)
    .text(title, 40, 70, { align: 'center', width: doc.page.width - 80 });
  if (subtitle) {
    doc.font('Helvetica').fontSize(9).fillColor(GOLD)
      .text(subtitle, 40, 88, { align: 'center', width: doc.page.width - 80 });
  }
}

function addFooter(doc) {
  const bottom = doc.page.height - 40;
  doc.rect(0, bottom - 8, doc.page.width, 48).fill(NAVY);
  doc.rect(0, bottom - 8, doc.page.width, 3).fill(GOLD);
  doc.font('Helvetica').fontSize(8).fillColor(WHITE).opacity(0.5)
    .text('Global Pathway University · ERP Portal · Confidential Document', 40, bottom + 4,
      { align: 'center', width: doc.page.width - 80 });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, bottom + 16,
    { align: 'center', width: doc.page.width - 80 });
  doc.opacity(1);
}

function infoRow(doc, y, label, value, x = 40) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY).text(label.toUpperCase(), x, y);
  doc.font('Helvetica').fontSize(10).fillColor('#1a1a1a').text(value || '—', x + 130, y);
}

function sectionTitle(doc, text, y) {
  doc.rect(40, y, doc.page.width - 80, 22).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD)
    .text(text, 50, y + 6, { width: doc.page.width - 100 });
  return y + 22;
}

function tableHeader(doc, y, cols, headers) {
  doc.rect(40, y, doc.page.width - 80, 20).fill('#1a237e');
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD)
      .text(h, cols[i] + 3, y + 6, { width: (cols[i + 1] || doc.page.width - 40) - cols[i] - 6 });
  });
  return y + 20;
}

// ─── 1. ATTENDANCE REPORT ────────────────────────────────────────────────────
async function generateAttendanceReport(student, attendanceData) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addWatermark(doc);
    addHeader(doc, 'ATTENDANCE REPORT', `Academic Year ${new Date().getFullYear()}`);

    let y = 130;
    doc.rect(40, y, doc.page.width - 80, 80).fill(LIGHT).stroke('#e0e0e0');
    y += 10;
    infoRow(doc, y, 'Student Name', student.user?.name);
    infoRow(doc, y, 'Roll Number',  student.rollNumber, 300);
    y += 18;
    infoRow(doc, y, 'Department',   student.department?.name);
    infoRow(doc, y, 'Semester',     `Semester ${student.semester}`, 300);
    y += 18;
    infoRow(doc, y, 'Email',        student.user?.email);
    y += 24;

    const overall = attendanceData.length
      ? (attendanceData.reduce((s, a) => s + parseFloat(a.percentage), 0) / attendanceData.length).toFixed(1)
      : 0;

    y = sectionTitle(doc, 'ATTENDANCE SUMMARY', y);
    y += 10;
    const summaryColor = overall >= 75 ? GREEN : RED;
    doc.rect(40, y, doc.page.width - 80, 36).fill(overall >= 75 ? '#e8f5e9' : '#ffebee').stroke(summaryColor);
    doc.font('Helvetica-Bold').fontSize(22).fillColor(summaryColor).text(`${overall}%`, 50, y + 7);
    doc.font('Helvetica').fontSize(10).fillColor(summaryColor)
      .text(overall >= 75 ? '✓ Good Standing — Eligible for Exams' : '⚠ Below 75% — Action Required', 120, y + 14);
    y += 50;

    const cols    = [40, 190, 310, 370, 430, 490];
    const headers = ['Course Name', 'Course Code', 'Present', 'Total', 'Absent', 'Percentage'];
    y = sectionTitle(doc, 'COURSE-WISE ATTENDANCE', y);
    y += 5;
    y = tableHeader(doc, y, cols, headers);

    attendanceData.forEach((a, idx) => {
      const pct    = parseFloat(a.percentage);
      const absent = a.total - a.present;
      const bg     = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg).stroke('#e0e0e0');
      [a.course?.name || '—', a.course?.code || '—', a.present, a.total, absent, `${pct}%`].forEach((v, i) => {
        const color = i === 5 ? (pct >= 75 ? GREEN : RED) : '#1a1a1a';
        doc.font(i === 5 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(color)
          .text(String(v), cols[i] + 3, y + 6, { width: (cols[i + 1] || 555) - cols[i] - 6 });
      });
      y += 20;
      if (y > doc.page.height - 80) { doc.addPage(); addWatermark(doc); y = 40; }
    });

    addFooter(doc);
    doc.end();
  });
}

// ─── 2. RESULT REPORT ────────────────────────────────────────────────────────
async function generateResultReport(student, results) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addWatermark(doc);
    addHeader(doc, 'STUDENT RESULT REPORT', `Semester ${student.semester}`);

    let y = 130;
    doc.rect(40, y, doc.page.width - 80, 80).fill(LIGHT).stroke('#e0e0e0');
    y += 10;
    infoRow(doc, y, 'Student Name', student.user?.name);
    infoRow(doc, y, 'Roll Number',  student.rollNumber, 300);
    y += 18;
    infoRow(doc, y, 'Department',   student.department?.name);
    infoRow(doc, y, 'Semester',     `Semester ${student.semester}`, 300);
    y += 18;
    infoRow(doc, y, 'Email',        student.user?.email);
    y += 24;

    const cols    = [40, 180, 310, 380, 430, 490];
    const headers = ['Course', 'Exam Name', 'Type', 'Marks', 'Grade', 'Status'];
    y = sectionTitle(doc, 'EXAMINATION RESULTS', y);
    y += 5;
    y = tableHeader(doc, y, cols, headers);

    const gradePoints = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, D: 5, F: 0 };
    let totalMarks = 0, totalObtained = 0, gpTotal = 0;

    results.forEach((r, idx) => {
      const pct  = r.exam?.totalMarks ? Math.round((r.marksObtained / r.exam.totalMarks) * 100) : 0;
      const pass = pct >= 40;
      totalMarks    += r.exam?.totalMarks || 0;
      totalObtained += r.marksObtained;
      gpTotal       += gradePoints[r.grade] || 0;

      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg).stroke('#e0e0e0');
      [
        r.exam?.course?.name || '—', r.exam?.name || '—', r.exam?.examType || '—',
        `${r.marksObtained}/${r.exam?.totalMarks || 0}`, r.grade, pass ? 'PASS' : 'FAIL',
      ].forEach((v, i) => {
        const color = i === 4 ? (r.grade === 'F' ? RED : GREEN) : i === 5 ? (pass ? GREEN : RED) : '#1a1a1a';
        doc.font(i === 4 || i === 5 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(color)
          .text(v, cols[i] + 3, y + 6, { width: (cols[i + 1] || 555) - cols[i] - 6 });
      });
      y += 20;
    });

    y += 12;
    const overallPct = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : 0;
    const gpa        = results.length ? (gpTotal / results.length).toFixed(2) : 0;
    const passed     = parseFloat(overallPct) >= 40;

    y = sectionTitle(doc, 'RESULT SUMMARY', y);
    y += 10;
    [['Total Marks', `${totalObtained} / ${totalMarks}`], ['Percentage', `${overallPct}%`],
     ['GPA', gpa], ['Status', passed ? 'PASS' : 'FAIL']].forEach(([label, value], i) => {
      const bx = 40 + i * 126;
      doc.rect(bx, y, 120, 50).fill(i === 3 ? (passed ? '#e8f5e9' : '#ffebee') : LIGHT).stroke('#e0e0e0');
      doc.font('Helvetica').fontSize(8).fillColor(GRAY).text(label, bx + 8, y + 8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(i === 3 ? (passed ? GREEN : RED) : NAVY)
        .text(String(value), bx + 8, y + 22);
    });

    addFooter(doc);
    doc.end();
  });
}

// ─── 3. STUDENT ID CARD ──────────────────────────────────────────────────────
async function generateIDCard(student) {
  return new Promise(async (resolve, reject) => {
    const doc    = new PDFDocument({ size: [595, 400], margin: 0 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, 595, 400).fill(NAVY);
    doc.rect(0, 0, 595, 5).fill(GOLD);
    doc.rect(0, 395, 595, 5).fill(GOLD);
    doc.rect(0, 0, 5, 400).fill(GOLD);
    doc.rect(590, 0, 5, 400).fill(GOLD);

    doc.font('Helvetica-Bold').fontSize(16).fillColor(GOLD)
      .text('GLOBAL PATHWAY UNIVERSITY', 20, 20, { align: 'center', width: 555 });
    doc.font('Helvetica').fontSize(8).fillColor(WHITE).opacity(0.6)
      .text('OFFICIAL STUDENT IDENTITY CARD', 20, 42, { align: 'center', width: 555 });
    doc.opacity(1);
    doc.rect(20, 58, 555, 1).fill(GOLD).opacity(0.4);
    doc.opacity(1);

    doc.circle(90, 160, 55).fill('#1a237e').stroke(GOLD);
    doc.font('Helvetica-Bold').fontSize(28).fillColor(GOLD)
      .text((student.user?.name?.[0] || 'S').toUpperCase(), 68, 140);

    const detailX = 165;
    doc.font('Helvetica-Bold').fontSize(17).fillColor(WHITE).text(student.user?.name || '—', detailX, 80);
    doc.font('Helvetica').fontSize(10).fillColor(GOLD).text(student.department?.name || '—', detailX, 102);
    doc.rect(detailX, 118, 200, 1).fill(GOLD).opacity(0.3);
    doc.opacity(1);

    [['Roll No.', student.rollNumber], ['Semester', `Semester ${student.semester}`],
     ['Blood Group', student.bloodGroup || 'N/A'], ['Email', student.user?.email || '—']
    ].forEach(([k, v], i) => {
      const fy = 128 + i * 22;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).opacity(0.7).text(k.toUpperCase(), detailX, fy);
      doc.opacity(1).font('Helvetica').fontSize(10).fillColor(WHITE).text(v, detailX + 80, fy);
    });

    try {
      const qrBuf = await QRCode.toBuffer(`GPU-${student.rollNumber}-${student._id}`,
        { width: 90, margin: 1, color: { dark: '#0a1628', light: '#ffffff' } });
      doc.rect(460, 80, 110, 110).fill(WHITE).stroke(GOLD);
      doc.image(qrBuf, 465, 85, { width: 100, height: 100 });
    } catch (_) {}

    doc.rect(0, 340, 595, 60).fill('#06112a');
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).opacity(0.7)
      .text('Valid for Academic Year 2024–2025', 20, 355, { align: 'center', width: 555 });
    doc.opacity(1).font('Helvetica').fontSize(7).fillColor(WHITE).opacity(0.4)
      .text('If found, please return to Global Pathway University — ERP Portal', 20, 370, { align: 'center', width: 555 });
    doc.opacity(1);

    doc.end();
  });
}

// ─── 4. FEE RECEIPT ──────────────────────────────────────────────────────────
async function generateFeeReceipt(student, fees) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addWatermark(doc);
    addHeader(doc, 'FEE RECEIPT', `Generated on ${new Date().toLocaleDateString('en-IN')}`);

    let y = 130;
    const receiptNo = `GPU-FEE-${Date.now().toString().slice(-8)}`;

    doc.rect(40, y, doc.page.width - 80, 85).fill(LIGHT).stroke('#e0e0e0');
    y += 10;
    infoRow(doc, y, 'Student Name', student.user?.name);
    infoRow(doc, y, 'Receipt No.',  receiptNo, 300);
    y += 18;
    infoRow(doc, y, 'Roll Number',  student.rollNumber);
    infoRow(doc, y, 'Date',         new Date().toLocaleDateString('en-IN'), 300);
    y += 18;
    infoRow(doc, y, 'Department',   student.department?.name);
    infoRow(doc, y, 'Semester',     `Semester ${student.semester}`, 300);
    y += 28;

    const cols    = [40, 180, 290, 380, 460];
    const headers = ['Fee Type', 'Amount (Rs.)', 'Due Date', 'Paid Date', 'Status'];
    y = sectionTitle(doc, 'FEE DETAILS', y);
    y += 5;
    y = tableHeader(doc, y, cols, headers);

    let total = 0, paid = 0;
    fees.forEach((f, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg).stroke('#e0e0e0');
      total += f.amount;
      if (f.status === 'paid') paid += f.amount;
      [
        f.feeType.charAt(0).toUpperCase() + f.feeType.slice(1),
        `Rs.${f.amount.toLocaleString()}`,
        new Date(f.dueDate).toLocaleDateString('en-IN'),
        f.paidDate ? new Date(f.paidDate).toLocaleDateString('en-IN') : '—',
        f.status.toUpperCase(),
      ].forEach((v, i) => {
        const color = i === 4 ? (f.status === 'paid' ? GREEN : f.status === 'overdue' ? RED : '#ff6f00') : '#1a1a1a';
        doc.font(i === 4 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(color)
          .text(v, cols[i] + 3, y + 6, { width: (cols[i + 1] || 555) - cols[i] - 6 });
      });
      y += 20;
    });

    y += 5;
    doc.rect(40, y, doc.page.width - 80, 28).fill('#1a237e');
    doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD)
      .text('TOTAL', 50, y + 8).text(`Rs.${total.toLocaleString()}`, 180, y + 8);
    doc.fillColor(GREEN).text(`Paid: Rs.${paid.toLocaleString()}`, 290, y + 8);
    doc.fillColor(RED).text(`Pending: Rs.${(total - paid).toLocaleString()}`, 400, y + 8);

    addFooter(doc);
    doc.end();
  });
}

// ─── 5. BONAFIDE CERTIFICATE ─────────────────────────────────────────────────
async function generateBonafide(student) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 60 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addWatermark(doc);
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke(GOLD);
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke(NAVY);
    addHeader(doc, 'BONAFIDE CERTIFICATE');

    let y = 150;
    const certNo = `GPU-BON-${Date.now().toString().slice(-6)}`;

    doc.font('Helvetica').fontSize(9).fillColor(GRAY)
      .text(`Certificate No: ${certNo}  |  Date: ${new Date().toLocaleDateString('en-IN')}`,
        60, y, { align: 'right', width: doc.page.width - 120 });
    y += 30;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY)
      .text('TO WHOMSOEVER IT MAY CONCERN', 60, y, { align: 'center', width: doc.page.width - 120 });
    y += 30;

    const body = `This is to certify that ${(student.user?.name || 'N/A').toUpperCase()}, bearing Roll Number `
      + `${student.rollNumber}, is a bonafide student of ${student.department?.name || 'N/A'} Department at `
      + `Global Pathway University. The student is currently enrolled in Semester ${student.semester} `
      + `of the degree program for the academic year 2024–2025.`;

    doc.font('Helvetica').fontSize(12).fillColor('#1a1a1a')
      .text(body, 60, y, { align: 'justify', width: doc.page.width - 120, lineGap: 8 });
    y += 140;

    doc.font('Helvetica').fontSize(12).fillColor('#1a1a1a')
      .text('This certificate is issued upon the request of the student for the purpose of _____________________.', 60, y,
        { align: 'justify', width: doc.page.width - 120 });
    y += 70;

    const details = [
      ['Name', student.user?.name], ['Roll No.', student.rollNumber],
      ['Department', student.department?.name], ['Semester', `Semester ${student.semester}`],
      ['Admission', new Date(student.admissionDate).toLocaleDateString('en-IN')],
    ];
    doc.rect(60, y, doc.page.width - 120, details.length * 22 + 16).fill('#f0f4ff').stroke('#c5cae9');
    y += 10;
    details.forEach(([k, v]) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY).text(`${k}:`, 80, y);
      doc.font('Helvetica').fontSize(10).fillColor('#1a1a1a').text(v || '—', 200, y);
      y += 22;
    });

    y += 30;
    doc.rect(60, y + 40, 150, 1).fill(NAVY);
    doc.rect(doc.page.width - 210, y + 40, 150, 1).fill(NAVY);
    doc.font('Helvetica').fontSize(9).fillColor(GRAY)
      .text('Student Signature', 60, y + 45)
      .text('Registrar / Principal', doc.page.width - 210, y + 45);

    addFooter(doc);
    doc.end();
  });
}

// ─── 6. SEMESTER GRADE CARD ──────────────────────────────────────────────────
async function generateGradeCard(student, results) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addWatermark(doc);
    addHeader(doc, 'SEMESTER GRADE CARD', `Semester ${student.semester} — Academic Year 2024–2025`);

    let y = 130;
    doc.rect(40, y, doc.page.width - 80, 60).fill(LIGHT).stroke('#e0e0e0');
    y += 10;
    infoRow(doc, y, 'Student Name', student.user?.name);
    infoRow(doc, y, 'Roll Number',  student.rollNumber, 300);
    y += 18;
    infoRow(doc, y, 'Department',   student.department?.name);
    infoRow(doc, y, 'Semester',     `Semester ${student.semester}`, 300);
    y += 32;

    const cols    = [40, 200, 330, 390, 440, 500];
    const headers = ['Course', 'Exam', 'Marks', 'Percentage', 'Grade', 'Grade Point'];
    y = sectionTitle(doc, 'GRADE SHEET', y);
    y += 5;
    y = tableHeader(doc, y, cols, headers);

    const gradePoints = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, D: 5, F: 0 };
    let gpTotal = 0, totalMarks = 0, totalObtained = 0;

    results.forEach((r, idx) => {
      const pct = r.exam?.totalMarks ? ((r.marksObtained / r.exam.totalMarks) * 100).toFixed(1) : 0;
      const gp  = gradePoints[r.grade] || 0;
      gpTotal       += gp;
      totalMarks    += r.exam?.totalMarks || 0;
      totalObtained += r.marksObtained;

      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg).stroke('#e0e0e0');
      [r.exam?.course?.name || '—', r.exam?.name || '—',
       `${r.marksObtained}/${r.exam?.totalMarks}`, `${pct}%`, r.grade, String(gp)].forEach((v, i) => {
        const color = i === 4 ? (r.grade === 'F' ? RED : GREEN) : '#1a1a1a';
        doc.font(i === 4 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(color)
          .text(v, cols[i] + 3, y + 6, { width: (cols[i + 1] || 555) - cols[i] - 6 });
      });
      y += 20;
    });

    y += 12;
    const sgpa    = results.length ? (gpTotal / results.length).toFixed(2) : 0;
    const overPct = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : 0;
    const passed  = parseFloat(overPct) >= 40;

    y = sectionTitle(doc, 'GRADE SUMMARY', y);
    y += 10;
    [['SGPA', sgpa], ['Percentage', `${overPct}%`], ['Result', passed ? 'PASS' : 'FAIL']].forEach(([label, val], i) => {
      const bx = 40 + i * 170;
      doc.rect(bx, y, 160, 50).fill(LIGHT).stroke('#e0e0e0');
      doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(label, bx + 10, y + 10);
      doc.font('Helvetica-Bold').fontSize(18).fillColor(i === 2 ? (passed ? GREEN : RED) : NAVY)
        .text(String(val), bx + 10, y + 24);
    });

    addFooter(doc);
    doc.end();
  });
}

module.exports = {
  generateAttendanceReport,
  generateResultReport,
  generateIDCard,
  generateFeeReceipt,
  generateBonafide,
  generateGradeCard,
};
