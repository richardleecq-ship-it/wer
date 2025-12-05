/**
 * LinkFilter - Responsible for filtering links based on criteria
 */

import { Link, FilterCriteria } from '../types';

export class LinkFilter {
  /**
   * Filter links based on criteria
   * Applies all specified filter criteria to the link collection
   */
  filter(links: Link[], criteria: FilterCriteria): Link[] {
    let filtered = [...links];

    // Apply internal/external filter
    if (criteria.internalOnly) {
      filtered = filtered.filter(link => link.isInternal);
    }
    if (criteria.externalOnly) {
      filtered = filtered.filter(link => link.isExternal);
    }

    // Apply domain whitelist filter
    if (criteria.domains && criteria.domains.length > 0) {
      filtered = this.filterByDomain(filtered, criteria.domains);
    }

    // Apply domain blacklist filter
    if (criteria.excludeDomains && criteria.excludeDomains.length > 0) {
      filtered = filtered.filter(link => {
        try {
          const url = new URL(link.url);
          const hostname = url.hostname.toLowerCase();
          return !criteria.excludeDomains!.some(domain => 
            hostname === domain.toLowerCase() || 
            hostname.endsWith('.' + domain.toLowerCase())
          );
        } catch {
          return true; // Keep non-parseable URLs
        }
      });
    }

    // Apply URL pattern filter
    if (criteria.urlPattern) {
      filtered = filtered.filter(link => 
        this.matchesPattern(link.url, criteria.urlPattern!)
      );
    }

    // Apply protocol filter
    if (criteria.protocols && criteria.protocols.length > 0) {
      const normalizedProtocols = criteria.protocols.map(p => p.toLowerCase().replace(':', ''));
      filtered = filtered.filter(link => 
        normalizedProtocols.includes(link.protocol.toLowerCase())
      );
    }

    return filtered;
  }

  /**
   * Check if a link is internal
   * A link is internal if it shares the same hostname as the base URL
   */
  isInternalLink(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);
      
      // Compare hostnames (case-insensitive)
      return urlObj.hostname.toLowerCase() === baseUrlObj.hostname.toLowerCase();
    } catch {
      // If URL parsing fails, consider it external
      return false;
    }
  }

  /**
   * Check if a URL matches a pattern
   * Pattern is treated as a regular expression
   */
  matchesPattern(url: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch {
      // If pattern is invalid regex, return false
      return false;
    }
  }

  /**
   * Filter links by domain
   * Returns links that match any of the specified domains
   * Supports exact match and subdomain matching
   */
  filterByDomain(links: Link[], domains: string[]): Link[] {
    if (domains.length === 0) {
      return links;
    }

    const normalizedDomains = domains.map(d => d.toLowerCase());

    return links.filter(link => {
      try {
        const url = new URL(link.url);
        const hostname = url.hostname.toLowerCase();
        
        // Check if hostname matches any domain exactly or is a subdomain
        return normalizedDomains.some(domain => 
          hostname === domain || hostname.endsWith('.' + domain)
        );
      } catch {
        // If URL parsing fails, exclude the link
        return false;
      }
    });
  }

  /**
   * Classify links into internal and external groups
   * Returns an object with 'internal' and 'external' arrays
   */
  classifyLinks(links: Link[], baseUrl: string): { internal: Link[]; external: Link[] } {
    const internal: Link[] = [];
    const external: Link[] = [];

    for (const link of links) {
      if (link.isInternal) {
        internal.push(link);
      } else if (link.isExternal) {
        external.push(link);
      }
    }

    return { internal, external };
  }
}
