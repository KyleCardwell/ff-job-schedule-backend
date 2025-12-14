import chromium from 'chrome-aws-lambda';
import { chromium as playwrightChromium } from 'playwright-core';
import dotenv from 'dotenv';

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
 *     format?: string,      // Paper format (Letter, A4, etc.)
 *     printBackground?: boolean,
 *     landscape?: boolean,
 *     margin?: { top, right, bottom, left },
 *     scale?: number,
 *     displayHeaderFooter?: boolean,
 *     headerTemplate?: string,
 *     footerTemplate?: string
 *   }
 * }
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser = null;

  try {
    const { url, html, options = {} } = req.body;

    // Validate input
    if (!url && !html) {
      return res.status(400).json({ 
        error: 'Either "url" or "html" must be provided' 
      });
    }

    // Default PDF options
    const pdfOptions = {
      format: options.format || 'Letter',
      printBackground: options.printBackground !== false,
      landscape: options.landscape || false,
      margin: options.margin || {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      scale: options.scale || 1,
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      preferCSSPageSize: true
    };

    console.log('Starting PDF generation...');

    // Launch browser (use chrome-aws-lambda for Vercel)
    const isProduction = process.env.NODE_ENV === 'production';
    
    browser = await playwrightChromium.launch({
      args: isProduction ? chromium.args : [],
      executablePath: isProduction 
        ? await chromium.executablePath 
        : undefined,
      headless: chromium.headless || true
    });

    console.log('Browser launched');

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    // Navigate to URL or set HTML content
    if (url) {
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    } else if (html) {
      console.log('Setting HTML content');
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait for external resources (like Tailwind CSS) to load
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });
    }

    // Wait for content to render (reduced since we're using inline styles now)
    await page.waitForTimeout(1000);
    
    // Check if body has content
    const bodyContent = await page.evaluate(() => document.body.innerHTML).catch(() => '');
    console.log('Body content length:', bodyContent.length);
    if (bodyContent.length < 100) {
      console.warn('Warning: Body content seems very short');
    }

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);

    // Close browser
    await browser.close();
    browser = null;

    console.log('PDF generated successfully');

    // Return PDF as base64
    const base64Pdf = pdfBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      pdf: base64Pdf,
      contentType: 'application/pdf',
      size: pdfBuffer.length
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}
