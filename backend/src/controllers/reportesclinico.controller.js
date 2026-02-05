const { PDFDocument, StandardFonts } = require('pdf-lib');
const db = require('../config/database');

// Reporte de inventario por paciente (actual)
exports.reporteInventarioPacientePDF = (req, res) => {
  const sql = `
    SELECT 
      ip.id,
      ip.cantidad,
      ip.ultima_actualizacion,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      p.tipo_presentacion,
      pa.nombre as paciente_nombre,
      pa.cedula,
      pa.area,
      pa.cama
    FROM inventario_paciente ip
    LEFT JOIN productos p ON ip.producto_id = p.id
    LEFT JOIN pacientes pa ON ip.paciente_id = pa.id
    ORDER BY pa.nombre ASC, p.nombre ASC
  `;

  db.all(sql, [], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generando reporte de inventario' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay inventario de pacientes' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 50;

    // Título
    page.drawText('INVENTARIO DE PACIENTES', {
      x: 50,
      y,
      size: 18,
      font: boldFont
    });

    y -= 25;
    page.drawText(`Fecha de generación: ${new Date().toLocaleString()}`, {
      x: 50,
      y,
      size: 10,
      font
    });

    y -= 15;
    page.drawText(`Total de registros: ${rows.length}`, {
      x: 50,
      y,
      size: 10,
      font
    });

    y -= 20;

    // Agrupar por paciente
    const pacientes = {};
    rows.forEach(row => {
      const key = row.paciente_id;
      if (!pacientes[key]) {
        pacientes[key] = {
          nombre: row.paciente_nombre,
          cedula: row.cedula,
          area: row.area,
          cama: row.cama,
          productos: []
        };
      }
      pacientes[key].productos.push({
        nombre: row.producto_nombre,
        lote: row.lote,
        medida: row.medida || row.tipo_presentacion,
        cantidad: row.cantidad,
        ultima_actualizacion: row.ultima_actualizacion
      });
    });

    // Por cada paciente
    Object.entries(pacientes).forEach(([pacienteId, paciente]) => {
      // Título del paciente
      if (y < 100) {
        page = pdfDoc.addPage();
        y = height - 50;
      }

      page.drawText(`${paciente.nombre}`, {
        x: 50,
        y,
        size: 14,
        font: boldFont
      });
      y -= 18;

      page.drawText(`Cédula: ${paciente.cedula || '-'} | Área: ${paciente.area || '-'} | Cama: ${paciente.cama || '-'}`, {
        x: 50,
        y,
        size: 10,
        font
      });
      y -= 20;

      // Encabezados de tabla para este paciente
      const headers = ['Producto', 'Lote', 'Presentación', 'Cantidad'];
      const colWidths = [120, 50, 80, 40];
      let x = 50;

      page.drawText('Producto', { x, y, size: 9, font: boldFont });
      x += colWidths[0];
      page.drawText('Lote', { x, y, size: 9, font: boldFont });
      x += colWidths[1];
      page.drawText('Presentación', { x, y, size: 9, font: boldFont });
      x += colWidths[2];
      page.drawText('Cant', { x, y, size: 9, font: boldFont });

      y -= 5;
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1
      });
      y -= 12;

      // Productos del paciente
      let totalPaciente = 0;
      paciente.productos.forEach(prod => {
        if (y < 60) {
          page = pdfDoc.addPage();
          y = height - 50;
        }

        x = 50;
        const truncatedProd = prod.nombre && prod.nombre.length > 35 ? prod.nombre.substring(0, 33) + '..' : (prod.nombre || '-');
        page.drawText(truncatedProd, { x, y, size: 8, font });
        x += colWidths[0];

        page.drawText(prod.lote || '-', { x, y, size: 8, font });
        x += colWidths[1];

        page.drawText(prod.medida || '-', { x, y, size: 8, font });
        x += colWidths[2];

        page.drawText(String(prod.cantidad), { x, y, size: 8, font: boldFont });

        totalPaciente += prod.cantidad;
        y -= 14;
      });

      // Total del paciente
      page.drawText(`Total unidades: ${totalPaciente}`, {
        x: 50,
        y,
        size: 10,
        font: boldFont
      });

      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    const filename = `inventario_pacientes_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  });
};

// Reporte clínico por paciente
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

// Reporte general de historial de retiros
exports.reporteHistorialPDF = (req, res) => {
  const { tipo, fechaInicio, fechaFin } = req.query;

  let sql = `
    SELECT
      r.id,
      p.nombre AS producto,
      p.lote,
      p.medida,
      r.cantidad,
      r.tipo,
      r.fecha_retiro,
      u.nombre AS usuario,
      pa.nombre AS paciente,
      r.observacion
    FROM retiros r
    LEFT JOIN productos p ON r.producto_id = p.id
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    LEFT JOIN pacientes pa ON r.paciente_id = pa.id
  `;

  const params = [];
  const conditions = [];

  if (tipo && tipo !== 'todos') {
    conditions.push('r.tipo = ?');
    params.push(tipo);
  }

  if (fechaInicio) {
    conditions.push('date(r.fecha_retiro) >= date(?)');
    params.push(fechaInicio);
  }

  if (fechaFin) {
    conditions.push('date(r.fecha_retiro) <= date(?)');
    params.push(fechaFin);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY r.fecha_retiro DESC LIMIT 500';

  db.all(sql, params, async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generando reporte de historial' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 50;

    // Título
    page.drawText('Historial General de Retiros', {
      x: 50,
      y,
      size: 18,
      font: boldFont
    });

    y -= 25;
    page.drawText(`Fecha de generación: ${new Date().toLocaleString()}`, {
      x: 50,
      y,
      size: 10,
      font
    });

    y -= 15;
    page.drawText(`Total de registros: ${rows.length}`, {
      x: 50,
      y,
      size: 10,
      font
    });

    y -= 20;

    // Encabezados de tabla
    const headers = ['#', 'Fecha', 'Producto', 'Lote', 'Cant', 'Tipo', 'Paciente', 'Usuario'];
    const colWidths = [20, 55, 60, 30, 20, 25, 50, 40];
    let x = 50;

    page.drawText('N', { x, y, size: 9, font: boldFont });
    x += colWidths[0];
    page.drawText('Fecha', { x, y, size: 9, font: boldFont });
    x += colWidths[1];
    page.drawText('Producto', { x, y, size: 9, font: boldFont });
    x += colWidths[2];
    page.drawText('Lote', { x, y, size: 9, font: boldFont });
    x += colWidths[3];
    page.drawText('Cant', { x, y, size: 9, font: boldFont });
    x += colWidths[4];
    page.drawText('Tipo', { x, y, size: 9, font: boldFont });
    x += colWidths[5];
    page.drawText('Paciente', { x, y, size: 9, font: boldFont });
    x += colWidths[6];
    page.drawText('Usuario', { x, y, size: 9, font: boldFont });

    y -= 5;
    // Línea separadora
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: [0, 0, 0]
    });
    y -= 12;

    // Datos de la tabla
    rows.forEach((r, index) => {
      if (y < 60) {
        page = pdfDoc.addPage();
        y = height - 50;
      }

      x = 50;
      page.drawText(String(index + 1), { x, y, size: 8, font });
      x += colWidths[0];
      
      const fechaStr = new Date(r.fecha_retiro).toLocaleString('es-VE');
      const truncatedFecha = fechaStr.length > 18 ? fechaStr.substring(0, 16) + '..' : fechaStr;
      page.drawText(truncatedFecha, { x, y, size: 7, font });
      x += colWidths[1];

      const truncatedProd = r.producto && r.producto.length > 25 ? r.producto.substring(0, 23) + '..' : (r.producto || '-');
      page.drawText(truncatedProd, { x, y, size: 7, font });
      x += colWidths[2];

      const truncatedLote = r.lote && r.lote.length > 12 ? r.lote.substring(0, 10) + '..' : (r.lote || '-');
      page.drawText(truncatedLote, { x, y, size: 7, font });
      x += colWidths[3];

      page.drawText(String(r.cantidad), { x, y, size: 7, font });
      x += colWidths[4];

      const tipoText = r.tipo === 'clinico' ? 'Clínico' : 'Comercial';
      page.drawText(tipoText, { x, y, size: 7, font });
      x += colWidths[5];

      const truncatedPaciente = r.paciente && r.paciente.length > 20 ? r.paciente.substring(0, 18) + '..' : (r.paciente || '-');
      page.drawText(truncatedPaciente, { x, y, size: 7, font });
      x += colWidths[6];

      const truncatedUsuario = r.usuario && r.usuario.length > 15 ? r.usuario.substring(0, 13) + '..' : (r.usuario || '-');
      page.drawText(truncatedUsuario, { x, y, size: 7, font });

      y -= 12;
    });

    const pdfBytes = await pdfDoc.save();

    const filename = `historial_retiros_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  });
};

