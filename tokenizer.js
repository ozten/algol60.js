var util = require('./util');

var arithmetics = ['+', '-', '*', '/', '%', '^'];
var relationals = ['<', '≤', '=', '≥', '>', '≠'];
var sequentials = ['goto', 'if', 'then', 'else', 'for', 'do'];

var seperators = [',', '.', ':', ':=', '?', 'step',
                  'until', 'while', 'comment'];
var brackets = ['(', ')', '[', ']', '`', "'", 'begin', 'end'];
var declarators = ['own', 'boolean', 'integer', 'real', 'array', 'switch',
    'procedure'];
var specificators = ['string', 'label', 'value'];

module.exports = function(source) {
    'use strict';

    var tokens = [];
    var currentToken = '';
    var lineNumber = 1;
    var columnNumber = 1;
    var i;

    try {
        for (i = 0; i < source.length; i++) {
            if ([' ', '\t', '\n', ';'].indexOf(source[i]) !== -1) {
                saveCurrentToken(i);
                currentToken = '';
            } else if (relationals.indexOf(source[i]) !== -1) {
                saveCurrentToken(i);
                currentToken = '';
                tokens.push(makeStringToken(source[i], i - 1, 'relationals',
                    lineNumber, columnNumber));

            } else if (seperators.indexOf(source[i]) !== -1) {
                saveCurrentToken(i);
                currentToken = '';
                tokens.push(makeStringToken(source[i], i - 1, 'seperators',
                    lineNumber, columnNumber));

            } else if (arithmetics.indexOf(source[i]) !== -1) {
                saveCurrentToken(i);
                currentToken = '';
                tokens.push(makeStringToken(source[i], i - 1, 'arithmetics',
                    lineNumber, columnNumber));
            } else if (brackets.indexOf(source[i]) !== -1) {
                saveCurrentToken(i);
                currentToken = '';

                // This seperator token
                tokens.push(makeToken(source[i], i - 1,
                    lineNumber, columnNumber));

            } else {
                currentToken += source[i];
            }

            if (source[i] === '\n') {
                lineNumber += 1;
                columnNumber = 1;
            } else {
                columnNumber += 1;
            }
        }
        tokens.push({
            type: 'eof',
            value: 'EOF',
            start: i + 1,
            length: 1,
            lineNumber: lineNumber + 1,
            columnNumber: 0
        })
        return tokens;
    } catch (e) {
        for (var j in tokens) {
            console.log(tokens[j]);
        }
        console.error(e);
    }
    function saveCurrentToken(i) {
        'use strict';
        if (tokens === undefined || currentToken === undefined || i === undefined) {
            throw new Error('Bad caller of saveCurrentToken');
        }
        if (currentToken.length > 0) {
            // Previous token
            tokens.push(makeToken(currentToken, i - currentToken.length,
                lineNumber, columnNumber - currentToken.length));
        }
    }
};

function makeStringToken(str, startPos, type, lineNumber, columnNumber) {
    return {
        type: type,
        value: str,
        start: startPos,
        length: str.length,
        lineNumber: lineNumber,
        columnNumber: columnNumber
    };
}

function makeToken(str, startPos, lineNumber, columnNumber) {
    'use strict';

    if (sequentials.indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'sequential',
            lineNumber, columnNumber);

    } else if (specificators.indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'specificator',
            lineNumber, columnNumber);
    } else if (declarators.indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'declarator',
            lineNumber, columnNumber);
    } else if (util.isNumeric(str[0])) {
        return {
            type: 'literal',
            value: parseInt(str, 10),
            start: startPos,
            length: str.length,
            lineNumber: lineNumber,
            columnNumber: columnNumber
        };
    } else if (seperators.indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'seperator',
            lineNumber, columnNumber);
    } else if (brackets.indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'brackets',
            lineNumber, columnNumber);
    } else if (util.isAlphabetic(str[0])) {
        return makeStringToken(str, startPos, 'name',
            lineNumber, columnNumber);
    } else {
        console.log(typeof str + '_' + str + '_' + str.length);
        throw new Error('Unknown Token Type: ' + str + ' line number: ' +
            lineNumber + 'column number:' + columnNumber);
    }
}

