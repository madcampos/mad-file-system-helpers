// oxlint-disable max-lines

import { beforeEach, describe, expect, test } from 'vitest';
import {
	appendFile,
	checkDirExists,
	checkFileExists,
	getDirHandle,
	getFileHandle,
	listDirEntries,
	removeDir,
	removeFile,
	resolveParentHandle,
	writeFile
} from './opfs.ts';

describe('getDirHandle', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the path is empty, then it returns the root handle', async () => {
		const handle = await getDirHandle('');

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('');
	});

	test('When the path is relative, then it resolves from the root', async () => {
		const handle = await getDirHandle('foo/bar', { recursive: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');

		const otherHandle = await getDirHandle('foo/bar');

		expect(otherHandle).toBeDefined();
		expect(otherHandle.kind).toBe('directory');
		expect(otherHandle.name).toBe('bar');
	});

	test('When the path does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(getDirHandle('/test', { recursive: false })).rejects.toThrow();
	});

	test('When the path does not exist and the `recursive` flag is true, then it creates the directory and returns a handle', async () => {
		const handle = await getDirHandle('/foo/bar', { recursive: true });
		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');

		const otherHandle = await getDirHandle('/foo/bar');

		expect(otherHandle).toBeDefined();
		expect(otherHandle.kind).toBe('directory');
		expect(otherHandle.name).toBe('bar');
	});

	test('When `rootDir` is provided, then it resolves the path relative to it', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo', { recursive: true });

		const handle = await getDirHandle('foo', { rootDir: root });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('foo');
	});

	test('When `rootDir` is provided and `recursive` is true, then it resolves the path recursively relative to it', async () => {
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

	test('When the path is empty, then it resolves to rootn', async () => {
		const { parentPath, parentHandle, name } = await resolveParentHandle('');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When the path is a single slash, then it resolves to root', async () => {
		const { parentPath, parentHandle, name } = await resolveParentHandle('/');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When the input is a root handle, then it resolves to itself', async () => {
		const rootDir = await navigator.storage.getDirectory();
		const { parentPath, parentHandle, name } = await resolveParentHandle(rootDir);

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When the path is a first-level directory, then it resolves to the root as parent', async () => {
		const { parentPath, parentHandle, name } = await resolveParentHandle('foo');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('When the path is deeply nested, then it resolves to its immediate parent correctly', async () => {
		await getDirHandle('foo/bar/baz', { recursive: true });

		const { parentPath, parentHandle, name } = await resolveParentHandle('foo/bar/baz');

		expect(parentPath).toBe('/foo/bar');
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('When the input is a first-level handle, then it resolves to the root as parent', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		const { parentPath, parentHandle, name } = await resolveParentHandle(handle);

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('When the input is a deeply nested handle, then it resolves to its immediate parent', async () => {
		const handle = await getDirHandle('foo/bar/baz', { recursive: true });
		const { parentPath, parentHandle, name } = await resolveParentHandle(handle);

		expect(parentPath).toBe('/foo/bar');
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('When the path does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(resolveParentHandle('foo/bar', { recursive: false })).rejects.toThrow();
	});

	test('When the path does not exist and the `recursive` flag is true, then it ensures the parent exists and resolves correctly', async () => {
		const { parentPath, parentHandle, name } = await resolveParentHandle('foo/bar', { recursive: true });

		expect(parentPath).toBe('/foo');
		expect(parentHandle.name).toBe('foo');
		expect(name).toBe('bar');
	});

	test('When `rootDir` is provided, then it resolves the parent handle relative to it', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo/bar', { recursive: true });

		const { parentPath, name, parentHandle } = await resolveParentHandle('foo/bar', { rootDir: root });

		expect(parentPath).toBe('/foo');
		expect(parentHandle.name).toBe('foo');
		expect(name).toBe('bar');
	});
});

describe('getFileHandle', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the path is empty, then it throws an error', async () => {
		await expect(getFileHandle('')).rejects.toThrow();
	});

	test('When the path is the root, then it throws an error', async () => {
		await expect(getFileHandle('/')).rejects.toThrow();
	});

	test('When the path points to a directory, then it throws an error', async () => {
		await getDirHandle('foo', { recursive: true });
		await expect(getFileHandle('foo')).rejects.toThrow();
	});

	test('When the file does not exist, then it throws an error', async () => {
		await expect(getFileHandle('foo.txt')).rejects.toThrow();
	});

	test('When the file does not exist and the `touch` flag is true, then it creates the file and returns it', async () => {
		const handle = await getFileHandle('test.txt', { touch: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('file');
		expect(handle.name).toBe('test.txt');

		const otherHandle = await getFileHandle('test.txt');
		expect(otherHandle).toBeDefined();
	});

	test('When the parent directory does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(getFileHandle('foo/bar/baz.txt', { recursive: false })).rejects.toThrow();
	});

	test('When the parent directory does not exist and the `touch` flag is false, then it throws an error', async () => {
		await expect(getFileHandle('foo/bar/baz.txt', { recursive: true })).rejects.toThrow();
	});

	test('When the parent directory does not exist and both `recursive` and `touch` flags are true, then it creates the path and returns the handle', async () => {
		const handle = await getFileHandle('foo/bar/baz.txt', { touch: true, recursive: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('file');
		expect(handle.name).toBe('baz.txt');
	});

	test('When `rootDir` is provided, then it resolves the file handle relative to it', async () => {
		const root = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		const handle = await getFileHandle('foo.txt', { rootDir: root, touch: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('file');
		expect(handle.name).toBe('foo.txt');
		expect((await root.resolve(handle))?.length).toBe(1);
	});
});

describe('checkDirExists', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the directory exists, then it returns `true`', async () => {
		await getDirHandle('foo', { recursive: true });
		const exists = await checkDirExists('foo');
		expect(exists).toBe(true);
	});

	test('When the directory does not exist, then it returns `false`', async () => {
		const exists = await checkDirExists('foo.txt');
		expect(exists).toBe(false);
	});

	test('When the path points to a file, then it throws an error', async () => {
		await getFileHandle('baz.txt', { touch: true });
		await expect(checkDirExists('baz.txt')).rejects.toThrow();
	});
});

describe('checkFileExists', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the file exists, then it returns `true`', async () => {
		await getFileHandle('foo.txt', { touch: true });
		const exists = await checkFileExists('foo.txt');
		expect(exists).toBe(true);
	});

	test('When the file does not exist, then it returns `false`', async () => {
		const exists = await checkFileExists('foo.txt');
		expect(exists).toBe(false);
	});

	test('When the path points to a directory, then it throws an error', async () => {
		await getDirHandle('bar', { recursive: true });
		await expect(checkFileExists('bar')).rejects.toThrow();
	});
});

describe('listDirEntries', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}

		await getDirHandle('foo', { recursive: true });
		await getDirHandle('bar/woot', { recursive: true });
		await getFileHandle('bar/baz.txt', { touch: true });
		await getFileHandle('bar/quux.txt', { touch: true });
	});

	test('When no depth is provided, then it returns only the immediate children', async () => {
		const entries = await listDirEntries('/');

		// oxlint-disable-next-line no-magic-numbers
		expect(entries.length).toBe(2);
		expect(entries.every(({ children }) => children === undefined)).toBe(true);
	});

	test('When a partial depth is provided, then it returns children up to that depth', async () => {
		const entries = await listDirEntries('/', { depth: 1 });

		// oxlint-disable-next-line no-magic-numbers
		expect(entries.length).toBe(2);
		expect(entries.some(({ children, handle }) => handle instanceof FileSystemDirectoryHandle && children !== undefined)).toBe(true);
	});

	test('When depth is set to Infinity, then it returns all nested children', async () => {
		const entries = await listDirEntries('/', { depth: Infinity });

		// oxlint-disable-next-line no-magic-numbers
		expect(entries.length).toBe(2);
		expect(entries.every(({ children, handle }) => (handle instanceof FileSystemDirectoryHandle && children !== undefined) || (handle instanceof FileSystemFileHandle)))
			.toBe(true);
	});
});

describe('writeFile', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When writing to a new file, then it creates the file and writes the content', async () => {
		await writeFile('foo.txt', 'foo');

		const handle = await getFileHandle('foo.txt');
		const file = await handle.getFile();
		expect(await file.text()).toBe('foo');
	});

	test('When the file exists and the `overwrite` flag is false, then it throws an error', async () => {
		await writeFile('foo.txt', 'foo');

		await expect(writeFile('foo.txt', 'bar', { overwrite: false })).rejects.toThrow();
	});

	test('When the file exists and the `overwrite` flag is true, then it overwrites the file content', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });

		await writeFile('foo.txt', 'foo', { overwrite: true });

		const file = await handle.getFile();
		expect(await file.text()).toBe('foo');
	});

	test('When the parent directory does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(writeFile('foo/bar/baz.txt', 'baz', { recursive: false })).rejects.toThrow();
	});

	test('When the parent directory does not exist and the `recursive` flag is true, then it creates the directory and writes the file', async () => {
		await writeFile('foo/bar/baz.txt', 'baz', { recursive: true });

		const handle = await getFileHandle('foo/bar/baz.txt');
		const file = await handle.getFile();
		expect(await file.text()).toBe('baz');
	});

	test('When the path is empty, then it throws an error', async () => {
		await expect(writeFile('', 'foo')).rejects.toThrow();
	});

	test('When a file handle is provided, then it writes the content to that handle', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });
		await writeFile(handle, 'foo');

		const file = await handle.getFile();
		expect(await file.text()).toBe('foo');
	});

	test('When a directory handle is provided, then it throws an error', async () => {
		const dirHandle = await getDirHandle('dir', { recursive: true });
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(writeFile(dirHandle as unknown as FileSystemFileHandle, 'foo')).rejects.toThrow();
	});

	test('When a directory path is provided, then it throws an error', async () => {
		await getDirHandle('dir', { recursive: true });
		await expect(writeFile('dir', 'foo')).rejects.toThrow();
	});
});

describe('appendFile', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When appending to a new file, then it creates the file and writes the content', async () => {
		await appendFile('foo.txt', 'foo');

		const handle = await getFileHandle('foo.txt');
		const file = await handle.getFile();
		expect(await file.text()).toBe('foo');
	});

	test('When appending to an existing file, then it adds the content to the end of the file', async () => {
		await writeFile('foo.txt', 'foo');
		await appendFile('foo.txt', 'bar');

		const handle = await getFileHandle('foo.txt');
		const file = await handle.getFile();
		expect(await file.text()).toBe('foobar');
	});

	test('When the parent directory does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(appendFile('foo/bar/baz.txt', 'baz', { recursive: false })).rejects.toThrow();
	});

	test('When the parent directory does not exist and the `recursive` flag is true, then it creates the directory and appends to the file', async () => {
		await writeFile('foo/bar/baz.txt', 'foo', { recursive: true });
		await appendFile('foo/bar/baz.txt', 'baz', { recursive: true });

		const handle = await getFileHandle('foo/bar/baz.txt');
		const file = await handle.getFile();
		expect(await file.text()).toBe('foobaz');
	});

	test('When the path is empty, then it throws an error', async () => {
		await expect(appendFile('', 'foo')).rejects.toThrow();
	});

	test('When a file handle is provided, then it appends the content to that handle', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });
		await writeFile(handle, 'foo');
		await appendFile(handle, 'bar');

		const file = await handle.getFile();
		expect(await file.text()).toBe('foobar');
	});

	test('When a directory handle is provided, then it throws an error', async () => {
		const dirHandle = await getDirHandle('dir', { recursive: true });
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(appendFile(dirHandle as unknown as FileSystemFileHandle, 'foo')).rejects.toThrow();
	});

	test('When a directory path is provided, then it throws an error', async () => {
		await getDirHandle('dir', { recursive: true });
		await expect(appendFile('dir', 'foo')).rejects.toThrow();
	});
});

describe('removeDir', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the path is empty, then it removes all entries in the root directory', async () => {
		await getDirHandle('foo', { recursive: true });
		await removeDir('', { recursive: true });

		const rootDir = await navigator.storage.getDirectory();
		const entries = [];

		for await (const name of rootDir.keys()) {
			entries.push(name);
		}

		expect(entries.length).toBe(0);
	});

	test('When the path is a single slash, then it removes all entries in the root directory', async () => {
		await getDirHandle('foo', { recursive: true });
		await removeDir('/', { recursive: true });

		const rootDir = await navigator.storage.getDirectory();
		const entries = [];

		for await (const name of rootDir.keys()) {
			entries.push(name);
		}

		expect(entries.length).toBe(0);
	});

	test('When the path points to a file, then it throws an error', async () => {
		await getFileHandle('foo.txt', { touch: true });
		await expect(removeDir('foo.txt', { recursive: true })).rejects.toThrow();
	});

	test('When the handle provided is a file handle, then it throws an error', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(removeDir(handle as unknown as FileSystemDirectoryHandle, { recursive: true })).rejects.toThrow();
	});

	test('When the handle provided is a directory handle, then it removes the directory', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		await removeDir(handle, { recursive: true });

		const exists = await checkDirExists('foo');
		expect(exists).toBe(false);
	});

	test('When the directory is not empty and the `recursive` flag is false, then it throws an error', async () => {
		await getFileHandle('foo/bar.txt', { touch: true, recursive: true });
		await expect(removeDir('foo', { recursive: false })).rejects.toThrow();
	});
});

describe('removeFile', () => {
	beforeEach(async () => {
		const rootDir = await navigator.storage.getDirectory();

		for await (const name of rootDir.keys()) {
			await rootDir.removeEntry(name, { recursive: true });
		}
	});

	test('When the path is empty, then it throws an error', async () => {
		await expect(removeFile('')).rejects.toThrow();
	});

	test('When the path points to a directory, then it throws an error', async () => {
		await getDirHandle('foo', { recursive: true });
		await expect(removeFile('foo')).rejects.toThrow();
	});

	test('When the file does not exist, then it throws an error', async () => {
		await expect(removeFile('foo.txt')).rejects.toThrow();
	});

	test('When the path points to a file, then it removes the file', async () => {
		await getFileHandle('foo.txt', { touch: true });
		await removeFile('foo.txt');

		const exists = await checkFileExists('foo.txt');
		expect(exists).toBe(false);
	});

	test('When the handle provided is a file handle, then it removes the file', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });
		await removeFile(handle);

		const exists = await checkFileExists('foo.txt');
		expect(exists).toBe(false);
	});

	test('When the handle provided is a directory handle, then it throws an error', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(removeFile(handle as unknown as FileSystemFileHandle)).rejects.toThrow();
	});
});
