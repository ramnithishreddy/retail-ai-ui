import { expect, test } from "@playwright/test";

test.describe("Retail AI UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders header with title and status", async ({ page }) => {
    await expect(page.locator(".brand h1")).toHaveText("Retail AI Helper");
    await expect(page.locator(".status")).toContainText("Online");
  });

  test("renders welcome screen with suggestions on first load", async ({
    page,
  }) => {
    await expect(page.locator(".welcome h2")).toHaveText("How can I help?");
    const suggestions = page.locator(".suggestions button");
    await expect(suggestions).toHaveCount(4);
  });

  test("clicking a suggestion fills the input", async ({ page }) => {
    const firstSuggestion = page.locator(".suggestions button").first();
    const suggestionText = await firstSuggestion.textContent();
    await firstSuggestion.click();
    const textarea = page.locator("textarea");
    const value = await textarea.inputValue();
    expect(suggestionText?.trim()).toContain(value.trim());
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    const sendBtn = page.locator(".send-button");
    await expect(sendBtn).toBeDisabled();
  });

  test("send button enables when text is typed", async ({ page }) => {
    await page.locator("textarea").fill("test question");
    await expect(page.locator(".send-button")).toBeEnabled();
  });

  test("textarea clears after send (mocked response)", async ({ page }) => {
    // Mock the API so the test doesn't need a live backend
    await page.route("**/chat/stream", async (route) => {
      const body = [
        `data: ${JSON.stringify({ type: "start", session_id: "test-session" })}`,
        `data: ${JSON.stringify({ type: "token", content: "Hello! " })}`,
        `data: ${JSON.stringify({ type: "token", content: "I can help." })}`,
        `data: ${JSON.stringify({ type: "sources", route: "private", sources: [] })}`,
        `data: ${JSON.stringify({ type: "end", response_time_ms: 100 })}`,
        "data: [DONE]",
      ].join("\n\n");
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body,
      });
    });

    const textarea = page.locator("textarea");
    await textarea.fill("Where is the rice?");
    await page.locator(".send-button").click();

    // Input clears immediately on send
    await expect(textarea).toHaveValue("");
  });

  test("assistant reply appears after mocked stream", async ({ page }) => {
    await page.route("**/chat/stream", async (route) => {
      const body = [
        `data: ${JSON.stringify({ type: "start", session_id: "s1" })}`,
        `data: ${JSON.stringify({ type: "token", content: "Rice is in aisle 3." })}`,
        `data: ${JSON.stringify({ type: "sources", route: "private", sources: [{ type: "private", source: "store_layout.md" }] })}`,
        `data: ${JSON.stringify({ type: "end", response_time_ms: 80 })}`,
        "data: [DONE]",
      ].join("\n\n");
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body,
      });
    });

    await page.locator("textarea").fill("Where is rice?");
    await page.locator(".send-button").click();

    const assistant = page.locator(".message-row.assistant").last();
    await expect(assistant.locator(".message-content")).toContainText(
      "Rice is in aisle 3."
    );
    await expect(assistant.locator(".sources")).toBeVisible();
    await expect(assistant.locator(".source")).toContainText("store_layout.md");
  });

  test("user message appears in chat", async ({ page }) => {
    await page.route("**/chat/stream", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: "data: [DONE]\n\n",
      });
    });

    await page.locator("textarea").fill("Hello there");
    await page.locator(".send-button").click();

    await expect(
      page.locator(".message-row.user .message-content")
    ).toContainText("Hello there");
  });

  test("sidebar opens and closes", async ({ page }) => {
    await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
    await page.locator(".sidebar-toggle").click();
    await expect(page.locator(".sidebar")).toHaveClass(/sidebar-open/);
    await page.locator(".sidebar .icon-button").first().click();
    await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
  });

  test("mode toggle cycles through light/dark/system", async ({ page }) => {
    const modeOptions = page.locator(".mode-option");
    await expect(modeOptions).toHaveCount(3);
    await modeOptions.nth(1).click(); // dark
    await expect(modeOptions.nth(1)).toHaveClass(/active/);
    await modeOptions.nth(0).click(); // light
    await expect(modeOptions.nth(0)).toHaveClass(/active/);
  });

  test("Enter key sends message", async ({ page }) => {
    await page.route("**/chat/stream", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: "data: [DONE]\n\n",
      });
    });

    await page.locator("textarea").fill("test");
    await page.locator("textarea").press("Enter");
    await expect(page.locator(".message-row.user")).toBeVisible();
  });

  test("Shift+Enter adds newline instead of sending", async ({ page }) => {
    await page.locator("textarea").fill("line one");
    await page.locator("textarea").press("Shift+Enter");
    const value = await page.locator("textarea").inputValue();
    expect(value).toContain("\n");
    // No user message in chat
    await expect(page.locator(".message-row.user")).not.toBeVisible();
  });

  test("hint text is visible below input", async ({ page }) => {
    await expect(page.locator(".input-hint")).toContainText("Enter to send");
  });
});
