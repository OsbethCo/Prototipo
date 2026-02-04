import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const reportService = {
    exportarInventario: (productos: any[], titulo: string = 'Reporte de Inventario') => {
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(18);
        doc.text(titulo, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Nombre", "Presentación", "Stock", "Lote", "Vencimiento", "Ubicación"];
        const tableRows: any[] = [];

        productos.forEach(p => {
            const rowData = [
                p.nombre,
                p.medida || p.tipoPresentacion || '-',
                p.cantidad || p.stock_actual,
                p.lote || '-',
                p.fechaVencimiento || p.fecha_vencimiento || '-',
                p.ubicacion || '-'
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 9 }
        });

        doc.save(`${titulo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    },

    exportarHistorial: (historial: any[]) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Historial de Retiros', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Producto", "Cantidad", "Fecha", "Personal", "Cargo", "Lista"];
        const tableRows: any[] = [];

        historial.forEach(h => {
            const rowData = [
                h.nombre || h.producto,
                `${h.cantidadMedida || h.cantidad} ${h.unidadMedida || ''}`,
                h.fechaRetiro || h.fecha_retiro,
                h.persona ? `${h.persona.nombre} ${h.persona.apellido || ''}` : h.usuario || '-',
                h.persona ? h.persona.cargo : '-',
                h.lista || '-'
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] }
        });

        doc.save(`Historial_Retiros_${new Date().getTime()}.pdf`);
    }
};
