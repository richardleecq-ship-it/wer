# Web Link Extractor Examples

This directory contains example scripts demonstrating various features of the web-link-extractor tool.

## Prerequisites

Before running these examples, make sure you have:

1. Built the project:
   ```bash
   npm run build
   ```

2. Installed dependencies:
   ```bash
   npm install
   ```

## Running Examples

All examples can be run with Node.js:

```bash
node examples/basic-usage.js
node examples/filtering-links.js
node examples/batch-processing.js
node examples/output-formats.js
node examples/advanced-options.js
```

## Example Scripts

### 1. basic-usage.js

Demonstrates basic link extraction from a single URL.

**Features:**
- Simple extraction
- Accessing link information
- Displaying statistics
- Viewing protocol breakdown

**Run:**
```bash
node examples/basic-usage.js
```

### 2. filtering-links.js

Shows various filtering options for links.

**Features:**
- Filter by internal/external
- Filter by domain
- Exclude domains
- Filter by URL pattern (regex)
- Filter by protocol
- Combine multiple filters

**Run:**
```bash
node examples/filtering-links.js
```

### 3. batch-processing.js

Demonstrates processing multiple URLs concurrently.

**Features:**
- Create URL list file
- Process batch with concurrency control
- View batch summary
- Handle errors in batch processing
- Analyze results

**Run:**
```bash
node examples/batch-processing.js
```

### 4. output-formats.js

Shows how to use different output formatters.

**Features:**
- JSON format
- CSV format
- Markdown format
- Text format
- Save to files

**Run:**
```bash
node examples/output-formats.js
```

**Output files created:**
- `output-example.json`
- `output-example.csv`
- `output-example.md`
- `output-example.txt`

### 5. advanced-options.js

Demonstrates advanced configuration options.

**Features:**
- Custom timeouts
- Wait for selectors
- Custom User-Agent
- Metadata collection
- Error handling
- Combining options

**Run:**
```bash
node examples/advanced-options.js
```

## Configuration Examples

The `config-examples/` directory contains sample configuration files:

### .linkextractorrc.basic.json

Basic configuration with default settings.

```json
{
  "timeout": 30000,
  "format": "text",
  "includeMetadata": false,
  "verbose": false,
  "concurrency": 3
}
```

**Usage:**
```bash
link-extractor https://example.com --config examples/config-examples/.linkextractorrc.basic.json
```

### .linkextractorrc.advanced.json

Advanced configuration with custom User-Agent and filtering.

```json
{
  "timeout": 60000,
  "format": "json",
  "includeMetadata": true,
  "verbose": true,
  "concurrency": 5,
  "userAgent": "MyCustomBot/1.0",
  "filter": {
    "protocols": ["https", "http"],
    "excludeDomains": ["ads.example.com"]
  }
}
```

**Usage:**
```bash
link-extractor https://example.com --config examples/config-examples/.linkextractorrc.advanced.json
```

### .linkextractorrc.internal-only.json

Configuration for extracting only internal HTTPS links.

```json
{
  "format": "markdown",
  "filter": {
    "internalOnly": true,
    "protocols": ["https"]
  }
}
```

**Usage:**
```bash
link-extractor https://example.com --config examples/config-examples/.linkextractorrc.internal-only.json
```

### .linkextractorrc.batch.json

Optimized configuration for batch processing.

```json
{
  "timeout": 45000,
  "format": "csv",
  "includeMetadata": true,
  "concurrency": 10
}
```

**Usage:**
```bash
link-extractor --batch urls.txt --config examples/config-examples/.linkextractorrc.batch.json
```

## Common Use Cases

### Extract All Links from a Website

```bash
node examples/basic-usage.js
```

### Extract Only Internal Links

```bash
link-extractor https://example.com --internal-only --format markdown
```

### Extract Links and Save as JSON

```bash
link-extractor https://example.com --format json --output results.json
```

### Process Multiple URLs

Create a `urls.txt` file:
```
https://example.com
https://example.org
https://example.net
```

Then run:
```bash
link-extractor --batch urls.txt --concurrency 5 --format csv --output batch-results.csv
```

### Extract with Custom Timeout

```bash
link-extractor https://slow-website.com --timeout 60000 --verbose
```

### Filter by Domain

```bash
link-extractor https://example.com --domains "example.com,example.org"
```

### Extract Only HTTPS Links

```bash
link-extractor https://example.com --protocols "https"
```

## Troubleshooting Examples

### Handling Slow Pages

If a page takes a long time to load:

```bash
link-extractor https://slow-page.com --timeout 90000 --wait-for ".content-loaded"
```

### Debugging Issues

Enable verbose mode to see detailed logs:

```bash
link-extractor https://example.com --verbose
```

### Handling Authentication

Create a config file with custom headers:

```json
{
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  },
  "cookies": [
    {
      "name": "session",
      "value": "your-session-id",
      "domain": "example.com"
    }
  ]
}
```

Then use it:
```bash
link-extractor https://protected-site.com --config auth-config.json
```

## Tips

1. **Start Simple**: Begin with basic extraction, then add filters and options as needed.

2. **Use Verbose Mode**: When debugging, use `--verbose` to see what's happening.

3. **Test Filters**: Test your filters on a single URL before batch processing.

4. **Adjust Concurrency**: Start with low concurrency (2-3) and increase if your system can handle it.

5. **Save Results**: Always save results to files for later analysis.

6. **Use Config Files**: For complex setups, use configuration files instead of long command lines.

## Next Steps

- Read the [API Documentation](../docs/API.md) for programmatic usage
- Check the main [README](../README.md) for CLI reference
- Explore the source code in `src/` for implementation details

## Support

If you encounter issues with these examples, please:

1. Check that you've built the project: `npm run build`
2. Verify dependencies are installed: `npm install`
3. Try running with `--verbose` flag for more information
4. Open an issue on GitHub with the error details
