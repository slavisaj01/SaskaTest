import { test, expect } from '@playwright/test';

test('should allow dynamic split into multiple parts (mocked)', async ({ page }) => {
  let sentSplits: any = null;
  let splitApplied = false;

  // Mock GET /transactions
  await page.route('**/transactions?**', async route => {
    const body = {
      items: [
        {
          id: 'tx1',
          'beneficiary-name': 'Split User',
          date: '2025-07-25',
          direction: 'd',
          amount: 100,
          currency: 'USD',
          kind: 'Payment',
          splits: splitApplied
            ? [
                { catcode: '38', amount: 30 },
                { catcode: '39', amount: 30 },
                { catcode: '40', amount: 40 }
              ]
            : [],
          category: '',
          subcategory: ''
        }
      ],
      'total-count': 1
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });
  });

  // Mock GET /categories
  await page.route('**/categories', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { code: 'E', name: 'Food & Dining', 'parent-code': null },
        { code: '38', name: 'Groceries', 'parent-code': 'E' },
        { code: 'M', name: 'Misc', 'parent-code': null },
        { code: '39', name: 'Snacks', 'parent-code': 'M' },
        { code: 'T', name: 'Transport', 'parent-code': null },
        { code: '40', name: 'Bus', 'parent-code': 'T' }
      ])
    });
  });

  // Mock POST /split
  await page.route('**/transactions/tx1/split', async route => {
    sentSplits = await route.request().postDataJSON();
    splitApplied = true; // signal to next GET /transactions to return split data
    await route.fulfill({ status: 200 });
  });

  // Open page and interact
  await page.goto('http://localhost:4200/transactions');
  await expect(page.getByText('Split User')).toBeVisible();
  await page.getByRole('button', { name: 'Split' }).click();

  const splitsToCreate = [
    { category: 'Food & Dining', subcategory: 'Groceries', amount: '30' },
    { category: 'Misc', subcategory: 'Snacks', amount: '30' },
    { category: 'Transport', subcategory: 'Bus', amount: '40' }
  ];

  for (let i = 0; i < splitsToCreate.length; i++) {
    if (i > 1) {
      await page.getByText('+ Add new category').click();
    }

    const split = splitsToCreate[i];

    await page.getByLabel('Choose category').nth(i).click();
    await page.getByRole('option', { name: split.category }).click();

    await page.getByLabel('Choose subcategory (optional)').nth(i).click();
    await page.getByRole('option', { name: split.subcategory }).click();

    await page.getByLabel('Enter amount').nth(i).fill(split.amount);
  }

  const applyBtn = page.getByRole('button', { name: 'Apply' });
  await expect(applyBtn).toBeEnabled();
  await applyBtn.click();

  // Proveri da su svi splitovi poslati
  await expect.poll(() => sentSplits).toMatchObject([
    { 'cat-code': '38', amount: 30 },
    { 'cat-code': '39', amount: 30 },
    { 'cat-code': '40', amount: 40 }
    ]);


  // Proveri da su prikazani u UI
  await expect(page.getByText('Groceries')).toBeVisible();
  await expect(page.getByText('Snacks')).toBeVisible();
  await expect(page.getByText('Bus')).toBeVisible();
  await expect(page.getByText('Amount: 30.00 USD').nth(0)).toBeVisible();
  await expect(page.getByText('Amount: 30.00 USD').nth(1)).toBeVisible();
  await expect(page.getByText('Amount: 40.00 USD')).toBeVisible();
  await page.pause();
});
