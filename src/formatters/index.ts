/**
 * Formatters module - Export all formatters and factory function
 */

export { Formatter } from './Formatter';
export { JSONFormatter } from './JSONFormatter';
export { CSVFormatter } from './CSVFormatter';
export { MarkdownFormatter } from './MarkdownFormatter';
export { TextFormatter } from './TextFormatter';

import { Formatter } from './Formatter';
import { JSONFormatter } from './JSONFormatter';
import { CSVFormatter } from './CSVFormatter';
import { MarkdownFormatter } from './MarkdownFormatter';
import { TextFormatter } from './TextFormatter';
import { OutputFormat } from '../types';

/**
 * Factory function to get formatter by format type
 * Implements default format selection logic (defaults to 'text')
 */
export function getFormatter(format?: OutputFormat): Formatter {
  const selectedFormat = format || 'text'; // Default to text format
  
  switch (selectedFormat) {
    case 'json':
      return new JSONFormatter();
    case 'csv':
      return new CSVFormatter();
    case 'markdown':
      return new MarkdownFormatter();
    case 'text':
      return new TextFormatter();
    default:
      return new TextFormatter(); // Fallback to text
  }
}
