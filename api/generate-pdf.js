import { chromium as playwrightChromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generate PDF using Playwright + Browserbase
 * Connects to a remote Browserbase-hosted Chromium browser via CDP.
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
 *     scale?: number
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

    // Validate Browserbase credentials
    if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
      return res.status(500).json({
        error: "Browserbase credentials not configured. Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID.",
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

    console.log("Starting PDF generation via Browserbase...");
    console.log("PDF options:", JSON.stringify(pdfOptions));

    // Create a Browserbase session and connect via CDP
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY,
    });

    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });

    console.log("Browserbase session created:", session.id);

    browser = await playwrightChromium.connectOverCDP(session.connectUrl);

    console.log("Connected to Browserbase browser");

    // Get the default context and page from the Browserbase session
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0];

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

    // Close browser connection
    await page.close();
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
