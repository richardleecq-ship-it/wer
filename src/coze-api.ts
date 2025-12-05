/**
 * Coze Plugin API Entry Point
 * Provides a simple HTTP interface for link extraction
 */

import { LinkExtractorService } from './services/LinkExtractorService';
import { Link } from './types';

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
export async function extractLinks(url: string): Promise<CozeApiResponse> {
  let extractor: LinkExtractorService | null = null;
  
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
    extractor = new LinkExtractorService();

    // Extract links with timeout
    const result = await extractor.extract(url, { timeout: 30000 });

    console.log('Extraction completed:', {
      sourceUrl: result.sourceUrl,
      linkCount: result.links.length,
      hasErrors: result.errors.length > 0
    });

    // Transform to simplified format
    const links: CozeLink[] = result.links.map((link: Link) => ({
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

  } catch (error) {
    console.error('Error in extractLinks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  } finally {
    // Always close browser to prevent memory leaks
    if (extractor) {
      try {
        await extractor.close();
      } catch (closeError) {
        console.error('Error closing extractor:', closeError);
      }
    }
  }
}

/**
 * HTTP handler for Coze plugin
 * Expects POST request with JSON body: { "url": "https://example.com" }
 */
export async function handleCozeRequest(requestBody: any): Promise<CozeApiResponse> {
  try {
    const { url } = requestBody;
    
    if (!url) {
      return {
        success: false,
        error: 'Missing required parameter: url'
      };
    }

    return await extractLinks(url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}
