#!/usr/bin/env node

/**
 * Filtering example for web-link-extractor
 * 
 * This example demonstrates:
 * - Filtering links by domain
 * - Filtering internal/external links
 * - Filtering by URL pattern
 * - Filtering by protocol
 */

const { LinkExtractorService } = require('../dist/services/LinkExtractorService');

async function main() {
  const extractor = new LinkExtractorService();
  
  try {
    const url = 'https://example.com';
    
    // Example 1: Extract only internal links
    console.log('=== Example 1: Internal Links Only ===\n');
    const internalResult = await extractor.extract(url, {
      filter: {
        internalOnly: true
      }
    });
    console.log(`Found ${internalResult.links.length} internal links`);
    internalResult.links.slice(0, 3).forEach(link => {
      console.log(`  - ${link.description}: ${link.url}`);
    });
    
    // Example 2: Extract only external links
    console.log('\n=== Example 2: External Links Only ===\n');
    const externalResult = await extractor.extract(url, {
      filter: {
        externalOnly: true
      }
    });
    console.log(`Found ${externalResult.links.length} external links`);
    externalResult.links.slice(0, 3).forEach(link => {
      console.log(`  - ${link.description}: ${link.url}`);
    });
    
    // Example 3: Filter by specific domains
    console.log('\n=== Example 3: Filter by Domains ===\n');
    const domainResult = await extractor.extract(url, {
      filter: {
        domains: ['example.com', 'example.org']
      }
    });
    console.log(`Found ${domainResult.links.length} links from specified domains`);
    domainResult.links.slice(0, 3).forEach(link => {
      console.log(`  - ${link.description}: ${link.url}`);
    });
    
    // Example 4: Exclude specific domains
    console.log('\n=== Example 4: Exclude Domains ===\n');
    const excludeResult = await extractor.extract(url, {
      filter: {
        excludeDomains: ['ads.example.com', 'tracker.example.com']
      }
    });
    console.log(`Found ${excludeResult.links.length} links (excluding specified domains)`);
    
    // Example 5: Filter by URL pattern (regex)
    console.log('\n=== Example 5: Filter by URL Pattern ===\n');
    const patternResult = await extractor.extract(url, {
      filter: {
        urlPattern: '.*\\.pdf$'  // Only PDF links
      }
    });
    console.log(`Found ${patternResult.links.length} PDF links`);
    patternResult.links.forEach(link => {
      console.log(`  - ${link.description}: ${link.url}`);
    });
    
    // Example 6: Filter by protocols
    console.log('\n=== Example 6: Filter by Protocols ===\n');
    const protocolResult = await extractor.extract(url, {
      filter: {
        protocols: ['https']  // Only HTTPS links
      }
    });
    console.log(`Found ${protocolResult.links.length} HTTPS links`);
    
    // Example 7: Combine multiple filters
    console.log('\n=== Example 7: Combined Filters ===\n');
    const combinedResult = await extractor.extract(url, {
      filter: {
        internalOnly: true,
        protocols: ['https'],
        urlPattern: '^https://example\\.com/blog/.*'
      }
    });
    console.log(`Found ${combinedResult.links.length} links matching all criteria`);
    combinedResult.links.forEach(link => {
      console.log(`  - ${link.description}: ${link.url}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await extractor.close();
  }
}

main();
