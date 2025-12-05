/**
 * Tests for MetadataCollector
 */

import { describe, it, expect } from 'vitest';
import { MetadataCollector } from './MetadataCollector';
import { RawLink } from '../types';

describe('MetadataCollector', () => {
  const collector = new MetadataCollector();

  describe('detectNoFollow', () => {
    it('should detect nofollow in rel attribute', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
        rel: 'nofollow',
      };
      
      expect(collector.detectNoFollow(link)).toBe(true);
    });

    it('should detect nofollow in combined rel attributes', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
        rel: 'nofollow noopener noreferrer',
      };
      
      expect(collector.detectNoFollow(link)).toBe(true);
    });

    it('should return false when rel does not contain nofollow', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
        rel: 'noopener noreferrer',
      };
      
      expect(collector.detectNoFollow(link)).toBe(false);
    });

    it('should return false when rel is undefined', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
      };
      
      expect(collector.detectNoFollow(link)).toBe(false);
    });

    it('should be case insensitive', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
        rel: 'NoFollow',
      };
      
      expect(collector.detectNoFollow(link)).toBe(true);
    });
  });

  describe('extractParentContext', () => {
    it('should extract parent tag name', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
        parentTag: 'nav',
      };
      
      expect(collector.extractParentContext(link)).toBe('nav');
    });

    it('should return unknown when parent tag is undefined', () => {
      const link: RawLink = {
        href: 'https://example.com',
        anchorText: 'Example',
      };
      
      expect(collector.extractParentContext(link)).toBe('unknown');
    });
  });

  describe('countOccurrences', () => {
    it('should count single occurrence', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example' },
        { href: 'https://other.com', anchorText: 'Other' },
      ];
      
      expect(collector.countOccurrences('https://example.com', rawLinks)).toBe(1);
    });

    it('should count multiple occurrences', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example 1' },
        { href: 'https://other.com', anchorText: 'Other' },
        { href: 'https://example.com', anchorText: 'Example 2' },
        { href: 'https://example.com', anchorText: 'Example 3' },
      ];
      
      expect(collector.countOccurrences('https://example.com', rawLinks)).toBe(3);
    });

    it('should return 0 for non-existent URL', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example' },
      ];
      
      expect(collector.countOccurrences('https://notfound.com', rawLinks)).toBe(0);
    });
  });

  describe('collectMetadata', () => {
    it('should collect metadata for single link', () => {
      const rawLinks: RawLink[] = [
        {
          href: 'https://example.com',
          anchorText: 'Example',
          rel: 'nofollow',
          parentTag: 'nav',
        },
      ];
      
      const metadata = collector.collectMetadata(rawLinks);
      
      expect(metadata.size).toBe(1);
      expect(metadata.get('https://example.com')).toEqual({
        occurrences: 1,
        hasNoFollow: true,
        parentContext: 'nav',
        position: 0,
      });
    });

    it('should count occurrences for duplicate URLs', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example 1', parentTag: 'nav' },
        { href: 'https://other.com', anchorText: 'Other', parentTag: 'footer' },
        { href: 'https://example.com', anchorText: 'Example 2', parentTag: 'main' },
      ];
      
      const metadata = collector.collectMetadata(rawLinks);
      
      expect(metadata.size).toBe(2);
      expect(metadata.get('https://example.com')?.occurrences).toBe(2);
      expect(metadata.get('https://other.com')?.occurrences).toBe(1);
    });

    it('should record position of first occurrence', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://first.com', anchorText: 'First' },
        { href: 'https://second.com', anchorText: 'Second' },
        { href: 'https://third.com', anchorText: 'Third' },
      ];
      
      const metadata = collector.collectMetadata(rawLinks);
      
      expect(metadata.get('https://first.com')?.position).toBe(0);
      expect(metadata.get('https://second.com')?.position).toBe(1);
      expect(metadata.get('https://third.com')?.position).toBe(2);
    });

    it('should handle empty link list', () => {
      const metadata = collector.collectMetadata([]);
      expect(metadata.size).toBe(0);
    });
  });

  describe('buildMetadata', () => {
    it('should build metadata from provided map', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example', rel: 'nofollow' },
      ];
      
      const metadataMap = collector.collectMetadata(rawLinks);
      const metadata = collector.buildMetadata('https://example.com', rawLinks, metadataMap);
      
      expect(metadata.occurrences).toBe(1);
      expect(metadata.hasNoFollow).toBe(true);
    });

    it('should collect metadata on the fly when map not provided', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example', rel: 'nofollow' },
      ];
      
      const metadata = collector.buildMetadata('https://example.com', rawLinks);
      
      expect(metadata.occurrences).toBe(1);
      expect(metadata.hasNoFollow).toBe(true);
    });

    it('should return default metadata for non-existent URL', () => {
      const rawLinks: RawLink[] = [
        { href: 'https://example.com', anchorText: 'Example' },
      ];
      
      const metadata = collector.buildMetadata('https://notfound.com', rawLinks);
      
      expect(metadata).toEqual({
        occurrences: 0,
        hasNoFollow: false,
        parentContext: 'unknown',
        position: -1,
      });
    });
  });
});
