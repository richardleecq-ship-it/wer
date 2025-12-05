"use strict";
/**
 * DescriptionGenerator - Responsible for generating readable descriptions for links
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptionGenerator = void 0;
class DescriptionGenerator {
    /**
     * Generate a readable description for a link
     * Tries multiple sources in priority order:
     * 1. Anchor text
     * 2. aria-label
     * 3. title attribute
     * 4. Image alt text
     * 5. URL path
     */
    generate(rawLink) {
        // Priority 1: Anchor text
        if (rawLink.anchorText && rawLink.anchorText.trim()) {
            return this.cleanText(rawLink.anchorText);
        }
        // Priority 2: aria-label
        if (rawLink.ariaLabel && rawLink.ariaLabel.trim()) {
            return this.cleanText(rawLink.ariaLabel);
        }
        // Priority 3: title attribute
        if (rawLink.title && rawLink.title.trim()) {
            return this.cleanText(rawLink.title);
        }
        // Priority 4: Image alt text
        if (rawLink.imageAlt && rawLink.imageAlt.trim()) {
            return this.cleanText(rawLink.imageAlt);
        }
        // Priority 5: Generate from URL
        return this.generateFromUrl(rawLink.href);
    }
    /**
     * Generate a readable description from a URL path
     */
    generateFromUrl(url) {
        try {
            // Handle empty URLs
            if (!url || url.trim() === '') {
                return 'Empty link';
            }
            // Handle special protocols
            if (url.startsWith('mailto:')) {
                const email = url.substring(7);
                return `Email: ${email}`;
            }
            if (url.startsWith('tel:')) {
                const phone = url.substring(4);
                return `Phone: ${phone}`;
            }
            if (url.startsWith('javascript:')) {
                return 'JavaScript action';
            }
            if (url.startsWith('data:')) {
                return 'Data URI';
            }
            // Parse URL
            const urlObj = new URL(url);
            // If path is just root, use domain
            if (urlObj.pathname === '/' || urlObj.pathname === '') {
                return this.formatDomain(urlObj.hostname);
            }
            // Extract meaningful parts from path
            const pathParts = urlObj.pathname
                .split('/')
                .filter(part => part.length > 0)
                .map(part => this.formatPathSegment(part));
            if (pathParts.length === 0) {
                return this.formatDomain(urlObj.hostname);
            }
            // Use the last meaningful part of the path
            const lastPart = pathParts[pathParts.length - 1];
            // If it looks like a file, remove extension
            const withoutExtension = lastPart.replace(/\.(html?|php|aspx?|jsp)$/i, '');
            return this.capitalizeWords(withoutExtension);
        }
        catch (error) {
            // If URL parsing fails, try to extract something meaningful
            return this.fallbackUrlDescription(url);
        }
    }
    /**
     * Format a domain name into a readable description
     */
    formatDomain(domain) {
        // Remove www. prefix
        domain = domain.replace(/^www\./, '');
        // Remove TLD for common cases
        const parts = domain.split('.');
        if (parts.length > 1) {
            // Use the main domain name (before TLD)
            domain = parts[0];
        }
        return this.capitalizeWords(domain);
    }
    /**
     * Format a path segment into readable text
     */
    formatPathSegment(segment) {
        // Decode URL encoding
        try {
            segment = decodeURIComponent(segment);
        }
        catch (e) {
            // If decoding fails, use original
        }
        // Replace common separators with spaces
        segment = segment
            .replace(/[-_+]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2'); // Handle camelCase
        return segment;
    }
    /**
     * Capitalize words in a string
     */
    capitalizeWords(text) {
        return text
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    /**
     * Fallback description when URL parsing fails
     */
    fallbackUrlDescription(url) {
        // Try to extract something meaningful from the URL string
        const cleaned = url
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/[?#].*$/, '') // Remove query and hash
            .replace(/\/$/, ''); // Remove trailing slash
        if (cleaned.length === 0) {
            return 'Link';
        }
        // Take first part or whole thing if short
        const parts = cleaned.split('/');
        const firstPart = parts[0];
        if (firstPart.length > 0) {
            return this.formatDomain(firstPart);
        }
        return 'Link';
    }
    /**
     * Clean and format text
     * Removes excessive whitespace and normalizes the text
     */
    cleanText(text) {
        if (!text) {
            return '';
        }
        // Normalize whitespace
        text = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace newlines with space
            .replace(/\t+/g, ' ') // Replace tabs with space
            .trim();
        // Remove leading/trailing punctuation that doesn't add meaning
        text = text.replace(/^[^\w\s]+|[^\w\s]+$/g, '');
        // If text is too long, truncate intelligently
        const maxLength = 200;
        if (text.length > maxLength) {
            // Try to truncate at word boundary
            const truncated = text.substring(0, maxLength);
            const lastSpace = truncated.lastIndexOf(' ');
            if (lastSpace > maxLength * 0.8) {
                text = truncated.substring(0, lastSpace) + '...';
            }
            else {
                text = truncated + '...';
            }
        }
        return text;
    }
}
exports.DescriptionGenerator = DescriptionGenerator;
//# sourceMappingURL=DescriptionGenerator.js.map