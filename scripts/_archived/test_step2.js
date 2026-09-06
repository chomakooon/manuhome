import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

    await page.goto('http://localhost:5175/order');
    await page.waitForSelector('.order-product', { timeout: 5000 });

    // click light plan
    await page.evaluate(() => {
        document.querySelectorAll('.order-product')[0].click();
    });

    // wait and click next
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        document.querySelector('.order-nav__next').click();
    });

    // wait for step 2 rendering
    await new Promise(r => setTimeout(r, 1000));

    const html = await page.evaluate(() => {
        const card = document.querySelector('.order-card');
        return card ? card.innerHTML : 'NO CARD RENDERED';
    });

    console.log('--- HTML OF ORDER CARD ---');
    console.log(html);

    await browser.close();
})();
