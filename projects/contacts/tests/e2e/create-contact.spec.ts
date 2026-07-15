import { test, expect } from '@playwright/test';

test.describe('Create Contact', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first so the page has an origin, then clear localStorage
    // and reload for a clean slate.
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should create a new contact', async ({ page }) => {
    // Arrange
    const addButton = page.getByRole('button', { name: 'Add contact' });

    // Act
    await page.getByPlaceholder('First name').fill('Ada');
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByPlaceholder('Email').fill('ada@example.com');
    await addButton.click();

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByPlaceholder('First name')).toHaveValue('');
  });

  test('should persist contact after page reload', async ({ page }) => {
    // Arrange & Act
    await page.getByPlaceholder('First name').fill('Grace');
    await page.getByPlaceholder('Last name').fill('Hopper');
    await page.getByPlaceholder('Phone').fill('555-123-4567');
    await page.getByRole('button', { name: 'Add contact' }).click();

    await expect(page.getByText('Grace Hopper')).toBeVisible();

    // Reload page
    await page.reload();

    // Assert
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('should create multiple contacts', async ({ page }) => {
    // Act
    const names = [
      ['Ada', 'Lovelace'],
      ['Grace', 'Hopper'],
      ['Alan', 'Turing'],
    ];

    for (const [firstName, lastName] of names) {
      await page.getByPlaceholder('First name').fill(firstName);
      await page.getByPlaceholder('Last name').fill(lastName);
      await page.getByPlaceholder('Email').fill(`${firstName.toLowerCase()}@example.com`);
      await page.getByRole('button', { name: 'Add contact' }).click();
      await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();
    }

    // Assert
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
    await expect(page.getByText('Alan Turing')).toBeVisible();
  });

  test('should show an error when the first name is missing', async ({ page }) => {
    // Act
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByPlaceholder('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Add contact' }).click();

    // Assert
    await expect(page.getByText('First name is required')).toBeVisible();
  });

  test('should show an error when neither email nor phone is provided', async ({ page }) => {
    // Act
    await page.getByPlaceholder('First name').fill('Ada');
    await page.getByPlaceholder('Last name').fill('Lovelace');
    await page.getByRole('button', { name: 'Add contact' }).click();

    // Assert
    await expect(page.getByText('At least one of email or phone is required')).toBeVisible();
  });
});
