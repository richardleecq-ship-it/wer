"use strict";
/**
 * BatchProcessorService - Service for batch processing multiple URLs
 * Handles concurrent processing, error isolation, and summary reporting
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessorService = void 0;
const fs = __importStar(require("fs/promises"));
const types_1 = require("../types");
const LinkExtractorService_1 = require("./LinkExtractorService");
class BatchProcessorService {
    constructor() {
        this.linkExtractor = new LinkExtractorService_1.LinkExtractorService();
    }
    /**
     * Process a batch of URLs from a file
     * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
     */
    async processBatch(urlsOrFile, options = {}) {
        // Read URLs from file if a string path is provided
        const urls = Array.isArray(urlsOrFile)
            ? urlsOrFile
            : await this.readUrlsFromFile(urlsOrFile);
        // Validate URLs
        if (urls.length === 0) {
            throw new types_1.ValidationError('No URLs provided for batch processing', 'urls', 'Must provide at least one URL');
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
    async readUrlsFromFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const urls = [];
            for (const line of lines) {
                const trimmed = line.trim();
                // Skip empty lines and comments
                if (trimmed && !trimmed.startsWith('#')) {
                    urls.push(trimmed);
                }
            }
            return urls;
        }
        catch (error) {
            throw new types_1.ValidationError(`Failed to read URLs from file: ${error.message}`, 'filePath', 'File must exist and be readable');
        }
    }
    /**
     * Process URLs with concurrency control
     * Ensures no more than N requests are running simultaneously
     * Requirements: 8.2, 8.3, 8.5
     */
    async processWithConcurrency(urls, options, concurrency) {
        const results = [];
        const queue = [...urls];
        const inProgress = new Set();
        while (queue.length > 0 || inProgress.size > 0) {
            // Start new tasks up to concurrency limit
            while (queue.length > 0 && inProgress.size < concurrency) {
                const url = queue.shift();
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
    async processUrl(url, options, results) {
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
        }
        catch (error) {
            // Isolate errors - create a failed result instead of throwing
            if (options.verbose) {
                console.error(`Failed: ${url} - ${error.message}`);
            }
            // Create a result with error information
            const failedResult = {
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
    generateSummary(urls, results) {
        const totalUrls = urls.length;
        let successfulUrls = 0;
        let failedUrls = 0;
        let totalLinks = 0;
        const errors = [];
        for (const result of results) {
            if (result.errors.length === 0) {
                successfulUrls++;
                totalLinks += result.links.length;
            }
            else {
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
    async close() {
        await this.linkExtractor.close();
    }
}
exports.BatchProcessorService = BatchProcessorService;
//# sourceMappingURL=BatchProcessorService.js.map