# Troubleshooting Guide

This guide helps you resolve common issues when using the web-link-extractor tool.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Output Issues](#output-issues)
- [Authentication Issues](#authentication-issues)
- [Network Issues](#network-issues)
- [Browser Issues](#browser-issues)

## Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Ensure you have Node.js 18 or higher.

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Issue: Playwright installation fails

**Symptoms:**
```
Error: Failed to download browser
```

**Solutions:**

1. **Install Playwright browsers manually:**
   ```bash
   npx playwright install
   ```

2. **Install specific browser:**
   ```bash
   npx playwright install chromium
   ```

3. **Check network connection and proxy settings**

## Runtime Errors

### Issue: "Timeout waiting for page to load"

**Symptoms:**
```
TimeoutError: Page load timeout after 30000ms
```

**Solutions:**

1. **Increase timeout:**
   ```bash
   link-extractor https://example.com --timeout 60000
   ```

2. **Wait for specific element:**
   ```bash
   link-extractor https://example.com --wait-for ".content-loaded"
   ```

3. **Check if the page actually loads in a browser**

4. **Use verbose mode to see what's happening:**
   ```bash
   link-extractor https://example.com --verbose
   ```

### Issue: "No links found"

**Symptoms:**
- Extraction completes but returns 0 links
- Statistics show 0 total links

**Solutions:**

1. **Check if page has links:**
   - Open the URL in a browser
   - Verify there are `<a>` tags

2. **Wait for dynamic content:**
   ```bash
   link-extractor https://example.com --wait-for "a" --timeout 60000
   ```

3. **Enable verbose mode:**
   ```bash
   link-extractor https://example.com --verbose
   ```

4. **Check if links are in iframes** (not currently supported)

### Issue: "Authentication required (401/403)"

**Symptoms:**
```
AuthenticationError: Authentication required (401)
```

**Solutions:**

1. **Provide authentication via config file:**
   ```json
   {
     "headers": {
       "Authorization": "Bearer YOUR_TOKEN"
     }
   }
   ```

2. **Use cookies:**
   ```json
   {
     "cookies": [
       {
         "name": "session",
         "value": "your-session-id",
         "domain": "example.com"
       }
     ]
   }
   ```

3. **Check if the site requires login in a browser first**

### Issue: "Network error"

**Symptoms:**
```
NetworkError: Failed to connect to https://example.com
```

**Solutions:**

1. **Check internet connection**

2. **Verify URL is accessible:**
   ```bash
   curl -I https://example.com
   ```

3. **Use a proxy if behind firewall:**
   ```bash
   link-extractor https://example.com --proxy http://proxy.example.com:8080
   ```

4. **Check DNS resolution:**
   ```bash
   nslookup example.com
   ```

### Issue: "Invalid format"

**Symptoms:**
```
ValidationError: Invalid format: xyz
```

**Solutions:**

1. **Use valid format:**
   ```bash
   link-extractor https://example.com --format json
   ```

2. **Valid formats are:** `json`, `csv`, `markdown`, `text`

## Performance Issues

### Issue: Extraction is very slow

**Symptoms:**
- Takes several minutes to extract links
- High CPU or memory usage

**Solutions:**

1. **Reduce timeout:**
   ```bash
   link-extractor https://example.com --timeout 15000
   ```

2. **Disable metadata collection:**
   ```bash
   link-extractor https://example.com
   ```
   (metadata is disabled by default)

3. **For batch processing, reduce concurrency:**
   ```bash
   link-extractor --batch urls.txt --concurrency 2
   ```

4. **Close other applications to free up resources**

### Issue: High memory usage

**Symptoms:**
- System becomes slow
- Out of memory errors

**Solutions:**

1. **Reduce batch concurrency:**
   ```bash
   link-extractor --batch urls.txt --concurrency 1
   ```

2. **Process URLs in smaller batches**

3. **Disable metadata collection**

4. **Close the extractor properly:**
   ```javascript
   await extractor.close();
   ```

### Issue: Batch processing hangs

**Symptoms:**
- Batch processing stops mid-way
- No progress for extended time

**Solutions:**

1. **Reduce concurrency:**
   ```bash
   link-extractor --batch urls.txt --concurrency 2
   ```

2. **Increase timeout:**
   ```bash
   link-extractor --batch urls.txt --timeout 60000
   ```

3. **Check for problematic URLs in the batch:**
   - Test each URL individually
   - Remove or fix problematic URLs

4. **Enable verbose mode to see where it hangs:**
   ```bash
   link-extractor --batch urls.txt --verbose
   ```

## Output Issues

### Issue: Output file is empty

**Symptoms:**
- File is created but has 0 bytes
- File exists but contains no data

**Solutions:**

1. **Check if extraction succeeded:**
   ```bash
   link-extractor https://example.com --verbose --output results.json
   ```

2. **Verify write permissions:**
   ```bash
   ls -la results.json
   ```

3. **Try writing to a different location:**
   ```bash
   link-extractor https://example.com --output /tmp/results.json
   ```

### Issue: CSV format has encoding issues

**Symptoms:**
- Special characters appear garbled
- Non-ASCII characters display incorrectly

**Solutions:**

1. **Open CSV with UTF-8 encoding:**
   - In Excel: Data > Get Data > From Text/CSV > File Origin: UTF-8
   - In Google Sheets: File > Import > Upload > Character encoding: UTF-8

2. **Convert encoding if needed:**
   ```bash
   iconv -f UTF-8 -t ISO-8859-1 input.csv > output.csv
   ```

### Issue: JSON output is not valid

**Symptoms:**
```
SyntaxError: Unexpected token in JSON
```

**Solutions:**

1. **Validate JSON:**
   ```bash
   cat output.json | jq .
   ```

2. **Check if file is complete:**
   - Ensure extraction finished
   - Check file size

3. **Re-run extraction:**
   ```bash
   link-extractor https://example.com --format json --output results.json
   ```

## Authentication Issues

### Issue: Cookies not working

**Symptoms:**
- Still getting 401/403 with cookies set
- Session appears invalid

**Solutions:**

1. **Verify cookie format:**
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

2. **Check cookie domain matches URL domain**

3. **Ensure cookie hasn't expired**

4. **Try getting fresh cookies from browser:**
   - Open browser DevTools
   - Go to Application > Cookies
   - Copy cookie values

### Issue: Custom headers not being sent

**Symptoms:**
- Server doesn't recognize authentication
- Headers appear to be ignored

**Solutions:**

1. **Verify header format in config:**
   ```json
   {
     "headers": {
       "Authorization": "Bearer token123",
       "X-Custom-Header": "value"
     }
   }
   ```

2. **Check header names are correct** (case-sensitive)

3. **Use verbose mode to debug:**
   ```bash
   link-extractor https://example.com --config auth.json --verbose
   ```

## Network Issues

### Issue: Proxy connection fails

**Symptoms:**
```
Error: Proxy connection failed
```

**Solutions:**

1. **Verify proxy URL format:**
   ```bash
   link-extractor https://example.com --proxy http://proxy.example.com:8080
   ```

2. **Test proxy separately:**
   ```bash
   curl -x http://proxy.example.com:8080 https://example.com
   ```

3. **Check proxy authentication if required:**
   ```bash
   link-extractor https://example.com --proxy http://user:pass@proxy.example.com:8080
   ```

4. **Verify proxy is accessible from your network**

### Issue: SSL/TLS errors

**Symptoms:**
```
Error: certificate has expired
Error: self signed certificate
```

**Solutions:**

1. **For development/testing only, you can bypass SSL verification** (not recommended for production)

2. **Update system certificates:**
   ```bash
   # On Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install ca-certificates
   ```

3. **Check if the site's SSL certificate is valid:**
   ```bash
   openssl s_client -connect example.com:443
   ```

### Issue: DNS resolution fails

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND example.com
```

**Solutions:**

1. **Check DNS settings:**
   ```bash
   nslookup example.com
   ```

2. **Try using a different DNS server:**
   - Change system DNS to 8.8.8.8 (Google DNS)
   - Or 1.1.1.1 (Cloudflare DNS)

3. **Check /etc/hosts file for conflicts**

4. **Verify domain exists and is accessible**

## Browser Issues

### Issue: Browser fails to launch

**Symptoms:**
```
Error: Failed to launch browser
```

**Solutions:**

1. **Reinstall Playwright browsers:**
   ```bash
   npx playwright install --force
   ```

2. **Check system dependencies:**
   ```bash
   # On Ubuntu/Debian
   npx playwright install-deps
   ```

3. **Try a different browser:**
   - Playwright uses Chromium by default
   - Check if Chromium is installed

4. **Check for permission issues:**
   ```bash
   ls -la ~/.cache/ms-playwright/
   ```

### Issue: Browser crashes during extraction

**Symptoms:**
- Extraction stops unexpectedly
- "Browser closed" error

**Solutions:**

1. **Increase system resources:**
   - Close other applications
   - Increase available RAM

2. **Reduce concurrency:**
   ```bash
   link-extractor --batch urls.txt --concurrency 1
   ```

3. **Update Playwright:**
   ```bash
   npm update playwright
   ```

4. **Check system logs for crashes**

## Debug Mode

For any issue, enable verbose mode to get detailed logs:

```bash
link-extractor https://example.com --verbose
```

This will show:
- Page load progress
- Link extraction details
- Error stack traces
- Timing information

## Getting Help

If you can't resolve your issue:

1. **Check existing issues on GitHub**

2. **Create a new issue with:**
   - Full error message
   - Command you ran
   - Output with `--verbose` flag
   - Node.js version (`node --version`)
   - Operating system

3. **Provide a minimal reproduction:**
   - Simplest command that reproduces the issue
   - Sample URL if possible (or describe the page structure)

## Common Error Messages Reference

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| `TimeoutError` | Page loads slowly | Increase `--timeout` |
| `NetworkError` | Connection failed | Check internet/proxy |
| `AuthenticationError` | Auth required | Add headers/cookies |
| `ValidationError` | Invalid input | Check command syntax |
| `ParseError` | Page structure issue | Check page in browser |
| `ENOTFOUND` | DNS failure | Check domain exists |
| `ECONNREFUSED` | Server refused | Check URL is correct |
| `EACCES` | Permission denied | Check file permissions |

## Performance Tuning

For optimal performance:

1. **Single URL extraction:**
   ```bash
   link-extractor https://example.com --timeout 30000
   ```

2. **Batch processing (fast):**
   ```bash
   link-extractor --batch urls.txt --concurrency 5 --timeout 20000
   ```

3. **Batch processing (reliable):**
   ```bash
   link-extractor --batch urls.txt --concurrency 2 --timeout 60000
   ```

4. **With metadata (slower but detailed):**
   ```bash
   link-extractor https://example.com --include-metadata --timeout 45000
   ```
