/**
 * PageLoader - Responsible for loading web pages and waiting for dynamic content
 */
import { Page } from 'playwright';
import { LoadConfig, Cookie } from '../types';
import { ErrorHandler } from './ErrorHandler';
export declare class PageLoader {
    private browser;
    private context;
    private customHeaders;
    private customCookies;
    private errorHandler;
    constructor(errorHandler?: ErrorHandler);
    /**
     * Set error handler
     */
    setErrorHandler(errorHandler: ErrorHandler): void;
    /**
     * Load a page with the given configuration
     */
    load(url: string, config?: LoadConfig): Promise<Page>;
    /**
     * Wait for content to load
     * This ensures dynamic content rendered by JavaScript is loaded
     */
    waitForContent(page: Page, timeout?: number): Promise<void>;
    /**
     * Set custom HTTP headers for future requests
     */
    setHeaders(headers: Record<string, string>): void;
    /**
     * Set cookies for future requests
     */
    setCookies(cookies: Cookie[]): void;
    /**
     * Close the browser context and page
     */
    closePage(page: Page): Promise<void>;
    /**
     * Close the browser
     */
    close(): Promise<void>;
}
//# sourceMappingURL=PageLoader.d.ts.map