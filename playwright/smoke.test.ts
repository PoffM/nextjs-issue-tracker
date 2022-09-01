import { test } from "@playwright/test";

test.setTimeout(5_000);

test("Go to /", async ({ page }) => {
  await page.goto("/");

  // Wait for the header to render:
  await page.waitForSelector(`text="Issue Tracker"`);
});
