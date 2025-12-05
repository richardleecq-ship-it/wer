"use strict";
/**
 * LinkExtractorService - Main service for extracting links from web pages
 * Integrates PageLoader, LinkParser, DescriptionGenerator, LinkFilter, and MetadataCollector
 *
 * Requirements: 1.1, 1.4, 1.5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkExtractorService = void 0;
const types_1 = require("../types");
const PageLoader_1 = require("../core/PageLoader");
const LinkParser_1 = require("../core/LinkParser");
const DescriptionGenerator_1 = require("../core/DescriptionGenerator");
const LinkFilter_1 = require("../core/LinkFilter");
const MetadataCollector_1 = require("../core/MetadataCollector");
const ErrorHandler_1 = require("../core/ErrorHandler");
class LinkExtractorService {
    constructor(errorHandler) {
        this.errorHandler = errorHandler || new ErrorHandler_1.ErrorHandler();
        this.pageLoader = new PageLoader_1.PageLoader(this.errorHandler);
        this.linkParser = new LinkParser_1.LinkParser();
        this.descriptionGenerator = new DescriptionGenerator_1.DescriptionGenerator();
        this.linkFilter = new LinkFilter_1.LinkFilter();
        this.metadataCollector = new MetadataCollector_1.MetadataCollector();
    }
    /**
     * Set error handler and propagate to components
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
        this.pageLoader.setErrorHandler(errorHandler);
    }
    /**
     * Get the error handler
     */
    getErrorHandler() {
        return this.errorHandler;
    }
    /**
     * Extract links from a URL with the given options
     * This is the main entry point for link extraction
     */
    async extract(url, options = {}) {
        const timestamp = new Date();
        const errors = [];
        let links = [];
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
                    : new Map();
                // Process raw links into Link objects
                links = this.processRawLinks(rawLinks, url, metadataMap, options.includeMetadata || false);
                // Deduplicate links
                links = this.deduplicateLinks(links);
                // Apply filters if specified
                if (options.filter) {
                    links = this.linkFilter.filter(links, options.filter);
                }
                // Log verbose information
                this.errorHandler.info(`Extracted ${links.length} unique links from ${url}`, { url, linkCount: links.length });
            }
            finally {
                // Always close the page
                await this.pageLoader.closePage(page);
            }
        }
        catch (error) {
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
    async extractWithRetry(url, options = {}, maxRetries = 3) {
        let lastError = null;
        let retryCount = 0;
        while (retryCount <= maxRetries) {
            try {
                return await this.extract(url, options);
            }
            catch (error) {
                lastError = error;
                retryCount++;
                // Only retry on network errors, not on other types
                if (error instanceof types_1.NetworkError && retryCount <= maxRetries) {
                    const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    this.errorHandler.info(`Retry ${retryCount}/${maxRetries} for ${url} after ${backoffMs}ms`, { url, retryCount, maxRetries, backoffMs });
                    await this.sleep(backoffMs);
                }
                else {
                    // Don't retry for other error types or if max retries reached
                    break;
                }
            }
        }
        // If all retries failed, throw the last error with retry count
        const finalError = new types_1.NetworkError(`Failed after ${retryCount} retries: ${lastError?.message}`, url, retryCount, lastError || undefined);
        this.errorHandler.handleError(finalError, { url, retryCount });
        throw finalError;
    }
    /**
     * Process raw links into Link objects
     */
    processRawLinks(rawLinks, baseUrl, metadataMap, includeMetadata) {
        const links = [];
        for (const rawLink of rawLinks) {
            // Skip empty URLs
            if (!rawLink.href || rawLink.href.trim() === '') {
                continue;
            }
            // Generate description
            const description = this.descriptionGenerator.generate(rawLink);
            // Extract attributes
            const attributes = this.linkParser.extractAttributes(rawLink);
            // Identify protocol
            const protocol = this.linkParser.identifyProtocol(rawLink.href);
            // Determine if internal/external
            const isInternal = this.linkFilter.isInternalLink(rawLink.href, baseUrl);
            const isExternal = !isInternal && (protocol === 'http' || protocol === 'https');
            // Get metadata
            const metadata = includeMetadata && metadataMap.has(rawLink.href)
                ? metadataMap.get(rawLink.href)
                : {
                    occurrences: 1,
                    hasNoFollow: false,
                    parentContext: rawLink.parentTag || 'unknown',
                    position: 0,
                };
            // Create Link object
            const link = {
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
    deduplicateLinks(links) {
        const seen = new Set();
        const unique = [];
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
    generateStatistics(links) {
        const totalLinks = links.length;
        const uniqueLinks = links.length; // Already deduplicated
        let internalLinks = 0;
        let externalLinks = 0;
        const protocolBreakdown = {};
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Close the service and cleanup resources
     */
    async close() {
        await this.pageLoader.close();
    }
}
exports.LinkExtractorService = LinkExtractorService;
//# sourceMappingURL=LinkExtractorService.js.map