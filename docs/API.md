# API Documentation

This document provides a comprehensive reference for using the web-link-extractor as a library in your Node.js or TypeScript projects.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Classes](#core-classes)
  - [LinkExtractorService](#linkextractorservice)
  - [BatchProcessorService](#batchprocessorservice)
- [Data Types](#data-types)
- [Formatters](#formatters)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Installation

```bash
npm install web-link-extractor
```

## Quick Start

```typescript
import { LinkExtractorService } from 'web-link-extractor';

const extractor = new LinkExtractorService();

const result = await extractor.extract('https://example.com', {
  timeout: 30000,
  includeMetadata: true
});

console.log(`Found ${result.statistics.totalLinks} links`);

await extractor.close();
```

## Core Classes

### LinkExtractorService

The main service for extracting links from a single URL.

#### Constructor

```typescript
new LinkExtractorService()
```

Creates a new instance of the link extractor service. Initializes a Playwright browser instance.

#### Methods

##### `extract(url: string, options?: ExtractionOptions): Promise<ExtractionResult>`

Extracts links from a single URL.

**Parameters:**
- `url` (string): The URL to extract links from
- `options` (ExtractionOptions, optional): Extraction options

**Returns:** Promise<ExtractionResult>

**Example:**
```typescript
const result = await extractor.extract('https://example.com', {
  timeout: 30000,
  includeMetadata: true,
  filter: {
    internalOnly: true
  }
});
```

##### `close(): Promise<void>`

Closes the browser instance and releases resources. Always call this when done.

**Example:**
```typescript
await extractor.close();
```

---

### BatchProcessorService

Service for processing multiple URLs concurrently.

#### Constructor

```typescript
new BatchProcessorService()
```

Creates a new instance of the batch processor service.

#### Methods

##### `processBatch(urlsFile: string, options?: BatchOptions): Promise<BatchResult>`

Processes multiple URLs from a file.

**Parameters:**
- `urlsFile` (string): Path to a file containing URLs (one per line)
- `options` (BatchOptions, optional): Batch processing options

**Returns:** Promise<BatchResult>

**Example:**
```typescript
const batchProcessor = new BatchProcessorService();

const result = await batchProcessor.processBatch('urls.txt', {
  concurrency: 5,
  timeout: 30000,
  filter: {
    internalOnly: true
  }
});

await batchProcessor.close();
```

##### `close(): Promise<void>`

Closes the browser instance and releases resources.

---

## Data Types

### ExtractionOptions

Options for link extraction.

```typescript
interface ExtractionOptions {
  timeout?: number;                      // Page load timeout (ms), default: 30000
  waitForSelector?: string;              // CSS selector to wait for
  headers?: Record<string, string>;      // Custom HTTP headers
  cookies?: Cookie[];                    // Cookies to set
  userAgent?: string;                    // Custom User-Agent
  proxy?: string;                        // Proxy server URL
  filter?: FilterCriteria;               // Filter criteria
  includeMetadata?: boolean;             // Include metadata, default: false
  verbose?: boolean;                     // Verbose logging, default: false
}
```

### FilterCriteria

Criteria for filtering links.

```typescript
interface FilterCriteria {
  domains?: string[];                    // Domain whitelist
  excludeDomains?: string[];             // Domain blacklist
  internalOnly?: boolean;                // Only internal links
  externalOnly?: boolean;                // Only external links
  urlPattern?: string;                   // URL regex pattern
  protocols?: string[];                  // Protocol filter (e.g., ['https', 'http'])
}
```

### ExtractionResult

Result of link extraction.

```typescript
interface ExtractionResult {
  sourceUrl: string;                     // Source URL
  timestamp: Date;                       // Extraction timestamp
  links: Link[];                         // Extracted links
  statistics: Statistics;                // Statistics
  errors: Error[];                       // Errors encountered
}
```

### Link

Represents a processed link.

```typescript
interface Link {
  url: string;                           // Normalized absolute URL
  description: string;                   // Generated description
  anchorText: string;                    // Original anchor text
  title?: string;                        // Title attribute
  protocol: string;                      // Protocol (http, https, mailto, etc.)
  isInternal: boolean;                   // Is internal link
  isExternal: boolean;                   // Is external link
  attributes: LinkAttributes;            // HTML attributes
  metadata: LinkMetadata;                // Metadata
}
```

### LinkAttributes

HTML attributes of a link.

```typescript
interface LinkAttributes {
  rel?: string;                          // Rel attribute
  target?: string;                       // Target attribute
  ariaLabel?: string;                    // Aria-label attribute
  dataAttributes: Record<string, string>; // Data-* attributes
}
```

### LinkMetadata

Metadata about a link.

```typescript
interface LinkMetadata {
  occurrences: number;                   // Number of occurrences on page
  hasNoFollow: boolean;                  // Has nofollow attribute
  parentContext: string;                 // Parent element context
  position: number;                      // Position on page
}
```

### Statistics

Statistics about extracted links.

```typescript
interface Statistics {
  totalLinks: number;                    // Total number of links
  uniqueLinks: number;                   // Number of unique links
  internalLinks: number;                 // Number of internal links
  externalLinks: number;                 // Number of external links
  protocolBreakdown: Record<string, number>; // Breakdown by protocol
}
```

### BatchOptions

Options for batch processing (extends ExtractionOptions).

```typescript
interface BatchOptions extends ExtractionOptions {
  concurrency?: number;                  // Number of concurrent requests, default: 3
}
```

### BatchResult

Result of batch processing.

```typescript
interface BatchResult {
  results: ExtractionResult[];           // Individual results
  summary: BatchSummary;                 // Summary
}
```

### BatchSummary

Summary of batch processing.

```typescript
interface BatchSummary {
  totalUrls: number;                     // Total URLs processed
  successfulUrls: number;                // Successful extractions
  failedUrls: number;                    // Failed extractions
  totalLinks: number;                    // Total links extracted
  errors: Array<{                        // Errors by URL
    url: string;
    error: Error;
  }>;
}
```

### Cookie

Cookie structure for authentication.

```typescript
interface Cookie {
  name: string;                          // Cookie name
  value: string;                         // Cookie value
  domain?: string;                       // Cookie domain
  path?: string;                         // Cookie path
  expires?: number;                      // Expiration timestamp
  httpOnly?: boolean;                    // HTTP only flag
  secure?: boolean;                      // Secure flag
  sameSite?: 'Strict' | 'Lax' | 'None'; // SameSite attribute
}
```

---

## Formatters

Formatters convert extraction results to different output formats.

### getFormatter(format: OutputFormat): Formatter

Returns a formatter for the specified format.

**Parameters:**
- `format` (OutputFormat): One of 'json', 'csv', 'markdown', or 'text'

**Returns:** Formatter instance

**Example:**
```typescript
import { getFormatter } from 'web-link-extractor/formatters';

const formatter = getFormatter('json');
const output = formatter.format(result);
console.log(output);
```

### Formatter Interface

```typescript
interface Formatter {
  format(result: ExtractionResult): string;
}
```

### Available Formatters

- **JSONFormatter**: Outputs structured JSON
- **CSVFormatter**: Outputs CSV format
- **MarkdownFormatter**: Outputs Markdown format
- **TextFormatter**: Outputs plain text format

---

## Error Handling

The library defines custom error types for different failure scenarios.

### Error Types

#### NetworkError

Thrown when network requests fail.

```typescript
class NetworkError extends Error {
  url: string;                           // Failed URL
  retries: number;                       // Number of retries attempted
  originalError?: Error;                 // Original error
}
```

#### TimeoutError

Thrown when page load times out.

```typescript
class TimeoutError extends Error {
  url: string;                           // URL that timed out
  timeout: number;                       // Timeout value (ms)
}
```

#### AuthenticationError

Thrown when authentication fails (401/403).

```typescript
class AuthenticationError extends Error {
  url: string;                           // URL requiring authentication
  statusCode: number;                    // HTTP status code
}
```

#### ParseError

Thrown when page parsing fails.

```typescript
class ParseError extends Error {
  url: string;                           // URL that failed to parse
  partialLinks?: Link[];                 // Partially extracted links
}
```

#### ValidationError

Thrown when input validation fails.

```typescript
class ValidationError extends Error {
  invalidParameter: string;              // Invalid parameter name
  validationRule: string;                // Validation rule that failed
}
```

### Error Handling Example

```typescript
import { 
  LinkExtractorService,
  NetworkError,
  TimeoutError,
  AuthenticationError 
} from 'web-link-extractor';

const extractor = new LinkExtractorService();

try {
  const result = await extractor.extract('https://example.com');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error(`Network error: ${error.message}`);
    console.error(`Failed after ${error.retries} retries`);
  } else if (error instanceof TimeoutError) {
    console.error(`Timeout after ${error.timeout}ms`);
  } else if (error instanceof AuthenticationError) {
    console.error(`Authentication required (${error.statusCode})`);
  } else {
    console.error(`Unknown error: ${error.message}`);
  }
} finally {
  await extractor.close();
}
```

---

## Examples

### Example 1: Basic Extraction

```typescript
import { LinkExtractorService } from 'web-link-extractor';

async function extractLinks() {
  const extractor = new LinkExtractorService();
  
  try {
    const result = await extractor.extract('https://example.com');
    
    console.log(`Found ${result.statistics.totalLinks} links`);
    
    result.links.forEach(link => {
      console.log(`${link.description}: ${link.url}`);
    });
  } finally {
    await extractor.close();
  }
}
```

### Example 2: Filtering Links

```typescript
import { LinkExtractorService } from 'web-link-extractor';

async function extractInternalLinks() {
  const extractor = new LinkExtractorService();
  
  try {
    const result = await extractor.extract('https://example.com', {
      filter: {
        internalOnly: true,
        protocols: ['https']
      }
    });
    
    console.log(`Found ${result.links.length} internal HTTPS links`);
  } finally {
    await extractor.close();
  }
}
```

### Example 3: Batch Processing

```typescript
import { BatchProcessorService } from 'web-link-extractor';

async function processBatch() {
  const batchProcessor = new BatchProcessorService();
  
  try {
    const result = await batchProcessor.processBatch('urls.txt', {
      concurrency: 5,
      timeout: 30000
    });
    
    console.log(`Processed ${result.summary.totalUrls} URLs`);
    console.log(`Found ${result.summary.totalLinks} total links`);
    
    result.results.forEach(urlResult => {
      console.log(`${urlResult.sourceUrl}: ${urlResult.links.length} links`);
    });
  } finally {
    await batchProcessor.close();
  }
}
```

### Example 4: Custom Headers and Authentication

```typescript
import { LinkExtractorService } from 'web-link-extractor';

async function extractWithAuth() {
  const extractor = new LinkExtractorService();
  
  try {
    const result = await extractor.extract('https://example.com', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      cookies: [
        {
          name: 'session',
          value: 'your-session-id',
          domain: 'example.com'
        }
      ],
      userAgent: 'MyBot/1.0'
    });
    
    console.log(`Extracted ${result.links.length} links`);
  } finally {
    await extractor.close();
  }
}
```

### Example 5: Using Formatters

```typescript
import { LinkExtractorService } from 'web-link-extractor';
import { getFormatter } from 'web-link-extractor/formatters';
import * as fs from 'fs/promises';

async function extractAndSave() {
  const extractor = new LinkExtractorService();
  
  try {
    const result = await extractor.extract('https://example.com');
    
    // Save as JSON
    const jsonFormatter = getFormatter('json');
    await fs.writeFile('links.json', jsonFormatter.format(result));
    
    // Save as CSV
    const csvFormatter = getFormatter('csv');
    await fs.writeFile('links.csv', csvFormatter.format(result));
    
    // Save as Markdown
    const mdFormatter = getFormatter('markdown');
    await fs.writeFile('links.md', mdFormatter.format(result));
    
    console.log('Results saved in multiple formats');
  } finally {
    await extractor.close();
  }
}
```

### Example 6: Error Recovery

```typescript
import { LinkExtractorService, NetworkError } from 'web-link-extractor';

async function extractWithRetry(url: string, maxRetries = 3) {
  const extractor = new LinkExtractorService();
  
  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await extractor.extract(url, {
          timeout: 30000 * attempt  // Increase timeout with each retry
        });
        return result;
      } catch (error) {
        if (error instanceof NetworkError && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          throw error;
        }
      }
    }
  } finally {
    await extractor.close();
  }
}
```

---

## TypeScript Support

The library is written in TypeScript and includes full type definitions. Import types as needed:

```typescript
import {
  LinkExtractorService,
  BatchProcessorService,
  ExtractionOptions,
  ExtractionResult,
  Link,
  FilterCriteria,
  Statistics
} from 'web-link-extractor';
```

---

## Best Practices

1. **Always close the service**: Call `close()` in a `finally` block to ensure browser resources are released.

2. **Use appropriate timeouts**: Adjust timeout based on the expected page load time.

3. **Handle errors gracefully**: Catch and handle specific error types for better error recovery.

4. **Use filters efficiently**: Apply filters to reduce processing time and memory usage.

5. **Control concurrency**: In batch processing, adjust concurrency based on your system resources.

6. **Enable metadata selectively**: Only enable metadata collection when needed, as it adds processing overhead.

7. **Reuse service instances**: For multiple extractions, reuse the same service instance instead of creating new ones.

---

## Performance Considerations

- **Browser overhead**: Each service instance maintains a browser instance. Reuse instances when possible.
- **Concurrency**: Higher concurrency speeds up batch processing but uses more memory.
- **Metadata collection**: Adds ~10-20% overhead. Disable if not needed.
- **Filtering**: Apply filters to reduce the number of links processed.
- **Timeout**: Set appropriate timeouts to avoid hanging on slow pages.

---

## License

MIT
