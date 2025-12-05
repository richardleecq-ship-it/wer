/**
 * Integration tests for the web link extractor
 * Tests the complete system with real web pages
 * 
 * Requirements: All requirements
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LinkExtractorService } from './services/LinkExtractorService';
import { BatchProcessorService } from './services/BatchProcessorService';
import { ExtractionOptions, FilterCriteria } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Integration Tests - Real Web Pages', () => {
  let extractor: LinkExtractorService;
  let batchProcessor: BatchProcessorService;

  beforeAll(() => {
    extractor = new LinkExtractorService();
    batchProcessor = new BatchProcessorService();
  });

  afterAll(async () => {
    await extractor.close();
    await batchProcessor.close();
  });

  describe('Single URL Extraction', () => {
    it('should extract links from example.com', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
        includeMetadata: true,
      });

      // Verify basic structure
      expect(result).toBeDefined();
      expect(result.sourceUrl).toBe('https://example.com');
      expect(result.links).toBeInstanceOf(Array);
      expect(result.statistics).toBeDefined();
      expect(result.errors).toBeInstanceOf(Array);

      // Verify statistics
      expect(result.statistics.totalLinks).toBeGreaterThanOrEqual(0);
      expect(result.statistics.uniqueLinks).toBeLessThanOrEqual(result.statistics.totalLinks);

      // Verify each link has required properties
      for (const link of result.links) {
        expect(link.url).toBeDefined();
        expect(typeof link.url).toBe('string');
        expect(link.description).toBeDefined();
        expect(typeof link.description).toBe('string');
        expect(link.protocol).toBeDefined();
        expect(typeof link.isInternal).toBe('boolean');
        expect(typeof link.isExternal).toBe('boolean');
      }
    }, 60000);

    it('should extract links from a page with dynamic content', async () => {
      // Using a page known to have JavaScript-rendered content
      const result = await extractor.extract('https://www.wikipedia.org', {
        timeout: 30000,
        includeMetadata: true,
      });

      expect(result).toBeDefined();
      expect(result.links.length).toBeGreaterThan(0);
      
      // Verify links are properly extracted
      const hasValidLinks = result.links.some(link => 
        link.url.startsWith('http') && link.description.length > 0
      );
      expect(hasValidLinks).toBe(true);
    }, 60000);

    it('should handle pages with various link types', async () => {
      // GitHub has various types of links (internal, external, anchors, etc.)
      const result = await extractor.extract('https://github.com', {
        timeout: 30000,
        includeMetadata: true,
      });

      expect(result).toBeDefined();
      expect(result.links.length).toBeGreaterThan(0);

      // Check for protocol breakdown
      expect(result.statistics.protocolBreakdown).toBeDefined();
      expect(result.statistics.protocolBreakdown['https']).toBeGreaterThan(0);

      // Verify internal/external classification
      const internalCount = result.links.filter(l => l.isInternal).length;
      const externalCount = result.links.filter(l => l.isExternal).length;
      expect(internalCount + externalCount).toBe(result.links.length);
    }, 60000);
  });

  describe('Filtering Functionality', () => {
    it('should filter internal links only', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
        filter: {
          internalOnly: true,
        },
      });

      // All links should be internal
      for (const link of result.links) {
        expect(link.isInternal).toBe(true);
      }
    }, 60000);

    it('should filter external links only', async () => {
      const result = await extractor.extract('https://www.wikipedia.org', {
        timeout: 30000,
        filter: {
          externalOnly: true,
        },
      });

      // All links should be external
      for (const link of result.links) {
        expect(link.isExternal).toBe(true);
      }
    }, 60000);

    it('should filter by protocol', async () => {
      const result = await extractor.extract('https://github.com', {
        timeout: 30000,
        filter: {
          protocols: ['https'],
        },
      });

      // All links should use https protocol
      for (const link of result.links) {
        expect(link.protocol).toBe('https');
      }
    }, 60000);

    it('should filter by URL pattern', async () => {
      const result = await extractor.extract('https://github.com', {
        timeout: 30000,
        filter: {
          urlPattern: 'github\\.com',
        },
      });

      // All links should match the pattern
      for (const link of result.links) {
        expect(link.url).toMatch(/github\.com/);
      }
    }, 60000);
  });

  describe('Metadata Collection', () => {
    it('should collect detailed metadata when enabled', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
        includeMetadata: true,
      });

      // Check that metadata is present
      for (const link of result.links) {
        expect(link.metadata).toBeDefined();
        expect(typeof link.metadata.occurrences).toBe('number');
        expect(typeof link.metadata.hasNoFollow).toBe('boolean');
        expect(link.metadata.parentContext).toBeDefined();
      }
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      const result = await extractor.extract('not-a-valid-url', { timeout: 10000 });
      
      // Should return a result with errors
      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.links.length).toBe(0);
    }, 30000);

    it('should handle timeout errors', async () => {
      const result = await extractor.extract('https://example.com', { timeout: 1 });
      
      // Should return a result with timeout error
      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.links.length).toBe(0);
    }, 30000);

    it('should handle non-existent domains', async () => {
      const result = await extractor.extract(
        'https://this-domain-definitely-does-not-exist-12345.com',
        { timeout: 10000 }
      );
      
      // Should return a result with network error
      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.links.length).toBe(0);
    }, 30000);
  });

  describe('Batch Processing', () => {
    const testUrlsFile = 'test-urls-integration.txt';

    beforeAll(async () => {
      // Create a test URLs file
      const urls = [
        'https://example.com',
        'https://www.wikipedia.org',
        'https://github.com',
      ];
      await fs.writeFile(testUrlsFile, urls.join('\n'), 'utf-8');
    });

    afterAll(async () => {
      // Clean up test file
      try {
        await fs.unlink(testUrlsFile);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('should process multiple URLs from a file', async () => {
      const result = await batchProcessor.processBatch(testUrlsFile, {
        timeout: 30000,
        concurrency: 2,
      });

      expect(result).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(3);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalUrls).toBe(3);
      expect(result.summary.successfulUrls).toBeGreaterThan(0);
    }, 120000);

    it('should handle mixed valid and invalid URLs', async () => {
      const mixedUrlsFile = 'test-urls-mixed.txt';
      const urls = [
        'https://example.com',
        'not-a-valid-url',
        'https://www.wikipedia.org',
      ];
      await fs.writeFile(mixedUrlsFile, urls.join('\n'), 'utf-8');

      const result = await batchProcessor.processBatch(mixedUrlsFile, {
        timeout: 30000,
        concurrency: 2,
      });

      expect(result.summary.totalUrls).toBe(3);
      expect(result.summary.failedUrls).toBeGreaterThan(0);
      expect(result.summary.successfulUrls).toBeGreaterThan(0);
      expect(result.summary.errors.length).toBeGreaterThan(0);

      // Clean up
      await fs.unlink(mixedUrlsFile);
    }, 120000);

    it('should respect concurrency limits', async () => {
      const result = await batchProcessor.processBatch(testUrlsFile, {
        timeout: 30000,
        concurrency: 1, // Process one at a time
      });

      expect(result.results.length).toBe(3);
      // All should complete even with concurrency of 1
      expect(result.summary.totalUrls).toBe(3);
    }, 120000);
  });

  describe('URL Normalization', () => {
    it('should normalize relative URLs to absolute', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
      });

      // All URLs should be absolute
      for (const link of result.links) {
        expect(link.url).toMatch(/^[a-z]+:\/\//);
      }
    }, 60000);

    it('should preserve query parameters and hash fragments', async () => {
      const result = await extractor.extract('https://github.com', {
        timeout: 30000,
      });

      // Check if any links have query params or hashes (they should be preserved)
      const linksWithParams = result.links.filter(l => 
        l.url.includes('?') || l.url.includes('#')
      );
      
      // If there are links with params/hashes, verify they're properly formatted
      for (const link of linksWithParams) {
        expect(link.url).toMatch(/^https?:\/\//);
      }
    }, 60000);
  });

  describe('Description Generation', () => {
    it('should generate descriptions for all links', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
      });

      // Every link should have a non-empty description
      for (const link of result.links) {
        expect(link.description).toBeDefined();
        expect(link.description.length).toBeGreaterThan(0);
      }
    }, 60000);

    it('should extract anchor text when available', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
      });

      // At least some links should have anchor text
      const linksWithAnchorText = result.links.filter(l => 
        l.anchorText && l.anchorText.length > 0
      );
      expect(linksWithAnchorText.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('Statistics Generation', () => {
    it('should generate accurate statistics', async () => {
      const result = await extractor.extract('https://example.com', {
        timeout: 30000,
      });

      const stats = result.statistics;
      
      // Verify statistics consistency
      expect(stats.uniqueLinks).toBe(result.links.length);
      expect(stats.internalLinks + stats.externalLinks).toBe(stats.uniqueLinks);
      
      // Protocol breakdown should sum to total unique links
      const protocolSum = Object.values(stats.protocolBreakdown).reduce(
        (sum, count) => sum + count,
        0
      );
      expect(protocolSum).toBe(stats.uniqueLinks);
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete extraction within reasonable time', async () => {
      const startTime = Date.now();
      
      await extractor.extract('https://example.com', {
        timeout: 30000,
      });
      
      const duration = Date.now() - startTime;
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    }, 60000);

    it('should handle large pages efficiently', async () => {
      const startTime = Date.now();
      
      // Wikipedia pages tend to have many links
      const result = await extractor.extract('https://www.wikipedia.org', {
        timeout: 30000,
      });
      
      const duration = Date.now() - startTime;
      
      expect(result.links.length).toBeGreaterThan(0);
      // Should complete within 30 seconds even for large pages
      expect(duration).toBeLessThan(30000);
    }, 60000);
  });
});
