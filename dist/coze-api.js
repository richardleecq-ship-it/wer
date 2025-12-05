"use strict";
/**
 * Coze Plugin API Entry Point
 * Provides a simple HTTP interface for link extraction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractLinks = extractLinks;
exports.handleCozeRequest = handleCozeRequest;
const LinkExtractorService_1 = require("./services/LinkExtractorService");
/**
 * Extract links from a URL and return simplified format
 */
async function extractLinks(url) {
    try {
        // Validate URL
        if (!url || typeof url !== 'string') {
            console.error('Invalid URL provided:', url);
            return {
                success: false,
                error: 'Invalid URL: URL must be a non-empty string'
            };
        }
        console.log('Starting link extraction for:', url);
        // Create extractor service
        const extractor = new LinkExtractorService_1.LinkExtractorService();
        // Extract links
        const result = await extractor.extract(url, { timeout: 30000 });
        console.log('Extraction completed:', {
            sourceUrl: result.sourceUrl,
            linkCount: result.links.length,
            hasErrors: result.errors.length > 0
        });
        // Transform to simplified format
        const links = result.links.map((link) => ({
            url: link.url,
            description: link.description || '',
            anchorText: link.anchorText || '',
            title: link.title
        }));
        return {
            success: true,
            data: links,
            sourceUrl: result.sourceUrl,
            totalLinks: links.length
        };
    }
    catch (error) {
        console.error('Error in extractLinks:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}
/**
 * HTTP handler for Coze plugin
 * Expects POST request with JSON body: { "url": "https://example.com" }
 */
async function handleCozeRequest(requestBody) {
    try {
        const { url } = requestBody;
        if (!url) {
            return {
                success: false,
                error: 'Missing required parameter: url'
            };
        }
        return await extractLinks(url);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}
//# sourceMappingURL=coze-api.js.map