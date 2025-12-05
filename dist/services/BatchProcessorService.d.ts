/**
 * BatchProcessorService - Service for batch processing multiple URLs
 * Handles concurrent processing, error isolation, and summary reporting
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
import { BatchOptions, BatchResult } from '../types';
export declare class BatchProcessorService {
    private linkExtractor;
    constructor();
    /**
     * Process a batch of URLs from a file
     * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
     */
    processBatch(urlsOrFile: string[] | string, options?: BatchOptions): Promise<BatchResult>;
    /**
     * Read URLs from a file
     * Each line in the file should contain one URL
     * Empty lines and lines starting with # are ignored
     * Requirement: 8.1
     */
    private readUrlsFromFile;
    /**
     * Process URLs with concurrency control
     * Ensures no more than N requests are running simultaneously
     * Requirements: 8.2, 8.3, 8.5
     */
    private processWithConcurrency;
    /**
     * Process a single URL with error isolation
     * Errors are captured in the result, not thrown
     * Requirement: 8.3
     */
    private processUrl;
    /**
     * Generate summary report for batch processing
     * Requirement: 8.4
     */
    private generateSummary;
    /**
     * Close the service and cleanup resources
     */
    close(): Promise<void>;
}
//# sourceMappingURL=BatchProcessorService.d.ts.map