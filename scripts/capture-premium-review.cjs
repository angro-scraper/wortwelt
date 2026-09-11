const { chromium } = require('playwright');
const path = require('node:path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 414, height: 896 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.CapacitorCustomPlatform = { name: 'ios' };
      const offer = {
        pricingPhases: [
          { price: '0 €', billingPeriod: 'P1W', paymentMode: 'FreeTrial' },
          { price: '3,99 €', billingPeriod: 'P1M', paymentMode: 'PayAsYouGo' }
        ]
      };
      window.CdvPurchase = {
        Platform: { APPLE_APPSTORE: 'ios-appstore', GOOGLE_PLAY: 'android-playstore' },
        ProductType: { PAID_SUBSCRIPTION: 'paid subscription' },
        ErrorCode: { PAYMENT_CANCELLED: 6777001 },
        store: {
          minTimeBetweenUpdates: 0,
          register() {},
          when() { return { approved() { return this; } }; },
          async initialize() { return []; },
          async update() {},
          get() { return { pricing: { price: '3,99 €' }, getOffer: () => offer }; },
          owned() { return false; },
          async order() {},
          async restorePurchases() {}
        }
      };
    });
    await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Für Eltern/i }).click();
    await page.getByLabel('4 + 3 =').fill('7');
    await page.getByRole('button', { name: /Elternbereich öffnen/i }).click();
    await page.getByRole('heading', { name: 'WortWelt Premium' }).waitFor();
    await page.getByRole('button', { name: 'Premium starten' }).waitFor();
    await page.screenshot({
      path: path.resolve('store-listing/wortwelt-iphone-premium-review.png'),
      fullPage: false
    });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
