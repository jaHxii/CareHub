import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { auth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

router.use(auth);

const createPatientSchema = z.object({
  userId: z.string().uuid(),
  dob: z.string().date(),
  medicalHistory: z.record(z.unknown()).optional(),
});

const updatePatientSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  dob: z.string().date().optional(),
  medicalHistory: z.record(z.unknown()).optional(),
});

router.get("/", requireRole("admin", "doctor"), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.user_id, p.full_name, p.dob, p.medical_history,
              p.created_at, u.email
       FROM patients p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.full_name`
    );
    res.json({ patients: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.user_id, p.full_name, p.dob, p.medical_history,
              p.created_at, u.email
       FROM patients p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    const patient = rows[0];
    if (!patient) throw new HttpError(404, "Patient not found");

    const role = req.user!.role;
    const isOwner =
      role === "patient" && patient.user_id === req.user!.id;
    if (role === "patient" && !isOwner) {
      throw new HttpError(403, "Insufficient permissions");
    }
    res.json({ patient });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const body = createPatientSchema.parse(req.body);
    const { rowCount } = await pool.query(
      `SELECT 1 FROM patients WHERE user_id = $1`,
      [body.userId]
    );
    if (rowCount) throw new HttpError(409, "Patient record already exists");

    const { rows } = await pool.query(
      `INSERT INTO patients (user_id, full_name, dob, medical_history)
       SELECT id, full_name, $2, $3 FROM users WHERE id = $1
       RETURNING id, user_id, full_name, dob, medical_history`,
      [body.userId, body.dob, JSON.stringify(body.medicalHistory ?? {})]
    );
    if (!rows[0]) throw new HttpError(404, "User not found");
    res.status(201).json({ patient: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const body = updatePatientSchema.parse(req.body);
    const sets: string[] = [];
    const params: unknown[] = [];
    if (body.fullName !== undefined) {
      params.push(body.fullName);
      sets.push(`full_name = $${params.length}`);
    }
    if (body.dob !== undefined) {
      params.push(body.dob);
      sets.push(`dob = $${params.length}`);
    }
    if (body.medicalHistory !== undefined) {
      params.push(JSON.stringify(body.medicalHistory));
      sets.push(`medical_history = $${params.length}`);
    }
    if (!sets.length) throw new HttpError(400, "No fields to update");

    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE patients SET ${sets.join(", ")}
       WHERE id = $${params.length}
       RETURNING id, user_id, full_name, dob, medical_history`,
      params
    );
    if (!rows[0]) throw new HttpError(404, "Patient not found");
    res.json({ patient: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;