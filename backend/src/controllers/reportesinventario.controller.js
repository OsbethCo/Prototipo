const db = require('../config/database');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const reporteInventarioPDF = (req, res) => {

  const sql = `
    SELECT 
      nombre,
      medida,
      lote,
      fecha_vencimiento,
      stock_actual,
      stock_minimo,
      ubicacion,
      created_at
    FROM productos
    ORDER BY nombre ASC
  `;

  db.all(sql, [], async (err, productos) => {

    if (err) {
      return res.status(500).json({
        message: 'Error obteniendo inventario'
      });
    }

    try {

      const pdfDoc = await PDFDocument.create();

      const page = pdfDoc.addPage([900, 600]);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { height } = page.getSize();

      let y = height - 40;

      // Título
      page.drawText('REPORTE DE INVENTARIO - FARMACIA', {
        x: 50,
        y,
        size: 20,
        font: fontBold,
        color: rgb(0, 0, 0)
      });

      y -= 40;

      // Encabezados
      const headers = [
        'Producto',
        'Medida',
        'Lote',
        'Vencimiento',
        'Stock',
        'Stock Min',
        'Ubicación'
      ];

      let xPositions = [50, 200, 270, 350, 450, 520, 600];

      headers.forEach((header, i) => {

        page.drawText(header, {
          x: xPositions[i],
          y,
          size: 12,
          font: fontBold
        });

      });

      y -= 20;

      // Línea separadora
      page.drawLine({
        start: { x: 50, y },
        end: { x: 850, y },
        thickness: 1
      });

      y -= 20;

      // Datos
      productos.forEach(producto => {

        page.drawText(producto.nombre || '', { x: xPositions[0], y, size: 10, font });
        page.drawText(producto.medida || '', { x: xPositions[1], y, size: 10, font });
        page.drawText(producto.lote || '', { x: xPositions[2], y, size: 10, font });
        page.drawText(producto.fecha_vencimiento || '', { x: xPositions[3], y, size: 10, font });
        page.drawText(String(producto.stock_actual), { x: xPositions[4], y, size: 10, font });
        page.drawText(String(producto.stock_minimo), { x: xPositions[5], y, size: 10, font });
        page.drawText(producto.ubicacion || '', { x: xPositions[6], y, size: 10, font });

        y -= 18;

      });

      // Fecha del reporte
      page.drawText(
        `Fecha de generación: ${new Date().toLocaleString()}`,
        {
          x: 50,
          y: 20,
          size: 10,
          font
        }
      );

      const pdfBytes = await pdfDoc.save();

      res.setHeader('Content-Type', 'application/pdf');

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=reporte_inventario.pdf'
      );

      res.send(Buffer.from(pdfBytes));

    }
    catch (error) {

      console.error(error);

      res.status(500).json({
        message: 'Error generando PDF'
      });

    }

  });

};

module.exports = reporteInventarioPDF;
