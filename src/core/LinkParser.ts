/**
 * LinkParser - Responsible for parsing links from web pages
 */

import { Page } from 'playwright';
import { RawLink, LinkAttributes } from '../types';

export class LinkParser {
  /**
   * Parse all links from a page
   */
  async parseLinks(page: Page, baseUrl: string): Promise<RawLink[]> {
    // Extract all link elements and their properties
    const rawLinks = await page.evaluate(() => {
      const links: any[] = [];
      const anchorElements = document.querySelectorAll('a[href]');

      anchorElements.forEach((anchor) => {
        const element = anchor as HTMLAnchorElement;
        
        // Extract anchor text
        let anchorText = element.textContent?.trim() || '';
        
        // Check if link contains an image
        let imageAlt: string | undefined;
        const img = element.querySelector('img');
        if (img) {
          imageAlt = img.alt || undefined;
        }

        // Get parent element tag
        const parentTag = element.parentElement?.tagName.toLowerCase();

        // Extract all relevant attributes
        links.push({
          href: element.getAttribute('href') || '',
          anchorText,
          title: element.getAttribute('title') || undefined,
          ariaLabel: element.getAttribute('aria-label') || undefined,
          rel: element.getAttribute('rel') || undefined,
          target: element.getAttribute('target') || undefined,
          imageAlt,
          parentTag,
        });
      });

      return links;
    });

    // Normalize URLs
    const normalizedLinks = rawLinks.map((link) => ({
      ...link,
      href: this.normalizeUrl(link.href, baseUrl),
    }));

    return normalizedLinks;
  }

  /**
   * Normalize a URL (convert relative URLs to absolute)
   */
  normalizeUrl(url: string, baseUrl: string): string {
    try {
      // Handle empty or invalid URLs
      if (!url || url.trim() === '') {
        return '';
      }

      // Trim whitespace
      url = url.trim();

      // Handle special protocols that don't need normalization
      if (
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('javascript:') ||
        url.startsWith('data:')
      ) {
        return url;
      }

      // Handle protocol-relative URLs (//example.com)
      if (url.startsWith('//')) {
        const baseProtocol = new URL(baseUrl).protocol;
        return `${baseProtocol}${url}`;
      }

      // Handle absolute URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // Handle anchor links (same page)
      if (url.startsWith('#')) {
        return `${baseUrl}${url}`;
      }

      // Handle relative URLs
      const base = new URL(baseUrl);
      
      // Absolute path (starts with /)
      if (url.startsWith('/')) {
        return `${base.protocol}//${base.host}${url}`;
      }

      // Relative path
      // Remove filename from base URL if present
      let basePath = base.pathname;
      if (!basePath.endsWith('/')) {
        basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
      }

      // Construct the full URL
      const fullUrl = `${base.protocol}//${base.host}${basePath}${url}`;
      
      // Use URL constructor to resolve .. and . in paths
      return new URL(fullUrl).href;
    } catch (error) {
      // If URL parsing fails, return the original URL
      return url;
    }
  }

  /**
   * Extract link attributes from a raw link
   */
  extractAttributes(rawLink: RawLink): LinkAttributes {
    const dataAttributes: Record<string, string> = {};
    
    // Note: data-* attributes would need to be extracted in the page.evaluate
    // For now, we'll return the basic attributes we have
    
    return {
      rel: rawLink.rel,
      target: rawLink.target,
      ariaLabel: rawLink.ariaLabel,
      dataAttributes,
    };
  }

  /**
   * Identify the protocol of a URL
   */
  identifyProtocol(url: string): string {
    try {
      // Handle empty URLs
      if (!url || url.trim() === '') {
        return 'unknown';
      }

      // Check for common protocols
      if (url.startsWith('mailto:')) {
        return 'mailto';
      }
      if (url.startsWith('tel:')) {
        return 'tel';
      }
      if (url.startsWith('javascript:')) {
        return 'javascript';
      }
      if (url.startsWith('data:')) {
        return 'data';
      }
      if (url.startsWith('ftp://')) {
        return 'ftp';
      }
      if (url.startsWith('ftps://')) {
        return 'ftps';
      }

      // Use URL constructor for standard URLs
      const urlObj = new URL(url);
      return urlObj.protocol.replace(':', '');
    } catch (error) {
      // If URL parsing fails, try to extract protocol manually
      const match = url.match(/^([a-z][a-z0-9+.-]*):/i);
      if (match) {
        return match[1].toLowerCase();
      }
      return 'unknown';
    }
  }

  /**
   * Classify protocol type
   */
  classifyProtocol(protocol: string): 'http' | 'special' | 'unknown' {
    const httpProtocols = ['http', 'https'];
    const specialProtocols = ['mailto', 'tel', 'javascript', 'data', 'ftp', 'ftps'];

    if (httpProtocols.includes(protocol)) {
      return 'http';
    }
    if (specialProtocols.includes(protocol)) {
      return 'special';
    }
    return 'unknown';
  }
}
