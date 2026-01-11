import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { QuestionState, WritingAnswers } from '@/types/exam';

type FileFormat = 'txt' | 'pdf' | 'docx';
type TestType = 'reading' | 'listening' | 'writing';

interface DownloadOptions {
  format: FileFormat;
  testType: TestType;
  date?: Date;
  timeSpent: number;
}

interface ReadingListeningData {
  questions: QuestionState[];
}

interface WritingData {
  answers: WritingAnswers;
}

// Helper to format time
const formatTimeSpent = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate plain text content
const generateReadingListeningText = (data: ReadingListeningData, options: DownloadOptions): string => {
  const { questions } = data;
  const { testType, date = new Date(), timeSpent } = options;
  const testName = testType === 'reading' ? 'Reading' : 'Listening';
  
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const unansweredCount = 40 - answeredCount;

  let content = `IELTS ${testName} Test - Answer Sheet\n`;
  content += `${'='.repeat(50)}\n\n`;
  content += `Date: ${formatDate(date)}\n`;
  content += `Time Taken: ${formatTimeSpent(timeSpent)}\n`;
  content += `Answered: ${answeredCount}/40\n`;
  content += `Unanswered: ${unansweredCount}\n\n`;
  content += `${'='.repeat(50)}\n`;
  content += `ANSWERS\n`;
  content += `${'='.repeat(50)}\n\n`;

  for (let i = 1; i <= 40; i++) {
    const answer = questions[i]?.value || '(No Answer)';
    const marked = questions[i]?.marked ? ' [MARKED]' : '';
    content += `${i.toString().padStart(2, '0')}. ${answer}${marked}\n`;
  }

  return content;
};

const generateWritingText = (data: WritingData, options: DownloadOptions): string => {
  const { answers } = data;
  const { date = new Date(), timeSpent } = options;
  
  const task1Words = answers.task1.trim() ? answers.task1.trim().split(/\s+/).length : 0;
  const task2Words = answers.task2.trim() ? answers.task2.trim().split(/\s+/).length : 0;
  const task1Complete = task1Words >= 150;
  const task2Complete = task2Words >= 250;

  let content = `IELTS Writing Test - Answer Sheet\n`;
  content += `${'='.repeat(60)}\n\n`;
  content += `Date: ${formatDate(date)}\n`;
  content += `Time Taken: ${formatTimeSpent(timeSpent)}\n`;
  content += `Total Words: ${task1Words + task2Words}\n`;
  content += `Tasks Complete: ${(task1Complete ? 1 : 0) + (task2Complete ? 1 : 0)}/2\n\n`;
  
  content += `${'='.repeat(60)}\n`;
  content += `TASK 1 (${task1Words} words - Target: 150+)\n`;
  content += `${'='.repeat(60)}\n\n`;
  content += answers.task1 || '(No Response)\n';
  content += `\n\n`;
  
  content += `${'='.repeat(60)}\n`;
  content += `TASK 2 (${task2Words} words - Target: 250+)\n`;
  content += `${'='.repeat(60)}\n\n`;
  content += answers.task2 || '(No Response)\n';

  return content;
};

// Generate PDF
const generateReadingListeningPDF = (data: ReadingListeningData, options: DownloadOptions): jsPDF => {
  const { questions } = data;
  const { testType, date = new Date(), timeSpent } = options;
  const testName = testType === 'reading' ? 'Reading' : 'Listening';
  
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const unansweredCount = 40 - answeredCount;

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`IELTS ${testName} Test - Answer Sheet`, 105, y, { align: 'center' });
  y += 15;

  // Date and stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(date)}`, 20, y);
  y += 6;
  doc.text(`Time Taken: ${formatTimeSpent(timeSpent)}`, 20, y);
  y += 6;
  doc.text(`Answered: ${answeredCount}/40  |  Unanswered: ${unansweredCount}`, 20, y);
  y += 12;

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Answers in two columns
  doc.setFontSize(11);
  const colWidth = 85;
  const startX1 = 20;
  const startX2 = 110;

  for (let i = 1; i <= 40; i++) {
    const answer = questions[i]?.value || '(No Answer)';
    const marked = questions[i]?.marked ? ' *' : '';
    const text = `${i.toString().padStart(2, '0')}. ${answer}${marked}`;
    
    if (i <= 20) {
      doc.text(text, startX1, y + (i - 1) * 7, { maxWidth: colWidth });
    } else {
      doc.text(text, startX2, y + (i - 21) * 7, { maxWidth: colWidth });
    }
  }

  y += 145;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('* Marked for review', 20, y);

  return doc;
};

const generateWritingPDF = (data: WritingData, options: DownloadOptions): jsPDF => {
  const { answers } = data;
  const { date = new Date(), timeSpent } = options;
  
  const task1Words = answers.task1.trim() ? answers.task1.trim().split(/\s+/).length : 0;
  const task2Words = answers.task2.trim() ? answers.task2.trim().split(/\s+/).length : 0;

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('IELTS Writing Test - Answer Sheet', 105, y, { align: 'center' });
  y += 15;

  // Stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(date)}`, 20, y);
  y += 6;
  doc.text(`Time Taken: ${formatTimeSpent(timeSpent)}  |  Total Words: ${task1Words + task2Words}`, 20, y);
  y += 12;

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Task 1
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Task 1 (${task1Words} words)`, 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const task1Lines = doc.splitTextToSize(answers.task1 || '(No Response)', 170);
  doc.text(task1Lines, 20, y);
  y += task1Lines.length * 5 + 15;

  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Task 2
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Task 2 (${task2Words} words)`, 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const task2Lines = doc.splitTextToSize(answers.task2 || '(No Response)', 170);
  
  // Handle page overflow for Task 2
  const linesPerPage = 40;
  let currentLine = 0;
  while (currentLine < task2Lines.length) {
    const remainingSpace = Math.floor((280 - y) / 5);
    const linesToPrint = task2Lines.slice(currentLine, currentLine + remainingSpace);
    doc.text(linesToPrint, 20, y);
    currentLine += remainingSpace;
    if (currentLine < task2Lines.length) {
      doc.addPage();
      y = 20;
    }
  }

  return doc;
};

// Generate DOCX
const generateReadingListeningDocx = async (data: ReadingListeningData, options: DownloadOptions): Promise<Blob> => {
  const { questions } = data;
  const { testType, date = new Date(), timeSpent } = options;
  const testName = testType === 'reading' ? 'Reading' : 'Listening';
  
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const unansweredCount = 40 - answeredCount;

  const children: Paragraph[] = [
    new Paragraph({
      text: `IELTS ${testName} Test - Answer Sheet`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun(formatDate(date)),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Time Taken: ', bold: true }),
        new TextRun(formatTimeSpent(timeSpent)),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Answered: ', bold: true }),
        new TextRun(`${answeredCount}/40`),
        new TextRun('  |  '),
        new TextRun({ text: 'Unanswered: ', bold: true }),
        new TextRun(`${unansweredCount}`),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'ANSWERS',
      heading: HeadingLevel.HEADING_2,
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      },
    }),
    new Paragraph({ text: '' }),
  ];

  // Add answers
  for (let i = 1; i <= 40; i++) {
    const answer = questions[i]?.value || '(No Answer)';
    const marked = questions[i]?.marked ? ' [MARKED]' : '';
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i.toString().padStart(2, '0')}. `, bold: true }),
          new TextRun(answer + marked),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
};

const generateWritingDocx = async (data: WritingData, options: DownloadOptions): Promise<Blob> => {
  const { answers } = data;
  const { date = new Date(), timeSpent } = options;
  
  const task1Words = answers.task1.trim() ? answers.task1.trim().split(/\s+/).length : 0;
  const task2Words = answers.task2.trim() ? answers.task2.trim().split(/\s+/).length : 0;

  const children: Paragraph[] = [
    new Paragraph({
      text: 'IELTS Writing Test - Answer Sheet',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun(formatDate(date)),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Time Taken: ', bold: true }),
        new TextRun(formatTimeSpent(timeSpent)),
        new TextRun('  |  '),
        new TextRun({ text: 'Total Words: ', bold: true }),
        new TextRun(`${task1Words + task2Words}`),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: `Task 1 (${task1Words} words)`,
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: '' }),
  ];

  // Add Task 1 content (split by paragraphs)
  const task1Paragraphs = (answers.task1 || '(No Response)').split('\n');
  task1Paragraphs.forEach(p => {
    children.push(new Paragraph({ text: p }));
  });

  children.push(new Paragraph({ text: '' }));
  children.push(
    new Paragraph({
      text: `Task 2 (${task2Words} words)`,
      heading: HeadingLevel.HEADING_2,
    })
  );
  children.push(new Paragraph({ text: '' }));

  // Add Task 2 content
  const task2Paragraphs = (answers.task2 || '(No Response)').split('\n');
  task2Paragraphs.forEach(p => {
    children.push(new Paragraph({ text: p }));
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
};

// Main download functions
export const downloadReadingListeningTranscript = async (
  data: ReadingListeningData,
  options: DownloadOptions
): Promise<void> => {
  const { format, testType, date = new Date() } = options;
  const testName = testType === 'reading' ? 'Reading' : 'Listening';
  const dateStr = date.toISOString().split('T')[0];
  const filename = `IELTS_${testName}_Answers_${dateStr}`;

  switch (format) {
    case 'txt': {
      const content = generateReadingListeningText(data, options);
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, `${filename}.txt`);
      break;
    }
    case 'pdf': {
      const pdf = generateReadingListeningPDF(data, options);
      pdf.save(`${filename}.pdf`);
      break;
    }
    case 'docx': {
      const blob = await generateReadingListeningDocx(data, options);
      saveAs(blob, `${filename}.docx`);
      break;
    }
  }
};

export const downloadWritingTranscript = async (
  data: WritingData,
  options: DownloadOptions
): Promise<void> => {
  const { format, date = new Date() } = options;
  const dateStr = date.toISOString().split('T')[0];
  const filename = `IELTS_Writing_Answers_${dateStr}`;

  switch (format) {
    case 'txt': {
      const content = generateWritingText(data, options);
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, `${filename}.txt`);
      break;
    }
    case 'pdf': {
      const pdf = generateWritingPDF(data, options);
      pdf.save(`${filename}.pdf`);
      break;
    }
    case 'docx': {
      const blob = await generateWritingDocx(data, options);
      saveAs(blob, `${filename}.docx`);
      break;
    }
  }
};

// For history page - handles raw database answers
export const downloadHistoryTranscript = async (
  answers: any,
  testType: 'Writing' | 'Reading/Listening',
  completedAt: string,
  timeSpent: number,
  format: FileFormat
): Promise<void> => {
  const date = new Date(completedAt);

  if (testType === 'Writing') {
    await downloadWritingTranscript(
      { answers: answers as WritingAnswers },
      { format, testType: 'writing', date, timeSpent }
    );
  } else {
    // Convert array format to QuestionState format
    const answersArray = Array.isArray(answers) ? answers : [];
    const questions: QuestionState[] = [{ answered: false, marked: false, value: '' }]; // Index 0 unused
    
    for (let i = 0; i < 40; i++) {
      const item = answersArray[i];
      questions.push({
        answered: !!item?.answer?.trim(),
        marked: item?.marked || false,
        value: item?.answer || '',
      });
    }

    await downloadReadingListeningTranscript(
      { questions },
      { format, testType: 'reading', date, timeSpent }
    );
  }
};
