import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePatientReport = (patient, appointments = [], evolution = []) => {
    const doc = new jsPDF();
    const brandColor = [85, 169, 138]; // #55A98A
    const darkColor = [26, 46, 53];   // #1A2E35

    // 1. Cabecera Premium
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text('KINEFY', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('CENTRO DE FISIOTERAPIA AVANZADA', 20, 32);
    doc.text('Informe Clínico Oficial de Seguimiento', 20, 37);

    // 2. Información del Paciente (Estructura de Ficha)
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('INFORMACIÓN DEL PACIENTE', 20, 60);
    
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.5);
    doc.line(20, 63, 190, 63);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('Nombre:', 20, 72);
    doc.text('Email:', 20, 78);
    doc.text('Teléfono:', 20, 84);
    doc.text('Estado:', 20, 90);

    doc.setFont("helvetica", "normal");
    doc.text(patient.nombre || 'Sin nombre', 50, 72);
    doc.text(patient.email || 'Sin email', 50, 78);
    doc.text(patient.telefono || 'No registrado', 50, 84);
    doc.text(patient.estado?.toUpperCase() || 'ACTIVO', 50, 90);

    doc.setFont("helvetica", "bold");
    doc.text('Profesión:', 110, 72);
    doc.text('Actividad:', 110, 78);
    doc.text('Expediente:', 110, 84);
    doc.text('Fecha:', 110, 90);

    doc.setFont("helvetica", "normal");
    doc.text(patient.profesion || '-', 135, 72);
    doc.text(patient.actividadFisica || '-', 135, 78);
    doc.text((patient._id || '').substring(0, 8).toUpperCase(), 135, 84);
    doc.text(new Date().toLocaleDateString('es-ES'), 135, 90);

    // 3. Valoración Clínica
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('VALORACIÓN CLÍNICA', 20, 105);
    doc.line(20, 108, 190, 108);

    doc.setFontSize(10);
    doc.text('DIAGNÓSTICO:', 20, 115);
    doc.setFont("helvetica", "normal");
    const diagLines = doc.splitTextToSize(patient.diagnostico || 'Sin diagnóstico registrado en el sistema.', 170);
    doc.text(diagLines, 20, 120);

    let nextY = 120 + (diagLines.length * 5) + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text('NOTAS Y OBSERVACIONES:', 20, nextY);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(patient.notes || patient.notas || 'Sin notas adicionales registradas.', 170);
    doc.text(notesLines, 20, nextY + 5);

    nextY = nextY + (notesLines.length * 5) + 20;

    // 4. Evolución Diaria (NUEVA SECCIÓN)
    if (evolution && evolution.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('EVOLUCIÓN DIARIA DEL PACIENTE', 20, nextY);
        doc.line(20, nextY + 3, 190, nextY + 3);

        const evolutionData = [...evolution].sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(entry => [
            new Date(entry.fecha).toLocaleDateString('es-ES'),
            `EVA ${entry.nivelDolor}/10`,
            entry.observaciones || 'Sin observaciones.'
        ]);

        autoTable(doc, {
            startY: nextY + 7,
            margin: { left: 20, right: 20 },
            head: [['FECHA', 'DOLOR', 'OBSERVACIONES DEL PACIENTE']],
            body: evolutionData,
            headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { textColor: darkColor, fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25 },
                2: { cellWidth: 'auto' }
            },
            alternateRowStyles: { fillColor: [245, 249, 248] },
            theme: 'grid'
        });

        nextY = doc.lastAutoTable.finalY + 15;
    }

    // 5. Tabla de Seguimiento (Citas)
    if (appointments && appointments.length > 0) {
        if (nextY > 230) { doc.addPage(); nextY = 20; }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('HISTORIAL DE SESIONES', 20, nextY);
        doc.line(20, nextY + 3, 190, nextY + 3);

        const tableData = appointments.map(appt => [
            new Date(appt.fecha).toLocaleDateString('es-ES'),
            appt.hora,
            appt.tipo ? appt.tipo.toUpperCase() : 'SESIÓN GENERAL',
            appt.estado === 'completada' ? 'ASISTIDA' : 'PENDIENTE'
        ]);

        autoTable(doc, {
            startY: nextY + 7,
            margin: { left: 20, right: 20 },
            head: [['FECHA', 'HORA', 'TIPO DE SESIÓN', 'ESTADO']],
            body: tableData,
            headStyles: { fillColor: [59, 122, 142], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { textColor: darkColor, fontSize: 9 },
            alternateRowStyles: { fillColor: [240, 244, 244] },
            theme: 'grid'
        });
    }

    // 5. Pie de Página con Línea
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200);
        doc.line(20, 280, 190, 280);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('KINEFY - Plataforma Digital de Gestión Clínica', 20, 285);
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    }

    const fileName = `Informe_Clinico_Kinefy_${(patient.nombre || 'Paciente').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};
