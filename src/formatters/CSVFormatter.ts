/**
 * CSVFormatter - Format extraction results as CSV
 */

import { ExtractionResult } from '../types';
import { Formatter } from './Formatter';

export class CSVFormatter implements Formatter {
  format(result: ExtractionResult): string {
    const lines: string[] = [];
    
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
  
  private escapeCSV(value: string): string {
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
