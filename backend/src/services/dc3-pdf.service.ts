/**
 * DC-3 PDF Generator
 * 
 * Generates official DC-3 constancias in PDF format using pdf-lib.
 * Following STPS format specifications for "Constancia de Competencias 
 * o de Habilidades Laborales" (formato DC-3).
 */

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { STPSConstancia, STPS_AREAS_TEMATICAS } from '../types/stps.types';

const MARGIN = 50;
const PAGE_WIDTH = 612; // Letter size
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

interface DrawTextOptions {
  font?: PDFFont;
  size?: number;
  color?: { r: number; g: number; b: number };
  maxWidth?: number;
  align?: 'left' | 'center';
}

/**
 * Generate a DC-3 PDF document from a constancia record
 */
export async function generateDC3PDF(constancia: STPSConstancia): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = {
    title: 14,
    subtitle: 11,
    sectionHeader: 10,
    body: 9,
    small: 8,
    tiny: 7,
  };

  let y = PAGE_HEIGHT - MARGIN;

  // ── Helper functions ──

  function drawText(
    text: string,
    x: number,
    yPos: number,
    opts: DrawTextOptions = {}
  ) {
    const font = opts.font || fontRegular;
    const size = opts.size || fontSize.body;
    const color = opts.color || { r: 0, g: 0, b: 0 };

    if (opts.align === 'center') {
      const textWidth = font.widthOfTextAtSize(text, size);
      x = (PAGE_WIDTH - textWidth) / 2;
    }

    page.drawText(text, {
      x,
      y: yPos,
      size,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  }

  function drawLine(x1: number, yPos: number, x2: number) {
    page.drawLine({
      start: { x: x1, y: yPos },
      end: { x: x2, y: yPos },
      thickness: 0.5,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  function drawBox(x: number, yPos: number, w: number, h: number) {
    page.drawRectangle({
      x,
      y: yPos - h,
      width: w,
      height: h,
      borderColor: rgb(0.4, 0.4, 0.4),
      borderWidth: 0.5,
    });
  }

  function drawSectionHeader(text: string, yPos: number): number {
    page.drawRectangle({
      x: MARGIN,
      y: yPos - 14,
      width: CONTENT_WIDTH,
      height: 16,
      color: rgb(0.15, 0.25, 0.45),
    });
    drawText(text, MARGIN + 6, yPos - 11, {
      font: fontBold,
      size: fontSize.sectionHeader,
      color: { r: 1, g: 1, b: 1 },
    });
    return yPos - 18;
  }

  function drawLabelValue(label: string, value: string, x: number, yPos: number, labelWidth = 140): number {
    drawText(label, x, yPos, { font: fontBold, size: fontSize.small });
    drawText(value || '—', x + labelWidth, yPos, { size: fontSize.small });
    return yPos - 14;
  }

  // ── Document Header ──

  drawText('SECRETARÍA DEL TRABAJO Y PREVISIÓN SOCIAL', 0, y, {
    font: fontBold,
    size: fontSize.title,
    align: 'center',
  });
  y -= 18;

  drawText('CONSTANCIA DE COMPETENCIAS O DE HABILIDADES LABORALES', 0, y, {
    font: fontBold,
    size: fontSize.subtitle,
    align: 'center',
    color: { r: 0.15, g: 0.25, b: 0.45 },
  });
  y -= 16;

  drawText('(Formato DC-3)', 0, y, {
    size: fontSize.small,
    align: 'center',
    color: { r: 0.4, g: 0.4, b: 0.4 },
  });
  y -= 8;
  drawLine(MARGIN, y, PAGE_WIDTH - MARGIN);
  y -= 6;

  // Folio
  drawText(`Folio: ${constancia.folioInterno}`, PAGE_WIDTH - MARGIN - 180, y, {
    font: fontBold,
    size: fontSize.small,
    color: { r: 0.15, g: 0.25, b: 0.45 },
  });
  y -= 18;

  // ── Section A: Datos del Trabajador ──

  y = drawSectionHeader('A. DATOS DEL TRABAJADOR', y);
  y -= 4;

  const colA1 = MARGIN + 6;
  y = drawLabelValue('Nombre completo:', constancia.trabajador.nombreCompleto, colA1, y);
  y = drawLabelValue('CURP:', constancia.trabajador.curp, colA1, y);

  const halfWidth = CONTENT_WIDTH / 2;
  drawText('RFC:', colA1, y, { font: fontBold, size: fontSize.small });
  drawText(constancia.trabajador.rfc || '—', colA1 + 140, y, { size: fontSize.small });
  drawText('NSS:', MARGIN + halfWidth, y, { font: fontBold, size: fontSize.small });
  drawText(constancia.trabajador.nss || '—', MARGIN + halfWidth + 50, y, { size: fontSize.small });
  y -= 14;

  y = drawLabelValue('Ocupación:', constancia.trabajador.ocupacion, colA1, y);
  y = drawLabelValue('Puesto:', constancia.trabajador.puesto, colA1, y);
  y = drawLabelValue('Nacionalidad:', constancia.trabajador.nacionalidad, colA1, y);
  y -= 6;

  // ── Section B: Datos de la Empresa ──

  y = drawSectionHeader('B. DATOS DE LA EMPRESA', y);
  y -= 4;

  y = drawLabelValue('Razón social:', constancia.empresa.razonSocial, colA1, y);
  y = drawLabelValue('RFC:', constancia.empresa.rfc, colA1, y);
  y = drawLabelValue('Reg. IMSS:', constancia.empresa.registroPatronalIMSS || '—', colA1, y);
  y = drawLabelValue('Actividad o giro:', constancia.empresa.actividadGiro || '—', colA1, y);

  const domicilio = constancia.empresa.domicilio;
  const domStr = [domicilio.calle, domicilio.colonia, domicilio.municipio, domicilio.estado, domicilio.codigoPostal]
    .filter(Boolean)
    .join(', ');
  y = drawLabelValue('Domicilio:', domStr || '—', colA1, y, 80);
  y -= 6;

  // ── Section C: Datos del Curso ──

  y = drawSectionHeader('C. DATOS DEL CURSO / EVENTO DE CAPACITACIÓN', y);
  y -= 4;

  y = drawLabelValue('Nombre del curso:', constancia.curso.nombre, colA1, y);
  y = drawLabelValue('Duración (horas):', String(constancia.curso.duracionHoras), colA1, y);

  const fechaInicio = formatDate(constancia.curso.fechaInicio);
  const fechaFin = formatDate(constancia.curso.fechaFin);
  y = drawLabelValue('Período:', `${fechaInicio} — ${fechaFin}`, colA1, y);

  y = drawLabelValue('Área temática:', `${constancia.curso.areaTematica}. ${constancia.curso.areaTematicaDescripcion}`, colA1, y);
  y = drawLabelValue('Modalidad:', constancia.curso.modalidad.toUpperCase(), colA1, y);

  // Wrap objetivo if too long
  const objText = constancia.curso.objetivoGeneral;
  drawText('Objetivo:', colA1, y, { font: fontBold, size: fontSize.small });
  const maxCharsPerLine = 70;
  if (objText.length > maxCharsPerLine) {
    drawText(objText.substring(0, maxCharsPerLine), colA1 + 140, y, { size: fontSize.small });
    y -= 12;
    drawText(objText.substring(maxCharsPerLine, maxCharsPerLine * 2), colA1 + 140, y, { size: fontSize.small });
  } else {
    drawText(objText, colA1 + 140, y, { size: fontSize.small });
  }
  y -= 14;
  y -= 6;

  // ── Section D: Instructor ──

  y = drawSectionHeader('D. DATOS DEL INSTRUCTOR / AGENTE CAPACITADOR', y);
  y -= 4;

  y = drawLabelValue('Nombre del instructor:', constancia.instructor.nombre, colA1, y);
  y = drawLabelValue('Tipo de agente:', constancia.instructor.tipoAgente.toUpperCase(), colA1, y);
  if (constancia.instructor.registroSTPS) {
    y = drawLabelValue('Registro STPS:', constancia.instructor.registroSTPS, colA1, y);
  }
  if (constancia.instructor.nombreAgente) {
    y = drawLabelValue('Agente capacitador:', constancia.instructor.nombreAgente, colA1, y);
  }
  y -= 6;

  // ── Section E: Resultado ──

  y = drawSectionHeader('E. RESULTADO', y);
  y -= 4;

  y = drawLabelValue('Calificación:', `${constancia.resultado.calificacion}/100`, colA1, y);

  // Resultado badge
  const resultText = constancia.resultado.aprobado ? 'APROBADO' : 'NO APROBADO';
  const resultColor = constancia.resultado.aprobado
    ? { r: 0.1, g: 0.55, b: 0.2 }
    : { r: 0.75, g: 0.1, b: 0.1 };
  drawText('Resultado:', colA1, y, { font: fontBold, size: fontSize.small });
  drawText(resultText, colA1 + 140, y, {
    font: fontBold,
    size: fontSize.sectionHeader,
    color: resultColor,
  });
  y -= 18;

  if (constancia.resultado.observaciones) {
    y = drawLabelValue('Observaciones:', constancia.resultado.observaciones, colA1, y);
  }
  y -= 10;

  // ── Signature Lines ──

  drawLine(MARGIN, y, PAGE_WIDTH - MARGIN);
  y -= 20;

  const sigWidth = (CONTENT_WIDTH - 40) / 3;

  // Three signature boxes
  const sigY = y;
  for (let i = 0; i < 3; i++) {
    const sx = MARGIN + i * (sigWidth + 20);
    drawLine(sx, sigY, sx + sigWidth);
  }

  y -= 12;
  drawText('Firma del Trabajador', MARGIN + 10, y, { size: fontSize.tiny, color: { r: 0.4, g: 0.4, b: 0.4 } });
  drawText('Firma del Instructor', MARGIN + sigWidth + 30, y, { size: fontSize.tiny, color: { r: 0.4, g: 0.4, b: 0.4 } });
  drawText('Representante de la Empresa', MARGIN + 2 * (sigWidth + 20) + 2, y, { size: fontSize.tiny, color: { r: 0.4, g: 0.4, b: 0.4 } });

  y -= 24;

  // ── Footer ──

  drawLine(MARGIN, y, PAGE_WIDTH - MARGIN);
  y -= 12;

  drawText(
    `Lugar y fecha de expedición: ${constancia.lugarExpedicion}, ${formatDate(constancia.fechaExpedicion)}`,
    MARGIN,
    y,
    { size: fontSize.small, color: { r: 0.3, g: 0.3, b: 0.3 } }
  );
  y -= 12;

  drawText(
    'Documento generado por Kaido LMS — Este documento tiene validez como constancia interna de capacitación.',
    MARGIN,
    y,
    { size: fontSize.tiny, color: { r: 0.5, g: 0.5, b: 0.5 } }
  );
  y -= 10;

  drawText(
    `Folio: ${constancia.folioInterno}`,
    MARGIN,
    y,
    { size: fontSize.tiny, color: { r: 0.5, g: 0.5, b: 0.5 } }
  );

  // Generate final PDF bytes
  return doc.save();
}

// ── Helpers ──

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoDate;
  }
}
