/**
 * Unit tests for LinkParser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LinkParser } from './LinkParser';
import { PageLoader } from './PageLoader';

describe('LinkParser', () => {
  let parser: LinkParser;
  let loader: PageLoader;

  beforeEach(() => {
    parser = new LinkParser();
    loader = new PageLoader();
  });

  afterEach(async () => {
    await loader.close();
  });

  it('should parse links from a simple HTML page', async () => {
    const page = await loader.load('https://example.com', { timeout: 10000 });
    const links = await parser.parseLinks(page, 'https://example.com');
    
    expect(links).toBeDefined();
    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBeGreaterThan(0);
    
    // Check that links have required properties
    links.forEach(link => {
      expect(link).toHaveProperty('href');
      expect(link).toHaveProperty('anchorText');
    });
    
    await loader.closePage(page);
  });

  it('should normalize relative URLs to absolute URLs', () => {
    const baseUrl = 'https://example.com/path/page.html';
    
    // Test relative path
    expect(parser.normalizeUrl('about.html', baseUrl))
      .toBe('https://example.com/path/about.html');
    
    // Test absolute path
    expect(parser.normalizeUrl('/contact', baseUrl))
      .toBe('https://example.com/contact');
    
    // Test absolute URL
    expect(parser.normalizeUrl('https://other.com/page', baseUrl))
      .toBe('https://other.com/page');
    
    // Test anchor link
    expect(parser.normalizeUrl('#section', baseUrl))
      .toBe('https://example.com/path/page.html#section');
  });

  it('should handle special protocols', () => {
    const baseUrl = 'https://example.com';
    
    // mailto should not be normalized
    expect(parser.normalizeUrl('mailto:test@example.com', baseUrl))
      .toBe('mailto:test@example.com');
    
    // tel should not be normalized
    expect(parser.normalizeUrl('tel:+1234567890', baseUrl))
      .toBe('tel:+1234567890');
    
    // javascript should not be normalized
    expect(parser.normalizeUrl('javascript:void(0)', baseUrl))
      .toBe('javascript:void(0)');
  });

  it('should identify protocols correctly', () => {
    expect(parser.identifyProtocol('https://example.com')).toBe('https');
    expect(parser.identifyProtocol('http://example.com')).toBe('http');
    expect(parser.identifyProtocol('mailto:test@example.com')).toBe('mailto');
    expect(parser.identifyProtocol('tel:+1234567890')).toBe('tel');
    expect(parser.identifyProtocol('javascript:void(0)')).toBe('javascript');
    expect(parser.identifyProtocol('ftp://example.com')).toBe('ftp');
  });

  it('should classify protocols correctly', () => {
    expect(parser.classifyProtocol('http')).toBe('http');
    expect(parser.classifyProtocol('https')).toBe('http');
    expect(parser.classifyProtocol('mailto')).toBe('special');
    expect(parser.classifyProtocol('tel')).toBe('special');
    expect(parser.classifyProtocol('javascript')).toBe('special');
    expect(parser.classifyProtocol('unknown-protocol')).toBe('unknown');
  });

  it('should handle empty pages', async () => {
    // Create a simple HTML page with no links
    const page = await loader.load('data:text/html,<html><body><p>No links here</p></body></html>', { timeout: 5000 });
    const links = await parser.parseLinks(page, 'data:text/html');
    
    expect(links).toBeDefined();
    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBe(0);
    
    await loader.closePage(page);
  });

  it('should extract link attributes', async () => {
    const rawLink = {
      href: 'https://example.com',
      anchorText: 'Example',
      title: 'Example Site',
      ariaLabel: 'Visit Example',
      rel: 'nofollow',
      target: '_blank',
    };
    
    const attributes = parser.extractAttributes(rawLink);
    
    expect(attributes.rel).toBe('nofollow');
    expect(attributes.target).toBe('_blank');
    expect(attributes.ariaLabel).toBe('Visit Example');
    expect(attributes.dataAttributes).toBeDefined();
  });
});
