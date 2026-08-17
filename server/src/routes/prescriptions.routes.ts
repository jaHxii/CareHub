import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { auth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

router.use(auth);

const createPrescriptionSchema = z.object({
  appointmentId: z.string().uuid(),
  medication: z.string().min(1).max(500),
  dosage: z.string().min(1).max(100),
  notes: z.string().max(2000).optional().nullable(),
});

const updatePrescriptionSchema = z.object({
  medication: z.string().min(1).max(500).optional(),
  dosage: z.string().min(1).max(100).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

router.get("/", async (req, res, next) => {
  try {
    const appointmentId = req.query.appointmentId;
    const filters: string[] = [];
    const params: unknown[] = [];
    const role = req.user!.role;

    if (appointmentId) {
      params.push(String(appointmentId));
      filters.push(`pr.appointment_id = $${params.length}`);
    }

    if (role === "patient") {
      const { rows: patients } = await pool.query(
        `SELECT id FROM patients WHERE user_id = $1`,
        [req.user!.id]
      );
      if (!patients[0]) return res.json({ prescriptions: [] });
      params.push(patients[0].id);
      filters.push(`a.patient_id = $${params.length}`);
    } else if (role === "doctor") {
      params.push(req.user!.id);
      filters.push(`a.doctor_id = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT pr.id, pr.appointment_id, pr.medication, pr.dosage, pr.notes,
              pr.created_at, a.patient_id, a.doctor_id
       FROM prescriptions pr
       JOIN appointments a ON a.id = pr.appointment_id
       ${where}
       ORDER BY pr.created_at DESC`,
      params
    );
    res.json({ prescriptions: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "doctor"), async (req, res, next) => {
  try {
    const body = createPrescriptionSchema.parse(req.body);
    const { rows } = await pool.query(
      `SELECT * FROM appointments WHERE id = $1`,
      [body.appointmentId]
    );
    const appointment = rows[0];
    if (!appointment) throw new HttpError(404, "Appointment not found");
    if (
      req.user!.role === "doctor" &&
      appointment.doctor_id !== req.user!.id
    ) {
      throw new HttpError(403, "Doctors can only prescribe for their own appointments");
    }

    const { rows: inserted } = await pool.query(
      `INSERT INTO prescriptions (appointment_id, medication, dosage, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [body.appointmentId, body.medication, body.dosage, body.notes ?? null]
    );
    res.status(201).json({ prescription: inserted[0] });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole("admin", "doctor"), async (req, res, next) => {
  try {
    const body = updatePrescriptionSchema.parse(req.body);
    const sets: string[] = [];
    const params: unknown[] = [];
    if (body.medication !== undefined) {
      params.push(body.medication);
      sets.push(`medication = $${params.length}`);
    }
    if (body.dosage !== undefined) {
      params.push(body.dosage);
      sets.push(`dosage = $${params.length}`);
    }
    if (body.notes !== undefined) {
      params.push(body.notes ?? null);
      sets.push(`notes = $${params.length}`);
    }
    if (!sets.length) throw new HttpError(400, "No fields to update");

    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE prescriptions SET ${sets.join(", ")}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );
    if (!rows[0]) throw new HttpError(404, "Prescription not found");
    res.json({ prescription: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;