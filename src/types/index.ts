/**
 * Core data models for the web link extractor
 */

/**
 * Raw link extracted directly from HTML
 */
export interface RawLink {
  href: string;              // Original href attribute
  anchorText: string;        // Anchor text
  title?: string;            // title attribute
  ariaLabel?: string;        // aria-label attribute
  rel?: string;              // rel attribute
  target?: string;           // target attribute
  imageAlt?: string;         // If image link, the alt attribute
  parentTag?: string;        // Parent element tag name
}

/**
 * HTML attributes of a link
 */
export interface LinkAttributes {
  rel?: string;
  target?: string;
  ariaLabel?: string;
  dataAttributes: Record<string, string>; // data-* attributes
}

/**
 * Metadata information about a link
 */
export interface LinkMetadata {
  occurrences: number;       // Number of times link appears on page
  hasNoFollow: boolean;      // Whether link has nofollow
  parentContext: string;     // Parent element context
  position: number;          // Position on page
}

/**
 * Processed link with all information
 */
export interface Link {
  url: string;               // Normalized absolute URL
  description: string;       // Generated readable description
  anchorText: string;        // Original anchor text
  title?: string;            // title attribute
  protocol: string;          // Protocol (http, https, mailto, etc.)
  isInternal: boolean;       // Whether internal link
  isExternal: boolean;       // Whether external link
  attributes: LinkAttributes; // All HTML attributes
  metadata: LinkMetadata;    // Metadata information
}

/**
 * Statistics about extracted links
 */
export interface Statistics {
  totalLinks: number;        // Total number of links
  uniqueLinks: number;       // Number of unique links
  internalLinks: number;     // Number of internal links
  externalLinks: number;     // Number of external links
  protocolBreakdown: Record<string, number>; // Breakdown by protocol
}

/**
 * Result of link extraction
 */
export interface ExtractionResult {
  sourceUrl: string;         // Source URL
  timestamp: Date;           // Extraction time
  links: Link[];             // Extracted links
  statistics: Statistics;    // Statistics
  errors: Error[];           // Error information
}

/**
 * Filter criteria for links
 */
export interface FilterCriteria {
  domains?: string[];        // Domain whitelist
  excludeDomains?: string[]; // Domain blacklist
  internalOnly?: boolean;    // Only internal links
  externalOnly?: boolean;    // Only external links
  urlPattern?: string;       // URL regex pattern
  protocols?: string[];      // Protocol filter
}

/**
 * Options for link extraction
 */
export interface ExtractionOptions {
  timeout?: number;          // Page load timeout
  waitForSelector?: string;  // Wait for specific selector
  headers?: Record<string, string>; // Custom HTTP headers
  cookies?: Cookie[];        // Cookies
  userAgent?: string;        // User-Agent
  proxy?: string;            // Proxy server
  filter?: FilterCriteria;   // Filter criteria
  includeMetadata?: boolean; // Whether to include metadata
  verbose?: boolean;         // Verbose logging
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
  errors: Array<{ url: string; error: Error }>;
}

/**
 * Custom error types
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public url: string,
    public retries: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public url: string,
    public timeout: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public url: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ParseError extends Error {
  constructor(
    message: string,
    public url: string,
    public partialLinks?: Link[]
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public invalidParameter: string,
    public validationRule: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
