"use strict";
/**
 * Formatters module - Export all formatters and factory function
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFormatter = exports.MarkdownFormatter = exports.CSVFormatter = exports.JSONFormatter = void 0;
exports.getFormatter = getFormatter;
var JSONFormatter_1 = require("./JSONFormatter");
Object.defineProperty(exports, "JSONFormatter", { enumerable: true, get: function () { return JSONFormatter_1.JSONFormatter; } });
var CSVFormatter_1 = require("./CSVFormatter");
Object.defineProperty(exports, "CSVFormatter", { enumerable: true, get: function () { return CSVFormatter_1.CSVFormatter; } });
var MarkdownFormatter_1 = require("./MarkdownFormatter");
Object.defineProperty(exports, "MarkdownFormatter", { enumerable: true, get: function () { return MarkdownFormatter_1.MarkdownFormatter; } });
var TextFormatter_1 = require("./TextFormatter");
Object.defineProperty(exports, "TextFormatter", { enumerable: true, get: function () { return TextFormatter_1.TextFormatter; } });
const JSONFormatter_2 = require("./JSONFormatter");
const CSVFormatter_2 = require("./CSVFormatter");
const MarkdownFormatter_2 = require("./MarkdownFormatter");
const TextFormatter_2 = require("./TextFormatter");
/**
 * Factory function to get formatter by format type
 * Implements default format selection logic (defaults to 'text')
 */
function getFormatter(format) {
    const selectedFormat = format || 'text'; // Default to text format
    switch (selectedFormat) {
        case 'json':
            return new JSONFormatter_2.JSONFormatter();
        case 'csv':
            return new CSVFormatter_2.CSVFormatter();
        case 'markdown':
            return new MarkdownFormatter_2.MarkdownFormatter();
        case 'text':
            return new TextFormatter_2.TextFormatter();
        default:
            return new TextFormatter_2.TextFormatter(); // Fallback to text
    }
}
//# sourceMappingURL=index.js.map