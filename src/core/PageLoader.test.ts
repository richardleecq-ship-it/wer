/**
 * Unit tests for PageLoader
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PageLoader } from './PageLoader';
import { TimeoutError, NetworkError } from '../types';

describe('PageLoader', () => {
  let loader: PageLoader;

  beforeEach(() => {
    loader = new PageLoader();
  });

  afterEach(async () => {
    await loader.close();
  });

  it('should load a simple page successfully', async () => {
    // Using a reliable test URL
    const page = await loader.load('https://example.com', { timeout: 10000 });
    
    expect(page).toBeDefined();
    const title = await page.title();
    expect(title).toBeTruthy();
    
    await loader.closePage(page);
  });

  it('should handle timeout errors', async () => {
    // Using a very short timeout to trigger timeout
    await expect(
      loader.load('https://example.com', { timeout: 1 })
    ).rejects.toThrow(TimeoutError);
  });

  it('should handle invalid URLs', async () => {
    await expect(
      loader.load('invalid-url', { timeout: 5000 })
    ).rejects.toThrow(NetworkError);
  });

  it('should set custom user agent', async () => {
    const customUA = 'CustomBot/1.0';
    const page = await loader.load('https://example.com', {
      userAgent: customUA,
      timeout: 10000
    });
    
    expect(page).toBeDefined();
    await loader.closePage(page);
  });

  it('should set custom headers', async () => {
    loader.setHeaders({ 'X-Custom-Header': 'test-value' });
    const page = await loader.load('https://example.com', { timeout: 10000 });
    
    expect(page).toBeDefined();
    await loader.closePage(page);
  });
});
