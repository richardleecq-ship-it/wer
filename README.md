# Web Link Extractor

A powerful command-line tool for extracting links from web pages with intelligent description generation. Built with TypeScript and Playwright, it handles modern JavaScript-rendered content and provides extensive filtering and formatting options.

## Features

- 🔍 **Smart Link Extraction**: Extract all links from web pages, including JavaScript-rendered dynamic content
- 📝 **Intelligent Descriptions**: Automatically generate readable descriptions from anchor text, titles, aria-labels, or URL paths
- 🎯 **Advanced Filtering**: Filter by domain, internal/external links, URL patterns, or protocols
- 📊 **Multiple Output Formats**: Export as JSON, CSV, Markdown, or plain text
- ⚡ **Batch Processing**: Process multiple URLs concurrently with configurable concurrency
- 🔐 **Authentication Support**: Custom HTTP headers, cookies, user agents, and proxy support
- 📈 **Rich Metadata**: Collect detailed metadata including link occurrences, attributes, and context
- 🛠️ **Flexible Configuration**: Use command-line options or configuration files

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Basic Examples](#basic-examples)
  - [Filtering Links](#filtering-links)
  - [Output Formats](#output-formats)
  - [Batch Processing](#batch-processing)
  - [Authentication & Headers](#authentication--headers)
  - [Advanced Options](#advanced-options)
- [Configuration File](#configuration-file)
- [Output Examples](#output-examples)
- [API Usage](#api-usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Examples](#examples)
- [License](#license)

## Installation

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd web-link-extractor

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage (optional)
npm link
```

### Requirements

- Node.js 18 or higher
- npm or yarn

## Quick Start

Extract links from a webpage:

```bash
link-extractor https://example.com
```

Save results to a file:

```bash
link-extractor https://example.com --format json --output results.json
```

Process multiple URLs:

```bash
link-extractor --batch urls.txt --concurrency 5
```

## Usage

### Basic Examples

**Extract all links from a webpage:**
```bash
link-extractor https://example.com
```

**Extract with verbose output:**
```bash
link-extractor https://example.com --verbose
```

**Wait for dynamic content to load:**
```bash
link-extractor https://example.com --wait-for ".content-loaded"
```

**Set custom timeout:**
```bash
link-extractor https://example.com --timeout 60000
```

### Filtering Links

**Extract only internal links:**
```bash
link-extractor https://example.com --internal-only
```

**Extract only external links:**
```bash
link-extractor https://example.com --external-only
```

**Filter by specific domains:**
```bash
link-extractor https://example.com --domains "example.com,example.org"
```

**Exclude specific domains:**
```bash
link-extractor https://example.com --exclude-domains "ads.example.com,tracker.com"
```

**Filter by URL pattern (regex):**
```bash
link-extractor https://example.com --url-pattern "^https://.*\\.pdf$"
```

**Filter by protocols:**
```bash
link-extractor https://example.com --protocols "https,mailto"
```

### Output Formats

**JSON format (structured data):**
```bash
link-extractor https://example.com --format json --output results.json
```

**CSV format (spreadsheet-friendly):**
```bash
link-extractor https://example.com --format csv --output results.csv
```

**Markdown format (documentation-ready):**
```bash
link-extractor https://example.com --format markdown --output results.md
```

**Plain text format (simple list):**
```bash
link-extractor https://example.com --format text --output results.txt
```

### Batch Processing

Create a file with URLs (one per line):

```text
# urls.txt
https://example.com
https://example.org
https://example.net
```

Process all URLs:

```bash
link-extractor --batch urls.txt
```

**With concurrency control:**
```bash
link-extractor --batch urls.txt --concurrency 10
```

**Save batch results:**
```bash
link-extractor --batch urls.txt --format json --output batch-results.json
```

### Authentication & Headers

**Custom User-Agent:**
```bash
link-extractor https://example.com --user-agent "MyBot/1.0"
```

**Use a proxy:**
```bash
link-extractor https://example.com --proxy "http://proxy.example.com:8080"
```

**Custom configuration (for headers and cookies, use config file):**
```bash
link-extractor https://example.com --config my-config.json
```

### Advanced Options

**Include detailed metadata:**
```bash
link-extractor https://example.com --include-metadata
```

**Combine multiple options:**
```bash
link-extractor https://example.com \
  --internal-only \
  --format json \
  --include-metadata \
  --timeout 60000 \
  --verbose \
  --output results.json
```

## Configuration File

Create a `.linkextractorrc.json` file in your project directory or specify a custom config file:

```json
{
  "timeout": 30000,
  "format": "json",
  "includeMetadata": true,
  "verbose": false,
  "concurrency": 3,
  "userAgent": "MyBot/1.0",
  "filter": {
    "internalOnly": false,
    "protocols": ["https", "http"]
  }
}
```

Use a custom config file:

```bash
link-extractor https://example.com --config custom-config.json
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 30000 | Page load timeout in milliseconds |
| `format` | string | "text" | Output format (json, csv, markdown, text) |
| `includeMetadata` | boolean | false | Include detailed metadata |
| `verbose` | boolean | false | Enable verbose logging |
| `concurrency` | number | 3 | Concurrent requests for batch processing |
| `userAgent` | string | - | Custom User-Agent string |
| `proxy` | string | - | Proxy server URL |
| `filter` | object | - | Filter criteria (see below) |

**Filter Configuration:**

```json
{
  "filter": {
    "domains": ["example.com", "example.org"],
    "excludeDomains": ["ads.example.com"],
    "internalOnly": false,
    "externalOnly": false,
    "urlPattern": "^https://.*",
    "protocols": ["https", "http", "mailto"]
  }
}
```

## Output Examples

### JSON Format

```json
{
  "sourceUrl": "https://example.com",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "links": [
    {
      "url": "https://example.com/about",
      "description": "About Us",
      "anchorText": "About Us",
      "protocol": "https",
      "isInternal": true,
      "isExternal": false,
      "attributes": {
        "rel": "nofollow",
        "target": "_blank",
        "dataAttributes": {}
      },
      "metadata": {
        "occurrences": 2,
        "hasNoFollow": true,
        "parentContext": "nav",
        "position": 1
      }
    }
  ],
  "statistics": {
    "totalLinks": 25,
    "uniqueLinks": 20,
    "internalLinks": 15,
    "externalLinks": 5,
    "protocolBreakdown": {
      "https": 23,
      "mailto": 2
    }
  },
  "errors": []
}
```

### CSV Format

```csv
URL,Description,Anchor Text,Protocol,Is Internal,Is External
https://example.com/about,About Us,About Us,https,true,false
https://example.com/contact,Contact,Contact,https,true,false
```

### Markdown Format

```markdown
# Links from https://example.com

## Internal Links (15)

- [About Us](https://example.com/about)
- [Contact](https://example.com/contact)

## External Links (5)

- [GitHub](https://github.com)
- [Twitter](https://twitter.com)
```

### Text Format

```text
Links from https://example.com
================================================================================

About Us
  https://example.com/about

Contact
  https://example.com/contact
```

## API Usage

You can also use the link extractor as a library in your Node.js projects:

```typescript
import { LinkExtractorService } from 'web-link-extractor';

const extractor = new LinkExtractorService();

// Extract links from a single URL
const result = await extractor.extract('https://example.com', {
  timeout: 30000,
  includeMetadata: true,
  filter: {
    internalOnly: true
  }
});

console.log(`Found ${result.statistics.totalLinks} links`);
console.log(result.links);

// Don't forget to close the browser
await extractor.close();
```

**Batch Processing:**

```typescript
import { BatchProcessorService } from 'web-link-extractor';

const batchProcessor = new BatchProcessorService();

const result = await batchProcessor.processBatch('urls.txt', {
  concurrency: 5,
  timeout: 30000
});

console.log(`Processed ${result.summary.totalUrls} URLs`);
console.log(`Found ${result.summary.totalLinks} total links`);

await batchProcessor.close();
```

See the [API Documentation](./docs/API.md) for complete API reference.

## Development

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- https://example.com
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/core/LinkParser.test.ts
```

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# The compiled files will be in the dist/ directory
```

### Project Structure

```
web-link-extractor/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── index.ts               # Library entry point
│   ├── core/                  # Core extraction logic
│   │   ├── PageLoader.ts
│   │   ├── LinkParser.ts
│   │   ├── DescriptionGenerator.ts
│   │   ├── LinkFilter.ts
│   │   ├── MetadataCollector.ts
│   │   └── ErrorHandler.ts
│   ├── services/              # Service layer
│   │   ├── LinkExtractorService.ts
│   │   └── BatchProcessorService.ts
│   ├── formatters/            # Output formatters
│   │   ├── JSONFormatter.ts
│   │   ├── CSVFormatter.ts
│   │   ├── MarkdownFormatter.ts
│   │   └── TextFormatter.ts
│   └── types/                 # TypeScript types
│       └── index.ts
├── .linkextractorrc.json      # Default configuration
└── package.json
```

## Troubleshooting

### Common Issues

**Issue: "Timeout waiting for page to load"**
- Solution: Increase timeout with `--timeout 60000` or wait for a specific selector with `--wait-for`

**Issue: "Authentication required (401/403)"**
- Solution: Use a config file to provide custom headers or cookies

**Issue: "No links found"**
- Solution: Use `--verbose` to see what's happening, or increase timeout for dynamic content

**Issue: "Too many concurrent requests"**
- Solution: Reduce concurrency with `--concurrency 2`

**Issue: "Proxy connection failed"**
- Solution: Verify proxy URL format: `http://host:port` or `https://host:port`

### Debug Mode

Enable verbose logging to see detailed execution information:

```bash
link-extractor https://example.com --verbose
```

### Getting Help

```bash
link-extractor --help
```

## Requirements

This tool satisfies all requirements specified in the [requirements document](./.kiro/specs/web-link-extractor/requirements.md):

- ✅ Extract all links including JavaScript-rendered content
- ✅ Generate readable descriptions for each link
- ✅ Filter and classify links by various criteria
- ✅ Multiple output formats (JSON, CSV, Markdown, Text)
- ✅ Handle various URL formats and special cases
- ✅ Collect detailed metadata
- ✅ Support authentication and custom headers
- ✅ Batch processing with concurrency control
- ✅ Comprehensive error handling and logging

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Documentation

Comprehensive documentation is available:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[Usage Guide](./docs/USAGE_GUIDE.md)** - Comprehensive usage patterns and best practices
- **[API Documentation](./docs/API.md)** - Complete API reference for library usage
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Solutions to common issues
- **[Changelog](./CHANGELOG.md)** - Version history and changes

## Examples

The `examples/` directory contains working examples:

- **[basic-usage.js](./examples/basic-usage.js)** - Simple link extraction
- **[filtering-links.js](./examples/filtering-links.js)** - Various filtering options
- **[batch-processing.js](./examples/batch-processing.js)** - Processing multiple URLs
- **[output-formats.js](./examples/output-formats.js)** - Using different formatters
- **[advanced-options.js](./examples/advanced-options.js)** - Advanced configuration

Run examples:
```bash
npm run example:basic
npm run example:filtering
npm run example:batch
npm run example:formats
npm run example:advanced
```

Configuration examples are in `examples/config-examples/`.

## Support

For issues and questions:
- Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Review [existing issues](https://github.com/yourusername/web-link-extractor/issues)
- Open a [new issue](https://github.com/yourusername/web-link-extractor/issues/new) with details
