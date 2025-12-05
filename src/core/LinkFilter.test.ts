import { describe, it, expect } from 'vitest';
import { LinkFilter } from './LinkFilter';
import { Link, FilterCriteria } from '../types';

describe('LinkFilter', () => {
  const filter = new LinkFilter();

  // Helper to create a test link
  const createLink = (url: string, isInternal: boolean = false): Link => ({
    url,
    description: 'Test link',
    anchorText: 'Test',
    protocol: new URL(url).protocol.replace(':', ''),
    isInternal,
    isExternal: !isInternal,
    attributes: {
      dataAttributes: {}
    },
    metadata: {
      occurrences: 1,
      hasNoFollow: false,
      parentContext: 'div',
      position: 0
    }
  });

  describe('isInternalLink', () => {
    it('should identify internal links correctly', () => {
      expect(filter.isInternalLink('https://example.com/page', 'https://example.com')).toBe(true);
      expect(filter.isInternalLink('https://example.com/page', 'https://example.com/other')).toBe(true);
    });

    it('should identify external links correctly', () => {
      expect(filter.isInternalLink('https://other.com/page', 'https://example.com')).toBe(false);
      expect(filter.isInternalLink('https://sub.example.com', 'https://example.com')).toBe(false);
    });

    it('should handle invalid URLs', () => {
      expect(filter.isInternalLink('invalid-url', 'https://example.com')).toBe(false);
    });
  });

  describe('matchesPattern', () => {
    it('should match URL patterns correctly', () => {
      expect(filter.matchesPattern('https://example.com/api/users', '/api/')).toBe(true);
      expect(filter.matchesPattern('https://example.com/page', '/api/')).toBe(false);
    });

    it('should handle regex patterns', () => {
      expect(filter.matchesPattern('https://example.com/page123', '\\d+')).toBe(true);
      expect(filter.matchesPattern('https://example.com/page', '\\d+')).toBe(false);
    });

    it('should handle invalid regex patterns', () => {
      expect(filter.matchesPattern('https://example.com', '[')).toBe(false);
    });
  });

  describe('filterByDomain', () => {
    const links = [
      createLink('https://example.com/page1'),
      createLink('https://test.com/page2'),
      createLink('https://sub.example.com/page3'),
    ];

    it('should filter by exact domain', () => {
      const result = filter.filterByDomain(links, ['example.com']);
      expect(result).toHaveLength(2);
      expect(result.map(l => l.url)).toContain('https://example.com/page1');
      expect(result.map(l => l.url)).toContain('https://sub.example.com/page3');
    });

    it('should filter by multiple domains', () => {
      const result = filter.filterByDomain(links, ['example.com', 'test.com']);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no domains match', () => {
      const result = filter.filterByDomain(links, ['other.com']);
      expect(result).toHaveLength(0);
    });
  });

  describe('filter', () => {
    const links = [
      createLink('https://example.com/page1', true),
      createLink('https://other.com/page2', false),
      createLink('https://example.com/api/users', true),
      createLink('mailto:test@example.com', false),
    ];

    it('should filter internal links only', () => {
      const criteria: FilterCriteria = { internalOnly: true };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(2);
      expect(result.every(l => l.isInternal)).toBe(true);
    });

    it('should filter external links only', () => {
      const criteria: FilterCriteria = { externalOnly: true };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(2);
      expect(result.every(l => l.isExternal)).toBe(true);
    });

    it('should filter by domain', () => {
      const criteria: FilterCriteria = { domains: ['example.com'] };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(2);
    });

    it('should exclude domains', () => {
      const criteria: FilterCriteria = { excludeDomains: ['other.com'] };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(3);
    });

    it('should filter by URL pattern', () => {
      const criteria: FilterCriteria = { urlPattern: '/api/' };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com/api/users');
    });

    it('should filter by protocol', () => {
      const criteria: FilterCriteria = { protocols: ['https'] };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(3);
    });

    it('should apply multiple filters', () => {
      const criteria: FilterCriteria = {
        internalOnly: true,
        urlPattern: '/api/'
      };
      const result = filter.filter(links, criteria);
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com/api/users');
    });
  });

  describe('classifyLinks', () => {
    const links = [
      createLink('https://example.com/page1', true),
      createLink('https://other.com/page2', false),
      createLink('https://example.com/page3', true),
    ];

    it('should classify links into internal and external', () => {
      const result = filter.classifyLinks(links, 'https://example.com');
      expect(result.internal).toHaveLength(2);
      expect(result.external).toHaveLength(1);
    });
  });
});
