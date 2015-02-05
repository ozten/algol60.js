var util = require('./util');

module.exports = function(source) {
    'use strict';

    var tokens = [];
    var currentToken = '';
    var lineNumber = 0;
    var i;

    var arithmetics = ['+', '-', '*', '/', '%', '^'];
    var seperators = [',', '.', ':', ';', ':=', '?', 'step',
                      'until', 'while', 'comment'];

    try {
        for (i = 0; i < source.length; i++) {
            if (currentToken.length > 0 &&
                [' ', '\t', '\n'].indexOf(source[i]) !== -1) {
                tokens.push(makeToken(currentToken, i - currentToken.length));
                currentToken = '';
            } else if ([' ', '\t', '\n'].indexOf(source[i]) !== -1) {
                // Throw away extra whitespace
            } else if (['<', '≤', '=', '≥', '>', '≠'].indexOf(source[i]) !== -1) {
                if (currentToken.length > 0) {
                    // Previous token
                    tokens.push(makeToken(currentToken, i - currentToken.length));    
                }
                tokens.push(makeStringToken(source[i], i - 1, 'relationals'));
                currentToken = '';
            } else if (seperators.indexOf(source[i]) !== -1) {
                if (currentToken.length > 0) {
                    // Previous token
                    tokens.push(makeToken(currentToken, i - currentToken.length));    
                }
                tokens.push(makeStringToken(source[i], i - 1, 'seperators'));
                currentToken = '';
            } else if (arithmetics.indexOf(source[i]) !== -1) {
                if (currentToken.length > 0) {
                    // Previous token
                    tokens.push(makeToken(currentToken, i - currentToken.length));    
                }
                tokens.push(makeStringToken(source[i], i - 1, 'arithmetics'));
                currentToken = '';

            } else if (['(', ')', ';'].indexOf(source[i]) !== -1) {
                if (currentToken.length > 0) {
                    // Previous token
                    tokens.push(makeToken(currentToken, i - currentToken.length));    
                }
                
                // This seperator token
                tokens.push(makeToken(source[i], i - 1));
                currentToken = '';
            } else {
                currentToken += source[i];
            }
            if (source[i] === '\n') {
                lineNumber += 1;
            }
        }
        return tokens;
    } catch (e) {
        for (var j in tokens) {
            console.log(tokens[j]);
        }
        console.error(e);
    }
};

function makeStringToken(str, startPos, type) {
    return {
        type: 'name',
        value: str,
        start: startPos,
        length: str.length
    };
}

function makeToken(str, startPos) {
    'use strict';
    if (util.isAlphabetic(str[0])) {
        return makeStringToken(str, startPos, 'name');    
    } else if (util.isNumeric(str[0])) {
        return {
            type: 'literal',
            value: parseInt(str, 10),
            start: startPos,
            length: str.length
        };
    } else if ([',', '.', ':', ';', ':=', '?', 'step',
                'until', 'while', 'comment'].indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'seperator');
    } else if (['(', ')'].indexOf(str) !== -1) {
        return makeStringToken(str, startPos, 'brackets');

    } else {
        console.log(typeof str + '_' + str + '_' + str.length);
        throw new Error('Unknown Token Type: ' + str);
    }
}
    
