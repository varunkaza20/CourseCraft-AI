import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- PROGRAM GENERATOR ---
const generateProgramPDF = (doc, data) => {
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.programName || "Program Curriculum", 14, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${data.degreeType} in ${data.specialization} | ${data.department}`, 14, 30);
  doc.setTextColor(0);

  let currentY = 40;

  // Summary
  if (data.generatedCurriculum?.programSummary) {
    const summary = data.generatedCurriculum.programSummary;
    doc.setFontSize(11);
    doc.text(`Core Credits: ${summary.totalCoreCredits} | Elective: ${summary.totalElectiveCredits} | Open Elective: ${summary.totalOpenElectiveCredits}`, 14, currentY);
    currentY += 10;
  }

  // Semesters
  if (data.generatedCurriculum?.semesters) {
    data.generatedCurriculum.semesters.forEach((sem) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Semester ${sem.semesterNumber}`, 14, currentY + 5);
      
      const tableRows = sem.courses.map(c => [
        c.courseCode || "-",
        c.courseName || "-",
        c.type ? c.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "-",
        c.credits || 0,
        c.hasLab ? "Yes" : "No"
      ]);

      autoTable(doc, {
        startY: currentY + 10,
        head: [["Course Code", "Course Name", "Type", "Credits", "Lab"]],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        didDrawPage: (d) => { currentY = d.cursor.y; }
      });
      currentY = doc.lastAutoTable.finalY + 10;
    });
  }

  // Program Outcomes
  if (data.generatedCurriculum?.programOutcomes?.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Program Outcomes (POs)", 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    data.generatedCurriculum.programOutcomes.forEach(po => {
      const text = `PO${po.poNumber}: ${po.statement}`;
      const splitText = doc.splitTextToSize(text, 180);
      if (currentY + (splitText.length * 5) > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(splitText, 14, currentY);
      currentY += (splitText.length * 5) + 3;
    });
  }
};

// --- COURSE GENERATOR ---
const generateCoursePDF = (doc, data) => {
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.courseName || "Course Syllabus", 14, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const typeLabel = data.courseType ? data.courseType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "";
  const diffLabel = data.difficultyLevel ? data.difficultyLevel.replace(/\b\w/g, l => l.toUpperCase()) : "";
  doc.text(`${data.courseCode} | ${data.credits} Credits | ${typeLabel} | ${diffLabel}`, 14, 30);
  doc.setTextColor(0);

  let currentY = 42;
  const syl = data.generatedSyllabus || {};

  if (syl.courseDescription) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const splitDesc = doc.splitTextToSize(syl.courseDescription, 180);
    doc.text(splitDesc, 14, currentY);
    currentY += (splitDesc.length * 5) + 8;
  }

  if (syl.prerequisites?.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Prerequisites", 14, currentY);
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const preqText = syl.prerequisites.join(", ");
    const splitPreq = doc.splitTextToSize(preqText, 180);
    doc.text(splitPreq, 14, currentY);
    currentY += (splitPreq.length * 5) + 8;
  }

  if (syl.courseObjectives?.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Course Objectives", 14, currentY);
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    syl.courseObjectives.forEach((obj, i) => {
      const text = `${i + 1}. ${obj}`;
      const splitObj = doc.splitTextToSize(text, 180);
      if (currentY + (splitObj.length * 5) > 280) { doc.addPage(); currentY = 20; }
      doc.text(splitObj, 14, currentY);
      currentY += (splitObj.length * 5) + 2;
    });
    currentY += 6;
  }

  if (syl.units?.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Unit-wise Syllabus", 14, currentY);
    
    const tableRows = syl.units.map(u => [
      u.unitNumber || "-",
      u.unitTitle || "-",
      (u.topics || []).join(", "),
      u.estimatedHours ? `${u.estimatedHours}h` : "-"
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Unit", "Title", "Topics", "Est. Hours"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 105 },
        3: { cellWidth: 20, halign: 'center' },
      },
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  if (data.includesLab && syl.labSyllabus?.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Lab Syllabus", 14, currentY);
    
    const tableRows = syl.labSyllabus.map(lab => [
      lab.experimentNumber || "-",
      lab.title || "-",
      lab.aim || "-",
      lab.estimatedHours ? `${lab.estimatedHours}h` : "-"
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Exp", "Title", "Aim", "Est. Hours"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] }, // Emerald color for lab
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 100 },
        3: { cellWidth: 20, halign: 'center' },
      },
    });
  }
};

// --- MAPPING GENERATOR ---
const generateMappingPDF = (doc, data) => {
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.courseName || "Course Outcomes & Mapping", 14, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Course Code: ${data.courseCode || "-"} | Source: ${data.sourceType?.replace('_', ' ') || "-"}`, 14, 30);
  doc.setTextColor(0);

  let currentY = 40;
  
  const courseOutcomes = data.generatedOutcomes?.courseOutcomes || [];
  const matrix = data.generatedOutcomes?.copoMatrix || [];

  if (courseOutcomes.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Course Outcomes (COs)", 14, currentY);

    const coRows = courseOutcomes.map(co => [
      `CO${co.coNumber}`,
      co.statement,
      co.bloomsLevel
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["CO", "Statement", "Bloom's Level"]],
      body: coRows,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 125 },
        2: { cellWidth: 40 },
      },
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  if (matrix.length > 0) {
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CO-PO Correlation Matrix", 14, currentY);

    // Determine max PO count
    let maxPo = 0;
    matrix.forEach(row => {
      row.poMappings.forEach(pm => {
        if (pm.poNumber > maxPo) maxPo = pm.poNumber;
      });
    });

    if (maxPo > 0) {
      const headers = ["CO \\ PO"];
      for (let i = 1; i <= maxPo; i++) headers.push(`PO${i}`);

      const matrixRows = matrix.map(row => {
        const rowData = [`CO${row.coNumber}`];
        for (let i = 1; i <= maxPo; i++) {
          const poMap = row.poMappings.find(pm => pm.poNumber === i);
          let val = "-";
          if (poMap && poMap.correlationLevel > 0) {
            val = poMap.correlationLevel.toString();
          }
          rowData.push(val);
        }
        return rowData;
      });

      autoTable(doc, {
        startY: currentY + 5,
        head: [headers],
        body: matrixRows,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] }, // Amber color for matrix
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: { 0: { fontStyle: 'bold' } },
      });

      currentY = doc.lastAutoTable.finalY + 10;
      
      // Legend
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text("Correlation Scale: 3 (High), 2 (Medium), 1 (Low), - (None)", 14, currentY);
      }
  }
};

// --- PROGRAM SCHEDULE GENERATOR ---
const generateProgramSchedulePDF = (doc, data) => {
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.programName || "Program Schedule", 14, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${data.difficultyLevel ? data.difficultyLevel.charAt(0).toUpperCase() + data.difficultyLevel.slice(1) : "-"} | ${data.numberOfWeeks} Weeks`, 14, 30);
  doc.setTextColor(0);

  let currentY = 40;
  
  const schedule = data.generatedSchedule || {};
  
  if (schedule.programOverview) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const splitDesc = doc.splitTextToSize(schedule.programOverview, 180);
    doc.text(splitDesc, 14, currentY);
    currentY += (splitDesc.length * 5) + 8;
  }

  if (schedule.weeklySchedule?.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Week-Wise Schedule", 14, currentY);
    
    const tableRows = schedule.weeklySchedule.map(w => [
      `W${w.weekNumber}`,
      w.weekTitle || "-",
      (w.topics || []).join(", "),
      w.estimatedHours ? `${w.estimatedHours}h` : "-"
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Week", "Title", "Topics", "Est. Hours"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [147, 51, 234] }, // Purple color
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 105 },
        3: { cellWidth: 20, halign: 'center' },
      },
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  if (data.includesCapstone && schedule.capstoneProject) {
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    const capstone = schedule.capstoneProject;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Capstone Project (${capstone.suggestedWeeks} Weeks)`, 14, currentY);
    currentY += 8;

    doc.setFontSize(12);
    doc.text(capstone.title || "Capstone", 14, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitCapDesc = doc.splitTextToSize(capstone.description || "", 180);
    doc.text(splitCapDesc, 14, currentY);
    currentY += (splitCapDesc.length * 5) + 8;

    if (capstone.deliverables?.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Deliverables:", 14, currentY);
      currentY += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      capstone.deliverables.forEach(d => {
        doc.text(`• ${d}`, 14, currentY);
        currentY += 5;
      });
    }
  }
};

export const generateCurriculumPDF = (curriculumData, fileName) => {
  try {
    const doc = new jsPDF();
    const finalFileName = fileName ? fileName.trim() : "CourseCraft_Export";

    if (!curriculumData || !curriculumData.docType) {
      console.warn("Invalid curriculumData format provided to PDF generator.");
      return;
    }

    const { docType, data } = curriculumData;

    if (docType === "program") {
      generateProgramPDF(doc, data);
    } else if (docType === "course") {
      generateCoursePDF(doc, data);
    } else if (docType === "mapping") {
      generateMappingPDF(doc, data);
    } else if (docType === "generated_program") {
      generateProgramSchedulePDF(doc, data);
    }

    // Trigger browser download
    doc.save(`${finalFileName}.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("An error occurred while generating the PDF. Please check the console.");
  }
};
