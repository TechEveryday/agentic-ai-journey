import { test, expect } from '@playwright/test';

test.describe('Create Bracket', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should add participants to the pending list', async ({ page }) => {
    // Arrange
    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });

    // Act
    await input.fill('Alice');
    await addButton.click();
    await input.fill('Bob');
    await addButton.click();

    // Assert
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('should show an error for an empty participant name', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: 'Add participant' }).click();

    // Assert
    await expect(page.getByText('Name cannot be empty')).toBeVisible();
  });

  test('should keep Generate Bracket disabled until 2+ participants and a name are provided', async ({
    page,
  }) => {
    const generateButton = page.getByRole('button', { name: 'Generate Bracket' });

    // Arrange & Act: no participants yet
    await expect(generateButton).toBeDisabled();

    await page.getByPlaceholder('Tournament name').fill('My Cup');
    await expect(generateButton).toBeDisabled();

    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });
    await input.fill('Alice');
    await addButton.click();

    // Assert: still disabled with only 1 participant
    await expect(generateButton).toBeDisabled();

    await input.fill('Bob');
    await addButton.click();

    // Assert: enabled once 2 participants + name are present
    await expect(generateButton).toBeEnabled();
  });

  test('should generate a bracket and render round columns', async ({ page }) => {
    // Arrange
    await page.getByPlaceholder('Tournament name').fill('Spring Open');
    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });

    for (const name of ['Alice', 'Bob', 'Carol', 'Dave']) {
      await input.fill(name);
      await addButton.click();
    }

    // Act
    await page.getByRole('button', { name: 'Generate Bracket' }).click();

    // Assert
    await expect(page.getByText('Spring Open')).toBeVisible();
    await expect(page.getByText('Semifinal')).toBeVisible();
    await expect(page.getByText('Final', { exact: true })).toBeVisible();
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Carol')).toBeVisible();
    await expect(page.getByText('Dave')).toBeVisible();
  });

  test('should persist a generated bracket after reload', async ({ page }) => {
    // Arrange & Act
    await page.getByPlaceholder('Tournament name').fill('Persisted Cup');
    const input = page.getByPlaceholder('Add a participant...');
    const addButton = page.getByRole('button', { name: 'Add participant' });

    await input.fill('Alice');
    await addButton.click();
    await input.fill('Bob');
    await addButton.click();

    await page.getByRole('button', { name: 'Generate Bracket' }).click();
    await expect(page.getByText('Persisted Cup')).toBeVisible();

    // Reload
    await page.reload();

    // Assert
    await expect(page.getByText('Persisted Cup')).toBeVisible();
  });
});
