import { describe, expect, test } from 'vitest';
import { basename, dirname, encodePath, extname, pathToSegments, resolve } from './path';

describe('pathToSegments', () => {
	test('When the path is a single slash, then it returns no segments', () => {
		expect(pathToSegments('/')).toEqual([]);
	});

	test('When the path is an empty string, then it returns no segments', () => {
		expect(pathToSegments('')).toEqual([]);
	});

	test('When the path contains URI encoded strings, then they are handled correctly', () => {
		expect(pathToSegments('foo%20bar/baz%2Fqux')).toEqual(['foo%20bar', 'baz%2Fqux']);
	});

	test('When the path contains multiple slashes, then they are collapsed', () => {
		expect(pathToSegments('foo///bar//baz')).toEqual(['foo', 'bar', 'baz']);
	});
});

describe('dirname', () => {
	test('When the path is empty, then it returns an empty string', () => {
		expect(dirname('')).toBe('');
	});

	test('When the path is the root, then it returns the root', () => {
		expect(dirname('/')).toBe('/');
	});

	test('When the path has a trailing slash, then it is ignored', () => {
		expect(dirname('/foo/bar/')).toBe('/foo');
	});

	test('When the path ends in a file, then it returns the directory name', () => {
		expect(dirname('/foo/bar/baz.ext')).toBe('/foo/bar');
	});

	test('When the path ends in a directory, then it returns the parent directory name', () => {
		expect(dirname('/foo/bar')).toBe('/foo');
	});

	test('When the path is a first-level path, then it returns the root', () => {
		expect(dirname('/foo')).toBe('/');
	});

	test('When the path is relative, then it returns the relative directory name', () => {
		expect(dirname('foo/bar')).toBe('foo');
		expect(dirname('foo')).toBe('');
	});
});

describe('basename', () => {
	test('When the path is empty, then it returns an empty string', () => {
		expect(basename('')).toBe('');
	});

	test('When the path is the root, then it returns an empty string', () => {
		expect(basename('/')).toBe('');
	});

	test('When the path ends in a file, then it returns the base name', () => {
		expect(basename('/foo/bar/baz.txt')).toBe('baz.txt');
	});

	test('When the path ends in a directory, then it returns the directory name', () => {
		expect(basename('/foo/bar/')).toBe('bar');
		expect(basename('/foo/bar')).toBe('bar');
	});

	test('When a suffix is provided, then it is removed from the base name', () => {
		expect(basename('/foo/bar/baz.txt', '.txt')).toBe('baz');
		expect(basename('index.html', '.html')).toBe('index');
	});
});

describe('extname', () => {
	test('When the file name is empty, then it returns an empty string', () => {
		expect(extname('')).toBe('');
	});

	test('When the file name has no extension, then it returns an empty string', () => {
		expect(extname('test')).toBe('');
	});

	test('When the file name has an extension, then it returns the extension', () => {
		expect(extname('test.ext')).toBe('.ext');
	});

	test('When the file name has a composite extension, then it returns the last extension', () => {
		expect(extname('test.e.xt')).toBe('.xt');
	});

	test('When the file name ends with a dot, then it returns the dot', () => {
		expect(extname('test.')).toBe('.');
	});

	test('When the file name starts with a dot and has no other extension, then it returns an empty string', () => {
		expect(extname('.test')).toBe('');
	});

	test('When the file name starts with a dot and has an extension, then it returns the extension', () => {
		expect(extname('.test.ext')).toBe('.ext');
	});
});
describe('resolve', () => {
	test('When no path is provided, then it resolves to the root', () => {
		expect(resolve()).toBe('/');
	});

	test('When empty paths are provided, then they are skipped', () => {
		expect(resolve('', 'foo', '', 'bar')).toBe('/foo/bar');
	});

	test('When a relative path is provided, then it resolves from the root', () => {
		expect(resolve('foo/bar')).toBe('/foo/bar');
	});

	test('When a relative path is provided after another path, then it resolves from the previous path', () => {
		expect(resolve('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
	});

	test('When an absolute path is provided, then it resets the resolving path', () => {
		expect(resolve('/foo', '/bar', 'baz')).toBe('/bar/baz');
	});

	test('When ".." is provided, then it goes back one directory', () => {
		expect(resolve('/foo/bar', '..', 'baz')).toBe('/foo/baz');
	});

	test('When ".." is used at the root, then it does not go back further', () => {
		expect(resolve('..', '..', '..', '..', '..')).toBe('/');
	});

	test('When "../" is provided in a path, then it moves the result back', () => {
		expect(resolve('foo', 'bar', '../baz')).toBe('/foo/baz');
	});

	test('When "." is provided, then it is skipped', () => {
		expect(resolve('/foo', '.', 'bar')).toBe('/foo/bar');
	});

	test('When "./" is provided, then it is handled as a relative path', () => {
		expect(resolve('/foo', './bar')).toBe('/foo/bar');
	});
});

describe('encodePath', () => {
	test('When encoding with default replacer, normal characters get kept', () => {
		expect(encodePath('foo🙃')).toBe('foo🙃');
	});
	test('When encoding with default replacer, segments get trimmed', () => {
		expect(encodePath('      foo     /      bar      ')).toBe('foo/bar');
	});

	test('When encoding with default replacer, then it resolves restricted characters', () => {
		expect(encodePath('*"/\\><:|?\'')).toBe('%2a%22/%5c%3e%3c%3a%7c%3f%27');
	});

	test('When encoding with default replacer, then it resolves restricted names', () => {
		expect(encodePath('CON')).toBe('%43%4f%4e');
		expect(encodePath('COM1')).toBe('%43%4f%4d%31');
	});

	test('When encoding with default replacer, then it resolves "."', () => {
		expect(encodePath('.')).toBe('%2e');
	});

	test('When encoding with default replacer, then it resolves ".."', () => {
		expect(encodePath('..')).toBe('%2e%2e');
	});

	test('When a custom replacer is provided, then it is used to encode segments', () => {
		const customReplacer = (segment: string) => segment.toUpperCase();
		expect(encodePath('foo/bar', customReplacer)).toBe('FOO/BAR');
	});
});

describe.skip('decodePath', () => {
	// TODO
});
