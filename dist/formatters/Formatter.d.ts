/**
 * Formatter interface - Base interface for all output formatters
 */
import { ExtractionResult } from '../types';
export interface Formatter {
    format(result: ExtractionResult): string;
}
//# sourceMappingURL=Formatter.d.ts.map