import { ElementHandle, Page } from "@playwright/test";

/** Changes the value of a react-select input using playwright */
export async function reactSelectChange(
  page: Page,
  labelText: string,
  optionText: string
) {
  // Get the "*-live-region" span in the react-select:
  const innerDetail = await page.waitForSelector(
    `label:has-text("${labelText}") [id$="-live-region"]`
  );

  const select = await parentElement(innerDetail);
  if (!select) {
    throw new Error(`No react-select found with label ${labelText}`);
  }

  await select.click();
  const option = await select.waitForSelector(`div:text('${optionText}')`);
  await option.scrollIntoViewIfNeeded();
  await option.click();
}
function parentElement<T>(element: ElementHandle<T>) {
  return element.$("xpath=..");
}
