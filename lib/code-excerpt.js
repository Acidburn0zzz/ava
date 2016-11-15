'use strict';

var fs = require('fs');
var codeExcerpt = require('code-excerpt');
var repeating = require('repeating');
var chalk = require('chalk');

function formatLineNumber(line, maxLines) {
	return repeating('0', String(maxLines).length - String(line).length) + line;
}

module.exports = function (file, line) {
	var source = fs.readFileSync(file, 'utf8');
	var excerpt = codeExcerpt(source, line, {around: 1});

	return excerpt.map(function (item) {
		var lineNumber = formatLineNumber(item.line, line) + ': ';
		var coloredLineNumber = item.line === line ? lineNumber : chalk.grey(lineNumber);

		var result = ' ' + coloredLineNumber + item.value;
		return item.line === line ? chalk.bgRed(result) : result;
	})
	.map(function (line) {
		return '  ' + line;
	})
	.join('\n');
};
