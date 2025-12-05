"use strict";
/**
 * PageLoader - Responsible for loading web pages and waiting for dynamic content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = void 0;
const playwright_1 = require("playwright");
const types_1 = require("../types");
const ErrorHandler_1 = require("./ErrorHandler");
class PageLoader {
    constructor(errorHandler) {
        this.browser = null;
        this.context = null;
        this.customHeaders = {};
        this.customCookies = [];
        this.errorHandler = errorHandler || new ErrorHandler_1.ErrorHandler();
    }
    /**
     * Set error handler
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }
    /**
     * Load a page with the given configuration
     */
    async load(url, config = {}) {
        const timeout = config.timeout || 30000;
        try {
            // Initialize browser if not already done
            if (!this.browser) {
                const launchOptions = {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-blink-features=AutomationControlled'
                    ],
                };
                // Use system chromium if available (for Docker/Railway)
                if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
                    launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
                }
                // Add proxy support if provided
                if (config.proxy) {
                    launchOptions.proxy = {
                        server: config.proxy,
                    };
                }
                this.browser = await playwright_1.chromium.launch(launchOptions);
            }
            // Create browser context with configuration
            const contextOptions = {
                userAgent: config.userAgent,
                extraHTTPHeaders: config.headers || this.customHeaders,
            };
            this.context = await this.browser.newContext(contextOptions);
            // Set cookies if provided
            const cookiesToSet = config.cookies || this.customCookies;
            if (cookiesToSet.length > 0) {
                await this.context.addCookies(cookiesToSet.map(cookie => ({
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path || '/',
                    expires: cookie.expires,
                    httpOnly: cookie.httpOnly,
                    secure: cookie.secure,
                    sameSite: cookie.sameSite,
                })));
            }
            // Create new page
            const page = await this.context.newPage();
            // Track redirects
            page.on('response', (response) => {
                const status = response.status();
                if (status >= 300 && status < 400) {
                    const location = response.headers()['location'];
                    if (location) {
                        this.errorHandler.trackRedirect(response.url(), location, status);
                    }
                }
                // Check for authentication errors
                if (status === 401 || status === 403) {
                    this.errorHandler.warn(`Authentication required for ${response.url()}`, { statusCode: status, url: response.url() });
                }
            });
            // Navigate to URL with timeout
            let response;
            try {
                response = await page.goto(url, {
                    timeout,
                    waitUntil: 'networkidle',
                });
            }
            catch (error) {
                // Check if it's a timeout error
                if (error.message && error.message.includes('Timeout')) {
                    const timeoutError = new types_1.TimeoutError(`Page load timeout after ${timeout}ms`, url, timeout);
                    this.errorHandler.handleError(timeoutError, { url, timeout });
                    throw timeoutError;
                }
                // Otherwise it's a network error
                const networkError = new types_1.NetworkError(`Failed to load page: ${error.message}`, url, 0, error);
                this.errorHandler.handleError(networkError, { url });
                throw networkError;
            }
            // Check response status for authentication errors
            if (response) {
                const status = response.status();
                if (status === 401 || status === 403) {
                    const authError = new types_1.AuthenticationError(`Access denied: HTTP ${status}`, url, status);
                    this.errorHandler.handleError(authError, { url, statusCode: status });
                    throw authError;
                }
            }
            // Wait for dynamic content if selector specified
            if (config.waitForSelector) {
                await this.waitForContent(page, timeout);
            }
            else {
                // Default wait for dynamic content to load
                await this.waitForContent(page, timeout);
            }
            return page;
        }
        catch (error) {
            // Re-throw our custom errors
            if (error instanceof types_1.TimeoutError || error instanceof types_1.NetworkError) {
                throw error;
            }
            // Wrap other errors as NetworkError
            throw new types_1.NetworkError(`Failed to load page: ${error.message}`, url, 0, error);
        }
    }
    /**
     * Wait for content to load
     * This ensures dynamic content rendered by JavaScript is loaded
     */
    async waitForContent(page, timeout = 30000) {
        try {
            // Wait for the page to be fully loaded
            await page.waitForLoadState('domcontentloaded', { timeout });
            // Give a small additional time for JavaScript to execute
            // This helps with pages that render content after DOMContentLoaded
            await page.waitForTimeout(500);
            // Wait for network to be idle (no more than 2 connections for at least 500ms)
            await page.waitForLoadState('networkidle', { timeout });
        }
        catch (error) {
            // If waiting fails, we still continue - the page might be partially loaded
            // This is a graceful degradation approach
            console.warn(`Warning: Content wait timeout, continuing with partial content`);
        }
    }
    /**
     * Set custom HTTP headers for future requests
     */
    setHeaders(headers) {
        this.customHeaders = { ...this.customHeaders, ...headers };
    }
    /**
     * Set cookies for future requests
     */
    setCookies(cookies) {
        this.customCookies = [...this.customCookies, ...cookies];
    }
    /**
     * Close the browser context and page
     */
    async closePage(page) {
        try {
            await page.close();
        }
        catch (error) {
            // Ignore errors when closing page
        }
    }
    /**
     * Close the browser
     */
    async close() {
        try {
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }
        catch (error) {
            // Ignore errors when closing browser
        }
    }
}
exports.PageLoader = PageLoader;
//# sourceMappingURL=PageLoader.js.map