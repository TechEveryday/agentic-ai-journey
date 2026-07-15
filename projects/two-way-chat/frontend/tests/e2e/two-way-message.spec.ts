import { test, expect, type Browser } from '@playwright/test';

/**
 * Proves the core feature: two independent browser sessions join the same
 * room and can exchange messages in both directions over the live SignalR
 * connection. Requires the backend (Chat.Api) running on
 * http://localhost:5000 in addition to the frontend dev server that
 * Playwright's webServer config starts automatically.
 */

async function joinRoom(browser: Browser, roomId: string, displayName: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');

  // exact: true avoids ambiguity with the dialog's own accessible name
  // ("Join a chat room"), which otherwise fuzzy-matches "Room".
  await page.getByLabel('Room', { exact: true }).fill(roomId);
  await page.getByLabel('Display name', { exact: true }).fill(displayName);
  await page.getByRole('button', { name: /join/i }).click();

  // Dialog closes once isConnected flips true.
  await expect(page.getByText('Join a chat room')).not.toBeVisible();

  return { context, page };
}

test.describe('Two-way chat', () => {
  test('two participants can exchange messages in both directions', async ({ browser }) => {
    const roomId = `room-${Date.now()}`;

    const [alice, bob] = await Promise.all([
      joinRoom(browser, roomId, 'Alice'),
      joinRoom(browser, roomId, 'Bob'),
    ]);

    try {
      // Alice sends a message; Bob should receive it.
      await alice.page.getByPlaceholder('Type a message...').fill('Hello from Alice');
      await alice.page.getByRole('button', { name: 'send message' }).click();

      await expect(bob.page.getByText('Hello from Alice')).toBeVisible();
      await expect(alice.page.getByText('Hello from Alice')).toBeVisible();

      // Bob replies; Alice should receive it.
      await bob.page.getByPlaceholder('Type a message...').fill('Hi Alice, this is Bob');
      await bob.page.getByRole('button', { name: 'send message' }).click();

      await expect(alice.page.getByText('Hi Alice, this is Bob')).toBeVisible();
      await expect(bob.page.getByText('Hi Alice, this is Bob')).toBeVisible();
    } finally {
      await alice.context.close();
      await bob.context.close();
    }
  });
});
