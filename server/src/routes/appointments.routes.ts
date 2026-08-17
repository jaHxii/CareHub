import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { auth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

router.use(auth);

const createAppointmentSchema = z
  .object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    status: z
      .enum(["scheduled", "completed", "cancelled"])
      .default("scheduled"),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: "endsAt must be after startsAt",
  });

const statusSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

router.get("/", async (req, res, next) => {
  try {
    const role = req.user!.role;
    const filters: string[] = [];
    const params: unknown[] = [];

    if (role === "patient") {
      const { rows: patients } = await pool.query(
        `SELECT id FROM patients WHERE user_id = $1`,
        [req.user!.id]
      );
      const patientId = patients[0]?.id;
      if (!patientId) return res.json({ appointments: [] });
      params.push(patientId);
      filters.push(`a.patient_id = $${params.length}`);
    } else if (role === "doctor") {
      params.push(req.user!.id);
      filters.push(`a.doctor_id = $${params.length}`);
    }

    const { doctorId, patientId } = req.query;
    if (role !== "patient" && doctorId) {
      params.push(String(doctorId));
      filters.push(`a.doctor_id = $${params.length}`);
    }
    if (role !== "patient" && patientId) {
      params.push(String(patientId));
      filters.push(`a.patient_id = $${params.length}`);
    }
    if (req.query.from) {
      params.push(String(req.query.from));
      filters.push(`a.starts_at >= $${params.length}`);
    }
    if (req.query.to) {
      params.push(String(req.query.to));
      filters.push(`a.ends_at <= $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.starts_at, a.ends_at,
              a.status, a.created_at,
              p.full_name AS patient_name,
              u.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.doctor_id
       ${where}
       ORDER BY a.starts_at`,
      params
    );
    res.json({ appointments: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.starts_at, a.ends_at,
              a.status, a.created_at,
              p.full_name AS patient_name,
              u.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.doctor_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    const appointment = rows[0];
    if (!appointment) throw new HttpError(404, "Appointment not found");

    const role = req.user!.role;
    if (role === "patient") {
      const { rows: patients } = await pool.query(
        `SELECT id FROM patients WHERE user_id = $1`,
        [req.user!.id]
      );
      if (appointment.patient_id !== patients[0]?.id) {
        throw new HttpError(403, "Insufficient permissions");
      }
    } else if (role === "doctor" && appointment.doctor_id !== req.user!.id) {
      throw new HttpError(403, "Insufficient permissions");
    }
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "doctor"), async (req, res, next) => {
  try {
    const body = createAppointmentSchema.parse(req.body);
    if (
      req.user!.role === "doctor" &&
      body.doctorId !== req.user!.id
    ) {
      throw new HttpError(403, "Doctors can only create their own appointments");
    }

    const { rows } = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, starts_at, ends_at, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [body.patientId, body.doctorId, body.startsAt, body.endsAt, body.status]
    );
    res.status(201).json({ appointment: rows[0] });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "23P01") {
      next(
        new HttpError(409, "Overlapping appointment — the doctor is already booked")
      );
      return;
    }
    next(err);
  }
});

router.patch("/:id/status", requireRole("admin", "doctor"), async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const { rows } = await pool.query(
      `UPDATE appointments SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) throw new HttpError(404, "Appointment not found");
    res.json({ appointment: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;