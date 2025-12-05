/**
 * Coze Plugin API Entry Point
 * Provides a simple HTTP interface for link extraction
 */
/**
 * Simplified output format for Coze plugin
 */
export interface CozeLink {
    url: string;
    description: string;
    anchorText: string;
    title?: string;
}
/**
 * API response format
 */
export interface CozeApiResponse {
    success: boolean;
    data?: CozeLink[];
    error?: string;
    sourceUrl?: string;
    totalLinks?: number;
}
/**
 * Extract links from a URL and return simplified format
 */
export declare function extractLinks(url: string): Promise<CozeApiResponse>;
/**
 * HTTP handler for Coze plugin
 * Expects POST request with JSON body: { "url": "https://example.com" }
 */
export declare function handleCozeRequest(requestBody: any): Promise<CozeApiResponse>;
//# sourceMappingURL=coze-api.d.ts.map