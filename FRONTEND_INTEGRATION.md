# Frontend Integration Guide

This guide helps you integrate the Playwright PDF generation backend with your React frontend.

## Setup

### 1. Environment Variables

Add the backend URL to your frontend `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3001
# For production:
# VITE_BACKEND_URL=https://your-backend.vercel.app
```

### 2. Create a PDF Service

Create a new file `src/services/pdfService.js` in your frontend:

```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Generate PDF using Playwright backend
 * @param {string} url - URL to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Promise<Blob>} PDF as Blob
 */
export async function generatePdfFromUrl(url, options = {}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        options: {
          format: 'Letter',
          printBackground: true,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          },
          ...options
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate PDF');
    }

    const data = await response.json();
    
    if (data.success) {
      return base64ToBlob(data.pdf, 'application/pdf');
    } else {
      throw new Error('PDF generation failed');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate PDF from HTML content
 * @param {string} html - HTML content to convert
 * @param {object} options - PDF generation options
 * @returns {Promise<Blob>} PDF as Blob
 */
export async function generatePdfFromHtml(html, options = {}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        options: {
          format: 'Letter',
          printBackground: true,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          },
          ...options
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate PDF');
    }

    const data = await response.json();
    
    if (data.success) {
      return base64ToBlob(data.pdf, 'application/pdf');
    } else {
      throw new Error('PDF generation failed');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Download PDF blob as file
 * @param {Blob} blob - PDF blob
 * @param {string} filename - Desired filename
 */
export function downloadPdf(blob, filename = 'document.pdf') {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Convert base64 string to Blob
 * @param {string} base64 - Base64 encoded data
 * @param {string} contentType - MIME type
 * @returns {Blob}
 */
function base64ToBlob(base64, contentType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
}

/**
 * Check backend health
 * @returns {Promise<object>} Health status
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return await response.json();
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
}
```

## Usage Examples

### Example 1: Add Playwright PDF Button to Existing Component

```jsx
import React, { useState } from 'react';
import { generatePdfFromUrl, downloadPdf } from '../services/pdfService';

function GeneratePdfButton({ scheduleUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePlaywrightPdf = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate PDF using Playwright
      const pdfBlob = await generatePdfFromUrl(scheduleUrl, {
        format: 'Letter',
        printBackground: true,
        landscape: false
      });

      // Download the PDF
      downloadPdf(pdfBlob, 'schedule-playwright.pdf');
      
      console.log('PDF generated successfully with Playwright!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGeneratePlaywrightPdf}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generating PDF...' : 'Generate PDF (Playwright)'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default GeneratePdfButton;
```

### Example 2: Generate PDF from Current Page

```jsx
import React, { useState } from 'react';
import { generatePdfFromUrl, downloadPdf } from '../services/pdfService';

function ExportCurrentPageButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Get current page URL
      const currentUrl = window.location.href;
      
      // Generate PDF
      const pdfBlob = await generatePdfFromUrl(currentUrl, {
        format: 'Letter',
        printBackground: true
      });
      
      // Download
      downloadPdf(pdfBlob, 'current-page.pdf');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : 'Export as PDF'}
    </button>
  );
}
```

### Example 3: Generate PDF from HTML Content

```jsx
import React, { useState } from 'react';
import { generatePdfFromHtml, downloadPdf } from '../services/pdfService';

function GenerateCustomPdfButton({ scheduleData }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      
      // Create custom HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .schedule { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Job Schedule</h1>
          <div class="schedule">
            ${scheduleData.items.map(item => `
              <div><strong>${item.title}</strong>: ${item.date}</div>
            `).join('')}
          </div>
        </body>
        </html>
      `;
      
      // Generate PDF from HTML
      const pdfBlob = await generatePdfFromHtml(htmlContent, {
        format: 'A4',
        printBackground: true
      });
      
      // Download
      downloadPdf(pdfBlob, 'custom-schedule.pdf');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Custom PDF'}
    </button>
  );
}
```

### Example 4: Dual PDF Generation (Keep Existing + Add Playwright)

```jsx
import React, { useState } from 'react';
import { generatePdfFromUrl, downloadPdf } from '../services/pdfService';
import { generatePdfMake } from '../utils/pdfMakeGenerator'; // Your existing generator

function DualPdfButton({ scheduleData }) {
  const [loading, setLoading] = useState({ pdfmake: false, playwright: false });

  const handlePdfMakeGeneration = async () => {
    try {
      setLoading(prev => ({ ...prev, pdfmake: true }));
      
      // Your existing pdfmake logic
      await generatePdfMake(scheduleData);
      
      console.log('Generated with pdfmake');
    } catch (error) {
      console.error('pdfmake error:', error);
    } finally {
      setLoading(prev => ({ ...prev, pdfmake: false }));
    }
  };

  const handlePlaywrightGeneration = async () => {
    try {
      setLoading(prev => ({ ...prev, playwright: true }));
      
      // Generate with Playwright
      const pdfBlob = await generatePdfFromUrl(window.location.href);
      downloadPdf(pdfBlob, 'schedule-playwright.pdf');
      
      console.log('Generated with Playwright');
    } catch (error) {
      console.error('Playwright error:', error);
    } finally {
      setLoading(prev => ({ ...prev, playwright: false }));
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePdfMakeGeneration}
        disabled={loading.pdfmake}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        {loading.pdfmake ? 'Generating...' : 'PDF (Current)'}
      </button>
      
      <button
        onClick={handlePlaywrightGeneration}
        disabled={loading.playwright}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading.playwright ? 'Generating...' : 'PDF (Playwright)'}
      </button>
    </div>
  );
}
```

## PDF Options Reference

```javascript
const pdfOptions = {
  // Paper format: 'Letter', 'Legal', 'Tabloid', 'Ledger', 'A0'-'A6', etc.
  format: 'Letter',
  
  // Include background colors and images
  printBackground: true,
  
  // Portrait (false) or landscape (true)
  landscape: false,
  
  // Page margins
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in'
  },
  
  // Scale of the webpage rendering (0.1 to 2)
  scale: 1,
  
  // Display header and footer
  displayHeaderFooter: false,
  
  // HTML template for header (requires displayHeaderFooter: true)
  headerTemplate: '<div style="font-size:10px">Header</div>',
  
  // HTML template for footer (requires displayHeaderFooter: true)
  footerTemplate: '<div style="font-size:10px">Page <span class="pageNumber"></span></div>'
};
```

## Testing

### Test Backend Connection

```javascript
import { checkBackendHealth } from '../services/pdfService';

async function testConnection() {
  try {
    const health = await checkBackendHealth();
    console.log('Backend is healthy:', health);
  } catch (error) {
    console.error('Backend is not accessible:', error);
  }
}
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Make sure `FRONTEND_URL` is set in backend `.env`
2. Verify the URL matches exactly (including protocol and port)
3. Check browser console for specific CORS errors

### PDF Generation Timeout

If PDF generation times out:
1. Ensure the page loads quickly
2. Check for infinite loading states
3. Consider increasing timeout in backend `generate-pdf.js`
4. Use simpler HTML for testing

### Backend Not Accessible

1. Verify backend is running: `npm run dev`
2. Check `VITE_BACKEND_URL` in frontend `.env`
3. Test health endpoint: `curl http://localhost:3001/api/health`
4. Ensure no firewall is blocking the port

## Best Practices

1. **Error Handling**: Always wrap PDF generation in try-catch
2. **Loading States**: Show loading indicator during generation
3. **User Feedback**: Inform users when PDF is ready/failed
4. **File Naming**: Use descriptive filenames with timestamps
5. **Testing**: Test with various content sizes and formats
6. **Fallback**: Keep existing PDF generation as backup
7. **Performance**: Consider caching for frequently generated PDFs

## Migration Strategy

### Phase 1: Testing
1. Add Playwright PDF button alongside existing button
2. Test with sample data
3. Compare output quality

### Phase 2: Dual Mode
1. Offer both options to users
2. Collect feedback
3. Monitor performance and errors

### Phase 3: Full Migration (Optional)
1. Make Playwright the default
2. Keep old method as fallback
3. Add feature flag for easy rollback

## Additional Resources

- [Playwright PDF API Docs](https://playwright.dev/docs/api/class-page#page-pdf)
- [Backend API Documentation](./README.md#api-endpoints)
- Vercel Deployment Guide (in README.md)
