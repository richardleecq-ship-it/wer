# Quick Start Guide

Get up and running with web-link-extractor in 5 minutes!

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-link-extractor

# Install dependencies
npm install

# Build the project
npm run build

# (Optional) Link for global usage
npm link
```

## Your First Extraction

Extract all links from a webpage:

```bash
link-extractor https://example.com
```

You'll see output like:

```
Extracting links... Done!

Links from https://example.com
================================================================================

More information
  https://www.iana.org/domains/example

────────────────────────────────────────────────────────────────────────────────
Summary:
  Total links: 1
  Unique links: 1
  Internal links: 0
  External links: 1
  Protocol breakdown:
    https: 1
────────────────────────────────────────────────────────────────────────────────
```

## Common Tasks

### Save Results to a File

**JSON format:**
```bash
link-extractor https://example.com --format json --output links.json
```

**CSV format (great for Excel):**
```bash
link-extractor https://example.com --format csv --output links.csv
```

**Markdown format (great for documentation):**
```bash
link-extractor https://example.com --format markdown --output links.md
```

### Filter Links

**Only internal links:**
```bash
link-extractor https://example.com --internal-only
```

**Only external links:**
```bash
link-extractor https://example.com --external-only
```

**Only HTTPS links:**
```bash
link-extractor https://example.com --protocols "https"
```

### Process Multiple URLs

Create a file called `urls.txt`:
```
https://example.com
https://example.org
https://example.net
```

Then run:
```bash
link-extractor --batch urls.txt
```

### Handle Slow Pages

If a page takes time to load:

```bash
link-extractor https://slow-site.com --timeout 60000
```

Or wait for specific content:

```bash
link-extractor https://dynamic-site.com --wait-for ".content-loaded"
```

## Using as a Library

Create a file `extract.js`:

```javascript
const { LinkExtractorService } = require('web-link-extractor');

async function main() {
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

main();
```

Run it:
```bash
node extract.js
```

## Configuration File

Create `.linkextractorrc.json` in your project:

```json
{
  "timeout": 30000,
  "format": "json",
  "includeMetadata": true,
  "verbose": false
}
```

Now these settings will be used by default:

```bash
link-extractor https://example.com
```

## Next Steps

- **Read the full [README](../README.md)** for all CLI options
- **Check out [examples](../examples/)** for more use cases
- **Read the [API docs](./API.md)** for programmatic usage
- **See [troubleshooting](./TROUBLESHOOTING.md)** if you run into issues

## Quick Reference

### Most Useful Commands

```bash
# Basic extraction
link-extractor https://example.com

# Save as JSON
link-extractor https://example.com --format json --output results.json

# Only internal links
link-extractor https://example.com --internal-only

# Batch processing
link-extractor --batch urls.txt --concurrency 5

# With verbose output
link-extractor https://example.com --verbose

# Custom timeout
link-extractor https://example.com --timeout 60000

# Filter by domain
link-extractor https://example.com --domains "example.com,example.org"

# Include metadata
link-extractor https://example.com --include-metadata
```

### Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `--format` | Output format | `--format json` |
| `--output` | Save to file | `--output results.json` |
| `--internal-only` | Only internal links | `--internal-only` |
| `--external-only` | Only external links | `--external-only` |
| `--timeout` | Page load timeout (ms) | `--timeout 60000` |
| `--verbose` | Detailed logging | `--verbose` |
| `--batch` | Process multiple URLs | `--batch urls.txt` |
| `--concurrency` | Concurrent requests | `--concurrency 5` |

## Tips for Success

1. **Start simple** - Try basic extraction first, then add options
2. **Use verbose mode** - Add `--verbose` when debugging
3. **Save your results** - Always use `--output` for important extractions
4. **Test filters** - Test on one URL before batch processing
5. **Adjust timeout** - Increase for slow sites, decrease for fast ones

## Getting Help

```bash
# Show all options
link-extractor --help

# Show version
link-extractor --version
```

For more help:
- Check the [troubleshooting guide](./TROUBLESHOOTING.md)
- Read the [full documentation](../README.md)
- Open an issue on GitHub

Happy link extracting! 🔗
