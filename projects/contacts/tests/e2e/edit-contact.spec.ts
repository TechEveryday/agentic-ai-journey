import { test, expect } from '@playwright/test';

test.describe('Edit Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();

    // Create a contact to edit
    await page.getByPlaceholder('First name').fill('Ada');
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByPlaceholder('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Add contact' }).click();

    await expect(page.getByText('Ada Lovelace')).toBeVisible();
  });

  test('should edit a contact name', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Edit contact' }).click();
    const lastNameInput = page.getByLabel('Edit last name');

    // Act
    await lastNameInput.fill('Byron');
    await page.getByRole('button', { name: 'Save contact' }).click();

    // Assert
    await expect(page.getByText('Ada Byron')).toBeVisible();
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
  });

  test('should save edits on Enter key', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Edit contact' }).click();
    const lastNameInput = page.getByLabel('Edit last name');

    // Act
    await lastNameInput.fill('Byron');
    await lastNameInput.press('Enter');

    // Assert
    await expect(page.getByText('Ada Byron')).toBeVisible();
  });

  test('should cancel edit on Escape key without saving', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Edit contact' }).click();
    const lastNameInput = page.getByLabel('Edit last name');

    // Act
    await lastNameInput.fill('Byron');
    await lastNameInput.press('Escape');

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
  });

  test('should cancel edit when the cancel button is clicked', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Edit contact' }).click();
    const lastNameInput = page.getByLabel('Edit last name');
    await lastNameInput.fill('Byron');

    // Act
    await page.getByRole('button', { name: 'Cancel edit' }).click();

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
  });

  test('should persist edits after reload', async ({ page }) => {
    // Arrange & Act
    await page.getByRole('button', { name: 'Edit contact' }).click();
    await page.getByLabel('Edit last name').fill('Byron');
    await page.getByRole('button', { name: 'Save contact' }).click();
    await expect(page.getByText('Ada Byron')).toBeVisible();

    // Reload
    await page.reload();

    // Assert
    await expect(page.getByText('Ada Byron')).toBeVisible();
  });
});
