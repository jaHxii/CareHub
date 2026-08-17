import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:8080";
const PASSWORD = "Password123!";

const accounts = [
  { role: "admin", email: "admin@carehub.demo", fullName: "System Administrator" },
  { role: "doctor", email: "doctor@carehub.demo", fullName: "Dr. Yonas Alemayehu Gizaw" },
  { role: "patient", email: "patient@carehub.demo", fullName: "Selamawit Tadesse Alemu" },
];

async function login(page: Page, email: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("authentication", () => {
  for (const account of accounts) {
    test(`logs in as ${account.role}`, async ({ page }) => {
      await login(page, account.email);
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(`Welcome back, ${account.fullName.split(" ")[0]}`)).toBeVisible();
    });
  }

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").fill("admin@carehub.demo");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("redirects unauthenticated visitors to /login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("role-based navigation", () => {
  test("patient only sees patient nav items", async ({ page }) => {
    await login(page, "patient@carehub.demo");
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(page.getByRole("link", { name: /appointments/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /prescriptions/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /patients/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /staff/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /reports/i })).toHaveCount(0);
  });

  test("doctor sees patients and reports but not staff", async ({ page }) => {
    await login(page, "doctor@carehub.demo");
    await expect(page.getByRole("link", { name: /patients/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /reports/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /staff/i })).toHaveCount(0);
  });

  test("admin sees staff and reports", async ({ page }) => {
    await login(page, "admin@carehub.demo");
    await expect(page.getByRole("link", { name: /staff/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /reports/i })).toBeVisible();
  });

  test("patient is blocked from staff-only pages", async ({ page }) => {
    await login(page, "patient@carehub.demo");
    await page.goto(`${BASE}/reports`);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto(`${BASE}/patients`);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto(`${BASE}/staff`);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("patient flows", () => {
  test("sees their own appointments", async ({ page }) => {
    await login(page, "patient@carehub.demo");
    await page.getByRole("link", { name: /appointments/i }).click();
    await expect(page).toHaveURL(/\/appointments/);
    await expect(page.getByText("Selamawit Tadesse Alemu")).toBeVisible();
    await expect(page.getByText("Dr. Yonas Alemayehu Gizaw")).toBeVisible();
  });

  test("registers a new account and lands on the dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}@carehub.demo`;
    await page.goto(`${BASE}/register`);
    await page.getByLabel("Full name").fill("Eden Desta Berhane");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByLabel("Date of birth").fill("1990-05-12");
    await page.getByRole("button", { name: /^Register$/ }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Welcome back, Eden")).toBeVisible();
  });
});