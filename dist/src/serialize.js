"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = void 0;
const quote = (value, quotes) => {
    if (quotes === 'double') {
        return `"${value}"`;
    }
    if (quotes === 'single') {
        return `'${value}'`;
    }
    return value;
};
const serializeExpression = (expression) => {
    if (expression.type === 'LiteralExpression') {
        if (expression.quoted && typeof expression.value === 'string') {
            return quote(expression.value, expression.quotes);
        }
        return String(expression.value);
    }
    if (expression.type === 'RegexExpression') {
        return String(expression.value);
    }
    if (expression.type === 'RangeExpression') {
        const { max, maxInclusive, min, minInclusive } = expression.range;
        return `${minInclusive ? '[' : '{'}${min} TO ${max}${maxInclusive ? ']' : '}'}`;
    }
    if (expression.type === 'EmptyExpression') {
        return '';
    }
    throw new Error('Unexpected AST type.');
};
const serializeTag = (ast) => {
    if (ast.type !== 'Tag') {
        throw new Error('Expected a tag expression.');
    }
    const { expression, field, operator } = ast;
    if (field.type === 'ImplicitField') {
        return serializeExpression(expression);
    }
    const left = field.quoted ? quote(field.name, field.quotes) : field.name;
    const patEnd = ' '.repeat(expression.location.start - operator.location.end);
    const trailingComma = ast.location.end > expression.location.end ? ',' : '';
    return (left +
        operator.operator +
        patEnd +
        serializeExpression(expression) +
        trailingComma);
};
const serialize = (ast) => {
    if (ast.type === 'ParenthesizedExpression') {
        if (!('location' in ast.expression)) {
            throw new Error('Expected location in expression.');
        }
        if (!ast.location.end) {
            throw new Error('Expected location end.');
        }
        const patStart = ' '.repeat(ast.expression.location.start - (ast.location.start + 1));
        const patEnd = ' '.repeat(ast.location.end - ast.expression.location.end - 1);
        return `(${patStart}${(0, exports.serialize)(ast.expression)}${patEnd})`;
    }
    if (ast.type === 'Tag') {
        return serializeTag(ast);
    }
    if (ast.type === 'LogicalExpression') {
        if (ast.operator.type === 'BooleanOperator' &&
            ast.operator.operator === 'OR' &&
            ast.operator.location.end - ast.operator.location.start === 1 &&
            ast.right.type === 'Tag') {
            const separator = ' '.repeat(ast.operator.location.start - ast.left.location.end) +
                ',' +
                ' '.repeat(ast.right.location.start - ast.operator.location.end);
            const trailingComma = ast.location.end > ast.right.expression.location.end ? ',' : '';
            return `${(0, exports.serialize)(ast.left)}${separator}${serializeExpression(ast.right.expression)}${trailingComma}`;
        }
        let operator = '';
        if (ast.operator.type === 'BooleanOperator') {
            operator += ' '.repeat(ast.operator.location.start - ast.left.location.end);
            operator += ast.operator.operator;
            operator += ' '.repeat(ast.right.location.start - ast.operator.location.end);
        }
        else {
            operator = ' '.repeat(ast.right.location.start - ast.left.location.end);
        }
        return `${(0, exports.serialize)(ast.left)}${operator}${(0, exports.serialize)(ast.right)}`;
    }
    if (ast.type === 'UnaryOperator') {
        return ((ast.operator === 'NOT' ? 'NOT ' : ast.operator) + (0, exports.serialize)(ast.operand));
    }
    if (ast.type === 'EmptyExpression') {
        return '';
    }
    throw new Error('Unexpected AST type.');
};
exports.serialize = serialize;
