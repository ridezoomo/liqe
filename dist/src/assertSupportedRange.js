"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedRange = void 0;
// Non-numeric ranges are supported only for value formats whose lexical
// (character-by-character) ordering matches their chronological ordering. That
// requires big-endian ISO 8601 layouts (most-significant component first):
//   - calendar date: YYYY-MM-DD
//   - UTC date-time:  YYYY-MM-DDTHH:mm:ss[.sss]Z (uppercase "Z" only)
//   - clock time:     HH:mm[:ss] (24-hour)
// Little-/middle-endian dates such as DD-MM-YYYY or MM-DD-YYYY are intentionally
// NOT supported: sorting them lexically would order by day/month before year,
// which is chronologically wrong. Timezone offsets, lowercase "z", mixed
// precision, and mismatched boundary types are rejected for the same reason, so
// a range never returns a silently wrong result.
// https://github.com/gajus/liqe/issues/3
const MONTH = '(0[1-9]|1[0-2])';
const DAY = '(0[1-9]|[12]\\d|3[01])';
const HOUR = '([01]\\d|2[0-3])';
const MINUTE_SECOND = '[0-5]\\d';
const ISO_DATE = new RegExp(`^\\d{4}-${MONTH}-${DAY}$`, 'u');
const ISO_UTC_DATE_TIME = new RegExp(`^\\d{4}-${MONTH}-${DAY}T${HOUR}:${MINUTE_SECOND}:${MINUTE_SECOND}(\\.\\d{3})?Z$`, 'u');
const ISO_TIME = new RegExp(`^${HOUR}:${MINUTE_SECOND}(:${MINUTE_SECOND})?$`, 'u');
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const RANGE_ERROR_MESSAGE = 'Expected a number, ISO 8601 date, UTC date-time, or 24-hour time.';
const isLeapYear = (year) => {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
const isValidCalendarDate = (value) => {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(5, 7));
    const day = Number(value.slice(8, 10));
    const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
    return day <= maxDay;
};
const detectRangeStringFormat = (value) => {
    if (ISO_DATE.test(value) && isValidCalendarDate(value)) {
        return 'date';
    }
    if (ISO_UTC_DATE_TIME.test(value) && isValidCalendarDate(value)) {
        return 'datetime';
    }
    if (ISO_TIME.test(value)) {
        return 'time';
    }
    return null;
};
const assertSupportedRange = (range) => {
    const { max, min } = range;
    if (typeof min === 'number' && typeof max === 'number') {
        return;
    }
    if (typeof min !== 'string' || typeof max !== 'string') {
        throw new TypeError(RANGE_ERROR_MESSAGE);
    }
    const minFormat = detectRangeStringFormat(min);
    const maxFormat = detectRangeStringFormat(max);
    // Both boundaries must share a supported format and identical width, so that
    // e.g. "…00.00Z" TO "…00.000Z" (mismatched precision) is rejected rather than
    // lexically compared against differently-shaped values.
    if (!minFormat || minFormat !== maxFormat || min.length !== max.length) {
        throw new TypeError(RANGE_ERROR_MESSAGE);
    }
};
exports.assertSupportedRange = assertSupportedRange;
