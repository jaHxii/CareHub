const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type Role = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  medicalHistory: Record<string, unknown>;
  email: string;
  createdAt: string;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  medication: string;
  dosage: string;
  notes: string | null;
  patientId: string;
  doctorId: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "carehub_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase())] = value;
  }
  return out;
}

function mapUser(row: Record<string, unknown>): User {
  return toCamel(row) as unknown as User;
}

function mapPatient(row: Record<string, unknown>): Patient {
  return toCamel(row) as unknown as Patient;
}

function mapAppointment(row: Record<string, unknown>): Appointment {
  return toCamel(row) as unknown as Appointment;
}

function mapPrescription(row: Record<string, unknown>): Prescription {
  return toCamel(row) as unknown as Prescription;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    dob?: string;
  }) =>
    api<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: async () => {
    const res = await api<{ user: Record<string, unknown> }>("/api/auth/me");
    return { user: mapUser(res.user) };
  },
  listUsers: async (role?: Role) => {
    const query = role ? `?role=${encodeURIComponent(role)}` : "";
    const res = await api<{ users: Record<string, unknown>[] }>(
      `/api/auth/users${query}`
    );
    return res.users.map(mapUser);
  },
  createUser: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    dob?: string;
  }) => {
    const res = await api<{ user: Record<string, unknown> }>("/api/auth/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return mapUser(res.user);
  },
};

export const patientsApi = {
  list: async () => {
    const res = await api<{ patients: Record<string, unknown>[] }>(
      "/api/patients"
    );
    return res.patients.map(mapPatient);
  },
  get: async (id: string) => {
    const res = await api<{ patient: Record<string, unknown> }>(
      `/api/patients/${id}`
    );
    return mapPatient(res.patient);
  },
  create: async (data: { userId: string; dob: string }) => {
    const res = await api<{ patient: Record<string, unknown> }>(
      "/api/patients",
      { method: "POST", body: JSON.stringify(data) }
    );
    return mapPatient(res.patient);
  },
  update: async (
    id: string,
    data: {
      fullName?: string;
      dob?: string;
      medicalHistory?: Record<string, unknown>;
    }
  ) => {
    const res = await api<{ patient: Record<string, unknown> }>(
      `/api/patients/${id}`,
      { method: "PATCH", body: JSON.stringify(data) }
    );
    return mapPatient(res.patient);
  },
};

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  from?: string;
  to?: string;
}

export const appointmentsApi = {
  list: async (filters?: AppointmentFilters) => {
    const params = new URLSearchParams();
    if (filters?.patientId) params.set("patientId", filters.patientId);
    if (filters?.doctorId) params.set("doctorId", filters.doctorId);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    const res = await api<{ appointments: Record<string, unknown>[] }>(
      `/api/appointments${qs ? `?${qs}` : ""}`
    );
    return res.appointments.map(mapAppointment);
  },
  create: async (data: {
    patientId: string;
    doctorId: string;
    startsAt: string;
    endsAt: string;
  }) => {
    const res = await api<{ appointment: Record<string, unknown> }>(
      "/api/appointments",
      { method: "POST", body: JSON.stringify(data) }
    );
    return mapAppointment(res.appointment);
  },
  setStatus: async (id: string, status: AppointmentStatus) => {
    const res = await api<{ appointment: Record<string, unknown> }>(
      `/api/appointments/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) }
    );
    return mapAppointment(res.appointment);
  },
};

export const prescriptionsApi = {
  list: async (appointmentId?: string) => {
    const qs = appointmentId ? `?appointmentId=${encodeURIComponent(appointmentId)}` : "";
    const res = await api<{ prescriptions: Record<string, unknown>[] }>(
      `/api/prescriptions${qs}`
    );
    return res.prescriptions.map(mapPrescription);
  },
  create: async (data: {
    appointmentId: string;
    medication: string;
    dosage: string;
    notes: string | null;
  }) => {
    const res = await api<{ prescription: Record<string, unknown> }>(
      "/api/prescriptions",
      { method: "POST", body: JSON.stringify(data) }
    );
    return mapPrescription(res.prescription);
  },
  update: async (
    id: string,
    data: {
      medication: string;
      dosage: string;
      notes: string | null;
    }
  ) => {
    const res = await api<{ prescription: Record<string, unknown> }>(
      `/api/prescriptions/${id}`,
      { method: "PATCH", body: JSON.stringify(data) }
    );
    return mapPrescription(res.prescription);
  },
};

export const reportsApi = {
  downloadPatients: async (): Promise<Blob> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/reports/patients`, { headers });
    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(res.status, message);
    }
    return res.blob();
  },
};

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}