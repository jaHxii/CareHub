import { Router } from "express";
import rateLimit from "express-rate-limit";
import PDFDocument from "pdfkit";
import { pool } from "../db/pool";
import { auth, requireRole } from "../middleware/auth";

const router = Router();

router.use(auth, requireRole("admin", "doctor"));

const reportLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "anon",
  message: { error: "Too many report requests. Try again in a minute." },
});

function buildPdf(rows: ReportRow[]): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc
    .fontSize(18)
    .text("Patient Report", { align: "center" })
    .moveDown(0.5)
    .fontSize(10)
    .fillColor("#666")
    .text(`Generated ${new Date().toUTCString()}`, { align: "center" })
    .moveDown();

  doc.fillColor("#000");
  rows.forEach((row, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. ${row.full_name}`, { continued: false })
      .fontSize(9)
      .text(`Email: ${row.email}`)
      .text(`DOB: ${new Date(row.dob).toISOString().slice(0, 10)}`)
      .text(`Appointments: ${row.appointment_count}  |  Prescriptions: ${row.prescription_count}`)
      .moveDown(0.6);
    if (row !== rows[rows.length - 1]) {
      doc.moveTo(48, doc.y).lineTo(562, doc.y).strokeColor("#ddd").stroke();
      doc.moveDown(0.6);
    }
  });
  doc.end();
  return doc;
}

interface ReportRow {
  full_name: string;
  email: string;
  dob: string;
  appointment_count: string;
  prescription_count: string;
}

router.get("/patients", reportLimiter, async (req, res, next) => {
  try {
    const { rows } = await pool.query<ReportRow>(
      `SELECT p.full_name, u.email, p.dob,
              COUNT(DISTINCT a.id)::int AS appointment_count,
              COUNT(DISTINCT pr.id)::int AS prescription_count
       FROM patients p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN appointments a ON a.patient_id = p.id
       LEFT JOIN prescriptions pr ON pr.appointment_id = a.id
       GROUP BY p.id, u.email, p.dob
       ORDER BY p.full_name`
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="patients-report-${Date.now()}.pdf"`
    );
    buildPdf(rows).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;