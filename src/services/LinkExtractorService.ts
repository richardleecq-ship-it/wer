/**
 * LinkExtractorService - Main service for extracting links from web pages
 * Integrates PageLoader, LinkParser, DescriptionGenerator, LinkFilter, and MetadataCollector
 * 
 * Requirements: 1.1, 1.4, 1.5
 */

import {
  ExtractionResult,
  ExtractionOptions,
  Link,
  RawLink,
  Statistics,
  LinkAttributes,
  LinkMetadata,
  NetworkError,
} from '../types';
import { PageLoader } from '../core/PageLoader';
import { LinkParser } from '../core/LinkParser';
import { DescriptionGenerator } from '../core/DescriptionGenerator';
import { LinkFilter } from '../core/LinkFilter';
import { MetadataCollector } from '../core/MetadataCollector';
import { ErrorHandler } from '../core/ErrorHandler';

export class LinkExtractorService {
  private pageLoader: PageLoader;
  private linkParser: LinkParser;
  private descriptionGenerator: DescriptionGenerator;
  private linkFilter: LinkFilter;
  private metadataCollector: MetadataCollector;
  private errorHandler: ErrorHandler;

  constructor(errorHandler?: ErrorHandler) {
    this.errorHandler = errorHandler || new ErrorHandler();
    this.pageLoader = new PageLoader(this.errorHandler);
    this.linkParser = new LinkParser();
    this.descriptionGenerator = new DescriptionGenerator();
    this.linkFilter = new LinkFilter();
    this.metadataCollector = new MetadataCollector();
  }

  /**
   * Set error handler and propagate to components
   */
  setErrorHandler(errorHandler: ErrorHandler): void {
    this.errorHandler = errorHandler;
    this.pageLoader.setErrorHandler(errorHandler);
  }

  /**
   * Get the error handler
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Extract links from a URL with the given options
   * This is the main entry point for link extraction
   */
  async extract(url: string, options: ExtractionOptions = {}): Promise<ExtractionResult> {
    const timestamp = new Date();
    const errors: Error[] = [];
    let links: Link[] = [];

    // Set verbose mode on error handler
    if (options.verbose !== undefined) {
      this.errorHandler.setVerbose(options.verbose);
    }

    this.errorHandler.info(`Starting link extraction for ${url}`, { url });

    try {
      // Load the page
      const page = await this.pageLoader.load(url, {
        timeout: options.timeout,
        headers: options.headers,
        cookies: options.cookies,
        userAgent: options.userAgent,
        proxy: options.proxy,
        waitForSelector: options.waitForSelector,
      });

      try {
        // Parse links from the page
        const rawLinks = await this.linkParser.parseLinks(page, url);

        // Collect metadata if requested
        const metadataMap = options.includeMetadata
          ? this.metadataCollector.collectMetadata(rawLinks)
          : new Map<string, LinkMetadata>();

        // Process raw links into Link objects
        links = this.processRawLinks(rawLinks, url, metadataMap, options.includeMetadata || false);

        // Deduplicate links
        links = this.deduplicateLinks(links);

        // Apply filters if specified
        if (options.filter) {
          links = this.linkFilter.filter(links, options.filter);
        }

        // Log verbose information
        this.errorHandler.info(
          `Extracted ${links.length} unique links from ${url}`,
          { url, linkCount: links.length }
        );
      } finally {
        // Always close the page
        await this.pageLoader.closePage(page);
      }
    } catch (error: any) {
      // Collect errors but still return a result
      errors.push(error);
      this.errorHandler.handleError(error, { url });
    }

    // Generate statistics
    const statistics = this.generateStatistics(links);

    return {
      sourceUrl: url,
      timestamp,
      links,
      statistics,
      errors,
    };
  }

  /**
   * Extract links with retry mechanism
   * Retries on network errors with exponential backoff
   */
  async extractWithRetry(
    url: string,
    options: ExtractionOptions = {},
    maxRetries: number = 3
  ): Promise<ExtractionResult> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        return await this.extract(url, options);
      } catch (error: any) {
        lastError = error;
        retryCount++;

        // Only retry on network errors, not on other types
        if (error instanceof NetworkError && retryCount <= maxRetries) {
          const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
          
          this.errorHandler.info(
            `Retry ${retryCount}/${maxRetries} for ${url} after ${backoffMs}ms`,
            { url, retryCount, maxRetries, backoffMs }
          );

          await this.sleep(backoffMs);
        } else {
          // Don't retry for other error types or if max retries reached
          break;
        }
      }
    }

    // If all retries failed, throw the last error with retry count
    const finalError = new NetworkError(
      `Failed after ${retryCount} retries: ${lastError?.message}`,
      url,
      retryCount,
      lastError || undefined
    );
    this.errorHandler.handleError(finalError, { url, retryCount });
    throw finalError;
  }

  /**
   * Process raw links into Link objects
   */
  private processRawLinks(
    rawLinks: RawLink[],
    baseUrl: string,
    metadataMap: Map<string, LinkMetadata>,
    includeMetadata: boolean
  ): Link[] {
    const links: Link[] = [];

    for (const rawLink of rawLinks) {
      // Skip empty URLs
      if (!rawLink.href || rawLink.href.trim() === '') {
        continue;
      }

      // Generate description
      const description = this.descriptionGenerator.generate(rawLink);

      // Extract attributes
      const attributes: LinkAttributes = this.linkParser.extractAttributes(rawLink);

      // Identify protocol
      const protocol = this.linkParser.identifyProtocol(rawLink.href);

      // Determine if internal/external
      const isInternal = this.linkFilter.isInternalLink(rawLink.href, baseUrl);
      const isExternal = !isInternal && (protocol === 'http' || protocol === 'https');

      // Get metadata
      const metadata: LinkMetadata = includeMetadata && metadataMap.has(rawLink.href)
        ? metadataMap.get(rawLink.href)!
        : {
            occurrences: 1,
            hasNoFollow: false,
            parentContext: rawLink.parentTag || 'unknown',
            position: 0,
          };

      // Create Link object
      const link: Link = {
        url: rawLink.href,
        description,
        anchorText: rawLink.anchorText,
        title: rawLink.title,
        protocol,
        isInternal,
        isExternal,
        attributes,
        metadata,
      };

      links.push(link);
    }

    return links;
  }

  /**
   * Deduplicate links by URL
   * Keeps the first occurrence of each unique URL
   */
  private deduplicateLinks(links: Link[]): Link[] {
    const seen = new Set<string>();
    const unique: Link[] = [];

    for (const link of links) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        unique.push(link);
      }
    }

    return unique;
  }

  /**
   * Generate statistics about the extracted links
   */
  private generateStatistics(links: Link[]): Statistics {
    const totalLinks = links.length;
    const uniqueLinks = links.length; // Already deduplicated
    
    let internalLinks = 0;
    let externalLinks = 0;
    const protocolBreakdown: Record<string, number> = {};

    for (const link of links) {
      // Count internal/external
      if (link.isInternal) {
        internalLinks++;
      }
      if (link.isExternal) {
        externalLinks++;
      }

      // Count protocols
      const protocol = link.protocol;
      protocolBreakdown[protocol] = (protocolBreakdown[protocol] || 0) + 1;
    }

    return {
      totalLinks,
      uniqueLinks,
      internalLinks,
      externalLinks,
      protocolBreakdown,
    };
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close the service and cleanup resources
   */
  async close(): Promise<void> {
    await this.pageLoader.close();
  }
}
