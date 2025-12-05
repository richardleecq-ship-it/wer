/**
 * Core data models for the web link extractor
 */
/**
 * Raw link extracted directly from HTML
 */
export interface RawLink {
    href: string;
    anchorText: string;
    title?: string;
    ariaLabel?: string;
    rel?: string;
    target?: string;
    imageAlt?: string;
    parentTag?: string;
}
/**
 * HTML attributes of a link
 */
export interface LinkAttributes {
    rel?: string;
    target?: string;
    ariaLabel?: string;
    dataAttributes: Record<string, string>;
}
/**
 * Metadata information about a link
 */
export interface LinkMetadata {
    occurrences: number;
    hasNoFollow: boolean;
    parentContext: string;
    position: number;
}
/**
 * Processed link with all information
 */
export interface Link {
    url: string;
    description: string;
    anchorText: string;
    title?: string;
    protocol: string;
    isInternal: boolean;
    isExternal: boolean;
    attributes: LinkAttributes;
    metadata: LinkMetadata;
}
/**
 * Statistics about extracted links
 */
export interface Statistics {
    totalLinks: number;
    uniqueLinks: number;
    internalLinks: number;
    externalLinks: number;
    protocolBreakdown: Record<string, number>;
}
/**
 * Result of link extraction
 */
export interface ExtractionResult {
    sourceUrl: string;
    timestamp: Date;
    links: Link[];
    statistics: Statistics;
    errors: Error[];
}
/**
 * Filter criteria for links
 */
export interface FilterCriteria {
    domains?: string[];
    excludeDomains?: string[];
    internalOnly?: boolean;
    externalOnly?: boolean;
    urlPattern?: string;
    protocols?: string[];
}
/**
 * Options for link extraction
 */
export interface ExtractionOptions {
    timeout?: number;
    waitForSelector?: string;
    headers?: Record<string, string>;
    cookies?: Cookie[];
    userAgent?: string;
    proxy?: string;
    filter?: FilterCriteria;
    includeMetadata?: boolean;
    verbose?: boolean;
}
/**
 * Cookie structure
 */
export interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}
/**
 * Page load configuration
 */
export interface LoadConfig {
    timeout?: number;
    headers?: Record<string, string>;
    cookies?: Cookie[];
    userAgent?: string;
    proxy?: string;
    waitForSelector?: string;
}
/**
 * Output format types
 */
export type OutputFormat = 'json' | 'csv' | 'markdown' | 'text';
/**
 * CLI options
 */
export interface CLIOptions {
    url?: string;
    batch?: string;
    format?: OutputFormat;
    output?: string;
    internalOnly?: boolean;
    externalOnly?: boolean;
    domains?: string[];
    excludeDomains?: string[];
    urlPattern?: string;
    protocols?: string[];
    timeout?: number;
    waitForSelector?: string;
    headers?: Record<string, string>;
    cookies?: Cookie[];
    userAgent?: string;
    proxy?: string;
    includeMetadata?: boolean;
    verbose?: boolean;
    concurrency?: number;
}
/**
 * Batch processing options
 */
export interface BatchOptions extends ExtractionOptions {
    concurrency?: number;
}
/**
 * Result of batch processing
 */
export interface BatchResult {
    results: ExtractionResult[];
    summary: BatchSummary;
}
/**
 * Summary of batch processing
 */
export interface BatchSummary {
    totalUrls: number;
    successfulUrls: number;
    failedUrls: number;
    totalLinks: number;
    errors: Array<{
        url: string;
        error: Error;
    }>;
}
/**
 * Custom error types
 */
export declare class NetworkError extends Error {
    url: string;
    retries: number;
    originalError?: Error | undefined;
    constructor(message: string, url: string, retries: number, originalError?: Error | undefined);
}
export declare class TimeoutError extends Error {
    url: string;
    timeout: number;
    constructor(message: string, url: string, timeout: number);
}
export declare class AuthenticationError extends Error {
    url: string;
    statusCode: number;
    constructor(message: string, url: string, statusCode: number);
}
export declare class ParseError extends Error {
    url: string;
    partialLinks?: Link[] | undefined;
    constructor(message: string, url: string, partialLinks?: Link[] | undefined);
}
export declare class ValidationError extends Error {
    invalidParameter: string;
    validationRule: string;
    constructor(message: string, invalidParameter: string, validationRule: string);
}
//# sourceMappingURL=index.d.ts.map