import bcrypt from "bcryptjs";
import { pool } from "./pool";

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "Password123!";

async function ensureUser(
  email: string,
  fullName: string,
  role: "admin" | "doctor" | "patient",
  dob?: string
): Promise<string> {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows[0]) return existing.rows[0].id as string;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, passwordHash, fullName, role]
  );
  const userId = rows[0].id as string;

  if (role === "patient" && dob) {
    await pool.query(
      `INSERT INTO patients (user_id, full_name, dob, medical_history)
       VALUES ($1, $2, $3, '{}'::jsonb)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, fullName, dob]
    );
  }
  return userId;
}

async function seed(): Promise<void> {
  const adminId = await ensureUser(
    "admin@carehub.demo",
    "System Administrator",
    "admin"
  );
  const doctorId = await ensureUser(
    "doctor@carehub.demo",
    "Dr. Sarah Chen",
    "doctor"
  );
  const patientId = await ensureUser(
    "patient@carehub.demo",
    "James Miller",
    "patient",
    "1985-06-14"
  );

  const patient = await pool.query(
    "SELECT id FROM patients WHERE user_id = $1",
    [patientId]
  );
  if (patient.rows[0]) {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM appointments
       WHERE doctor_id = $1 AND patient_id = $2`,
      [doctorId, patient.rows[0].id]
    );
    if (!rowCount) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 30, 0, 0);
      const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      const { rows } = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, starts_at, ends_at, status)
         VALUES ($1, $2, $3, $4, 'scheduled')
         RETURNING id`,
        [patient.rows[0].id, doctorId, tomorrow.toISOString(), end.toISOString()]
      );
      await pool.query(
        `INSERT INTO prescriptions (appointment_id, medication, dosage, notes)
         VALUES ($1, 'Amoxicillin 500mg', '1 capsule, 3x daily for 7 days', 'Take with food')`,
        [rows[0].id]
      );
    }
  }

  console.log(`Seed complete. Demo accounts (password: ${DEMO_PASSWORD}):
  admin   -> admin@carehub.demo
  doctor  -> doctor@carehub.demo
  patient -> patient@carehub.demo`);
  await pool.end();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await pool.end();
  process.exit(1);
});