import jsPDF from "jspdf";
import { format } from "date-fns";

function toDateLabel(value) {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return String(value);
  }
}

export function generateCombinedReportPDF({
  patient,
  visit,
  visitMeta,
  vitals,
  faceDerived,
  audioDerived,
  gaitDerived,
  aiAssessment,
  serialVisits = [],
}) {
  const doc = new jsPDF();
  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const maxWidth = pageWidth - margin * 2;
  const line = 6;

  const addText = (text, size = 10, bold = false, indent = 0) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text), maxWidth - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * line;
  };

  const section = (title) => {
    y += 2;
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(236, 253, 245);
    doc.rect(margin, y - 4, maxWidth, 8, "F");
    addText(title, 12, true, 2);
    y += 1;
  };

  const bulletList = (items = []) => {
    items.forEach((item) => addText(`- ${item}`, 10, false, 3));
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Comprehensive Clinical Report", pageWidth / 2, y, { align: "center" });
  y += 10;
  addText(`Generated: ${format(new Date(), "MMM d, yyyy h:mm a")}`, 9);
  addText(`Visit ID: ${visitMeta?.visitId ?? visit?.id ?? "—"}`, 9);
  addText(`Patient: ${patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "Unknown Patient"}`, 9);
  addText(`Patient ID: ${visitMeta?.patientId ?? visit?.patient_id ?? "—"}`, 9);

  section("Visit Summary");
  addText(`Visit date: ${toDateLabel(vitals?.visit_date || visit?.visit_date)}`);
  if (vitals?.chief_complaint || visit?.chief_complaint) {
    addText(`Chief complaint: ${vitals?.chief_complaint || visit?.chief_complaint}`);
  }
  addText(
    `Vitals: BP ${vitals?.bp_systolic ?? "—"}/${vitals?.bp_diastolic ?? "—"} mmHg, ` +
      `HR ${vitals?.heart_rate ?? "—"} bpm, RR ${vitals?.respiratory_rate ?? "—"} /min, ` +
      `Temp ${vitals?.temperature ?? "—"}${vitals?.temperature_unit === "celsius" ? "°C" : "°F"}, ` +
      `SpO2 ${vitals?.spo2 ?? "—"}%, BMI ${vitals?.bmi ?? "—"}`
  );

  section("Face Analysis");
  if (faceDerived?.sorted?.length) {
    addText("Emotion distribution:");
    bulletList(faceDerived.sorted.map(([k, v]) => `${String(k).replace(/_/g, " ")}: ${Number(v).toFixed(1)}%`));
  } else {
    addText("No face summary available.");
  }

  section("Audio Analysis");
  if (audioDerived) {
    addText(
      `Sentiment windows: ${audioDerived.windows?.length ?? 0}. ` +
        `Top terms listed below (diagnostic terms marked in UI).`
    );
    if (audioDerived.kwSorted?.length) {
      addText("Top keywords:");
      bulletList(audioDerived.kwSorted.slice(0, 12).map(([w, c]) => `${w}: ${c}`));
    }
    if (audioDerived.topicRows?.length) {
      addText("Topic distribution:");
      bulletList(audioDerived.topicRows.slice(0, 8).map((r) => `${r.topic.replace(/_/g, " ")}: ${(r.avg * 100).toFixed(0)}%`));
    }
  } else {
    addText("No audio summary available.");
  }

  section("Gait Analysis");
  if (gaitDerived) {
    addText(
      `Avg speed: ${gaitDerived.avgSpeed != null ? gaitDerived.avgSpeed.toFixed(2) : "—"} m/s; ` +
        `symmetry: ${gaitDerived.avgSym != null ? `${(gaitDerived.avgSym * 100).toFixed(0)}%` : "—"}; ` +
        `stability: ${gaitDerived.avgStab != null ? `${(gaitDerived.avgStab * 100).toFixed(0)}%` : "—"}`
    );
    if (gaitDerived.events?.length) {
      addText("Detected events:");
      bulletList(
        gaitDerived.events.slice(0, 10).map((e) => {
          const t = e.t != null ? `${e.t}s` : "—";
          return `${t}: ${e.features?.event ?? "unknown"} (conf ${e.confidence != null ? (e.confidence * 100).toFixed(0) + "%" : "—"})`;
        })
      );
    }
    if (gaitDerived.gaitNotes) addText(`Notes: ${gaitDerived.gaitNotes}`);
  } else {
    addText("No gait summary available.");
  }

  section("AI Diagnostic Assessment");
  if (aiAssessment) {
    if (aiAssessment.consensus_note) addText(aiAssessment.consensus_note, 10, true);
    if (aiAssessment.suggested_diagnoses?.length) {
      addText("Differential diagnosis:");
      bulletList(aiAssessment.suggested_diagnoses);
    }
    if (aiAssessment.recommended_tests?.length) {
      addText("Recommended workup:");
      bulletList(aiAssessment.recommended_tests);
    }
    if (aiAssessment.treatment_suggestions?.length) {
      addText("Treatment plan:");
      bulletList(aiAssessment.treatment_suggestions);
    }
    if (aiAssessment.patient_education?.length) {
      addText("Patient education:");
      bulletList(aiAssessment.patient_education);
    }
    if (aiAssessment.follow_up_recommendations) {
      addText(`Follow-up: ${aiAssessment.follow_up_recommendations}`);
    }
  } else {
    addText("No AI assessment available.");
  }

  section("Serial Trend Analysis");
  if (serialVisits.length) {
    serialVisits.forEach((s) => {
      addText(
        `Visit #${s.visit_number} (${toDateLabel(s.visit_date)}): ` +
          `BP ${s.bp_systolic}/${s.bp_diastolic}, HR ${s.heart_rate}, ` +
          `Sentiment ${s.sentiment_score != null ? s.sentiment_score.toFixed(2) : "—"}, ` +
          `Face low affect ${s.face_low_affect_pct != null ? `${s.face_low_affect_pct.toFixed(1)}%` : "—"}, ` +
          `Gait speed ${s.gait_avg_speed_mps != null ? s.gait_avg_speed_mps.toFixed(2) : "—"} m/s`
      );
      if (s.ai_assessment?.suggested_diagnoses?.length) {
        bulletList(s.ai_assessment.suggested_diagnoses.slice(0, 3).map((d) => `AI: ${d}`));
      }
    });
  } else {
    addText("No serial trend data available.");
  }

  const lastName = patient?.last_name || "Patient";
  const firstName = patient?.first_name || "";
  const datePart = toDateLabel(vitals?.visit_date || visit?.visit_date).replace(/,/g, "").replace(/\s+/g, "-");
  doc.save(`Comprehensive_Report_${lastName}_${firstName}_${datePart}.pdf`);
}

