# FF Job Schedule Backend

Backend API for FF Job Schedule application with Playwright-powered PDF generation and Supabase integration.

## Features

- 🎭 **Playwright PDF Generation**: High-quality PDF generation using headless Chromium
- ☁️ **Vercel Serverless**: Optimized for Vercel deployment with serverless functions
- 🔐 **Supabase Integration**: Ready for database and authentication operations
- 🚀 **Express API**: RESTful API endpoints with CORS support
- 🔒 **Environment Variables**: Secure configuration management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **PDF Generation**: Playwright Core + chrome-aws-lambda
- **Database**: Supabase
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Vercel account (for deployment)
- Supabase project (for database operations)

### Installation

1. **Clone the repository**
   ```bash
   cd ff-job-schedule-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**
   ```env
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

### Development

Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001/api`

### Testing the API

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Generate PDF from URL:**
```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "format": "Letter",
      "printBackground": true
    }
  }'
```

**Generate PDF from HTML:**
```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello World</h1></body></html>",
    "options": {
      "format": "A4",
      "landscape": false
    }
  }'
```

## API Endpoints

### `GET /api`
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "FF Job Schedule Backend API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "generatePdf": "/api/generate-pdf"
  }
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### `POST /api/generate-pdf`
Generate PDF from URL or HTML content using Playwright.

**Request Body:**
```json
{
  "url": "https://example.com",  // Optional: URL to convert
  "html": "<html>...</html>",    // Optional: HTML to convert
  "options": {                    // Optional: PDF options
    "format": "Letter",           // Paper format
    "printBackground": true,      // Include background graphics
    "landscape": false,           // Orientation
    "margin": {                   // Page margins
      "top": "0.5in",
      "right": "0.5in",
      "bottom": "0.5in",
      "left": "0.5in"
    },
    "scale": 1,                   // Scale factor
    "displayHeaderFooter": false, // Show header/footer
    "headerTemplate": "",         // Header HTML
    "footerTemplate": ""          // Footer HTML
  }
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "base64_encoded_pdf_data",
  "contentType": "application/pdf",
  "size": 12345
}
```

**Note:** Either `url` or `html` must be provided, but not both.

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ff-job-schedule-backend)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**
   - Go to your project settings in Vercel
   - Add all environment variables from `.env.example`
   - Redeploy after adding variables

### Environment Variables for Production

Set these in your Vercel project settings:

- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain.com`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_SERVICE_KEY=your_supabase_service_key`

## Project Structure

```
ff-job-schedule-backend/
├── api/
│   ├── index.js           # Main Express app & API routes
│   └── generate-pdf.js    # Playwright PDF generation endpoint
├── utils/
│   └── supabase.js        # Supabase client & auth utilities
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies & scripts
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## Frontend Integration

### Example: Calling the PDF API from your frontend

```javascript
async function generatePdfWithPlaywright(url) {
  try {
    const response = await fetch('https://your-backend.vercel.app/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        options: {
          format: 'Letter',
          printBackground: true,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          }
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Convert base64 to blob and download
      const pdfBlob = base64ToBlob(data.pdf, 'application/pdf');
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schedule.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

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
```

## Future Enhancements

- [ ] Add authentication middleware for protected routes
- [ ] Implement PDF caching
- [ ] Add webhook support for async PDF generation
- [ ] Create additional Supabase integration endpoints
- [ ] Add rate limiting
- [ ] Implement PDF watermarking
- [ ] Add support for multiple page formats
- [ ] Create PDF template system

## Troubleshooting

### Playwright Issues in Production

If you encounter Playwright issues on Vercel, ensure:
1. You're using `chrome-aws-lambda` for serverless compatibility
2. Memory allocation in `vercel.json` is set to at least 1024MB
3. Function timeout is appropriate (30s recommended)

### CORS Errors

Make sure `FRONTEND_URL` is set correctly in your environment variables and matches your frontend domain.

### Supabase Connection Issues

Verify that:
1. `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly
2. Your Supabase project is active
3. Row Level Security (RLS) policies are configured appropriately

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues or questions, please open an issue in the repository.