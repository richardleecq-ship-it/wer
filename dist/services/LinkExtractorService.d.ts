/**
 * LinkExtractorService - Main service for extracting links from web pages
 * Integrates PageLoader, LinkParser, DescriptionGenerator, LinkFilter, and MetadataCollector
 *
 * Requirements: 1.1, 1.4, 1.5
 */
import { ExtractionResult, ExtractionOptions } from '../types';
import { ErrorHandler } from '../core/ErrorHandler';
export declare class LinkExtractorService {
    private pageLoader;
    private linkParser;
    private descriptionGenerator;
    private linkFilter;
    private metadataCollector;
    private errorHandler;
    constructor(errorHandler?: ErrorHandler);
    /**
     * Set error handler and propagate to components
     */
    setErrorHandler(errorHandler: ErrorHandler): void;
    /**
     * Get the error handler
     */
    getErrorHandler(): ErrorHandler;
    /**
     * Extract links from a URL with the given options
     * This is the main entry point for link extraction
     */
    extract(url: string, options?: ExtractionOptions): Promise<ExtractionResult>;
    /**
     * Extract links with retry mechanism
     * Retries on network errors with exponential backoff
     */
    extractWithRetry(url: string, options?: ExtractionOptions, maxRetries?: number): Promise<ExtractionResult>;
    /**
     * Process raw links into Link objects
     */
    private processRawLinks;
    /**
     * Deduplicate links by URL
     * Keeps the first occurrence of each unique URL
     */
    private deduplicateLinks;
    /**
     * Generate statistics about the extracted links
     */
    private generateStatistics;
    /**
     * Sleep for a specified duration
     */
    private sleep;
    /**
     * Close the service and cleanup resources
     */
    close(): Promise<void>;
}
//# sourceMappingURL=LinkExtractorService.d.ts.map