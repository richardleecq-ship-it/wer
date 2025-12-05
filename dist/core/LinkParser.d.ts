/**
 * LinkParser - Responsible for parsing links from web pages
 */
import { Page } from 'playwright';
import { RawLink, LinkAttributes } from '../types';
export declare class LinkParser {
    /**
     * Parse all links from a page
     */
    parseLinks(page: Page, baseUrl: string): Promise<RawLink[]>;
    /**
     * Normalize a URL (convert relative URLs to absolute)
     */
    normalizeUrl(url: string, baseUrl: string): string;
    /**
     * Extract link attributes from a raw link
     */
    extractAttributes(rawLink: RawLink): LinkAttributes;
    /**
     * Identify the protocol of a URL
     */
    identifyProtocol(url: string): string;
    /**
     * Classify protocol type
     */
    classifyProtocol(protocol: string): 'http' | 'special' | 'unknown';
}
//# sourceMappingURL=LinkParser.d.ts.map