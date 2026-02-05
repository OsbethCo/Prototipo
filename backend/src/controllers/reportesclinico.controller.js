const { PDFDocument, StandardFonts } = require('pdf-lib');
const db = require('../config/database');

exports.reporteClinicoPDF = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      pa.nombre AS paciente,
      p.nombre AS producto,
      r.cantidad,
      r.fecha_retiro,
      u.usuario AS usuario
    FROM retiros r
    JOIN productos p ON r.producto_id = p.id
    JOIN pacientes pa ON r.paciente_id = pa.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.tipo = 'clinico'
      AND r.paciente_id = ?
    ORDER BY r.fecha_retiro DESC
  `;

  db.all(sql, [id], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generando reporte clínico' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay retiros clínicos para este paciente' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage();
    let y = page.getHeight() - 50;

    // Título
    page.drawText('Reporte Clínico por Paciente', {
      x: 50,
      y,
      size: 16,
      font
    });

    y -= 30;

    page.drawText(`Paciente: ${rows[0].paciente}`, {
      x: 50,
      y,
      size: 11,
      font
    });

    y -= 15;

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

      y -= 15;

      page.drawText(
        `   Fecha retiro: ${r.fecha_retiro}`,
        { x: 50, y, size: 9, font }
      );

      y -= 18;
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_clinico_paciente_${id}.pdf"`
    );

    res.send(Buffer.from(pdfBytes));
  });
};
