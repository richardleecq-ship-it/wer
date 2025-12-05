#!/usr/bin/env node

/**
 * Output formats example for web-link-extractor
 * 
 * This example demonstrates:
 * - Using different output formatters
 * - Saving results to files
 * - Working with formatted output
 */

const { LinkExtractorService } = require('../dist/services/LinkExtractorService');
const { getFormatter } = require('../dist/formatters');
const fs = require('fs/promises');

async function main() {
  const extractor = new LinkExtractorService();
  
  try {
    const url = 'https://example.com';
    
    console.log(`Extracting links from ${url}...\n`);
    
    // Extract links once
    const result = await extractor.extract(url, {
      timeout: 30000,
      includeMetadata: true
    });
    
    console.log(`Found ${result.statistics.totalLinks} links\n`);
    
    // Example 1: JSON format
    console.log('=== JSON Format ===\n');
    const jsonFormatter = getFormatter('json');
    const jsonOutput = jsonFormatter.format(result);
    await fs.writeFile('output-example.json', jsonOutput, 'utf-8');
    console.log('Saved to output-example.json');
    console.log('Preview:');
    console.log(jsonOutput.substring(0, 200) + '...\n');
    
    // Example 2: CSV format
    console.log('=== CSV Format ===\n');
    const csvFormatter = getFormatter('csv');
    const csvOutput = csvFormatter.format(result);
    await fs.writeFile('output-example.csv', csvOutput, 'utf-8');
    console.log('Saved to output-example.csv');
    console.log('Preview:');
    console.log(csvOutput.split('\n').slice(0, 5).join('\n') + '\n...\n');
    
    // Example 3: Markdown format
    console.log('=== Markdown Format ===\n');
    const markdownFormatter = getFormatter('markdown');
    const markdownOutput = markdownFormatter.format(result);
    await fs.writeFile('output-example.md', markdownOutput, 'utf-8');
    console.log('Saved to output-example.md');
    console.log('Preview:');
    console.log(markdownOutput.split('\n').slice(0, 15).join('\n') + '\n...\n');
    
    // Example 4: Text format
    console.log('=== Text Format ===\n');
    const textFormatter = getFormatter('text');
    const textOutput = textFormatter.format(result);
    await fs.writeFile('output-example.txt', textOutput, 'utf-8');
    console.log('Saved to output-example.txt');
    console.log('Preview:');
    console.log(textOutput.split('\n').slice(0, 15).join('\n') + '\n...\n');
    
    console.log('All output examples created successfully!');
    console.log('\nFiles created:');
    console.log('  - output-example.json');
    console.log('  - output-example.csv');
    console.log('  - output-example.md');
    console.log('  - output-example.txt');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await extractor.close();
  }
}

main();
