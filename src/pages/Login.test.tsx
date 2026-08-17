import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import type { User } from "@/lib/api";

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/lib/auth-context";

const mockUseAuth = vi.mocked(useAuth);

const admin: User = {
  id: "u1",
  email: "admin@carehub.demo",
  fullName: "System Administrator",
  role: "admin",
};

describe("Login page", () => {
  beforeEach(() => vi.resetAllMocks());

  it("renders the sign-in form", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Sign in to CareHub")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("fills credentials from the demo account quick-fill", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByText("admin@carehub.demo"));

    expect(screen.getByLabelText("Email")).toHaveValue("admin@carehub.demo");
    expect(screen.getByLabelText("Password")).toHaveValue("Password123!");
  });

  it("calls login and navigates to /dashboard on submit", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(admin);
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login,
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByText("admin@carehub.demo"));
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("admin@carehub.demo", "Password123!");
    });
  });

  it("shows an error toast when login fails", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error("Invalid email or password"));
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login,
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByText("admin@carehub.demo"));
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });
});