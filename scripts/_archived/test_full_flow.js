import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Step 1
    await page.goto('http://localhost:5175/order');
    await page.waitForSelector('.order-product', { timeout: 5000 });
    await page.evaluate(() => document.querySelectorAll('.order-product')[0].click()); // Light Plan
    await page.evaluate(() => document.querySelectorAll('.order-options-list label')[0].click()); // Option
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 2
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        // Select buttons for select fields
        document.querySelectorAll('.order-style-grid')[0].children[0].click(); // dog
        document.querySelectorAll('.order-style-grid')[1].children[0].click(); // small
        document.querySelectorAll('.order-style-grid')[2].children[0].click(); // smile
        document.querySelectorAll('.order-style-grid')[3].children[0].click(); // sit
        // Text inputs
        const inputs = document.querySelectorAll('input.form-input');
        inputs[0].value = 'TestPet';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].value = 'Brown';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 3
    await page.waitForSelector('.order-style-grid', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        document.querySelectorAll('.order-style-grid')[0].children[0].click(); // realistic
        document.querySelectorAll('.order-style-grid')[1].children[0].click(); // color
        document.querySelectorAll('.order-style-grid')[2].children[0].click(); // standard
    });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 4 (Upload)
    await page.waitForSelector('input[type="file"]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile('/Users/okazakimana/manuhome/src/assets/react.svg');
    await fileInput.uploadFile('/Users/okazakimana/manuhome/src/assets/react.svg');
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.click());
    });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 5 (Usage)
    await page.waitForSelector('.order-style-grid', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        document.querySelectorAll('.order-style-grid')[0].children[0].click(); // personal
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.click());
    });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 6 (Customer)
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input.form-input');
        inputs[0].value = 'Taro Yamada';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].value = 'taro@example.com';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => document.querySelector('.order-nav__next').click());

    // Step 7 (Confirmation)
    await page.waitForSelector('.order-summary', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 1000));
    console.log('REACHED STEP 7 SUCCESSFULLY!');
    await page.screenshot({ path: '/Users/okazakimana/.gemini/antigravity/brain/a54068aa-8788-4a97-b971-a425c1f62f5f/dynamic_order_flow_step7_1.png', fullPage: true });

    await browser.close();
})();
