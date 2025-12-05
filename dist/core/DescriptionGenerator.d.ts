/**
 * DescriptionGenerator - Responsible for generating readable descriptions for links
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
import { RawLink } from '../types';
export declare class DescriptionGenerator {
    /**
     * Generate a readable description for a link
     * Tries multiple sources in priority order:
     * 1. Anchor text
     * 2. aria-label
     * 3. title attribute
     * 4. Image alt text
     * 5. URL path
     */
    generate(rawLink: RawLink): string;
    /**
     * Generate a readable description from a URL path
     */
    generateFromUrl(url: string): string;
    /**
     * Format a domain name into a readable description
     */
    private formatDomain;
    /**
     * Format a path segment into readable text
     */
    private formatPathSegment;
    /**
     * Capitalize words in a string
     */
    private capitalizeWords;
    /**
     * Fallback description when URL parsing fails
     */
    private fallbackUrlDescription;
    /**
     * Clean and format text
     * Removes excessive whitespace and normalizes the text
     */
    cleanText(text: string): string;
}
//# sourceMappingURL=DescriptionGenerator.d.ts.map