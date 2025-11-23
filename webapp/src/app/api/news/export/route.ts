import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { fetchNews } from '@/lib/news';

export async function GET() {
  try {
    const items = await fetchNews();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('IA en deporte');

    sheet.columns = [
      { header: 'Título', key: 'title', width: 80 },
      { header: 'Resumen', key: 'summary', width: 100 },
      { header: 'Enlace', key: 'link', width: 70 },
      { header: 'Fecha de publicación', key: 'publishedAt', width: 30 },
    ];

    items.forEach((item) => {
      sheet.addRow(item);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="noticias-ia-deporte.xlsx"',
        'Content-Length': String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error('Failed to export news', error);
    return NextResponse.json(
      { error: 'No se pudo generar el archivo de Excel.' },
      { status: 500 },
    );
  }
}
