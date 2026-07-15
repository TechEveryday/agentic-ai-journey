import { test, expect } from '@playwright/test';

test.describe('Search Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();

    // Create two contacts to search across
    await page.getByPlaceholder('First name').fill('Ada');
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByPlaceholder('Email').fill('ada@example.com');
    await page.getByPlaceholder('Tags (comma separated)').fill('mathematician');
    await page.getByRole('button', { name: 'Add contact' }).click();
    await expect(page.getByText('Ada Lovelace')).toBeVisible();

    await page.getByPlaceholder('First name').fill('Grace');
    await page.getByPlaceholder('Last name').fill('Hopper');
    await page.getByPlaceholder('Email').fill('grace@example.com');
    await page.getByPlaceholder('Tags (comma separated)').fill('navy');
    await page.getByRole('button', { name: 'Add contact' }).click();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('should filter contacts by name', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Search contacts...').fill('Grace');

    // Assert
    await expect(page.getByText('Grace Hopper')).toBeVisible();
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
  });

  test('should filter contacts by email', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Search contacts...').fill('ada@example.com');

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Grace Hopper')).not.toBeVisible();
  });

  test('should filter contacts by tag', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Search contacts...').fill('navy');

    // Assert
    await expect(page.getByText('Grace Hopper')).toBeVisible();
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
  });

  test('should be case-insensitive', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Search contacts...').fill('GRACE');

    // Assert
    await expect(page.getByText('Grace Hopper')).toBeVisible();
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
  });

  test('should show all contacts again when the search is cleared', async ({ page }) => {
    // Arrange
    const search = page.getByPlaceholder('Search contacts...');
    await search.fill('Grace');
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();

    // Act
    await search.fill('');

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('should show no results for a non-matching query', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Search contacts...').fill('nonexistent');

    // Assert
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
    await expect(page.getByText('Grace Hopper')).not.toBeVisible();
    await expect(page.getByText('No contacts yet')).toBeVisible();
  });
});
