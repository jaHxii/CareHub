import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db/pool";
import { auth, signToken } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(255),
  dob: z.string().date().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(255),
  role: z.enum(["admin", "doctor", "patient"]),
  dob: z.string().date().optional(),
});

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const client = await pool.connect();
    let user;
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'patient')
         RETURNING id, email, full_name, role`,
        [body.email, passwordHash, body.fullName]
      );
      user = rows[0];
      if (body.dob) {
        await client.query(
          `INSERT INTO patients (user_id, full_name, dob, medical_history)
           VALUES ($1, $2, $3, '{}'::jsonb)`,
          [user.id, body.fullName, body.dob]
        );
      }
      await client.query("COMMIT");
    } catch (err: unknown) {
      await client.query("ROLLBACK");
      if ((err as { code?: string }).code === "23505") {
        throw new HttpError(409, "Email already registered");
      }
      throw err;
    } finally {
      client.release();
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, full_name, role
       FROM users WHERE email = $1`,
      [body.email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!rows[0]) throw new HttpError(404, "User not found");
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/users", auth, async (req, res, next) => {
  try {
    if (req.user!.role !== "admin") {
      throw new HttpError(403, "Insufficient permissions");
    }
    const body = adminCreateSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const client = await pool.connect();
    let user;
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, full_name, role`,
        [body.email, passwordHash, body.fullName, body.role]
      );
      user = rows[0];
      if (body.role === "patient" && body.dob) {
        await client.query(
          `INSERT INTO patients (user_id, full_name, dob, medical_history)
           VALUES ($1, $2, $3, '{}'::jsonb)`,
          [user.id, body.fullName, body.dob]
        );
      }
      await client.query("COMMIT");
    } catch (err: unknown) {
      await client.query("ROLLBACK");
      if ((err as { code?: string }).code === "23505") {
        throw new HttpError(409, "Email already registered");
      }
      throw err;
    } finally {
      client.release();
    }

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;