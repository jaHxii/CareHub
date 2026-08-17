import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./guards";
import type { User } from "./api";

vi.mock("./auth-context", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "./auth-context";

const mockUseAuth = vi.mocked(useAuth);

const patient: User = {
  id: "p1",
  email: "patient@carehub.demo",
  fullName: "Selamawit Tadesse Alemu",
  role: "patient",
};

function mockAuthState(overrides: Partial<ReturnType<typeof useAuth>>) {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => vi.resetAllMocks());

  it("renders children when authenticated", () => {
    mockAuthState({ user: patient });
    renderProtected();
    expect(screen.getByText("secret content")).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("redirects to /login when unauthenticated", () => {
    mockAuthState({ user: null });
    renderProtected();
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("shows a loading state while restoring the session", () => {
    mockAuthState({ user: null, loading: true });
    renderProtected();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });
});

describe("RoleRoute", () => {
  beforeEach(() => vi.resetAllMocks());

  it("renders children when the role is allowed", () => {
    mockAuthState({ user: patient });
    render(
      <MemoryRouter initialEntries={["/patients"]}>
        <Routes>
          <Route
            path="/patients"
            element={
              <RoleRoute roles={["patient"]}>
                <div>patient-only</div>
              </RoleRoute>
            }
          />
          <Route path="/dashboard" element={<div>dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("patient-only")).toBeInTheDocument();
  });

  it("redirects to /dashboard when the role is not allowed", () => {
    mockAuthState({ user: patient });
    render(
      <MemoryRouter initialEntries={["/patients"]}>
        <Routes>
          <Route
            path="/patients"
            element={
              <RoleRoute roles={["admin", "doctor"]}>
                <div>staff-only</div>
              </RoleRoute>
            }
          />
          <Route path="/dashboard" element={<div>dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("dashboard page")).toBeInTheDocument();
    expect(screen.queryByText("staff-only")).not.toBeInTheDocument();
  });
});