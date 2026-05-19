import { describe, expect, test } from 'vitest';
import { basename, dirname, encodePath, extname, pathToSegments, resolve } from './path';

describe('pathToSegments', () => {
	test('A single slash returns no segment', () => {
		expect(pathToSegments('/')).toEqual([]);
	});

	test('An empty string returns no segments', () => {
		expect(pathToSegments('')).toEqual([]);
	});

	test('A single lone percentage sign gets correctly handled', () => {
		expect(pathToSegments('%')).toEqual(['%']);
	});

	test('URI encoded strings get correctly handled', () => {
		expect(pathToSegments('foo%20bar/baz%2Fqux')).toEqual(['foo bar', 'baz', 'qux']);
	});

	test('Multiple slashes get collapsed', () => {
		expect(pathToSegments('foo///bar//baz')).toEqual(['foo', 'bar', 'baz']);
	});
});

describe('dirname', () => {
	test('Path is empty', () => {
		expect(dirname('')).toBe('');
	});

	test('Path is root', () => {
		expect(dirname('/')).toBe('/');
	});

	test('Trailing slash is ignored', () => {
		expect(dirname('/foo/bar/')).toBe('/foo');
	});

	test('Path ends in a file', () => {
		expect(dirname('/foo/bar/baz.ext')).toBe('/foo/bar');
	});

	test('Path ends in a directory', () => {
		expect(dirname('/foo/bar')).toBe('/foo');
	});

	test('Path is first level', () => {
		expect(dirname('/foo')).toBe('/');
	});

	test('Path is relative', () => {
		expect(dirname('foo/bar')).toBe('foo');
		expect(dirname('foo')).toBe('');
	});
});

describe('basename', () => {
	test('Path is empty', () => {
		expect(basename('')).toBe('');
	});

	test('Path is root', () => {
		expect(basename('/')).toBe('');
	});

	test('Path ends in a file', () => {
		expect(basename('/foo/bar/baz.txt')).toBe('baz.txt');
	});

	test('Path ends in a directory', () => {
		expect(basename('/foo/bar/')).toBe('bar');
		expect(basename('/foo/bar')).toBe('bar');
	});

	test('Path with suffix removes suffix', () => {
		expect(basename('/foo/bar/baz.txt', '.txt')).toBe('baz');
		expect(basename('index.html', '.html')).toBe('index');
	});
});

describe('extname', () => {
	test('Empty file name', () => {
		expect(extname('')).toBe('');
	});

	test('File name with no extension', () => {
		expect(extname('test')).toBe('');
	});

	test('File name with extension', () => {
		expect(extname('test.ext')).toBe('.ext');
	});

	test('File name with composite extension', () => {
		expect(extname('test.e.xt')).toBe('.xt');
	});

	test('File name with ending dot', () => {
		expect(extname('test.')).toBe('.');
	});

	test('File name starting with dot and no extension', () => {
		expect(extname('.test')).toBe('');
	});

	test('File name starting with dot and extension', () => {
		expect(extname('.test.ext')).toBe('.ext');
	});
});
describe('resolve', () => {
	test('No path resolves to root', () => {
		expect(resolve()).toBe('/');
	});

	test('Empty paths are skipped', () => {
		expect(resolve('', 'foo', '', 'bar')).toBe('/foo/bar');
	});

	test('Relative path gets resolved from root', () => {
		expect(resolve('foo/bar')).toBe('/foo/bar');
	});

	test('Relative path gets resolved from previous path', () => {
		expect(resolve('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
	});

	test('Absolute path resets the resolving path', () => {
		expect(resolve('/foo', '/bar', 'baz')).toBe('/bar/baz');
	});

	test('".." goes back one dir', () => {
		expect(resolve('/foo/bar', '..', 'baz')).toBe('/foo/baz');
	});

	test('".." doesn\'t go back further than root', () => {
		expect(resolve('..', '..', '..', '..', '..')).toBe('/');
	});

	test('"../" moves the result back', () => {
		expect(resolve('foo', 'bar', '../baz')).toBe('/foo/baz');
	});

	test('"." is skipped', () => {
		expect(resolve('/foo', '.', 'bar')).toBe('/foo/bar');
	});

	test('"./" gets handled as relative path', () => {
		expect(resolve('/foo', './bar')).toBe('/foo/bar');
	});
});

describe('encodePath', () => {
	test('Default replace resolves restricted characters', () => {
		expect(encodePath('foo/bar/baz?')).toBe('foo/bar/baz%3f');
		expect(encodePath('foo:bar')).toBe('foo%3abar');
	});

	test('Default replace resolves restricted names', () => {
		expect(encodePath('CON')).toBe('%43%4f%4e');
		expect(encodePath('COM1')).toBe('%43%4f%4d%31');
	});

	test('Custom replace works', () => {
		const customReplacer = (segment: string) => segment.toUpperCase();
		expect(encodePath('foo/bar', customReplacer)).toBe('FOO/BAR');
	});
});
