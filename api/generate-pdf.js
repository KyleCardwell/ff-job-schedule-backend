import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generate PDF using Playwright
 * Accepts URL or HTML content to convert to PDF
 *
 * Request body:
 * {
 *   url?: string,           // URL to convert to PDF
 *   html?: string,          // HTML content to convert to PDF
 *   options?: {
 *     format?: string,      // Paper format (Letter, A4, etc.) — ignored when width/height provided
 *     width?: string,       // Custom page width  e.g. "24in"
 *     height?: string,      // Custom page height e.g. "18in"
 *     printBackground?: boolean,
 *     landscape?: boolean,
 *     margin?: { top, right, bottom, left },
 *     scale?: number,
 *     viewportWidth?: number,  // Browser viewport width in px (default 1920)
 *     viewportHeight?: number  // Browser viewport height in px (default 1080)
 *   }
 * }
 */
export default async function handler(req, res) {
  // CORS headers - handle multiple allowed origins
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : ["*"];

  const origin = req.headers.origin;

  // Set CORS header based on requesting origin
  if (allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let browser = null;

  try {
    const { url, html, options = {} } = req.body;

    // Validate input
    if (!url && !html) {
      return res.status(400).json({
        error: 'Either "url" or "html" must be provided',
      });
    }

    // Build PDF options — use custom width/height when provided, otherwise fall back to format
    const pdfOptions = {
      printBackground: options.printBackground !== false,
      landscape: options.landscape || false,
      margin: options.margin || {
        top: "0.25in",
        right: "0.25in",
        bottom: "0.25in",
        left: "0.25in",
      },
      scale: options.scale || 1,
      displayHeaderFooter: false,
      preferCSSPageSize: false,
    };

    if (options.width && options.height) {
      pdfOptions.width = options.width;
      pdfOptions.height = options.height;
    } else {
      pdfOptions.format = options.format || "Letter";
    }

    const viewportWidth = options.viewportWidth || 1920;
    const viewportHeight = options.viewportHeight || 1080;

    console.log("Starting PDF generation...");
    console.log("PDF options:", JSON.stringify(pdfOptions));
    console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);

    // Launch browser (use @sparticuz/chromium for Vercel)
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      // Configure @sparticuz/chromium for serverless environment
      await chromium.font(
        'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
      );
      
      // Use @sparticuz/chromium for serverless environment
      browser = await playwrightChromium.launch({
        args: [...chromium.args, '--disable-dev-shm-usage'],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Use local Chrome for development
      browser = await playwrightChromium.launch({
        headless: true,
      });
    }

    console.log("Browser launched");

    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    // Navigate to URL or set HTML content
    if (url) {
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
    } else if (html) {
      console.log("Setting HTML content, length:", html.length);
      await page.setContent(html, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait briefly for any inline resources to settle
      await page.waitForTimeout(500);
    }

    // Check if body has content
    const bodyContent = await page
      .evaluate(() => document.body.innerHTML)
      .catch(() => "");
    console.log("Body content length:", bodyContent.length);
    if (bodyContent.length < 100) {
      console.warn("Warning: Body content seems very short");
    }

    // Generate PDF
    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf(pdfOptions);

    // Close browser
    await browser.close();
    browser = null;

    console.log("PDF generated successfully, size:", pdfBuffer.length);

    // Return PDF as base64
    const base64Pdf = pdfBuffer.toString("base64");

    return res.status(200).json({
      success: true,
      pdf: base64Pdf,
      contentType: "application/pdf",
      size: pdfBuffer.length,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }

    return res.status(500).json({
      error: "Failed to generate PDF",
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
}
