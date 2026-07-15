import { test, expect } from '@playwright/test';

test.describe('Delete Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();

    // Create a contact to delete
    await page.getByPlaceholder('First name').fill('Ada');
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByPlaceholder('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Add contact' }).click();

    await expect(page.getByText('Ada Lovelace')).toBeVisible();
  });

  test('should delete a contact', async ({ page }) => {
    // Arrange
    const contactText = page.getByText('Ada Lovelace');

    // Act
    await page.getByRole('button', { name: 'Delete contact' }).click();

    // Assert
    await expect(contactText).not.toBeVisible();
    await expect(page.getByText('No contacts yet')).toBeVisible();
  });

  test('should persist deletion after reload', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: 'Delete contact' }).click();
    await expect(page.getByText('No contacts yet')).toBeVisible();

    // Reload
    await page.reload();

    // Assert
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
    await expect(page.getByText('No contacts yet')).toBeVisible();
  });

  test('should delete the correct contact when multiple exist', async ({ page }) => {
    // Arrange - create a second contact
    await page.getByPlaceholder('First name').fill('Grace');
    await page.getByPlaceholder('Last name').fill('Hopper');
    await page.getByPlaceholder('Email').fill('grace@example.com');
    await page.getByRole('button', { name: 'Add contact' }).click();
    await expect(page.getByText('Grace Hopper')).toBeVisible();

    // Act - delete the first contact
    await page.getByRole('button', { name: 'Delete contact' }).first().click();

    // Assert
    await expect(page.getByText('Ada Lovelace')).not.toBeVisible();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('should edit and then delete a contact', async ({ page }) => {
    // Arrange & Act - edit first
    await page.getByRole('button', { name: 'Edit contact' }).click();
    await page.getByLabel('Edit last name').fill('Byron');
    await page.getByRole('button', { name: 'Save contact' }).click();
    await expect(page.getByText('Ada Byron')).toBeVisible();

    // Act - delete
    await page.getByRole('button', { name: 'Delete contact' }).click();

    // Assert
    await expect(page.getByText('Ada Byron')).not.toBeVisible();
    await expect(page.getByText('No contacts yet')).toBeVisible();
  });
});
