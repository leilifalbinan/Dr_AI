import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const generateVisitPDF = (visit, patient) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  const addText = (text, size = 11, isBold = false) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * lineHeight);
  };

  const addSection = (title) => {
    yPosition += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    yPosition += 10;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT VISIT REPORT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Patient Info
  addSection('PATIENT INFORMATION');
  addText(`Name: ${patient.first_name} ${patient.last_name}`);
  addText(`Date of Birth: ${format(new Date(patient.date_of_birth), 'MMM d, yyyy')}`);

  if (patient.medical_record_number) addText(`MRN: ${patient.medical_record_number}`);
  if (patient.primary_diagnosis) addText(`Primary Diagnosis: ${patient.primary_diagnosis}`);

  // Visit Details
  addSection('VISIT DETAILS');
  addText(`Visit Number: ${visit.visit_number}`);
  addText(`Date: ${format(new Date(visit.visit_date), 'MMM d, yyyy')}`);

  if (visit.chief_complaint) addText(`Chief Complaint: ${visit.chief_complaint}`);

  // Vital Signs
  if (visit.bp_systolic || visit.heart_rate) {
    addSection('VITAL SIGNS');

    if (visit.bp_systolic && visit.bp_diastolic)
      addText(`Blood Pressure: ${visit.bp_systolic}/${visit.bp_diastolic} mmHg`);

    if (visit.heart_rate) addText(`Heart Rate: ${visit.heart_rate} bpm`);
    if (visit.respiratory_rate) addText(`Respiratory Rate: ${visit.respiratory_rate} /min`);
    if (visit.temperature) addText(`Temperature: ${visit.temperature}°F`);
    if (visit.spo2) addText(`SpO2: ${visit.spo2}%`);
  }

  // ----------- ✅ GAIT ANALYSIS (YOUR FEATURE KEPT) -----------
  if (visit.gait_summary) {
    addSection('GAIT ANALYSIS');

    if (visit.gait_summary_text || visit.gait_summary.summary_text) {
      addText(`Summary: ${visit.gait_summary_text || visit.gait_summary.summary_text}`);
    }

    if (visit.gait_summary.mean_speed_mps != null)
      addText(`Mean Gait Speed: ${visit.gait_summary.mean_speed_mps} m/s`);

    if (visit.gait_summary.cadence_spm != null)
      addText(`Cadence: ${visit.gait_summary.cadence_spm} steps/min`);

    if (visit.gait_summary.num_steps_est != null)
      addText(`Estimated Steps: ${visit.gait_summary.num_steps_est}`);

    if (visit.gait_summary.knee_symmetry_index_percent != null)
      addText(`Knee Symmetry Index: ${visit.gait_summary.knee_symmetry_index_percent}%`);

    if (visit.gait_summary.stability_ap_rms_m != null)
      addText(`AP Stability RMS: ${visit.gait_summary.stability_ap_rms_m} m`);

    if (visit.gait_summary.stability_ml_rms_m != null)
      addText(`ML Stability RMS: ${visit.gait_summary.stability_ml_rms_m} m`);

    if (visit.gait_summary.sit_to_stand_detected != null)
      addText(`Sit-to-Stand Detected: ${visit.gait_summary.sit_to_stand_detected ? 'Yes' : 'No'}`);

    if (visit.gait_summary.sit_to_stand_time_s != null)
      addText(`Sit-to-Stand Time: ${visit.gait_summary.sit_to_stand_time_s} s`);
  }

  // AI Assessment
  if (visit.ai_assessment) {
    addSection('AI DIAGNOSTIC ASSESSMENT');

    if (visit.ai_assessment.suggested_diagnoses) {
      addText('Suggested Diagnoses:', 11, true);
      visit.ai_assessment.suggested_diagnoses.forEach((dx, idx) => {
        addText(`  ${idx + 1}. ${dx}`);
      });
    }
  }

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.text(
    `Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  doc.save(`Visit_${patient.last_name}.pdf`);
};