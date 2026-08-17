import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  appointmentsApi,
  authApi,
  patientsApi,
  prescriptionsApi,
  setToken,
  getToken,
  api,
} from "./api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("token helpers", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves a token", () => {
    expect(getToken()).toBeNull();
    setToken("abc123");
    expect(getToken()).toBe("abc123");
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe("api()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("attaches the Authorization header when a token exists", async () => {
    setToken("tok-1");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await api<{ ok: boolean }>("/api/test");

    const [, init] = fetchMock.mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-1");
  });

  it("throws ApiError with the server error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "Email already registered" }, 409))
    );

    const err = (await api("/api/auth/register").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.message).toBe("Email already registered");
  });

  it("throws ApiError with the status text when body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("server error", { status: 500, statusText: "Internal Server Error" })
      )
    );

    const err = (await api("/api/test").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
    expect(err.message).toBe("Internal Server Error");
  });
});

describe("authApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps login response (camelCase) to User", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          token: "jwt",
          user: { id: "u1", email: "a@b.c", fullName: "Selamawit Tadesse Alemu", role: "patient" },
        })
      )
    );

    const res = await authApi.login("a@b.c", "pw");
    expect(res.token).toBe("jwt");
    expect(res.user).toEqual({
      id: "u1",
      email: "a@b.c",
      fullName: "Selamawit Tadesse Alemu",
      role: "patient",
    });
  });

  it("maps /me response (snake_case) to User", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          user: { id: "u2", email: "d@e.f", full_name: "Dr. Yonas Alemayehu Gizaw", role: "doctor" },
        })
      )
    );

    const { user } = await authApi.me();
    expect(user.fullName).toBe("Dr. Yonas Alemayehu Gizaw");
    expect(user.role).toBe("doctor");
  });

  it("lists users and filters by role", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        users: [
          { id: "u3", email: "x@y.z", full_name: "Dawit Mamo Tadesse", role: "doctor" },
        ],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const users = await authApi.listUsers("doctor");
    expect(users).toHaveLength(1);
    expect(users[0].fullName).toBe("Dawit Mamo Tadesse");
    expect(String(fetchMock.mock.calls[0][0])).toContain("role=doctor");
  });
});

describe("patientsApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps snake_case patient rows to camelCase", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          patients: [
            {
              id: "p1",
              user_id: "u1",
              full_name: "Selamawit Tadesse Alemu",
              dob: "1985-06-14",
              medical_history: { allergies: ["penicillin"] },
              email: "patient@carehub.demo",
              created_at: "2026-01-01T00:00:00Z",
            },
          ],
        })
      )
    );

    const patients = await patientsApi.list();
    expect(patients[0]).toEqual({
      id: "p1",
      userId: "u1",
      fullName: "Selamawit Tadesse Alemu",
      dob: "1985-06-14",
      medicalHistory: { allergies: ["penicillin"] },
      email: "patient@carehub.demo",
      createdAt: "2026-01-01T00:00:00Z",
    });
  });
});

describe("appointmentsApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps appointment rows and builds filter query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        appointments: [
          {
            id: "a1",
            patient_id: "p1",
            doctor_id: "u2",
            starts_at: "2026-08-19T10:00:00.000Z",
            ends_at: "2026-08-19T11:00:00.000Z",
            status: "scheduled",
            patient_name: "Selamawit Tadesse Alemu",
            doctor_name: "Dr. Yonas Alemayehu Gizaw",
            created_at: "2026-08-18T00:00:00Z",
          },
        ],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const appointments = await appointmentsApi.list({ patientId: "p1" });
    expect(appointments[0].patientName).toBe("Selamawit Tadesse Alemu");
    expect(appointments[0].doctorName).toBe("Dr. Yonas Alemayehu Gizaw");
    expect(appointments[0].status).toBe("scheduled");
    expect(String(fetchMock.mock.calls[0][0])).toContain("patientId=p1");
  });

  it("sends status updates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        appointment: {
          id: "a1",
          patient_id: "p1",
          doctor_id: "u2",
          starts_at: "2026-08-19T10:00:00.000Z",
          ends_at: "2026-08-19T11:00:00.000Z",
          status: "completed",
          patient_name: "Selamawit Tadesse Alemu",
          doctor_name: "Dr. Yonas Alemayehu Gizaw",
          created_at: "2026-08-18T00:00:00Z",
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const updated = await appointmentsApi.setStatus("a1", "completed");
    expect(updated.status).toBe("completed");

    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).method).toBe("PATCH");
    expect(String((init as RequestInit).body)).toContain('"status":"completed"');
  });
});

describe("prescriptionsApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps prescription rows to camelCase", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          prescriptions: [
            {
              id: "r1",
              appointment_id: "a1",
              medication: "Ibuprofen 400mg",
              dosage: "1 tablet, 2x daily",
              notes: "With food",
              patient_id: "p1",
              doctor_id: "u2",
              created_at: "2026-08-18T00:00:00Z",
            },
          ],
        })
      )
    );

    const prescriptions = await prescriptionsApi.list("a1");
    expect(prescriptions[0]).toEqual({
      id: "r1",
      appointmentId: "a1",
      medication: "Ibuprofen 400mg",
      dosage: "1 tablet, 2x daily",
      notes: "With food",
      patientId: "p1",
      doctorId: "u2",
      createdAt: "2026-08-18T00:00:00Z",
    });
  });
});