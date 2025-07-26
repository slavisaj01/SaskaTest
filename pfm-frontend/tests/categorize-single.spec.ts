import { test, expect } from '@playwright/test';

test('should categorize or re-categorize a transaction based on its state', async ({ page }) => {
  // 1. MOCK: GET /transactions
  await page.route('**/transactions?**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'tx3',
            'beneficiary-name': 'Flexible User',
            date: '2025-07-26',
            direction: 'd',
            amount: 77.77,
            currency: 'EUR',
            kind: 'Payment',
            isSplit: false,
            splits: [],
            'cat-code': '' 
          }
        ],
        'total-count': 1
      })
    });
  });

  // 2. MOCK: GET /categories
  await page.route('**/categories', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { code: 'E', name: 'Food & Dining', 'parent-code': null },
        { code: '38', name: 'Groceries', 'parent-code': 'E' },
        { code: '39', name: 'Restaurants', 'parent-code': 'E' }
      ])
    });
  });

  // 3. MOCK: POST /transactions/:id/categorize
  await page.route('**/transactions/tx3/categorize', async route => {
    const body = await route.request().postDataJSON();
    expect(body['cat-code']).toBe('39'); // očekujemo "Restaurants"
    await route.fulfill({ status: 200 });
  });

  // 4. OTVORI aplikaciju
  await page.goto('http://localhost:4200/transactions');

  // 5. SAČEKAJ da se pojavi korisnik
  const user = page.getByText('Flexible User');
  await expect(user).toBeVisible();

  // 6. DETEKTUJ dugme: "+ Add category" ili postojeća kategorija
  const addCategoryButton = page.getByRole('button', { name: '+ Add category' });
  const foodDiningButton = page.getByRole('button', { name: /Food & Dining/i });

  if (await addCategoryButton.isVisible()) {
    await addCategoryButton.click();
  } else {
    await foodDiningButton.click();
  }

  // 7. ČEKAMO da se otvori dijalog
  const categorySelect = page.getByLabel('Choose category');
  await expect(categorySelect).toBeVisible();

  // 8. ODABERI "Food & Dining"
  await categorySelect.click();
  await page.getByRole('option', { name: 'Food & Dining' }).click();

  // 9. ODABERI "Restaurants" kao novu subkategoriju
  const subcategorySelect = page.getByLabel('Choose subcategory (optional)');
  await subcategorySelect.click();
  await page.getByRole('option', { name: 'Restaurants' }).click();

  // 10. KLIKNI Apply
  await page.getByRole('button', { name: 'Apply' }).click();

  // 11. PROVERI da se prikazuje "Food & Dining"
  await expect(page.getByText('Food & Dining')).toBeVisible();
  await page.pause();
});
