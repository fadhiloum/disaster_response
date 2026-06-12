import { data } from "@/app/lib/data";
import type { Incident, SituationReport } from "@/app/lib/data/types";

type ExportVariant = "operational" | "donor" | "executive";

type ExportSection = {
  heading: string;
  body: string;
};

type ExportDocument = {
  title: string;
  subtitle: string;
  metadata: Array<[string, string]>;
  sections: ExportSection[];
  filename: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = (await data.listSituationReports()).find(
    (item) => item.id === id,
  );

  if (!report) {
    return new Response("Situation report not found", { status: 404 });
  }

  const incident = await data.getIncident(report.incidentId);
  const url = new URL(request.url);
  const variant = readVariant(url.searchParams.get("variant"));
  const document = buildExportDocument(report, incident, variant);

  if (url.searchParams.get("format") === "pdf") {
    return new Response(createReportPdf(document), {
      headers: {
        "content-disposition": `attachment; filename="${document.filename}.pdf"`,
        "content-type": "application/pdf",
      },
    });
  }

  return new Response(renderTextDocument(document), {
    headers: {
      "content-disposition": `attachment; filename="${document.filename}.txt"`,
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function readVariant(value: string | null): ExportVariant {
  if (value === "donor" || value === "executive") {
    return value;
  }

  return "operational";
}

function buildExportDocument(
  report: SituationReport,
  incident: Incident | undefined,
  variant: ExportVariant,
): ExportDocument {
  const programTitle = incident?.title ?? report.incidentId;
  const variantLabel =
    variant === "donor"
      ? "Donor Brief"
      : variant === "executive"
        ? "Executive Brief"
        : "Operational Situation Report";
  const filenameSuffix = variant === "operational" ? "" : `-${variant}`;
  const metadata: Array<[string, string]> = [
    ["Program", programTitle],
    ["Reporting period", report.reportingPeriod],
    ["Status", toTitleCase(report.status)],
    ["Revision", report.revision.toString()],
    ["Prepared by", report.createdBy],
    ["Created", report.createdAt],
  ];

  if (report.submittedAt) {
    metadata.push(["Submitted", report.submittedAt]);
  }

  if (report.reviewedAt) {
    metadata.push([
      "Reviewed",
      report.reviewedBy
        ? `${report.reviewedAt} by ${report.reviewedBy}`
        : report.reviewedAt,
    ]);
  }

  return {
    title: `${variantLabel}: ${programTitle}`,
    subtitle: report.reportingPeriod,
    metadata,
    sections: buildVariantSections(report, variant),
    filename: `${report.id}${filenameSuffix}`,
  };
}

function buildVariantSections(
  report: SituationReport,
  variant: ExportVariant,
): ExportSection[] {
  if (variant === "donor") {
    return [
      { heading: "Donor Summary", body: report.summary },
      { heading: "People And Places Affected", body: report.impact },
      { heading: "Priority Needs For Support", body: report.priorityNeeds },
      { heading: "Response Delivered", body: report.responseActions },
      { heading: "Funding-Relevant Gaps", body: report.gaps },
      { heading: "Next Operational Period", body: report.nextPriorities },
      ...(report.reviewComment
        ? [{ heading: "Review Note", body: report.reviewComment }]
        : []),
    ];
  }

  if (variant === "executive") {
    return [
      { heading: "Executive Summary", body: report.summary },
      { heading: "Current Impact", body: report.impact },
      {
        heading: "Decisions And Support Required",
        body: [report.priorityNeeds, report.gaps].filter(Boolean).join("\n\n"),
      },
      { heading: "Next Priorities", body: report.nextPriorities },
    ];
  }

  return [
    { heading: "Summary", body: report.summary },
    { heading: "Current Impact", body: report.impact },
    { heading: "Priority Needs", body: report.priorityNeeds },
    { heading: "Response Actions", body: report.responseActions },
    { heading: "Gaps", body: report.gaps },
    {
      heading: "Next Operational Period Priorities",
      body: report.nextPriorities,
    },
    ...(report.reviewComment
      ? [{ heading: "Review Comment", body: report.reviewComment }]
      : []),
  ];
}

function renderTextDocument(document: ExportDocument) {
  return [
    document.title,
    document.subtitle,
    "",
    ...document.metadata.map(([label, value]) => `${label}: ${value}`),
    "",
    ...document.sections.flatMap((section) => [
      section.heading,
      section.body,
      "",
    ]),
  ].join("\n");
}

type PdfLine = {
  text: string;
  size: number;
  font: "regular" | "bold";
  gapAfter?: number;
};

function createReportPdf(document: ExportDocument) {
  const lines = buildPdfLines(document);
  const pageHeight = 792;
  const pageWidth = 612;
  const pages = paginatePdfLines(lines);
  const pageObjectStart = 3;
  const fontObjectNumber = pageObjectStart + pages.length * 2;
  const boldFontObjectNumber = fontObjectNumber + 1;
  const pageObjects = pages.flatMap((pageLines, pageIndex) => {
    const pageObjectNumber = pageObjectStart + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const textCommands: string[] = [];
    let cursorY = pageHeight - 64;

    pageLines.forEach((line) => {
      const fontName = line.font === "bold" ? "F2" : "F1";
      textCommands.push(
        `BT /${fontName} ${line.size} Tf 1 0 0 1 54 ${cursorY} Tm (${escapePdfText(
          line.text,
        )}) Tj ET`,
      );
      cursorY -= line.size + 4 + (line.gapAfter ?? 0);
    });

    textCommands.push(
      `0.78 0.78 0.78 RG 54 42 m ${pageWidth - 54} 42 l S`,
      `BT /F1 8 Tf 1 0 0 1 54 28 Tm (${escapePdfText(document.subtitle)}) Tj ET`,
      `BT /F1 8 Tf 1 0 0 1 ${pageWidth - 110} 28 Tm (${escapePdfText(
        `Page ${pageIndex + 1} of ${pages.length}`,
      )}) Tj ET`,
    );

    const content = textCommands.join("\n");

    return [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
  });
  const pageRefs = pages
    .map((_page, pageIndex) => `${pageObjectStart + pageIndex * 2} 0 R`)
    .join(" ");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`,
    ...pageObjects,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function buildPdfLines(document: ExportDocument): PdfLine[] {
  const lines: PdfLine[] = [
    ...wrapPdfText(document.title, 52, 18, "bold", 8),
    ...wrapPdfText(document.subtitle, 72, 10, "regular", 12),
  ];

  document.metadata.forEach(([label, value]) => {
    lines.push(
      ...wrapPdfText(`${label}: ${value}`, 82, 9, "regular", 0),
    );
  });

  lines.push({ text: "", size: 6, font: "regular", gapAfter: 8 });

  document.sections.forEach((section) => {
    lines.push(...wrapPdfText(section.heading, 64, 12, "bold", 4));
    section.body.split(/\n+/).forEach((paragraph) => {
      lines.push(...wrapPdfText(paragraph, 86, 10, "regular", 8));
    });
  });

  return lines;
}

function wrapPdfText(
  text: string,
  maxLength: number,
  size: number,
  font: PdfLine["font"],
  gapAfter: number,
): PdfLine[] {
  const wrapped = wrapText(normalizePdfText(text), maxLength);

  return wrapped.map((line, index) => ({
    text: line,
    size,
    font,
    gapAfter: index === wrapped.length - 1 ? gapAfter : 0,
  }));
}

function paginatePdfLines(lines: PdfLine[]): PdfLine[][] {
  const pages: PdfLine[][] = [];
  let page: PdfLine[] = [];
  let usedHeight = 0;
  const maxHeight = 666;

  lines.forEach((line) => {
    const lineHeight = line.size + 4 + (line.gapAfter ?? 0);

    if (page.length && usedHeight + lineHeight > maxHeight) {
      pages.push(page);
      page = [];
      usedHeight = 0;
    }

    page.push(line);
    usedHeight += lineHeight;
  });

  if (page.length) {
    pages.push(page);
  }

  return pages.length
    ? pages
    : [[{ text: "", size: 10, font: "regular", gapAfter: 0 }]];
}

function normalizePdfText(text: string) {
  return text.replace(/[^\x20-\x7E]/g, " ");
}

function wrapText(text: string, maxLength: number) {
  if (!text) {
    return [""];
  }

  const lines: string[] = [];
  let current = "";

  text.split(/\s+/).forEach((word) => {
    if (!current) {
      current = word;
      return;
    }

    if (`${current} ${word}`.length > maxLength) {
      lines.push(current);
      current = word;
      return;
    }

    current = `${current} ${word}`;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
