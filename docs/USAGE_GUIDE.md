# Usage Guide

A comprehensive guide to using web-link-extractor effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Command-Line Usage](#command-line-usage)
- [Library Usage](#library-usage)
- [Configuration](#configuration)
- [Filtering Strategies](#filtering-strategies)
- [Output Formats](#output-formats)
- [Batch Processing](#batch-processing)
- [Authentication](#authentication)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Getting Started

### Installation

See [Quick Start Guide](./QUICK_START.md) for installation instructions.

### First Steps

1. **Test with a simple URL:**
   ```bash
   link-extractor https://example.com
   ```

2. **Save results:**
   ```bash
   link-extractor https://example.com --output links.txt
   ```

3. **Try different formats:**
   ```bash
   link-extractor https://example.com --format json --output links.json
   ```

## Command-Line Usage

### Basic Syntax

```bash
link-extractor [url] [options]
```

or

```bash
link-extractor --batch <file> [options]
```

### Essential Options

| Option | Description | Example |
|--------|-------------|---------|
| `--format <format>` | Output format | `--format json` |
| `--output <file>` | Save to file | `--output results.json` |
| `--timeout <ms>` | Page load timeout | `--timeout 60000` |
| `--verbose` | Detailed logging | `--verbose` |

### Filtering Options

| Option | Description | Example |
|--------|-------------|---------|
| `--internal-only` | Only internal links | `--internal-only` |
| `--external-only` | Only external links | `--external-only` |
| `--domains <list>` | Filter by domains | `--domains "example.com,example.org"` |
| `--exclude-domains <list>` | Exclude domains | `--exclude-domains "ads.com"` |
| `--url-pattern <regex>` | Filter by pattern | `--url-pattern ".*\\.pdf$"` |
| `--protocols <list>` | Filter by protocols | `--protocols "https,mailto"` |

### Advanced Options

| Option | Description | Example |
|--------|-------------|---------|
| `--wait-for <selector>` | Wait for element | `--wait-for ".content"` |
| `--user-agent <ua>` | Custom User-Agent | `--user-agent "MyBot/1.0"` |
| `--proxy <url>` | Proxy server | `--proxy "http://proxy:8080"` |
| `--include-metadata` | Include metadata | `--include-metadata` |
| `--config <file>` | Config file | `--config custom.json` |

### Batch Options

| Option | Description | Example |
|--------|-------------|---------|
| `--batch <file>` | URL list file | `--batch urls.txt` |
| `--concurrency <n>` | Concurrent requests | `--concurrency 5` |

## Library Usage

### Basic Example

```typescript
import { LinkExtractorService } from 'web-link-extractor';

const extractor = new LinkExtractorService();

try {
  const result = await extractor.extract('https://example.com');
  console.log(`Found ${result.statistics.totalLinks} links`);
} finally {
  await extractor.close();
}
```

### With Options

```typescript
const result = await extractor.extract('https://example.com', {
  timeout: 30000,
  includeMetadata: true,
  filter: {
    internalOnly: true,
    protocols: ['https']
  }
});
```

### Batch Processing

```typescript
import { BatchProcessorService } from 'web-link-extractor';

const batchProcessor = new BatchProcessorService();

try {
  const result = await batchProcessor.processBatch('urls.txt', {
    concurrency: 5,
    timeout: 30000
  });
  
  console.log(`Processed ${result.summary.totalUrls} URLs`);
} finally {
  await batchProcessor.close();
}
```

### Using Formatters

```typescript
import { getFormatter } from 'web-link-extractor';

const formatter = getFormatter('json');
const output = formatter.format(result);
console.log(output);
```

## Configuration

### Configuration File

Create `.linkextractorrc.json`:

```json
{
  "timeout": 30000,
  "format": "json",
  "includeMetadata": true,
  "verbose": false,
  "concurrency": 3,
  "filter": {
    "protocols": ["https", "http"]
  }
}
```

### Configuration Priority

1. Command-line options (highest priority)
2. Custom config file (`--config`)
3. Default config file (`.linkextractorrc.json`)
4. Built-in defaults (lowest priority)

### Environment-Specific Configs

Create different configs for different environments:

```bash
# Development
link-extractor https://example.com --config dev.json

# Production
link-extractor https://example.com --config prod.json

# Testing
link-extractor https://example.com --config test.json
```

## Filtering Strategies

### By Link Type

**Internal links only:**
```bash
link-extractor https://example.com --internal-only
```

**External links only:**
```bash
link-extractor https://example.com --external-only
```

### By Domain

**Whitelist domains:**
```bash
link-extractor https://example.com --domains "example.com,example.org"
```

**Blacklist domains:**
```bash
link-extractor https://example.com --exclude-domains "ads.com,tracker.com"
```

### By URL Pattern

**PDF files only:**
```bash
link-extractor https://example.com --url-pattern ".*\\.pdf$"
```

**Blog posts:**
```bash
link-extractor https://example.com --url-pattern "^https://example\\.com/blog/.*"
```

**Exclude query parameters:**
```bash
link-extractor https://example.com --url-pattern "^[^?]*$"
```

### By Protocol

**HTTPS only:**
```bash
link-extractor https://example.com --protocols "https"
```

**Web and email:**
```bash
link-extractor https://example.com --protocols "https,http,mailto"
```

### Combined Filters

```bash
link-extractor https://example.com \
  --internal-only \
  --protocols "https" \
  --url-pattern "^https://example\\.com/(blog|docs)/.*"
```

## Output Formats

### JSON Format

**Best for:**
- Programmatic processing
- Data analysis
- API integration

**Example:**
```bash
link-extractor https://example.com --format json --output links.json
```

**Structure:**
```json
{
  "sourceUrl": "https://example.com",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "links": [...],
  "statistics": {...},
  "errors": []
}
```

### CSV Format

**Best for:**
- Excel/spreadsheet analysis
- Data import
- Simple reporting

**Example:**
```bash
link-extractor https://example.com --format csv --output links.csv
```

**Columns:**
- URL
- Description
- Anchor Text
- Protocol
- Is Internal
- Is External

### Markdown Format

**Best for:**
- Documentation
- README files
- Reports

**Example:**
```bash
link-extractor https://example.com --format markdown --output links.md
```

**Features:**
- Organized by internal/external
- Clickable links
- Clean formatting

### Text Format

**Best for:**
- Quick viewing
- Terminal output
- Simple lists

**Example:**
```bash
link-extractor https://example.com --format text
```

**Features:**
- Human-readable
- Minimal formatting
- Easy to parse

## Batch Processing

### Creating URL Lists

Create `urls.txt`:
```
https://example.com
https://example.org
https://example.net
```

### Basic Batch Processing

```bash
link-extractor --batch urls.txt
```

### With Concurrency

```bash
link-extractor --batch urls.txt --concurrency 5
```

### Batch with Filters

```bash
link-extractor --batch urls.txt \
  --internal-only \
  --format json \
  --output batch-results.json
```

### Handling Large Batches

For large URL lists:

1. **Split into smaller batches:**
   ```bash
   split -l 100 urls.txt batch-
   ```

2. **Process each batch:**
   ```bash
   for file in batch-*; do
     link-extractor --batch $file --output "results-$file.json"
   done
   ```

3. **Use lower concurrency:**
   ```bash
   link-extractor --batch urls.txt --concurrency 2
   ```

## Authentication

### Custom Headers

Create `auth-config.json`:
```json
{
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN",
    "X-API-Key": "your-api-key"
  }
}
```

Use it:
```bash
link-extractor https://protected-site.com --config auth-config.json
```

### Cookies

```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true
    }
  ]
}
```

### User-Agent

```bash
link-extractor https://example.com --user-agent "MyBot/1.0"
```

### Proxy

```bash
link-extractor https://example.com --proxy "http://proxy.example.com:8080"
```

## Best Practices

### 1. Start Simple

Begin with basic extraction:
```bash
link-extractor https://example.com
```

Then add options as needed.

### 2. Use Verbose Mode for Debugging

```bash
link-extractor https://example.com --verbose
```

### 3. Save Results

Always save important extractions:
```bash
link-extractor https://example.com --output results.json
```

### 4. Test Filters First

Test filters on a single URL before batch processing:
```bash
link-extractor https://example.com --internal-only
```

### 5. Adjust Timeouts

For slow sites:
```bash
link-extractor https://slow-site.com --timeout 60000
```

For fast sites:
```bash
link-extractor https://fast-site.com --timeout 15000
```

### 6. Use Configuration Files

For repeated tasks, use config files:
```bash
link-extractor https://example.com --config my-config.json
```

### 7. Control Concurrency

Start low and increase:
```bash
link-extractor --batch urls.txt --concurrency 2
```

### 8. Handle Errors Gracefully

In scripts:
```bash
link-extractor https://example.com || echo "Extraction failed"
```

### 9. Monitor Resource Usage

For large batches, monitor:
- CPU usage
- Memory usage
- Network bandwidth

### 10. Close Properly

In library usage:
```typescript
try {
  // extraction code
} finally {
  await extractor.close();
}
```

## Common Patterns

### Pattern 1: Site Analysis

Extract all links and analyze:
```bash
link-extractor https://example.com \
  --include-metadata \
  --format json \
  --output analysis.json
```

### Pattern 2: SEO Audit

Check internal linking:
```bash
link-extractor https://example.com \
  --internal-only \
  --include-metadata \
  --format csv \
  --output seo-audit.csv
```

### Pattern 3: External Link Check

Find all external links:
```bash
link-extractor https://example.com \
  --external-only \
  --format markdown \
  --output external-links.md
```

### Pattern 4: Resource Discovery

Find specific resources:
```bash
link-extractor https://example.com \
  --url-pattern ".*\\.(pdf|doc|docx)$" \
  --format text \
  --output documents.txt
```

### Pattern 5: Competitive Analysis

Extract competitor links:
```bash
link-extractor https://competitor.com \
  --external-only \
  --format json \
  --output competitor-links.json
```

### Pattern 6: Documentation Generation

Generate link documentation:
```bash
link-extractor https://docs.example.com \
  --internal-only \
  --format markdown \
  --output docs-links.md
```

### Pattern 7: Broken Link Detection

Extract all links for validation:
```bash
link-extractor https://example.com \
  --format json \
  --output links-to-validate.json
```

### Pattern 8: Sitemap Generation

Extract internal structure:
```bash
link-extractor https://example.com \
  --internal-only \
  --protocols "https" \
  --format json \
  --output sitemap-data.json
```

## Troubleshooting

For common issues, see the [Troubleshooting Guide](./TROUBLESHOOTING.md).

## Further Reading

- [Quick Start Guide](./QUICK_START.md) - Get started quickly
- [API Documentation](./API.md) - Library usage reference
- [Examples](../examples/) - Code examples
- [README](../README.md) - Complete reference

## Support

For help:
- Check documentation
- Run with `--verbose`
- Open an issue on GitHub
