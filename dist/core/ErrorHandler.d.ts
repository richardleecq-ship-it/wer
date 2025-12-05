/**
 * ErrorHandler - Centralized error handling and logging system
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
/**
 * Redirect information
 */
export interface RedirectInfo {
    from: string;
    to: string;
    statusCode: number;
    timestamp: Date;
}
/**
 * Redirect chain tracking
 */
export interface RedirectChain {
    originalUrl: string;
    finalUrl: string;
    redirects: RedirectInfo[];
    totalRedirects: number;
}
/**
 * Log level enumeration
 */
export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
/**
 * Log entry structure
 */
export interface LogEntry {
    level: LogLevel;
    timestamp: Date;
    message: string;
    context?: Record<string, any>;
    error?: Error;
}
/**
 * ErrorHandler class provides centralized error handling, logging, and redirect tracking
 */
export declare class ErrorHandler {
    private verbose;
    private logs;
    private redirectChains;
    constructor(verbose?: boolean);
    /**
     * Set verbose mode
     */
    setVerbose(verbose: boolean): void;
    /**
     * Generate a user-friendly error message with suggestions
     * Requirement 9.1: Provide detailed error information and possible solutions
     */
    generateErrorMessage(error: Error): string;
    /**
     * Generate network error message with suggestions
     */
    private generateNetworkErrorMessage;
    /**
     * Generate timeout error message with suggestions
     */
    private generateTimeoutErrorMessage;
    /**
     * Generate authentication error message with suggestions
     */
    private generateAuthenticationErrorMessage;
    /**
     * Generate parse error message with suggestions
     */
    private generateParseErrorMessage;
    /**
     * Generate validation error message
     */
    private generateValidationErrorMessage;
    /**
     * Track a redirect
     * Requirement 9.5: Record redirect chain
     */
    trackRedirect(from: string, to: string, statusCode: number): void;
    /**
     * Get redirect chain for a URL
     */
    getRedirectChain(url: string): RedirectChain | undefined;
    /**
     * Get all redirect chains
     */
    getAllRedirectChains(): RedirectChain[];
    /**
     * Format redirect chain as a readable string
     */
    formatRedirectChain(chain: RedirectChain): string;
    /**
     * Log a message
     * Requirement 9.3: Detailed logging functionality
     */
    log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void;
    /**
     * Output a log entry to console
     */
    private outputLog;
    /**
     * Get all logs
     */
    getLogs(): LogEntry[];
    /**
     * Get logs filtered by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[];
    /**
     * Clear all logs
     */
    clearLogs(): void;
    /**
     * Clear redirect chains
     */
    clearRedirectChains(): void;
    /**
     * Export logs as JSON
     */
    exportLogsAsJSON(): string;
    /**
     * Export logs as text
     */
    exportLogsAsText(): string;
    /**
     * Handle an error and log it
     * Requirement 9.2: Record failure reason and continue processing
     */
    handleError(error: Error, context?: Record<string, any>): void;
    /**
     * Log info message
     */
    info(message: string, context?: Record<string, any>): void;
    /**
     * Log warning message
     */
    warn(message: string, context?: Record<string, any>): void;
    /**
     * Log error message
     */
    error(message: string, context?: Record<string, any>, error?: Error): void;
    /**
     * Log debug message
     */
    debug(message: string, context?: Record<string, any>): void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map