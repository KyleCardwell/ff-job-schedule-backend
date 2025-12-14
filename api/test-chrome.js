import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
  try {
    const executablePath = await chromium.executablePath;
    
    return res.json({
      success: true,
      executablePathType: typeof executablePath,
      executablePath: executablePath,
      executablePathString: String(executablePath),
      isString: typeof executablePath === 'string',
      chromiumArgs: chromium.args,
      chromiumHeadless: chromium.headless,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
