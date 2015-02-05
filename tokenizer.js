var util = require('./util');

module.exports = function(source) {
    'use strict';

    var tokens = [];
    var currentToken = '';
    var lineNumber = 1;
    var columnNumber = 1;
    var i;

    var arithmetics = ['+', '-', '*', '/', '%', '^'];
    var seperators = [',', '.', ':', ';', ':=', '?', 'step',
                      'until', 'while', 'comment'];

    var relationals = ['<', '≤', '=', '≥', '>', '≠'];

    try {
        for (i = 0; i < source.length; i++) {
            if ([' ', '\t', '\n'].indexOf(source[i]) !== -1) {
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
            } else if (['(', ')', ';'].indexOf(source[i]) !== -1) {
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
    if (util.isAlphabetic(str[0])) {
        return makeStringToken(str, startPos, 'name',
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
    } else if (['(', ')'].indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'brackets',
            lineNumber, columnNumber);

    } else {
        console.log(typeof str + '_' + str + '_' + str.length);
        throw new Error('Unknown Token Type: ' + str + ' line number: ' +
            lineNumber + 'column number:' + columnNumber);
    }
}

