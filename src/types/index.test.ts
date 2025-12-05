import { describe, it, expect } from 'vitest';
import type { Link, ExtractionResult, Statistics } from './index';

describe('Type definitions', () => {
  it('should allow creating a valid Link object', () => {
    const link: Link = {
      url: 'https://example.com',
      description: 'Example website',
      anchorText: 'Example',
      protocol: 'https',
      isInternal: false,
      isExternal: true,
      attributes: {
        dataAttributes: {}
      },
      metadata: {
        occurrences: 1,
        hasNoFollow: false,
        parentContext: 'div',
        position: 0
      }
    };

    expect(link.url).toBe('https://example.com');
    expect(link.isExternal).toBe(true);
  });

  it('should allow creating a valid Statistics object', () => {
    const stats: Statistics = {
      totalLinks: 10,
      uniqueLinks: 8,
      internalLinks: 5,
      externalLinks: 3,
      protocolBreakdown: {
        'https': 8,
        'http': 2
      }
    };

    expect(stats.totalLinks).toBe(10);
    expect(stats.protocolBreakdown['https']).toBe(8);
  });

  it('should allow creating a valid ExtractionResult object', () => {
    const result: ExtractionResult = {
      sourceUrl: 'https://example.com',
      timestamp: new Date(),
      links: [],
      statistics: {
        totalLinks: 0,
        uniqueLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        protocolBreakdown: {}
      },
      errors: []
    };

    expect(result.sourceUrl).toBe('https://example.com');
    expect(result.links).toHaveLength(0);
  });
});
