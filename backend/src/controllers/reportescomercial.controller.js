const { PDFDocument, StandardFonts } = require('pdf-lib');
const db = require('../config/database');

exports.reporteComercialPDF = (req, res) => {
  const sql = `
    SELECT
      p.nombre AS producto,
      r.cantidad,
      r.observacion,
      r.fecha_retiro,
      u.usuario AS usuario
    FROM retiros r
    JOIN productos p ON r.producto_id = p.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.tipo = 'comercial'
    ORDER BY r.fecha_retiro DESC
  `;

  db.all(sql, [], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generando reporte comercial' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay retiros comerciales' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage();
    let y = page.getHeight() - 50;

    // Título
    page.drawText('Reporte de Retiros Comerciales', {
      x: 50,
      y,
      size: 16,
      font
    });

    y -= 30;

    page.drawText(`Fecha: ${new Date().toLocaleString()}`, {
      x: 50,
      y,
      size: 10,
      font
    });

    y -= 25;

    rows.forEach((r, index) => {
      if (y < 80) {
        page = pdfDoc.addPage();
        y = page.getHeight() - 50;
      }

      page.drawText(
        `${index + 1}. ${r.producto} | Cantidad: ${r.cantidad} | Usuario: ${r.usuario}`,
        { x: 50, y, size: 10, font }
      );

      y -= 12;

      page.drawText(
        `   Fecha: ${r.fecha_retiro} | Obs: ${r.observacion || 'N/A'}`,
        { x: 50, y, size: 9, font }
      );

      y -= 18;
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_retiros_comerciales.pdf"'
    );

    res.send(Buffer.from(pdfBytes));
  });
};
