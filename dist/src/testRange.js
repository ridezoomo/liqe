"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRange = void 0;
const testRange = (value, range) => {
    if (typeof value === 'number' &&
        typeof range.min === 'number' &&
        typeof range.max === 'number') {
        if (value < range.min) {
            return false;
        }
        if (value === range.min && !range.minInclusive) {
            return false;
        }
        if (value > range.max) {
            return false;
        }
        if (value === range.max && !range.maxInclusive) {
            return false;
        }
        return true;
    }
    // Non-numeric (string) ranges are compared lexically. This makes ISO 8601
    // date/datetime ranges and other canonically-ordered string ranges work.
    // https://github.com/gajus/liqe/issues/3
    if (typeof value === 'string' &&
        typeof range.min === 'string' &&
        typeof range.max === 'string') {
        if (value < range.min) {
            return false;
        }
        if (value === range.min && !range.minInclusive) {
            return false;
        }
        if (value > range.max) {
            return false;
        }
        if (value === range.max && !range.maxInclusive) {
            return false;
        }
        return true;
    }
    return false;
};
exports.testRange = testRange;
