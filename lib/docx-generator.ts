import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
} from 'docx';
import type { TailoredResume, ResumeData } from './types';

function hr() {
  return new Paragraph({
    border: {
      bottom: { color: 'D4834E', space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    spacing: { after: 120 },
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    text: title.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 60 },
    border: {
      bottom: { color: 'E8E0D8', space: 1, style: BorderStyle.SINGLE, size: 4 },
    },
  });
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 20, color: '333333' })],
    spacing: { after: 60 },
    indent: { left: 360 },
  });
}

export async function generateDocx(
  tailored: TailoredResume,
  baseData: ResumeData
): Promise<Buffer> {
  const sections: Paragraph[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: baseData.fullName, bold: true, size: 52, color: '0F0F0F' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: tailored.title, size: 26, color: 'D4834E', bold: true })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        ...(baseData.email ? [new TextRun({ text: baseData.email, size: 18, color: '555555' }), new TextRun({ text: '  |  ', size: 18, color: 'AAAAAA' })] : []),
        ...(baseData.phone ? [new TextRun({ text: baseData.phone, size: 18, color: '555555' }), new TextRun({ text: '  |  ', size: 18, color: 'AAAAAA' })] : []),
        ...(baseData.location ? [new TextRun({ text: baseData.location, size: 18, color: '555555' }), new TextRun({ text: '  |  ', size: 18, color: 'AAAAAA' })] : []),
        ...(baseData.linkedinUrl ? [new TextRun({ text: baseData.linkedinUrl.replace('https://', ''), size: 18, color: '555555' })] : []),
      ],
      spacing: { after: 160 },
    })
  );

  sections.push(hr());

  // ── Summary ───────────────────────────────────────────────────────────────
  sections.push(sectionHeading('Professional Summary'));
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: tailored.summary, size: 20, color: '333333' })],
      spacing: { after: 160 },
    })
  );

  // ── Skills ─────────────────────────────────────────────────────────────────
  if (tailored.skills.length > 0) {
    sections.push(sectionHeading('Core Skills'));
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: tailored.skills.join('  ·  '), size: 20, color: '333333' })],
        spacing: { after: 160 },
      })
    );
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (tailored.experience.length > 0) {
    sections.push(sectionHeading('Experience'));
    for (const exp of tailored.experience) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, bold: true, size: 22, color: '111111' }),
            new TextRun({ text: `  ·  ${exp.startDate} – ${exp.endDate}`, size: 18, color: '777777' }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: exp.title, size: 20, bold: true, color: '555555' })],
          spacing: { after: 80 },
        }),
        ...exp.bullets.map(bullet),
        new Paragraph({ spacing: { after: 120 } })
      );
    }
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (tailored.projects.length > 0) {
    sections.push(sectionHeading('Selected Projects'));
    for (const proj of tailored.projects) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: proj.title, bold: true, size: 22, color: '111111' })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: proj.description, size: 19, color: '444444' })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: proj.tags.join(' · '), size: 18, color: 'D4834E', bold: true })],
          spacing: { after: 120 },
        })
      );
    }
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (baseData.includeSections.education && baseData.education.length > 0) {
    sections.push(sectionHeading('Education'));
    for (const edu of baseData.education) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 21, color: '111111' }),
            new TextRun({ text: `  ·  ${edu.school}  ·  ${edu.year}`, size: 18, color: '777777' }),
          ],
          spacing: { after: 60 },
        })
      );
    }
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (baseData.includeSections.certifications && baseData.certifications.length > 0) {
    sections.push(sectionHeading('Certifications'));
    for (const cert of baseData.certifications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20, color: '111111' }),
            new TextRun({ text: `  ·  ${cert.issuer}  ·  ${cert.year}`, size: 18, color: '777777' }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20, color: '1a1a1a' },
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: { size: 20, bold: true, color: 'D4834E', font: 'Calibri' },
          paragraph: { spacing: { before: 240, after: 60 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 864, right: 864 },
          },
        },
        children: sections,
      },
    ],
  });

  const arrayBuffer = await Packer.toBuffer(doc);
  return Buffer.from(arrayBuffer);
}
