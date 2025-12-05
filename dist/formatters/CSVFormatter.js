"use strict";
/**
 * CSVFormatter - Format extraction results as CSV
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVFormatter = void 0;
class CSVFormatter {
    format(result) {
        const lines = [];
        // CSV header
        lines.push('URL,Description,Anchor Text,Protocol,Type,Title');
        // CSV rows
        for (const link of result.links) {
            const type = link.isInternal ? 'Internal' : 'External';
            const row = [
                this.escapeCSV(link.url),
                this.escapeCSV(link.description),
                this.escapeCSV(link.anchorText),
                this.escapeCSV(link.protocol),
                this.escapeCSV(type),
                this.escapeCSV(link.title || '')
            ];
            lines.push(row.join(','));
        }
        return lines.join('\n');
    }
    escapeCSV(value) {
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
exports.CSVFormatter = CSVFormatter;
//# sourceMappingURL=CSVFormatter.js.map