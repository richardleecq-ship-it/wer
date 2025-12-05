/**
 * MetadataCollector - Responsible for collecting metadata about links
 */

import { RawLink, LinkMetadata } from '../types';

export class MetadataCollector {
  /**
   * Collect metadata for a list of raw links
   * This includes occurrence counting, nofollow detection, and context extraction
   */
  collectMetadata(rawLinks: RawLink[]): Map<string, LinkMetadata> {
    const metadataMap = new Map<string, LinkMetadata>();
    
    // First pass: count occurrences and collect information
    rawLinks.forEach((link, index) => {
      const url = link.href;
      
      if (!metadataMap.has(url)) {
        // First occurrence of this URL
        metadataMap.set(url, {
          occurrences: 1,
          hasNoFollow: this.detectNoFollow(link),
          parentContext: this.extractParentContext(link),
          position: index,
        });
      } else {
        // URL already seen, increment occurrence count
        const existing = metadataMap.get(url)!;
        existing.occurrences += 1;
      }
    });
    
    return metadataMap;
  }

  /**
   * Detect if a link has nofollow attribute
   */
  detectNoFollow(link: RawLink): boolean {
    if (!link.rel) {
      return false;
    }
    
    // The rel attribute can contain multiple space-separated values
    const relValues = link.rel.toLowerCase().split(/\s+/);
    return relValues.includes('nofollow');
  }

  /**
   * Extract parent context information
   * Returns a descriptive string about the parent element
   */
  extractParentContext(link: RawLink): string {
    if (!link.parentTag) {
      return 'unknown';
    }
    
    // Return the parent tag name as context
    return link.parentTag;
  }

  /**
   * Build complete metadata structure for a specific URL
   */
  buildMetadata(
    url: string,
    rawLinks: RawLink[],
    metadataMap?: Map<string, LinkMetadata>
  ): LinkMetadata {
    // If metadata map is provided, use it
    if (metadataMap && metadataMap.has(url)) {
      return metadataMap.get(url)!;
    }
    
    // Otherwise, collect metadata on the fly
    const map = this.collectMetadata(rawLinks);
    return map.get(url) || {
      occurrences: 0,
      hasNoFollow: false,
      parentContext: 'unknown',
      position: -1,
    };
  }

  /**
   * Count occurrences of a specific URL in the raw links
   */
  countOccurrences(url: string, rawLinks: RawLink[]): number {
    return rawLinks.filter(link => link.href === url).length;
  }
}
