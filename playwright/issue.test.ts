import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { reactSelectChange } from "./utils/reactSelectChange";

test("Add an issue and a comment, then delete the issue.", async ({ page }) => {
  // Go to the home page and click the Create button:
  await page.goto("/");
  await page.click("text=Create Issue");

  // Login:
  await page.fill("text=Username", "user");
  await page.fill("text=Password", "user");
  await page.click("text=Sign in with Credentials");

  // Fill out the Issue form
  const testTitle = `Test Issue ${randomUUID()}`;
  await page.fill("text=Title", testTitle);
  await page.fill("text=Description", "test description");
  await page.click("button >> text=Submit");

  // View the created Issue's page:
  await page.waitForSelector(`h1 >> text="${testTitle}"`);
  await page.waitForSelector(`text=test description`);
  await page.waitForSelector(`text=NEW`);

  // Add a comment and change the status:
  await page.fill("text=Add a Comment", "test comment");
  await reactSelectChange(page, "New Status", "IN PROGRESS");
  await page.click("button >> text=Submit");

  // View the new comment:
  await page.waitForSelector("text=User commented");
  await page.waitForSelector("text=test comment");
  await page.waitForSelector("text=IN PROGRESS");

  // Go back to the home page to view the new Issue in the table:
  await page.goto("/");
  await page.waitForSelector(`a:visible >> text="${testTitle}"`);

  // Logout and then back in as admin:
  await page.click("button >> text=Logout");
  await page.click("button >> text=Login");
  await page.fill("text=Username", "admin");
  await page.fill("text=Password", "admin");
  await page.click("text=Sign in with Credentials");

  // Go back to the new Issue's page and delete it:
  // await page.click(`a >> visible=true text="${testTitle}"`);
  await page.click(`a:visible >> text="${testTitle}"`);
  await page.click("button >> text=Delete Issue");
  await page.click("button >> text=Yes"); // "Are you sure" confirmation button

  // You should be redirected to the home page:
  await page.waitForNavigation({ url: "/" });

  // The Issue's link should not be visible:
  await expect(
    page.locator(`a:visible >> text="${testTitle}"`)
  ).not.toBeVisible();
});
