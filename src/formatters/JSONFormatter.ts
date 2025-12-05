/**
 * JSONFormatter - Format extraction results as JSON
 */

import { ExtractionResult } from '../types';
import { Formatter } from './Formatter';

export class JSONFormatter implements Formatter {
  format(result: ExtractionResult): string {
    return JSON.stringify(result, null, 2);
  }
}
