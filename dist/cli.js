#!/usr/bin/env node
"use strict";
/**
 * CLI entry point for the web link extractor
 * Implements command-line interface with Commander.js
 * Supports single URL extraction and batch processing
 *
 * Requirements: All requirements
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
const commander_1 = require("commander");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const types_1 = require("./types");
const LinkExtractorService_1 = require("./services/LinkExtractorService");
const BatchProcessorService_1 = require("./services/BatchProcessorService");
const formatters_1 = require("./formatters");
const program = new commander_1.Command();
program
    .name('link-extractor')
    .description('Extract links from web pages with readable descriptions')
    .version('1.0.0');
program
    .argument('[url]', 'URL to extract links from')
    .option('-b, --batch <file>', 'Process URLs from a file')
    .option('-f, --format <format>', 'Output format (json, csv, markdown, text)', 'text')
    .option('-o, --output <file>', 'Output file path')
    .option('--internal-only', 'Only extract internal links')
    .option('--external-only', 'Only extract external links')
    .option('--domains <domains>', 'Filter by domains (comma-separated)')
    .option('--exclude-domains <domains>', 'Exclude domains (comma-separated)')
    .option('--url-pattern <pattern>', 'Filter by URL pattern (regex)')
    .option('--protocols <protocols>', 'Filter by protocols (comma-separated)')
    .option('--timeout <ms>', 'Page load timeout in milliseconds', '30000')
    .option('--wait-for <selector>', 'Wait for a specific CSS selector')
    .option('--user-agent <ua>', 'Custom User-Agent string')
    .option('--proxy <url>', 'Proxy server URL')
    .option('--include-metadata', 'Include detailed metadata')
    .option('--verbose', 'Verbose logging')
    .option('--concurrency <n>', 'Number of concurrent requests for batch processing', '3')
    .option('--config <file>', 'Path to configuration file (.linkextractorrc.json)')
    .action(async (url, options) => {
    try {
        await runCLI(url, options);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
/**
 * Main CLI execution function
 */
async function runCLI(url, rawOptions) {
    // Load configuration file if specified or if default exists
    const configOptions = await loadConfig(rawOptions.config);
    // Merge options: CLI options override config file options
    const mergedOptions = { ...configOptions, ...rawOptions };
    // Parse CLI options
    const cliOptions = parseCLIOptions(url, mergedOptions);
    // Validate options
    validateOptions(cliOptions);
    // Execute based on mode (single URL or batch)
    if (cliOptions.batch) {
        await executeBatchMode(cliOptions);
    }
    else if (cliOptions.url) {
        await executeSingleMode(cliOptions);
    }
    else {
        throw new types_1.ValidationError('Either a URL or --batch option must be provided', 'url', 'URL or batch file required');
    }
}
/**
 * Load configuration from file
 */
async function loadConfig(configPath) {
    // Try specified config path first
    if (configPath) {
        try {
            const content = await fs.readFile(configPath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            throw new types_1.ValidationError(`Failed to load config file: ${error.message}`, 'config', 'Config file must exist and be valid JSON');
        }
    }
    // Try default config file in current directory
    const defaultConfigPath = path.join(process.cwd(), '.linkextractorrc.json');
    try {
        const content = await fs.readFile(defaultConfigPath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        // No default config file, return empty options
        return {};
    }
}
/**
 * Parse CLI options into structured format
 */
function parseCLIOptions(url, rawOptions) {
    const cliOptions = {
        url,
        batch: rawOptions.batch,
        format: rawOptions.format,
        output: rawOptions.output,
        internalOnly: rawOptions.internalOnly,
        externalOnly: rawOptions.externalOnly,
        timeout: parseInt(rawOptions.timeout, 10),
        waitForSelector: rawOptions.waitFor,
        userAgent: rawOptions.userAgent,
        proxy: rawOptions.proxy,
        includeMetadata: rawOptions.includeMetadata,
        verbose: rawOptions.verbose,
        concurrency: parseInt(rawOptions.concurrency, 10),
    };
    // Parse comma-separated lists
    if (rawOptions.domains) {
        cliOptions.domains = rawOptions.domains.split(',').map((d) => d.trim());
    }
    if (rawOptions.excludeDomains) {
        cliOptions.excludeDomains = rawOptions.excludeDomains.split(',').map((d) => d.trim());
    }
    if (rawOptions.protocols) {
        cliOptions.protocols = rawOptions.protocols.split(',').map((p) => p.trim());
    }
    if (rawOptions.urlPattern) {
        cliOptions.urlPattern = rawOptions.urlPattern;
    }
    return cliOptions;
}
/**
 * Validate CLI options
 */
function validateOptions(options) {
    // Validate format
    const validFormats = ['json', 'csv', 'markdown', 'text'];
    if (options.format && !validFormats.includes(options.format)) {
        throw new types_1.ValidationError(`Invalid format: ${options.format}. Must be one of: ${validFormats.join(', ')}`, 'format', 'Must be json, csv, markdown, or text');
    }
    // Validate timeout
    if (options.timeout && (isNaN(options.timeout) || options.timeout <= 0)) {
        throw new types_1.ValidationError('Timeout must be a positive number', 'timeout', 'Must be > 0');
    }
    // Validate concurrency
    if (options.concurrency && (isNaN(options.concurrency) || options.concurrency <= 0)) {
        throw new types_1.ValidationError('Concurrency must be a positive number', 'concurrency', 'Must be > 0');
    }
    // Validate mutually exclusive options
    if (options.internalOnly && options.externalOnly) {
        throw new types_1.ValidationError('Cannot use both --internal-only and --external-only', 'filter', 'Options are mutually exclusive');
    }
}
/**
 * Execute single URL extraction mode
 */
async function executeSingleMode(options) {
    const extractor = new LinkExtractorService_1.LinkExtractorService();
    try {
        // Show progress indicator
        if (options.verbose) {
            console.log(`Extracting links from: ${options.url}`);
        }
        else {
            process.stdout.write('Extracting links... ');
        }
        // Build extraction options
        const extractionOptions = buildExtractionOptions(options);
        // Extract links
        const result = await extractor.extract(options.url, extractionOptions);
        if (!options.verbose) {
            process.stdout.write('Done!\n');
        }
        // Display or save results
        await displayResults(result, options);
        // Show summary
        displaySummary(result, options);
    }
    finally {
        await extractor.close();
    }
}
/**
 * Execute batch processing mode
 */
async function executeBatchMode(options) {
    const batchProcessor = new BatchProcessorService_1.BatchProcessorService();
    try {
        // Show progress indicator
        console.log(`Processing URLs from: ${options.batch}`);
        // Build extraction options
        const extractionOptions = buildExtractionOptions(options);
        // Add concurrency to batch options
        const batchOptions = {
            ...extractionOptions,
            concurrency: options.concurrency,
        };
        // Process batch with progress indicator
        const startTime = Date.now();
        const result = await batchProcessor.processBatch(options.batch, batchOptions);
        const duration = Date.now() - startTime;
        console.log(`\nBatch processing completed in ${(duration / 1000).toFixed(2)}s`);
        // Display or save results
        await displayBatchResults(result, options);
        // Show summary
        displayBatchSummary(result, options);
    }
    finally {
        await batchProcessor.close();
    }
}
/**
 * Build extraction options from CLI options
 */
function buildExtractionOptions(options) {
    const extractionOptions = {
        timeout: options.timeout,
        waitForSelector: options.waitForSelector,
        userAgent: options.userAgent,
        proxy: options.proxy,
        includeMetadata: options.includeMetadata,
        verbose: options.verbose,
    };
    // Build filter criteria
    const filter = {};
    if (options.domains) {
        filter.domains = options.domains;
    }
    if (options.excludeDomains) {
        filter.excludeDomains = options.excludeDomains;
    }
    if (options.internalOnly) {
        filter.internalOnly = true;
    }
    if (options.externalOnly) {
        filter.externalOnly = true;
    }
    if (options.urlPattern) {
        filter.urlPattern = options.urlPattern;
    }
    if (options.protocols) {
        filter.protocols = options.protocols;
    }
    // Only add filter if it has properties
    if (Object.keys(filter).length > 0) {
        extractionOptions.filter = filter;
    }
    return extractionOptions;
}
/**
 * Display or save extraction results
 */
async function displayResults(result, options) {
    // Format the result
    const formatter = (0, formatters_1.getFormatter)(options.format);
    const formatted = formatter.format(result);
    // Save to file or display to console
    if (options.output) {
        await fs.writeFile(options.output, formatted, 'utf-8');
        console.log(`Results saved to: ${options.output}`);
    }
    else {
        console.log('\n' + formatted);
    }
}
/**
 * Display or save batch results
 */
async function displayBatchResults(result, options) {
    // For batch results, we format each result separately or create a combined output
    const formatter = (0, formatters_1.getFormatter)(options.format);
    if (options.format === 'json') {
        // For JSON, output the entire batch result as one object
        const formatted = JSON.stringify(result, null, 2);
        if (options.output) {
            await fs.writeFile(options.output, formatted, 'utf-8');
            console.log(`Results saved to: ${options.output}`);
        }
        else {
            console.log('\n' + formatted);
        }
    }
    else {
        // For other formats, concatenate individual results
        let combined = '';
        for (let i = 0; i < result.results.length; i++) {
            const singleResult = result.results[i];
            combined += `\n${'='.repeat(80)}\n`;
            combined += `URL ${i + 1}/${result.results.length}: ${singleResult.sourceUrl}\n`;
            combined += `${'='.repeat(80)}\n`;
            combined += formatter.format(singleResult);
            combined += '\n';
        }
        if (options.output) {
            await fs.writeFile(options.output, combined, 'utf-8');
            console.log(`Results saved to: ${options.output}`);
        }
        else {
            console.log(combined);
        }
    }
}
/**
 * Display summary for single URL extraction
 */
function displaySummary(result, options) {
    if (options.verbose || !options.output) {
        console.log('\n' + '─'.repeat(80));
        console.log('Summary:');
        console.log(`  Total links: ${result.statistics.totalLinks}`);
        console.log(`  Unique links: ${result.statistics.uniqueLinks}`);
        console.log(`  Internal links: ${result.statistics.internalLinks}`);
        console.log(`  External links: ${result.statistics.externalLinks}`);
        if (Object.keys(result.statistics.protocolBreakdown).length > 0) {
            console.log('  Protocol breakdown:');
            for (const [protocol, count] of Object.entries(result.statistics.protocolBreakdown)) {
                console.log(`    ${protocol}: ${count}`);
            }
        }
        if (result.errors.length > 0) {
            console.log(`  Errors: ${result.errors.length}`);
            for (const error of result.errors) {
                console.log(`    - ${error.message}`);
            }
        }
        console.log('─'.repeat(80));
    }
}
/**
 * Display summary for batch processing
 */
function displayBatchSummary(result, options) {
    console.log('\n' + '═'.repeat(80));
    console.log('Batch Summary:');
    console.log(`  Total URLs: ${result.summary.totalUrls}`);
    console.log(`  Successful: ${result.summary.successfulUrls}`);
    console.log(`  Failed: ${result.summary.failedUrls}`);
    console.log(`  Total links extracted: ${result.summary.totalLinks}`);
    if (result.summary.errors.length > 0) {
        console.log('\nErrors:');
        for (const { url, error } of result.summary.errors) {
            console.log(`  ${url}: ${error.message}`);
        }
    }
    console.log('═'.repeat(80));
}
// Parse and execute
program.parse();
//# sourceMappingURL=cli.js.map