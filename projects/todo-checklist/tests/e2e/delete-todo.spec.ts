import { test, expect } from '@playwright/test';

test.describe('Delete Todo', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/');

    // Create todos to delete
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('Delete me');
    await button.click();

    await expect(page.getByText('Delete me')).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Arrange
    const todoText = page.getByText('Delete me');

    // Act
    // Delete button is the second button in the list item (edit is first)
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    const firstDeleteButton = deleteButtons.first();

    await firstDeleteButton.click();

    // Assert
    await expect(todoText).not.toBeVisible();
    await expect(page.getByText('No todos yet')).toBeVisible();
  });

  test('should persist deletion after reload', async ({ page }) => {
    // Act
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    await deleteButtons.first().click();

    // Wait for empty state
    await expect(page.getByText('No todos yet')).toBeVisible();

    // Reload
    await page.reload();

    // Assert
    await expect(page.getByText('Delete me')).not.toBeVisible();
    await expect(page.getByText('No todos yet')).toBeVisible();
  });

  test('should delete correct todo when multiple exist', async ({ page }) => {
    // Arrange - Create more todos
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('Keep me');
    await button.click();

    await expect(page.getByText('Keep me')).toBeVisible();

    // Act - Delete first todo
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    await deleteButtons.first().click();

    // Assert
    await expect(page.getByText('Delete me')).not.toBeVisible();
    await expect(page.getByText('Keep me')).toBeVisible();
  });

  test('should edit and then delete a todo', async ({ page }) => {
    // Arrange & Act - Edit first
    const editButtons = page.getByRole('button', { name: /edit|create|edit_note/i });
    await editButtons.first().click();

    const input = page.getByDisplayValue('Delete me');
    await input.fill('Edited todo');

    // Save edit
    const checkButtons = page.getByRole('button', { name: /check|done/i });
    await checkButtons.first().click();

    // Verify edit worked
    await expect(page.getByText('Edited todo')).toBeVisible();

    // Act - Delete
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    await deleteButtons.first().click();

    // Assert
    await expect(page.getByText('Edited todo')).not.toBeVisible();
  });
});
