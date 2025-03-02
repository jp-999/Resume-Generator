import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, summary, skills, experience, education } = data;

    // Create a new PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    // Collect the PDF data
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Write content to the PDF
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(name, 50, 50)
      .font('Helvetica')
      .fontSize(12)
      .text(`Email: ${email}`, 50, 80)
      .text(`Phone: ${phone}`, 50, 100);

    // Professional Summary
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Professional Summary', 50, 140)
      .font('Helvetica')
      .fontSize(12)
      .text(summary, 50, 160, {
        width: 500,
        align: 'justify',
      });

    // Skills
    const skillsY = doc.y + 30;
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Skills', 50, skillsY)
      .font('Helvetica')
      .fontSize(12)
      .text(skills, 50, skillsY + 20, {
        width: 500,
      });

    // Experience
    const experienceY = doc.y + 30;
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Experience', 50, experienceY)
      .font('Helvetica')
      .fontSize(12)
      .text(experience, 50, experienceY + 20, {
        width: 500,
      });

    // Education
    const educationY = doc.y + 30;
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Education', 50, educationY)
      .font('Helvetica')
      .fontSize(12)
      .text(education, 50, educationY + 20, {
        width: 500,
      });

    // End the document
    doc.end();

    // Create a Promise to wait for the PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name.replace(/\s+/g, '_')}_resume.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 