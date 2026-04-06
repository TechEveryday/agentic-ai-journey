import { test, expect } from '@playwright/test';

test.describe('Create Todo', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test('should create a new todo', async ({ page }) => {
    // Arrange
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    // Act
    await input.fill('Buy groceries');
    await button.click();

    // Assert
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('should persist todo after page reload', async ({ page }) => {
    // Arrange & Act
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('Persistent todo');
    await button.click();

    // Wait for todo to appear
    await expect(page.getByText('Persistent todo')).toBeVisible();

    // Reload page
    await page.reload();

    // Assert
    await expect(page.getByText('Persistent todo')).toBeVisible();
  });

  test('should create multiple todos', async ({ page }) => {
    // Arrange
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    // Act
    await input.fill('Todo 1');
    await button.click();

    await input.fill('Todo 2');
    await button.click();

    await input.fill('Todo 3');
    await button.click();

    // Assert
    await expect(page.getByText('Todo 1')).toBeVisible();
    await expect(page.getByText('Todo 2')).toBeVisible();
    await expect(page.getByText('Todo 3')).toBeVisible();
  });

  test('should show error for empty todo', async ({ page }) => {
    // Act
    const button = page.getByRole('button').first();
    await button.click();

    // Assert
    await expect(page.getByText('Title cannot be empty')).toBeVisible();
  });

  test('should trim whitespace from todo title', async ({ page }) => {
    // Act
    const input = page.getByPlaceholder('Add a new todo...');
    const button = page.getByRole('button').first();

    await input.fill('   Trimmed todo   ');
    await button.click();

    // Assert
    await expect(page.getByText('Trimmed todo')).toBeVisible();
  });
});
