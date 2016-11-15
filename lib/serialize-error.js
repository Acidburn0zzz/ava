'use strict';
const cleanYamlObject = require('clean-yaml-object');
const ErrorStackParser = require('error-stack-parser');
const beautifyStack = require('./beautify-stack');

function filter(propertyName, isRoot, source, target) {
	if (!isRoot) {
		return true;
	}

	if (propertyName === 'stack') {
		target.stack = beautifyStack(source.stack);
		return false;
	}

	return true;
}

module.exports = error => {
	const err = cleanYamlObject(error, filter);

	const source = ErrorStackParser.parse(error)[1];
	err.source = {
		file: source.fileName,
		line: source.lineNumber
	};

	return err;
};
