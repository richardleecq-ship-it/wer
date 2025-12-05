/**
 * MetadataCollector - Responsible for collecting metadata about links
 */
import { RawLink, LinkMetadata } from '../types';
export declare class MetadataCollector {
    /**
     * Collect metadata for a list of raw links
     * This includes occurrence counting, nofollow detection, and context extraction
     */
    collectMetadata(rawLinks: RawLink[]): Map<string, LinkMetadata>;
    /**
     * Detect if a link has nofollow attribute
     */
    detectNoFollow(link: RawLink): boolean;
    /**
     * Extract parent context information
     * Returns a descriptive string about the parent element
     */
    extractParentContext(link: RawLink): string;
    /**
     * Build complete metadata structure for a specific URL
     */
    buildMetadata(url: string, rawLinks: RawLink[], metadataMap?: Map<string, LinkMetadata>): LinkMetadata;
    /**
     * Count occurrences of a specific URL in the raw links
     */
    countOccurrences(url: string, rawLinks: RawLink[]): number;
}
//# sourceMappingURL=MetadataCollector.d.ts.map