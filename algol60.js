
var fs = require('fs');

var tokenizer = require('./tokenizer');
var parser = require('./parser');

/* International Algorithm Language */

var basicSymbols = ['letter', 'digit', 'logical-value', 'delimiter'];

var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
	'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
	'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

var logicValues = [true, false];

var delimiters = ['operator', 'separator', 'bracet', 'declarator',
	'specificator'];

var operators = ['arithmetic', 'relational', 'logical', 'sequential'];

var arithmetics = ['+', '-', '*', '/', '%', '^'];

var relationals = ['<', '≤', '=', '≥', '>', '≠'];

var logicals = ['≡', '?', '?', '?', '?'];

var sequentials = ['goto', 'if', 'then', 'else', 'for', 'do'];

var separators = [',', '.', 10, ':', ';', ':=', '?', 'step',
	'until', 'while', 'comment'];

var brackets = ['(', ')', '[', ']', '`', "'", 'begin', 'end'];

var declarators = ['own', 'boolean', 'integer', 'real', 'array', 'switch',
	'procedure'];

var specificators = ['string', 'label', 'value'];

function lex(source) {
	var tokens = [];
	var value = "";

    

	return tokens;
}

fs.readFile(process.argv[2], {encoding: 'utf8'}, function(err, data) {
	var tokens = tokenizer(data);
	if (true) {
		for (var i=0; i<tokens.length; i++) {
			console.log(i, tokens[i]);	
		}
	}
	var ast = parser(tokens);
	console.log(ast);
});
