import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePatientReport = (patient, appointments = []) => {
    const doc = jsPDF();
    const brandColor = [85, 169, 138]; // #55A98A

    // Cabecera
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('KINEFY', 15, 25);
    doc.setFontSize(10);
    doc.text('Informe Clínico de Seguimiento', 15, 33);
    
    // Datos del Paciente
    doc.setTextColor(26, 46, 53);
    doc.setFontSize(16);
    doc.text('Datos del Paciente', 15, 55);
    
    doc.setFontSize(11);
    doc.text(`Nombre: ${patient.nombre}`, 15, 65);
    doc.text(`Email: ${patient.email}`, 15, 72);
    doc.text(`Diagnóstico: ${patient.diagnostico || 'No especificado'}`, 15, 79);
    doc.text(`Fecha de Informe: ${new Date().toLocaleDateString('es-ES')}`, 15, 86);

    // Tabla de Citas/Evolución
    if (appointments.length > 0) {
        doc.setFontSize(16);
        doc.text('Historial de Sesiones', 15, 105);
        
        const tableData = appointments.map(appt => [
            new Date(appt.fecha).toLocaleDateString('es-ES'),
            appt.hora,
            appt.tipo,
            appt.estado === 'completada' ? 'Asistida' : 'Pendiente',
            appt.notas || '-'
        ]);

        doc.autoTable({
            startY: 110,
            head: [['Fecha', 'Hora', 'Tipo', 'Estado', 'Notas']],
            body: tableData,
            headStyles: { fillColor: brandColor },
            theme: 'striped'
        });
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
            'Este documento es un resumen clínico generado por la plataforma Kinefy. Uso exclusivo profesional.',
            105, 285, { align: 'center' }
        );
    }

    doc.save(`Informe_Kinefy_${patient.nombre.replace(/\s+/g, '_')}.pdf`);
};
