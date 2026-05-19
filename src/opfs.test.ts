// oxlint-disable max-lines

import { beforeEach, describe, expect, test } from 'vitest';
import { getDirHandle, resolveParentHandle } from './opfs.ts';

describe('getDirHandle', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('Empty path returns root', async () => {
		const handle = await getDirHandle('');

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('');
	});

	test('Path without the recursive flag throws an error', async () => {
		await expect(getDirHandle('/test', { recursive: false })).rejects.toThrow();
	});

	test('Relative path resolves to root', async () => {
		const handle = await getDirHandle('foo/bar', { recursive: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');

		const otherHandle = await getDirHandle('foo/bar');

		expect(otherHandle).toBeDefined();
		expect(otherHandle.kind).toBe('directory');
		expect(otherHandle.name).toBe('bar');
	});

	test('Path with recursive flag returns a handle', async () => {
		const handle = await getDirHandle('/foo/bar', { recursive: true });
		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');

		const otherHandle = await getDirHandle('/foo/bar');

		expect(otherHandle).toBeDefined();
		expect(otherHandle.kind).toBe('directory');
		expect(otherHandle.name).toBe('bar');
	});

	test('Resolves relative to rootDir correctly', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo', { recursive: true });

		const handle = await getDirHandle('foo', { rootDir: root });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('foo');
	});

	test('Resolves recusrivelly relative to rootDir correctly', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });

		const handle = await getDirHandle('foo/bar', { rootDir: root, recursive: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');
	});
});

describe('resolveParentHandle', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('Empty path returns root', async () => {
		const { isRoot, parentHandle, name } = await resolveParentHandle('');

		expect(isRoot).toBe(true);
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('Single slash returns root', async () => {
		const { isRoot, parentHandle, name } = await resolveParentHandle('/');

		expect(isRoot).toBe(true);
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('Root handle resolves to itself', async () => {
		const rootDir = await navigator.storage.getDirectory();
		const { isRoot, parentHandle, name } = await resolveParentHandle(rootDir);

		expect(isRoot).toBe(true);
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('First level path resolves to parent correctly', async () => {
		const { isRoot, parentHandle, name } = await resolveParentHandle('foo');

		expect(isRoot).toBe(true);
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('Deep nested path resolves to parent correctly', async () => {
		await getDirHandle('foo/bar/baz', { recursive: true });

		const { isRoot, parentHandle, name } = await resolveParentHandle('foo/bar/baz');

		expect(isRoot).toBe(false);
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('First level handle resolves to parent correctly', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		const { isRoot, parentHandle, name } = await resolveParentHandle(handle);

		expect(isRoot).toBe(true);
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('Deep nested handle resolves to parent correctly', async () => {
		const handle = await getDirHandle('foo/bar/baz', { recursive: true });
		const { isRoot, parentHandle, name } = await resolveParentHandle(handle);

		expect(isRoot).toBe(false);
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('Path without the recursive flag throws an error', async () => {
		await expect(resolveParentHandle('foo/bar', { recursive: false })).rejects.toThrow();
	});

	test('Resolves relative to rootDir correctly', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo/bar', { recursive: true });

		const { isRoot, name, parentHandle } = await resolveParentHandle('foo/bar', { rootDir: root });

		expect(isRoot).toBe(false);
		expect(parentHandle.name).toBe('foo');
		expect(name).toBe('bar');
	});
});
