"use strict";
/**
 * Core data models for the web link extractor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ParseError = exports.AuthenticationError = exports.TimeoutError = exports.NetworkError = void 0;
/**
 * Custom error types
 */
class NetworkError extends Error {
    constructor(message, url, retries, originalError) {
        super(message);
        this.url = url;
        this.retries = retries;
        this.originalError = originalError;
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class TimeoutError extends Error {
    constructor(message, url, timeout) {
        super(message);
        this.url = url;
        this.timeout = timeout;
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class AuthenticationError extends Error {
    constructor(message, url, statusCode) {
        super(message);
        this.url = url;
        this.statusCode = statusCode;
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class ParseError extends Error {
    constructor(message, url, partialLinks) {
        super(message);
        this.url = url;
        this.partialLinks = partialLinks;
        this.name = 'ParseError';
    }
}
exports.ParseError = ParseError;
class ValidationError extends Error {
    constructor(message, invalidParameter, validationRule) {
        super(message);
        this.invalidParameter = invalidParameter;
        this.validationRule = validationRule;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=index.js.map