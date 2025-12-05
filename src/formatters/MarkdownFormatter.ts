/**
 * MarkdownFormatter - Format extraction results as Markdown
 */

import { ExtractionResult } from '../types';
import { Formatter } from './Formatter';

export class MarkdownFormatter implements Formatter {
  format(result: ExtractionResult): string {
    const lines: string[] = [];
    
    // Title
    lines.push(`# Links from ${result.sourceUrl}`);
    lines.push('');
    
    // Statistics
    lines.push('## Statistics');
    lines.push('');
    lines.push(`- Total Links: ${result.statistics.totalLinks}`);
    lines.push(`- Unique Links: ${result.statistics.uniqueLinks}`);
    lines.push(`- Internal Links: ${result.statistics.internalLinks}`);
    lines.push(`- External Links: ${result.statistics.externalLinks}`);
    lines.push('');
    
    // Group links by type
    const internalLinks = result.links.filter(link => link.isInternal);
    const externalLinks = result.links.filter(link => link.isExternal);
    
    // Internal links section
    if (internalLinks.length > 0) {
      lines.push('## Internal Links');
      lines.push('');
      for (const link of internalLinks) {
        const title = link.title ? ` "${link.title}"` : '';
        lines.push(`- [${link.description}](${link.url})${title}`);
      }
      lines.push('');
    }
    
    // External links section
    if (externalLinks.length > 0) {
      lines.push('## External Links');
      lines.push('');
      for (const link of externalLinks) {
        const title = link.title ? ` "${link.title}"` : '';
        lines.push(`- [${link.description}](${link.url})${title}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }
}
