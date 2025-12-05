/**
 * CSVFormatter - Format extraction results as CSV
 */
import { ExtractionResult } from '../types';
import { Formatter } from './Formatter';
export declare class CSVFormatter implements Formatter {
    format(result: ExtractionResult): string;
    private escapeCSV;
}
//# sourceMappingURL=CSVFormatter.d.ts.map