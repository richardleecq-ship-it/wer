/**
 * TextFormatter - Format extraction results as plain text
 */

import { ExtractionResult } from '../types';
import { Formatter } from './Formatter';

export class TextFormatter implements Formatter {
  format(result: ExtractionResult): string {
    const lines: string[] = [];
    
    // Header
    lines.push(`Links extracted from: ${result.sourceUrl}`);
    lines.push(`Extraction time: ${result.timestamp.toISOString()}`);
    lines.push('');
    
    // Statistics
    lines.push('Statistics:');
    lines.push(`  Total Links: ${result.statistics.totalLinks}`);
    lines.push(`  Unique Links: ${result.statistics.uniqueLinks}`);
    lines.push(`  Internal Links: ${result.statistics.internalLinks}`);
    lines.push(`  External Links: ${result.statistics.externalLinks}`);
    lines.push('');
    
    // Links
    lines.push('Links:');
    lines.push('');
    
    for (let i = 0; i < result.links.length; i++) {
      const link = result.links[i];
      const type = link.isInternal ? 'Internal' : 'External';
      
      lines.push(`${i + 1}. ${link.description}`);
      lines.push(`   URL: ${link.url}`);
      lines.push(`   Type: ${type}`);
      lines.push(`   Protocol: ${link.protocol}`);
      
      if (link.title) {
        lines.push(`   Title: ${link.title}`);
      }
      
      lines.push('');
    }
    
    // Errors
    if (result.errors.length > 0) {
      lines.push('Errors:');
      for (const error of result.errors) {
        lines.push(`  - ${error.message}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }
}
