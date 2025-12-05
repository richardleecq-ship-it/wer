"use strict";
/**
 * ErrorHandler - Centralized error handling and logging system
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.LogLevel = void 0;
const types_1 = require("../types");
/**
 * Log level enumeration
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * ErrorHandler class provides centralized error handling, logging, and redirect tracking
 */
class ErrorHandler {
    constructor(verbose = false) {
        this.verbose = false;
        this.logs = [];
        this.redirectChains = new Map();
        this.verbose = verbose;
    }
    /**
     * Set verbose mode
     */
    setVerbose(verbose) {
        this.verbose = verbose;
    }
    /**
     * Generate a user-friendly error message with suggestions
     * Requirement 9.1: Provide detailed error information and possible solutions
     */
    generateErrorMessage(error) {
        if (error instanceof types_1.NetworkError) {
            return this.generateNetworkErrorMessage(error);
        }
        else if (error instanceof types_1.TimeoutError) {
            return this.generateTimeoutErrorMessage(error);
        }
        else if (error instanceof types_1.AuthenticationError) {
            return this.generateAuthenticationErrorMessage(error);
        }
        else if (error instanceof types_1.ParseError) {
            return this.generateParseErrorMessage(error);
        }
        else if (error instanceof types_1.ValidationError) {
            return this.generateValidationErrorMessage(error);
        }
        else {
            return `Unexpected error: ${error.message}`;
        }
    }
    /**
     * Generate network error message with suggestions
     */
    generateNetworkErrorMessage(error) {
        let message = `Network Error: Failed to connect to ${error.url}\n`;
        message += `Reason: ${error.message}\n`;
        if (error.retries > 0) {
            message += `Retries attempted: ${error.retries}\n`;
        }
        message += '\nPossible solutions:\n';
        message += '  - Check your internet connection\n';
        message += '  - Verify the URL is correct and accessible\n';
        message += '  - Check if a proxy or VPN is required\n';
        message += '  - Try increasing the timeout value\n';
        if (error.originalError) {
            message += `\nOriginal error: ${error.originalError.message}`;
        }
        return message;
    }
    /**
     * Generate timeout error message with suggestions
     */
    generateTimeoutErrorMessage(error) {
        let message = `Timeout Error: Page load exceeded timeout limit\n`;
        message += `URL: ${error.url}\n`;
        message += `Timeout: ${error.timeout}ms (${(error.timeout / 1000).toFixed(1)}s)\n`;
        message += '\nPossible solutions:\n';
        message += '  - Increase the timeout value using --timeout option\n';
        message += '  - Check if the page is slow to load or has performance issues\n';
        message += '  - Verify the page does not have infinite loading states\n';
        message += '  - Try accessing the page in a browser to confirm it loads\n';
        return message;
    }
    /**
     * Generate authentication error message with suggestions
     */
    generateAuthenticationErrorMessage(error) {
        let message = `Authentication Error: Access denied\n`;
        message += `URL: ${error.url}\n`;
        message += `Status Code: ${error.statusCode}\n`;
        if (error.statusCode === 401) {
            message += '\nThis page requires authentication.\n';
            message += 'Possible solutions:\n';
            message += '  - Provide authentication cookies using --cookies option\n';
            message += '  - Add authorization headers using --headers option\n';
            message += '  - Ensure you have valid credentials for this resource\n';
        }
        else if (error.statusCode === 403) {
            message += '\nAccess to this page is forbidden.\n';
            message += 'Possible solutions:\n';
            message += '  - Check if you have permission to access this resource\n';
            message += '  - Verify your IP address is not blocked\n';
            message += '  - Try using a different User-Agent string\n';
            message += '  - Check if the page requires specific headers or cookies\n';
        }
        return message;
    }
    /**
     * Generate parse error message with suggestions
     */
    generateParseErrorMessage(error) {
        let message = `Parse Error: Failed to parse page content\n`;
        message += `URL: ${error.url}\n`;
        message += `Reason: ${error.message}\n`;
        if (error.partialLinks && error.partialLinks.length > 0) {
            message += `\nPartially extracted ${error.partialLinks.length} links before failure.\n`;
        }
        message += '\nPossible solutions:\n';
        message += '  - Check if the page has valid HTML structure\n';
        message += '  - Verify the page loaded completely\n';
        message += '  - Try accessing the page in a browser to inspect its content\n';
        message += '  - Enable verbose logging to see detailed parsing information\n';
        return message;
    }
    /**
     * Generate validation error message
     */
    generateValidationErrorMessage(error) {
        let message = `Validation Error: Invalid input parameter\n`;
        message += `Parameter: ${error.invalidParameter}\n`;
        message += `Validation Rule: ${error.validationRule}\n`;
        message += `Reason: ${error.message}\n`;
        message += '\nPlease check your input and try again.\n';
        return message;
    }
    /**
     * Track a redirect
     * Requirement 9.5: Record redirect chain
     */
    trackRedirect(from, to, statusCode) {
        const redirectInfo = {
            from,
            to,
            statusCode,
            timestamp: new Date(),
        };
        // Get or create redirect chain for the original URL
        let chain = this.redirectChains.get(from);
        if (!chain) {
            // This is the first redirect in the chain
            chain = {
                originalUrl: from,
                finalUrl: to,
                redirects: [redirectInfo],
                totalRedirects: 1,
            };
            this.redirectChains.set(from, chain);
        }
        else {
            // Add to existing chain
            chain.redirects.push(redirectInfo);
            chain.finalUrl = to;
            chain.totalRedirects++;
        }
        // Log the redirect if verbose
        if (this.verbose) {
            this.log(LogLevel.INFO, `Redirect: ${from} -> ${to} (${statusCode})`, { from, to, statusCode });
        }
    }
    /**
     * Get redirect chain for a URL
     */
    getRedirectChain(url) {
        return this.redirectChains.get(url);
    }
    /**
     * Get all redirect chains
     */
    getAllRedirectChains() {
        return Array.from(this.redirectChains.values());
    }
    /**
     * Format redirect chain as a readable string
     */
    formatRedirectChain(chain) {
        let output = `Redirect Chain for ${chain.originalUrl}:\n`;
        output += `Total Redirects: ${chain.totalRedirects}\n`;
        output += `Final URL: ${chain.finalUrl}\n\n`;
        output += 'Redirect Path:\n';
        chain.redirects.forEach((redirect, index) => {
            output += `  ${index + 1}. ${redirect.from}\n`;
            output += `     -> ${redirect.to} (${redirect.statusCode})\n`;
        });
        return output;
    }
    /**
     * Log a message
     * Requirement 9.3: Detailed logging functionality
     */
    log(level, message, context, error) {
        const entry = {
            level,
            timestamp: new Date(),
            message,
            context,
            error,
        };
        this.logs.push(entry);
        // Output to console based on verbose mode and log level
        if (this.verbose || level === LogLevel.ERROR) {
            this.outputLog(entry);
        }
    }
    /**
     * Output a log entry to console
     */
    outputLog(entry) {
        const timestamp = entry.timestamp.toISOString();
        const prefix = `[${timestamp}] [${entry.level}]`;
        switch (entry.level) {
            case LogLevel.ERROR:
                console.error(`${prefix} ${entry.message}`);
                if (entry.error) {
                    console.error('  Error details:', entry.error);
                }
                break;
            case LogLevel.WARN:
                console.warn(`${prefix} ${entry.message}`);
                break;
            case LogLevel.INFO:
                console.info(`${prefix} ${entry.message}`);
                break;
            case LogLevel.DEBUG:
                console.debug(`${prefix} ${entry.message}`);
                break;
        }
        if (entry.context && this.verbose) {
            console.log('  Context:', JSON.stringify(entry.context, null, 2));
        }
    }
    /**
     * Get all logs
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * Get logs filtered by level
     */
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
    }
    /**
     * Clear redirect chains
     */
    clearRedirectChains() {
        this.redirectChains.clear();
    }
    /**
     * Export logs as JSON
     */
    exportLogsAsJSON() {
        return JSON.stringify(this.logs, null, 2);
    }
    /**
     * Export logs as text
     */
    exportLogsAsText() {
        return this.logs.map(entry => {
            const timestamp = entry.timestamp.toISOString();
            let line = `[${timestamp}] [${entry.level}] ${entry.message}`;
            if (entry.context) {
                line += `\n  Context: ${JSON.stringify(entry.context)}`;
            }
            if (entry.error) {
                line += `\n  Error: ${entry.error.message}`;
            }
            return line;
        }).join('\n');
    }
    /**
     * Handle an error and log it
     * Requirement 9.2: Record failure reason and continue processing
     */
    handleError(error, context) {
        const message = this.generateErrorMessage(error);
        this.log(LogLevel.ERROR, message, context, error);
    }
    /**
     * Log info message
     */
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    /**
     * Log warning message
     */
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    /**
     * Log error message
     */
    error(message, context, error) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    /**
     * Log debug message
     */
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map