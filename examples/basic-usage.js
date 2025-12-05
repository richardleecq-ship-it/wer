#!/usr/bin/env node

/**
 * Basic usage example for web-link-extractor
 * 
 * This example demonstrates:
 * - Extracting links from a single URL
 * - Accessing link information
 * - Displaying statistics
 */

const { LinkExtractorService } = require('../dist/services/LinkExtractorService');

async function main() {
  const extractor = new LinkExtractorService();
  
  try {
    console.log('Extracting links from https://example.com...\n');
    
    // Extract links with basic options
    const result = await extractor.extract('https://example.com', {
      timeout: 30000,
      verbose: true
    });
    
    // Display results
    console.log('\n=== Extraction Results ===\n');
    console.log(`Source URL: ${result.sourceUrl}`);
    console.log(`Extracted at: ${result.timestamp}`);
    console.log(`Total links found: ${result.statistics.totalLinks}`);
    console.log(`Unique links: ${result.statistics.uniqueLinks}`);
    console.log(`Internal links: ${result.statistics.internalLinks}`);
    console.log(`External links: ${result.statistics.externalLinks}`);
    
    // Display protocol breakdown
    console.log('\nProtocol breakdown:');
    for (const [protocol, count] of Object.entries(result.statistics.protocolBreakdown)) {
      console.log(`  ${protocol}: ${count}`);
    }
    
    // Display first 5 links
    console.log('\nFirst 5 links:');
    result.links.slice(0, 5).forEach((link, index) => {
      console.log(`\n${index + 1}. ${link.description}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   Type: ${link.isInternal ? 'Internal' : 'External'}`);
      console.log(`   Protocol: ${link.protocol}`);
    });
    
    // Display any errors
    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach(error => {
        console.log(`  - ${error.message}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    // Always close the browser
    await extractor.close();
  }
}

main();
