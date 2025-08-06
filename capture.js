const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const COMPONENTS = [
  "testimonials-1",
  "testimonials-2",
];

const OUTPUT_FOLDER = "./public/screenshots";

(async () => {
  // Create output folder if it doesn't exist
  if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER);
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  for (const component of COMPONENTS) {
    try {
      const url = `http://localhost:3000/component-library/${component}`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for the component to load
      await page.waitForSelector("#component-container");

      const element = await page.$("#component-container");

      if (element) {
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          await new Promise(r => setTimeout(r, 1200));
          const optimizedScreenshotPath = path.join(OUTPUT_FOLDER, `${component}.png`);

          const screenshotBuffer = await element.screenshot({
            omitBackground: false,
          });


          // Optimize the screenshot size using sharp
          await sharp(screenshotBuffer).resize(450,null, { width: 450, background: "#2C2C2C"})
            .png({ compressionLevel: 9 })
            .toFile(optimizedScreenshotPath);

          console.log(`Screenshot saved: ${optimizedScreenshotPath}`);
        } else {
          console.error(`Bounding box not found for component: ${component}`);
        }
      } else {
        console.error(`Component container not found for ${component}`);
      }
    } catch (error) {
      console.error(`Error capturing screenshot for ${component}:`, error.message);
    }
  }

  await browser.close();
})();