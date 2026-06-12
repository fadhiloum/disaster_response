import { data } from "@/app/lib/data";

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
  const body = [
    `Situation Report: ${incident?.title ?? report.incidentId}`,
    `Reporting period: ${report.reportingPeriod}`,
    "",
    "Summary",
    report.summary,
    "",
    "Current impact",
    report.impact,
    "",
    "Priority needs",
    report.priorityNeeds,
    "",
    "Response actions",
    report.responseActions,
    "",
    "Gaps",
    report.gaps,
    "",
    "Next operational period priorities",
    report.nextPriorities,
    "",
    `Created by: ${report.createdBy}`,
    `Created at: ${report.createdAt}`,
  ].join("\n");

  const url = new URL(request.url);

  if (url.searchParams.get("format") === "pdf") {
    return new Response(createSimplePdf(body), {
      headers: {
        "content-disposition": `attachment; filename="${report.id}.pdf"`,
        "content-type": "application/pdf",
      },
    });
  }

  return new Response(body, {
    headers: {
      "content-disposition": `attachment; filename="${report.id}.txt"`,
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function createSimplePdf(text: string) {
  const lines = text
    .split("\n")
    .flatMap((line) => wrapText(normalizePdfText(line), 92));
  const pageHeight = 792;
  const linesPerPage = 46;
  const pages = chunk(lines.length ? lines : [""], linesPerPage);
  const pageObjectStart = 3;
  const fontObjectNumber = pageObjectStart + pages.length * 2;
  const pageObjects = pages.flatMap((pageLines, pageIndex) => {
    const pageObjectNumber = pageObjectStart + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const textCommands = pageLines
      .map(
        (line, index) =>
          `1 0 0 1 54 ${pageHeight - 72 - index * 14} Tm (${escapePdfText(line)}) Tj`,
      )
      .join("\n");
    const content = `BT\n/F1 10 Tf\n14 TL\n${textCommands}\nET`;

    return [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
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

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
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
