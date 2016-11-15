'use strict';
const cleanYamlObject = require('clean-yaml-object');
const StackUtils = require('stack-utils');
const prettyFormat = require('pretty-format');
const reactElementPlugin = require('pretty-format/plugins/ReactElement');
const reactTestPlugin = require('pretty-format/plugins/ReactTestComponent');
const renderer = require('react-test-renderer');
const beautifyStack = require('./beautify-stack');

function isReactElement(obj) {
	return obj.type && obj.ref !== undefined && obj.props;
}

function filter(propertyName, isRoot, source, target) {
	if (!isRoot) {
		return true;
	}

	if (propertyName === 'stack') {
		target.stack = beautifyStack(source.stack);
		return false;
	}

	if (propertyName === 'statements') {
		target.statements = JSON.stringify(source[propertyName].map(statement => {
			const path = statement[0];
			let value = statement[1];

			if (isReactElement(value)) {
				value = renderer.create(value).toJSON();
			}

			const formattedValue = prettyFormat(value, {
				plugins: [reactTestPlugin, reactElementPlugin],
				highlight: true
			});

			return [path, formattedValue];
		}));

		return false;
	}

	if (propertyName === 'actual' || propertyName === 'expected') {
		let value = source[propertyName];
		target[propertyName + 'Type'] = typeof value;

		if (isReactElement(value)) {
			value = renderer.create(value).toJSON();
		}

		target[propertyName] = prettyFormat(value, {
			plugins: [reactTestPlugin, reactElementPlugin],
			highlight: true
		});

		return false;
	}

	return true;
}

const stackUtils = new StackUtils();

module.exports = error => {
	const err = cleanYamlObject(error, filter);

	const source = stackUtils.parseLine(err.stack.split('\n')[1]);
	err.source = {
		file: source.file,
		line: source.line
	};

	return err;
};
