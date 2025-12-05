"use strict";
/**
 * Coze Plugin HTTP Server
 * Simple Express server for deploying as a Coze plugin
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coze_api_1 = require("./coze-api");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'web-link-extractor' });
});
// Main extraction endpoint
app.post('/extract', async (req, res) => {
    try {
        console.log('Received extraction request:', req.body);
        const result = await (0, coze_api_1.handleCozeRequest)(req.body);
        console.log('Extraction result:', {
            success: result.success,
            linkCount: result.data?.length || 0,
            error: result.error
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// GET endpoint for simple URL parameter
app.get('/extract', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameter: url'
            });
        }
        console.log('Received extraction request (GET):', { url });
        const result = await (0, coze_api_1.handleCozeRequest)({ url });
        console.log('Extraction result:', {
            success: result.success,
            linkCount: result.data?.length || 0,
            error: result.error
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// OpenAPI specification endpoint
app.get('/openapi.json', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const openapiPath = path.join(__dirname, '..', 'openapi.json');
    try {
        const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
        res.json(openapi);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to load OpenAPI specification' });
    }
});
// Root endpoint with API documentation
app.get('/', (req, res) => {
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
exports.default = app;
//# sourceMappingURL=coze-server.js.map