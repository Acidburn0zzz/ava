'use strict';

const fs = require('fs');
const codeExcerpt = require('code-excerpt');
const repeating = require('repeating');
const truncate = require('cli-truncate');
const chalk = require('chalk');

function formatLineNumber(line, maxLines) {
	return repeating(' ', String(maxLines).length - String(line).length) + line;
}

module.exports = (file, line, options) => {
	const maxWidth = (options || {}).maxWidth || 80;
	const source = fs.readFileSync(file, 'utf8');
	const excerpt = codeExcerpt(source, line, {around: 1});

	return excerpt
		.map(item => {
			const lineNumber = formatLineNumber(item.line, line) + ': ';
			const coloredLineNumber = item.line === line ? lineNumber : chalk.grey(lineNumber);

			const result = truncate(' ' + coloredLineNumber + item.value, maxWidth - 2);
			return item.line === line ? chalk.bgRed(result) : result;
		})
		.map(line => `  ${line}`)
		.join('\n');
};
