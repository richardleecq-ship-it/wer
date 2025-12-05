/**
 * LinkFilter - Responsible for filtering links based on criteria
 */
import { Link, FilterCriteria } from '../types';
export declare class LinkFilter {
    /**
     * Filter links based on criteria
     * Applies all specified filter criteria to the link collection
     */
    filter(links: Link[], criteria: FilterCriteria): Link[];
    /**
     * Check if a link is internal
     * A link is internal if it shares the same hostname as the base URL
     */
    isInternalLink(url: string, baseUrl: string): boolean;
    /**
     * Check if a URL matches a pattern
     * Pattern is treated as a regular expression
     */
    matchesPattern(url: string, pattern: string): boolean;
    /**
     * Filter links by domain
     * Returns links that match any of the specified domains
     * Supports exact match and subdomain matching
     */
    filterByDomain(links: Link[], domains: string[]): Link[];
    /**
     * Classify links into internal and external groups
     * Returns an object with 'internal' and 'external' arrays
     */
    classifyLinks(links: Link[], baseUrl: string): {
        internal: Link[];
        external: Link[];
    };
}
//# sourceMappingURL=LinkFilter.d.ts.map