import { test, expect } from '@playwright/test';

test.describe('Advance Winner to Champion', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should drive a full 4-participant tournament to a champion', async ({ page }) => {
    // Arrange: create a 4-participant bracket
    await page.getByPlaceholder('Tournament name').fill('Championship');
    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });

    for (const name of ['Alice', 'Bob', 'Carol', 'Dave']) {
      await input.fill(name);
      await addButton.click();
    }

    await page.getByRole('button', { name: 'Generate Bracket' }).click();
    await expect(page.getByText('Championship')).toBeVisible();
    await expect(page.getByText('Semifinal')).toBeVisible();

    // No champion yet
    await expect(page.getByText(/^Champion:/)).toHaveCount(0);

    // Act: win both semifinal matches by clicking the first participant in
    // each match card.
    const matches = page.locator('[data-testid^="match-"]');
    await expect(matches).toHaveCount(3); // 2 semifinals + 1 final

    const semifinal1 = matches.nth(0);
    const semifinal2 = matches.nth(1);

    const semifinal1WinnerName = await semifinal1
      .locator('p')
      .first()
      .textContent();
    await semifinal1.locator('p').first().click();

    const semifinal2WinnerName = await semifinal2
      .locator('p')
      .first()
      .textContent();
    await semifinal2.locator('p').first().click();

    // Assert: both semifinal winners now appear in the Final match card
    const finalMatch = matches.nth(2);
    await expect(finalMatch).toContainText(semifinal1WinnerName ?? '');
    await expect(finalMatch).toContainText(semifinal2WinnerName ?? '');

    // Act: win the final
    await finalMatch.locator('p').first().click();

    // Assert: champion is crowned
    await expect(page.getByText(/^Champion:/)).toBeVisible();
    await expect(page.getByText(`Champion: ${semifinal1WinnerName}`)).toBeVisible();
  });

  test('should crown a champion for a 2-participant bracket with a single click', async ({
    page,
  }) => {
    // Arrange
    await page.getByPlaceholder('Tournament name').fill('Duel');
    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });

    await input.fill('Alice');
    await addButton.click();
    await input.fill('Bob');
    await addButton.click();

    await page.getByRole('button', { name: 'Generate Bracket' }).click();
    await expect(page.getByText('Duel')).toBeVisible();

    // Act
    const match = page.locator('[data-testid^="match-"]').first();
    await match.locator('p').first().click();

    // Assert
    await expect(page.getByText('Champion: Alice')).toBeVisible();
  });
});
