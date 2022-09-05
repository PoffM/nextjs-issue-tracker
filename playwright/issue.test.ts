import { test } from "@playwright/test";
import { randomUUID } from "crypto";
import { reactSelectChange } from "./utils/reactSelectChange";

test("Add an issue and a comment", async ({ page }) => {
  // Go to the home page and click the Create button:
  await page.goto("/");
  await page.click("text=Create Issue");

  // Login:
  await page.fill("text=Username", "user");
  await page.fill("text=Password", "user");
  await page.click("text=Sign in with Local Dev Credentials");

  // Fill out the Issue form
  const testTitle = `Test Issue ${randomUUID()}`;
  await page.fill("text=Title", testTitle);
  await page.fill("text=Description", "test description");
  await page.click("button >> text=Submit");

  // View the created Issue's page:
  await page.waitForSelector(`h1 >> text=${testTitle}`);
  await page.waitForSelector(`text=test description`);
  await page.waitForSelector(`text=NEW`);

  // Add a comment and change the status:
  await page.fill("text=Add a Comment", "test comment");
  await reactSelectChange(page, "Status", "IN PROGRESS");
  await page.click("button >> text=Submit");

  // View the new comment:
  await page.waitForSelector("text=User commented");
  await page.waitForSelector("text=test comment");
  await page.waitForSelector("text=IN PROGRESS");

  // Go back to the home page to view the new Issue in the table:
  await page.goto("/");
  await page.waitForSelector(`td >> visible=true text=${testTitle}`);
});
