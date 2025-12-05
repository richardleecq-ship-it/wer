/**
 * Coze Plugin HTTP Server
 * Simple Express server for deploying as a Coze plugin
 */

import express, { Request, Response } from 'express';
import { handleCozeRequest } from './coze-api';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS support for Coze
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'web-link-extractor' });
});

// Main extraction endpoint
app.post('/extract', async (req: Request, res: Response) => {
  try {
    console.log('Received extraction request:', req.body);
    const result = await handleCozeRequest(req.body);
    console.log('Extraction result:', { 
      success: result.success, 
      linkCount: result.data?.length || 0,
      error: result.error 
    });
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET endpoint for simple URL parameter
app.get('/extract', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: url'
      });
    }

    console.log('Received extraction request (GET):', { url });
    const result = await handleCozeRequest({ url });
    console.log('Extraction result:', { 
      success: result.success, 
      linkCount: result.data?.length || 0,
      error: result.error 
    });
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// OpenAPI specification endpoint
app.get('/openapi.json', (req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');
  const openapiPath = path.join(__dirname, '..', 'openapi.json');
  
  try {
    const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
    res.json(openapi);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load OpenAPI specification' });
  }
});

// Root endpoint with API documentation
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Web Link Extractor API',
    version: '1.0.0',
    description: 'Extract links from web pages',
    documentation: '/openapi.json',
    endpoints: {
      'GET /health': 'Health check',
      'GET /openapi.json': 'OpenAPI specification',
      'POST /extract': 'Extract links from URL (body: { "url": "https://example.com" })',
      'GET /extract?url=': 'Extract links from URL (query parameter)'
    },
    example: {
      request: {
        method: 'POST',
        url: '/extract',
        body: { url: 'https://example.com' }
      },
      response: {
        success: true,
        data: [
          {
            url: 'https://example.com/page',
            description: 'Example page',
            anchorText: 'Click here',
            title: 'Page Title'
          }
        ],
        sourceUrl: 'https://example.com',
        totalLinks: 1
      }
    }
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Coze Link Extractor API running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  });
}

export default app;
