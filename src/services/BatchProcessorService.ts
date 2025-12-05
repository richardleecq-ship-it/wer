/**
 * BatchProcessorService - Service for batch processing multiple URLs
 * Handles concurrent processing, error isolation, and summary reporting
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  BatchOptions,
  BatchResult,
  BatchSummary,
  ExtractionResult,
  ValidationError,
} from '../types';
import { LinkExtractorService } from './LinkExtractorService';

export class BatchProcessorService {
  private linkExtractor: LinkExtractorService;

  constructor() {
    this.linkExtractor = new LinkExtractorService();
  }

  /**
   * Process a batch of URLs from a file
   * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
   */
  async processBatch(
    urlsOrFile: string[] | string,
    options: BatchOptions = {}
  ): Promise<BatchResult> {
    // Read URLs from file if a string path is provided
    const urls = Array.isArray(urlsOrFile)
      ? urlsOrFile
      : await this.readUrlsFromFile(urlsOrFile);

    // Validate URLs
    if (urls.length === 0) {
      throw new ValidationError(
        'No URLs provided for batch processing',
        'urls',
        'Must provide at least one URL'
      );
    }

    // Process with concurrency control
    const concurrency = options.concurrency || 3;
    const results = await this.processWithConcurrency(urls, options, concurrency);

    // Generate summary
    const summary = this.generateSummary(urls, results);

    return {
      results,
      summary,
    };
  }

  /**
   * Read URLs from a file
   * Each line in the file should contain one URL
   * Empty lines and lines starting with # are ignored
   * Requirement: 8.1
   */
  private async readUrlsFromFile(filePath: string): Promise<string[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      const urls: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and comments
        if (trimmed && !trimmed.startsWith('#')) {
          urls.push(trimmed);
        }
      }

      return urls;
    } catch (error: any) {
      throw new ValidationError(
        `Failed to read URLs from file: ${error.message}`,
        'filePath',
        'File must exist and be readable'
      );
    }
  }

  /**
   * Process URLs with concurrency control
   * Ensures no more than N requests are running simultaneously
   * Requirements: 8.2, 8.3, 8.5
   */
  private async processWithConcurrency(
    urls: string[],
    options: BatchOptions,
    concurrency: number
  ): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];
    const queue = [...urls];
    const inProgress = new Set<Promise<void>>();

    while (queue.length > 0 || inProgress.size > 0) {
      // Start new tasks up to concurrency limit
      while (queue.length > 0 && inProgress.size < concurrency) {
        const url = queue.shift()!;
        
        // Create a task for this URL
        const task = this.processUrl(url, options, results);
        inProgress.add(task);

        // Remove from in-progress when done
        task.finally(() => {
          inProgress.delete(task);
        });
      }

      // Wait for at least one task to complete
      if (inProgress.size > 0) {
        await Promise.race(inProgress);
      }
    }

    return results;
  }

  /**
   * Process a single URL with error isolation
   * Errors are captured in the result, not thrown
   * Requirement: 8.3
   */
  private async processUrl(
    url: string,
    options: BatchOptions,
    results: ExtractionResult[]
  ): Promise<void> {
    try {
      if (options.verbose) {
        console.log(`Processing: ${url}`);
      }

      // Extract links from the URL
      const result = await this.linkExtractor.extract(url, options);
      results.push(result);

      if (options.verbose) {
        console.log(`Completed: ${url} (${result.links.length} links)`);
      }
    } catch (error: any) {
      // Isolate errors - create a failed result instead of throwing
      if (options.verbose) {
        console.error(`Failed: ${url} - ${error.message}`);
      }

      // Create a result with error information
      const failedResult: ExtractionResult = {
        sourceUrl: url,
        timestamp: new Date(),
        links: [],
        statistics: {
          totalLinks: 0,
          uniqueLinks: 0,
          internalLinks: 0,
          externalLinks: 0,
          protocolBreakdown: {},
        },
        errors: [error],
      };

      results.push(failedResult);
    }
  }

  /**
   * Generate summary report for batch processing
   * Requirement: 8.4
   */
  private generateSummary(urls: string[], results: ExtractionResult[]): BatchSummary {
    const totalUrls = urls.length;
    let successfulUrls = 0;
    let failedUrls = 0;
    let totalLinks = 0;
    const errors: Array<{ url: string; error: Error }> = [];

    for (const result of results) {
      if (result.errors.length === 0) {
        successfulUrls++;
        totalLinks += result.links.length;
      } else {
        failedUrls++;
        // Collect all errors for this URL
        for (const error of result.errors) {
          errors.push({ url: result.sourceUrl, error });
        }
      }
    }

    return {
      totalUrls,
      successfulUrls,
      failedUrls,
      totalLinks,
      errors,
    };
  }

  /**
   * Close the service and cleanup resources
   */
  async close(): Promise<void> {
    await this.linkExtractor.close();
  }
}
