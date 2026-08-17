import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:8080";
const PASSWORD = "Password123!";

async function login(page: Page, email: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("admin appointment scheduling", () => {
  test("creates an appointment and rejects an overlapping one", async ({ page }) => {
    await login(page, "admin@carehub.demo");

    await page.getByRole("link", { name: /appointments/i }).click();
    await expect(page).toHaveURL(/\/appointments/);
    await page.getByRole("button", { name: /new appointment/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByText("Select a patient").click();
    await page.getByRole("option", { name: /selamawit tadesse alemu/i }).click();

    await dialog.getByText("Select a doctor").click();
    await page.getByRole("option", { name: /dr\. yonas alemayehu gizaw/i }).click();

    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 30);
    futureStart.setHours(9, 0, 0, 0);
    const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000);
    const toLocalInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    await dialog.getByLabel("Starts").fill(toLocalInput(futureStart));
    await dialog.getByLabel("Ends").fill(toLocalInput(futureEnd));
    await dialog.getByRole("button", { name: /^Schedule$/ }).click();

    await expect(page.getByText("Appointment scheduled")).toBeVisible();

    await page.getByRole("button", { name: /new appointment/i }).click();
    const dialog2 = page.getByRole("dialog");
    await dialog2.getByText("Select a patient").click();
    await page.getByRole("option", { name: /selamawit tadesse alemu/i }).click();
    await dialog2.getByText("Select a doctor").click();
    await page.getByRole("option", { name: /dr\. yonas alemayehu gizaw/i }).click();
    await dialog2.getByLabel("Starts").fill(toLocalInput(futureStart));
    await dialog2.getByLabel("Ends").fill(toLocalInput(futureEnd));
    await dialog2.getByRole("button", { name: /^Schedule$/ }).click();

    await expect(page.getByText(/already booked/i)).toBeVisible();
  });
});

test.describe("doctor flow", () => {
  test("marks an appointment as completed", async ({ page }) => {
    await login(page, "doctor@carehub.demo");

    await page.getByRole("link", { name: /appointments/i }).click();
    await expect(page).toHaveURL(/\/appointments/);

    const row = page.getByRole("row", { name: /selamawit tadesse alemu/i }).first();
    await row.getByRole("button", { name: /complete/i }).click();
    await expect(page.getByText("Appointment updated")).toBeVisible();
  });

  test("writes a prescription for an appointment", async ({ page }) => {
    await login(page, "doctor@carehub.demo");

    await page.getByRole("link", { name: /prescriptions/i }).click();
    await expect(page).toHaveURL(/\/prescriptions/);
    await page.getByRole("button", { name: /new prescription/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByText("Select an appointment").click();
    await page
      .getByRole("option", { name: /selamawit tadesse alemu/i })
      .first()
      .click();

    await dialog.getByLabel("Medication").fill("Paracetamol 500mg");
    await dialog.getByLabel("Dosage").fill("1 tablet every 6h as needed");
    await dialog.getByRole("button", { name: /^Save$/ }).click();

    await expect(page.getByText("Prescription created")).toBeVisible();
    await expect(page.getByText("Paracetamol 500mg")).toBeVisible();
  });
});

test.describe("reports", () => {
  test("admin can download the patient PDF", async ({ page }) => {
    await login(page, "admin@carehub.demo");
    await page.getByRole("link", { name: /reports/i }).click();
    await expect(page).toHaveURL(/\/reports/);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/patients-report-.*\.pdf/);
  });
});