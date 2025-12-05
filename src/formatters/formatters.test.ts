/**
 * Tests for output formatters
 */

import { describe, it, expect } from 'vitest';
import { JSONFormatter } from './JSONFormatter';
import { CSVFormatter } from './CSVFormatter';
import { MarkdownFormatter } from './MarkdownFormatter';
import { TextFormatter } from './TextFormatter';
import { getFormatter } from './index';
import { ExtractionResult, Link } from '../types';

// Helper to create test data
function createTestResult(): ExtractionResult {
  const link1: Link = {
    url: 'https://example.com/page1',
    description: 'Example Page 1',
    anchorText: 'Page 1',
    title: 'Example Title',
    protocol: 'https',
    isInternal: true,
    isExternal: false,
    attributes: {
      rel: 'nofollow',
      target: '_blank',
      ariaLabel: 'Link to page 1',
      dataAttributes: {}
    },
    metadata: {
      occurrences: 1,
      hasNoFollow: true,
      parentContext: 'div',
      position: 0
    }
  };

  const link2: Link = {
    url: 'https://external.com/page2',
    description: 'External Page',
    anchorText: 'External',
    protocol: 'https',
    isInternal: false,
    isExternal: true,
    attributes: {
      dataAttributes: {}
    },
    metadata: {
      occurrences: 1,
      hasNoFollow: false,
      parentContext: 'nav',
      position: 1
    }
  };

  return {
    sourceUrl: 'https://example.com',
    timestamp: new Date('2024-01-01T00:00:00Z'),
    links: [link1, link2],
    statistics: {
      totalLinks: 2,
      uniqueLinks: 2,
      internalLinks: 1,
      externalLinks: 1,
      protocolBreakdown: { https: 2 }
    },
    errors: []
  };
}

describe('Formatters', () => {
  describe('JSONFormatter', () => {
    it('should format result as JSON', () => {
      const formatter = new JSONFormatter();
      const result = createTestResult();
      const output = formatter.format(result);
      
      expect(output).toContain('"sourceUrl": "https://example.com"');
      expect(output).toContain('"url": "https://example.com/page1"');
      expect(output).toContain('"description": "Example Page 1"');
      
      // Verify it's valid JSON
      const parsed = JSON.parse(output);
      expect(parsed.sourceUrl).toBe('https://example.com');
      expect(parsed.links).toHaveLength(2);
    });
  });

  describe('CSVFormatter', () => {
    it('should format result as CSV', () => {
      const formatter = new CSVFormatter();
      const result = createTestResult();
      const output = formatter.format(result);
      
      expect(output).toContain('URL,Description,Anchor Text,Protocol,Type,Title');
      expect(output).toContain('https://example.com/page1');
      expect(output).toContain('Example Page 1');
      expect(output).toContain('Internal');
      expect(output).toContain('External');
    });

    it('should escape CSV special characters', () => {
      const formatter = new CSVFormatter();
      const result = createTestResult();
      result.links[0].description = 'Text with, comma';
      result.links[1].description = 'Text with "quotes"';
      
      const output = formatter.format(result);
      
      expect(output).toContain('"Text with, comma"');
      expect(output).toContain('"Text with ""quotes"""');
    });
  });

  describe('MarkdownFormatter', () => {
    it('should format result as Markdown', () => {
      const formatter = new MarkdownFormatter();
      const result = createTestResult();
      const output = formatter.format(result);
      
      expect(output).toContain('# Links from https://example.com');
      expect(output).toContain('## Statistics');
      expect(output).toContain('- Total Links: 2');
      expect(output).toContain('## Internal Links');
      expect(output).toContain('## External Links');
      expect(output).toContain('[Example Page 1](https://example.com/page1)');
      expect(output).toContain('[External Page](https://external.com/page2)');
    });
  });

  describe('TextFormatter', () => {
    it('should format result as plain text', () => {
      const formatter = new TextFormatter();
      const result = createTestResult();
      const output = formatter.format(result);
      
      expect(output).toContain('Links extracted from: https://example.com');
      expect(output).toContain('Statistics:');
      expect(output).toContain('Total Links: 2');
      expect(output).toContain('1. Example Page 1');
      expect(output).toContain('URL: https://example.com/page1');
      expect(output).toContain('Type: Internal');
      expect(output).toContain('2. External Page');
      expect(output).toContain('Type: External');
    });
  });

  describe('getFormatter', () => {
    it('should return JSONFormatter for json format', () => {
      const formatter = getFormatter('json');
      expect(formatter).toBeInstanceOf(JSONFormatter);
    });

    it('should return CSVFormatter for csv format', () => {
      const formatter = getFormatter('csv');
      expect(formatter).toBeInstanceOf(CSVFormatter);
    });

    it('should return MarkdownFormatter for markdown format', () => {
      const formatter = getFormatter('markdown');
      expect(formatter).toBeInstanceOf(MarkdownFormatter);
    });

    it('should return TextFormatter for text format', () => {
      const formatter = getFormatter('text');
      expect(formatter).toBeInstanceOf(TextFormatter);
    });

    it('should default to TextFormatter when no format specified', () => {
      const formatter = getFormatter();
      expect(formatter).toBeInstanceOf(TextFormatter);
    });
  });
});
