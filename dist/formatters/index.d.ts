/**
 * Formatters module - Export all formatters and factory function
 */
export { Formatter } from './Formatter';
export { JSONFormatter } from './JSONFormatter';
export { CSVFormatter } from './CSVFormatter';
export { MarkdownFormatter } from './MarkdownFormatter';
export { TextFormatter } from './TextFormatter';
import { Formatter } from './Formatter';
import { OutputFormat } from '../types';
/**
 * Factory function to get formatter by format type
 * Implements default format selection logic (defaults to 'text')
 */
export declare function getFormatter(format?: OutputFormat): Formatter;
//# sourceMappingURL=index.d.ts.map