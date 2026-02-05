const PDFDocument = require('pdfkit');
const db = require('../config/database');

exports.reporteClinicoPorPaciente = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      pa.nombre AS paciente,
      p.nombre AS producto,
      r.cantidad,
      r.fecha_retiro,
      u.usuario AS usuario
    FROM retiros r
    JOIN pacientes pa ON r.paciente_id = pa.id
    JOIN productos p ON r.producto_id = p.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.tipo = 'clinico'
      AND r.paciente_id = ?
    ORDER BY r.fecha_retiro DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generando reporte' });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No hay retiros clínicos para este paciente'
      });
    }

    // 🧾 Crear PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_clinico_paciente_${id}.pdf`
    );

    doc.pipe(res);

    // 🏥 Encabezado
    doc
      .fontSize(18)
      .text('Reporte de Retiros Clínicos', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Paciente: ${rows[0].paciente}`)
      .text(`Fecha de emisión: ${new Date().toLocaleString()}`)
      .moveDown();

    // 📊 Tabla simple
    doc.fontSize(11).text('Producto | Cantidad | Fecha | Usuario');
    doc.moveDown(0.5);

    let total = 0;

    rows.forEach(r => {
      doc.text(
        `${r.producto} | ${r.cantidad} | ${r.fecha_retiro} | ${r.usuario}`
      );
      total += r.cantidad;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total de productos retirados: ${total}`);

    doc.end();
  });
};
