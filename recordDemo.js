/**
 * TaskFlow Pro - Demo Recording Script
 * Records a professional demo video of all major features
 *
 * Usage:
 *   npm install puppeteer puppeteer-screen-recorder
 *   node recordDemo.js
 */
const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const CONFIG = {
  appUrl: 'http://localhost:5173',
  loginUrl: 'http://localhost:5173/login',
  viewport: { width: 1920, height: 1080 },
  outputFile: 'demo.mp4',
  fps: 30,
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const humanDelay = () => sleep(100 + Math.random() * 200);
async function typeLikeHuman( page, selector, text) {
  await page.click(selector);
  await sleep(300);
  for (const char of text) {
    await page.keyboard.type(char);
    await humanDelay();
  }
}
async function scrollSmoothly( page, distance = 300) {
  await page.evaluate((dist) => {
    window.scrollBy({ top: dist, behavior: 'smooth' });
  }, distance);
  await sleep(800);
}
async function waitForPageLoad( page) {
  await page.waitForLoadState('networkidle');
  await sleep(1000);
}
async function findAndClick( page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    await humanDelay();
    return true;
  } catch {
    return false;
  }
}
async function tryClickByText( page, text) {
  const elements = await page.$$('button, a, [role="button"], [tabindex="0"]');
  for (const el of elements) {
    try {
      const content = await el.textContent();
      if (content && content.trim().toLowerCase().includes(text.toLowerCase())) {
        await el.scrollIntoView();
        await el.click();
        return true;
      }
    } catch {}
  }
  return false;
}
async function main() {
  console.log('=================================');
  console.log('TaskFlow Pro - Demo Recording Script');
  console.log('=================================\n');
  console.log('[1] Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized', '--disable-web-security']
  });
  const context = browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setViewportSize(CONFIG.viewport);
  await page.setDefaultTimeout(30000);
  console.log('[2] Setting up screen recorder...');
  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTabs: true,
    fps: CONFIG.fps,
  });
  console.log('[3] Starting demo recording...');
  await recorder.startFile(CONFIG.outputFile);
  try {
    console.log('\n[STEP 1] Opening TaskFlow Pro...');
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle' });
    await waitForPageLoad(page);
    await scrollSmoothly(page, 100);
    console.log('\n[STEP 2] Performing login...');
    await page.waitForSelector('input[type="email"], input[placeholder*="email" i]', { timeout: 5000 }).catch(() => {});
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i]');
    if (emailInput) {
      await emailInput.click();
      await humanDelay();
      await page.keyboard.type('john@example.com', { delay: 150 });
      await humanDelay();
    }
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await humanDelay();
      await page.keyboard.type('password123', { delay: 150 });
      await humanDelay();
    }
    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
      await loginBtn.click();
      console.log('  -> Clicked login button');
      await sleep(3000);
    }
    await waitForPageLoad(page);
    console.log('\n[STEP 3] Dashboard walkthrough...');
    await waitForPageLoad(page);
    console.log('  -> Scrolling dashboard...');
    for (let i = 0; i < 3; i++) {
      await scrollSmoothly(page, 400);
      console.log('  -> Scrolled ' + ((i + 1) * 400) + 'px');
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    console.log('\n[STEP 4] Navigating through main pages...');
    const navItems = [
      { name: 'Dashboard', selector: 'a[href*="dashboard"]' },
      { name: 'Projects', selector: 'a[href*="projects"]' },
      { name: 'Settings', selector: 'a[href*="settings"]' },
    ];
    for (const nav of navItems) {
      console.log('\n  -> Exploring ' + nav.name + '...');
      try {
        const element = await page.$(nav.selector);
        if (element) {
          await element.scrollIntoView();
          await element.click();
          console.log('  -> Clicked ' + nav.name);
          await waitForPageLoad(page);
          for (let i = 0; i < 2; i++) {
            await scrollSmoothly(page, 300);
          }
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(500);
        } else {
          await tryClickByText(page, nav.name);
          console.log('  -> Clicked ' + nav.name + ' by text');
          await waitForPageLoad(page);
          await sleep(1000);
        }
      } catch (err) {
        console.log('  -> Could not navigate to ' + nav.name + ': ' + err.message);
      }
    }
    console.log('\n[STEP 5] Testing feature interactions...');
    console.log('  -> Looking for Create/Add buttons...');
    const addButtons = ['button:has-text("Add")', 'button:has-text("Create")', 'button:has-text("New")'];
    for (const btnSelector of addButtons) {
      try {
        const btn = await page.$(btnSelector);
        if (btn) {
          await btn.scrollIntoView();
          await btn.click();
          console.log('  -> Clicked ' + btnSelector);
          await sleep(2000);
          await page.keyboard.press('Escape');
          await sleep(500);
          break;
        }
      } catch {}
    }
    console.log('\n[STEP 6] UI showcase - scrolling showcase...');
    for (let i = 0; i < 5; i++) {
      await scrollSmoothly(page, 200);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    console.log('\n[STEP 7] Final navigation check...');
    const dashLink = await page.$('a[href*="dashboard"]');
    if (dashLink) {
      await dashLink.click();
      await sleep(2000);
    }
    console.log('\n=================================');
    console.log('Recording complete!');
    console.log('Output saved to: ' + CONFIG.outputFile);
    console.log('=================================\n');
  } catch (error) {
    console.error('Error during recording:', error);
  } finally {
    await sleep(1000);
    await recorder.stop();
    await browser.close();
    console.log('Browser closed. Demo recording finished!');
    console.log('\nYour demo video is saved as: ' + CONFIG.outputFile);
  }
}
main().catch(console.error);