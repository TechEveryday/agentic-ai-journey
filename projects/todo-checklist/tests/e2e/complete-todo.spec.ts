import { test, expect } from '@playwright/test';

test.describe('Complete Todo', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/');

    // Create a todo to mark as complete
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('Write tests');
    await button.click();

    await expect(page.getByText('Write tests')).toBeVisible();
  });

  test('should mark todo as complete', async ({ page }) => {
    // Arrange
    const checkbox = page.getByRole('checkbox').first();
    const todoText = page.getByText('Write tests');

    // Act
    await checkbox.click();

    // Assert
    await expect(checkbox).toBeChecked();
    // Check for strikethrough style (opacity changes)
    const listItem = todoText.locator('..');
    await expect(listItem).toHaveCSS('opacity', /[0-6]\d?$/); // opacity < 1
  });

  test('should unmark todo as complete', async ({ page }) => {
    // Arrange
    const checkbox = page.getByRole('checkbox').first();

    // Act - Mark complete
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Act - Mark incomplete
    await checkbox.click();

    // Assert
    await expect(checkbox).not.toBeChecked();
  });

  test('should persist completion status after reload', async ({ page }) => {
    // Arrange & Act
    const checkbox = page.getByRole('checkbox').first();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Reload page
    await page.reload();

    // Assert
    const reloadedCheckbox = page.getByRole('checkbox').first();
    await expect(reloadedCheckbox).toBeChecked();
  });

  test('should mark multiple todos with different statuses', async ({ page }) => {
    // Add second todo
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('Read book');
    await button.click();

    // Mark first as complete, leave second incomplete
    const checkboxes = page.getByRole('checkbox');

    await checkboxes.nth(0).click();
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();

    // Reload and verify
    await page.reload();

    const reloadedCheckboxes = page.getByRole('checkbox');
    await expect(reloadedCheckboxes.nth(0)).toBeChecked();
    await expect(reloadedCheckboxes.nth(1)).not.toBeChecked();
  });
});
