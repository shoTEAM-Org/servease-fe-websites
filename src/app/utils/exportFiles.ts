type ExportCell = string | number | boolean | null | undefined;

export interface ExportSection {
  title?: string;
  headers: string[];
  rows: ExportCell[][];
}

function todayStamp() {
  return new Date().toISOString().split("T")[0];
}

export function datedFileName(baseName: string, extension: "csv" | "pdf" | "txt") {
  return `${baseName}-${todayStamp()}.${extension}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value: ExportCell) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function exportSectionsToCsv(fileName: string, sections: ExportSection[]) {
  const lines = sections.flatMap((section) => [
    ...(section.title ? [section.title] : []),
    section.headers.map(csvEscape).join(","),
    ...section.rows.map((row) => row.map(csvEscape).join(",")),
    "",
  ]);

  downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), fileName);
}

export function exportTextFile(fileName: string, contents: string) {
  downloadBlob(new Blob([contents], { type: "text/plain;charset=utf-8;" }), fileName);
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizePdfText(value: ExportCell) {
  return String(value ?? "")
    .replace(/₱|â‚±/g, "PHP ")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapLine(line: string, maxLength = 105) {
  const words = line.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function buildPdfLines(title: string, sections: ExportSection[]) {
  return [
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...sections.flatMap((section) => [
      ...(section.title ? [section.title] : []),
      section.headers.map(normalizePdfText).join(" | "),
      "-".repeat(95),
      ...section.rows.flatMap((row) => wrapLine(row.map(normalizePdfText).join(" | "))),
      "",
    ]),
  ];
}

export function exportSectionsToPdf(fileName: string, title: string, sections: ExportSection[]) {
  const lines = buildPdfLines(title, sections);
  const pageHeight = 792;
  const marginTop = 744;
  const lineHeight = 14;
  const linesPerPage = Math.floor((marginTop - 48) / lineHeight);
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const pageObjectNumbers: number[] = [];
  pages.forEach((pageLines, index) => {
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 744 Td",
      ...pageLines.flatMap((line, lineIndex) => [
        lineIndex === 0 ? "" : "0 -14 Td",
        `(${pdfEscape(normalizePdfText(line))}) Tj`,
      ]).filter(Boolean),
      "ET",
    ].join("\n");
    const contentObjectNumber = 5 + index * 2;
    const pageObjectNumber = 4 + index * 2;
    pageObjectNumbers.push(pageObjectNumber);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((num) => `${num} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  downloadBlob(new Blob([pdf], { type: "application/pdf" }), fileName);
}
