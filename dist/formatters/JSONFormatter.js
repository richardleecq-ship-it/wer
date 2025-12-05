"use strict";
/**
 * JSONFormatter - Format extraction results as JSON
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONFormatter = void 0;
class JSONFormatter {
    format(result) {
        return JSON.stringify(result, null, 2);
    }
}
exports.JSONFormatter = JSONFormatter;
//# sourceMappingURL=JSONFormatter.js.map