const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const outDir = '/Users/okazakimana/.gemini/antigravity/brain/a54068aa-8788-4a97-b971-a425c1f62f5f';
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        console.log("Navigating to dashboard...");
        await page.goto('http://localhost:5174/dashboard');
        // The dashboard requires login, but wait we are simulating without a backend active yet or we need to bypass auth?
        // Let's see if we hit a redirect.
        await page.waitForTimeout(2000);
        let url = page.url();
        console.log("Current URL:", url);
        
        // Wait! The app uses Supabase Auth. If not logged in, it redirects to /dashboard/login or drops to a loading screen.
        // If it's on /dashboard/login, I should take a screenshot of that, or if there's dummy data, it might bypass.
        await page.screenshot({ path: path.join(outDir, 'dashboard.png') });
        console.log("Dashboard screenshot saved");

        console.log("Navigating to project room...");
        await page.goto('http://localhost:5174/projects/demo-1');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'project_room.png') });
        console.log("Project room screenshot saved");
        
        console.log("Navigating to Order flow...");
        await page.goto('http://localhost:5174/order');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'order_flow.png') });
        console.log("Order flow screenshot saved");

        await browser.close();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
