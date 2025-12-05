#!/usr/bin/env node

/**
 * Batch processing example for web-link-extractor
 * 
 * This example demonstrates:
 * - Processing multiple URLs from a file
 * - Controlling concurrency
 * - Handling errors in batch processing
 * - Accessing batch summary
 */

const { BatchProcessorService } = require('../dist/services/BatchProcessorService');
const fs = require('fs/promises');

async function main() {
  // Create a sample URLs file
  const urlsFile = 'example-urls.txt';
  const urls = [
    'https://example.com',
    'https://example.org',
    'https://example.net',
    'https://www.iana.org/domains/reserved'
  ];
  
  await fs.writeFile(urlsFile, urls.join('\n'), 'utf-8');
  console.log(`Created ${urlsFile} with ${urls.length} URLs\n`);
  
  const batchProcessor = new BatchProcessorService();
  
  try {
    console.log('=== Batch Processing Example ===\n');
    console.log('Processing URLs with concurrency of 2...\n');
    
    const startTime = Date.now();
    
    // Process batch with options
    const result = await batchProcessor.processBatch(urlsFile, {
      concurrency: 2,
      timeout: 30000,
      includeMetadata: false,
      verbose: false
    });
    
    const duration = Date.now() - startTime;
    
    // Display summary
    console.log('\n=== Batch Summary ===\n');
    console.log(`Total URLs: ${result.summary.totalUrls}`);
    console.log(`Successful: ${result.summary.successfulUrls}`);
    console.log(`Failed: ${result.summary.failedUrls}`);
    console.log(`Total links extracted: ${result.summary.totalLinks}`);
    console.log(`Processing time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Average time per URL: ${(duration / result.summary.totalUrls / 1000).toFixed(2)}s`);
    
    // Display results for each URL
    console.log('\n=== Individual Results ===\n');
    result.results.forEach((urlResult, index) => {
      console.log(`${index + 1}. ${urlResult.sourceUrl}`);
      console.log(`   Links found: ${urlResult.statistics.totalLinks}`);
      console.log(`   Internal: ${urlResult.statistics.internalLinks}`);
      console.log(`   External: ${urlResult.statistics.externalLinks}`);
      
      if (urlResult.errors.length > 0) {
        console.log(`   Errors: ${urlResult.errors.length}`);
        urlResult.errors.forEach(error => {
          console.log(`     - ${error.message}`);
        });
      }
      console.log('');
    });
    
    // Display any failed URLs
    if (result.summary.errors.length > 0) {
      console.log('=== Failed URLs ===\n');
      result.summary.errors.forEach(({ url, error }) => {
        console.log(`${url}`);
        console.log(`  Error: ${error.message}\n`);
      });
    }
    
    // Example: Filter results to find URLs with most links
    console.log('=== URLs with Most Links ===\n');
    const sortedResults = [...result.results].sort(
      (a, b) => b.statistics.totalLinks - a.statistics.totalLinks
    );
    sortedResults.slice(0, 3).forEach((urlResult, index) => {
      console.log(`${index + 1}. ${urlResult.sourceUrl}`);
      console.log(`   ${urlResult.statistics.totalLinks} links\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await batchProcessor.close();
    
    // Clean up example file
    try {
      await fs.unlink(urlsFile);
      console.log(`Cleaned up ${urlsFile}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

main();
