import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-context";
import type { User } from "./api";

vi.mock("./api", () => {
  return {
    getToken: vi.fn(),
    setToken: vi.fn(),
    authApi: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
    },
  };
});

import { authApi, getToken, setToken } from "./api";

const mockGetToken = vi.mocked(getToken);
const mockSetToken = vi.mocked(setToken);
const mockMe = vi.mocked(authApi.me);
const mockLogin = vi.mocked(authApi.login);

const doctor: User = {
  id: "u1",
  email: "doctor@carehub.demo",
  fullName: "Dr. Yonas Alemayehu Gizaw",
  role: "doctor",
};

function Consumer({ onReady }: { onReady: (value: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user?.fullName ?? "none"}</span>
      <button onClick={() => auth.logout()}>logout</button>
      <button onClick={() => void auth.login("a@b.c", "pw")}>login</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReset();
  });

  it("restores a session via /me when a token exists", async () => {
    mockGetToken.mockReturnValue("tok");
    mockMe.mockResolvedValue({ user: doctor });

    render(
      <AuthProvider>
        <Consumer onReady={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe(
        "Dr. Yonas Alemayehu Gizaw"
      );
    });
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("clears the token and stays signed out when /me fails", async () => {
    mockGetToken.mockReturnValue("stale");
    mockMe.mockRejectedValue(new Error("401"));

    render(
      <AuthProvider>
        <Consumer onReady={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(mockSetToken).toHaveBeenCalledWith(null);
  });

  it("logs in and stores the token + user", async () => {
    mockGetToken.mockReturnValue(null);
    mockLogin.mockResolvedValue({ token: "new-tok", user: doctor });

    render(
      <AuthProvider>
        <Consumer onReady={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    screen.getByText("login").click();

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe(
        "Dr. Yonas Alemayehu Gizaw"
      );
    });
    expect(mockSetToken).toHaveBeenCalledWith("new-tok");
  });

  it("logs out and clears the user", async () => {
    mockGetToken.mockReturnValue(null);
    mockLogin.mockResolvedValue({ token: "t", user: doctor });

    render(
      <AuthProvider>
        <Consumer onReady={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("login").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe(
        "Dr. Yonas Alemayehu Gizaw"
      );
    });

    act(() => {
      screen.getByText("logout").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
    expect(mockSetToken).toHaveBeenCalledWith(null);
  });
});