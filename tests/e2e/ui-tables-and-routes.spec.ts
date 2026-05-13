import { test, expect } from "@playwright/test";

/**
 * 1) واجهة: جدول المقارنة في لوحة التحكم يظهر داخل الإطار الموحّد.
 * 2) ربط الصفحات: صف أقسام لوحة التحكم → تفاصيل القسم في skill-matrix.
 * 3) المنطق (API) يُختبر لاحقاً ضمن عقود الـ OpenAPI / تكامل الخادم.
 */
test.describe("Unified tables & navigation", () => {
  test("dashboard comparison table + link to department detail", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "super_admin@hrm-dev.com");
    await page.fill('input[type="password"]', "admin123");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    const comparison = page.getByTestId("dept-comparison-table");
    await expect(comparison).toBeVisible({ timeout: 30_000 });

    await page.getByRole("link", { name: "Assembly", exact: true }).first().click();
    await expect(page).toHaveURL(/\/skill-matrix\/departments\/d1/);
  });

  test("employees list uses unified table shell", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "super_admin@hrm-dev.com");
    await page.fill('input[type="password"]', "admin123");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page.getByTestId("dept-comparison-table")).toBeVisible({ timeout: 30_000 });

    await page.goto("/skill-matrix/employees");
    await expect(page.getByTestId("employees-data-table")).toBeVisible({ timeout: 30_000 });
  });
});
