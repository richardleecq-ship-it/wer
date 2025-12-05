#!/usr/bin/env node

/**
 * Advanced options example for web-link-extractor
 * 
 * This example demonstrates:
 * - Custom timeouts and wait conditions
 * - Custom User-Agent
 * - Metadata collection
 * - Error handling
 */

const { LinkExtractorService } = require('../dist/services/LinkExtractorService');

async function main() {
  const extractor = new LinkExtractorService();
  
  try {
    const url = 'https://example.com';
    
    // Example 1: Custom timeout and wait for selector
    console.log('=== Example 1: Custom Timeout & Wait ===\n');
    const result1 = await extractor.extract(url, {
      timeout: 60000,  // 60 seconds
      waitForSelector: 'body',  // Wait for body element
      verbose: true
    });
    console.log(`Extracted ${result1.links.length} links\n`);
    
    // Example 2: Custom User-Agent
    console.log('=== Example 2: Custom User-Agent ===\n');
    const result2 = await extractor.extract(url, {
      userAgent: 'MyCustomBot/1.0 (compatible; LinkExtractor/1.0)',
      verbose: true
    });
    console.log(`Extracted ${result2.links.length} links with custom UA\n`);
    
    // Example 3: Include detailed metadata
    console.log('=== Example 3: Detailed Metadata ===\n');
    const result3 = await extractor.extract(url, {
      includeMetadata: true
    });
    
    console.log('Sample link with metadata:');
    if (result3.links.length > 0) {
      const sampleLink = result3.links[0];
      console.log(`  URL: ${sampleLink.url}`);
      console.log(`  Description: ${sampleLink.description}`);
      console.log(`  Occurrences: ${sampleLink.metadata.occurrences}`);
      console.log(`  Has nofollow: ${sampleLink.metadata.hasNoFollow}`);
      console.log(`  Parent context: ${sampleLink.metadata.parentContext}`);
      console.log(`  Position: ${sampleLink.metadata.position}`);
      
      if (sampleLink.attributes.rel) {
        console.log(`  Rel attribute: ${sampleLink.attributes.rel}`);
      }
      if (sampleLink.attributes.target) {
        console.log(`  Target attribute: ${sampleLink.attributes.target}`);
      }
    }
    console.log('');
    
    // Example 4: Error handling with retry
    console.log('=== Example 4: Error Handling ===\n');
    try {
      // Try to extract from an invalid URL
      await extractor.extract('https://this-domain-definitely-does-not-exist-12345.com', {
        timeout: 10000
      });
    } catch (error) {
      console.log('Caught expected error:');
      console.log(`  Type: ${error.name}`);
      console.log(`  Message: ${error.message}`);
      
      if (error.url) {
        console.log(`  URL: ${error.url}`);
      }
      if (error.statusCode) {
        console.log(`  Status Code: ${error.statusCode}`);
      }
    }
    console.log('');
    
    // Example 5: Combining multiple advanced options
    console.log('=== Example 5: Combined Advanced Options ===\n');
    const result5 = await extractor.extract(url, {
      timeout: 45000,
      waitForSelector: 'body',
      userAgent: 'AdvancedBot/2.0',
      includeMetadata: true,
      verbose: false,
      filter: {
        internalOnly: true,
        protocols: ['https']
      }
    });
    
    console.log('Results with combined options:');
    console.log(`  Total links: ${result5.statistics.totalLinks}`);
    console.log(`  Internal HTTPS links: ${result5.links.length}`);
    console.log(`  Protocol breakdown:`, result5.statistics.protocolBreakdown);
    
    // Show links with most occurrences
    const sortedByOccurrences = [...result5.links].sort(
      (a, b) => b.metadata.occurrences - a.metadata.occurrences
    );
    
    console.log('\n  Top 3 most frequent links:');
    sortedByOccurrences.slice(0, 3).forEach((link, index) => {
      console.log(`    ${index + 1}. ${link.description} (${link.metadata.occurrences} times)`);
      console.log(`       ${link.url}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await extractor.close();
  }
}

main();
