// oxlint-disable max-lines no-magic-numbers

import { beforeEach, describe, expect, test } from 'vitest';
import {
	appendFile,
	checkDirExists,
	checkFileExists,
	copyDir,
	copyFile,
	getDirHandle,
	getFileHandle,
	listDirEntries,
	moveDir,
	moveFile,
	removeDir,
	removeFile,
	resolveHandle,
	writeFile
} from './opfs.ts';

beforeEach(async () => {
	const rootDir = await navigator.storage.getDirectory();

	for await (const name of rootDir.keys()) {
		await rootDir.removeEntry(name, { recursive: true });
	}
});

// #region Get Handles
describe('getDirHandle', () => {
	test('When the path is empty, then it returns the root handle', async () => {
		const handle = await getDirHandle('');

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('');
	});

	test('When the path is a single slash, then it returns the root handle', async () => {
		const handle = await getDirHandle('/');

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
		const customRoot = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo', { recursive: true });

		const handle = await getDirHandle('foo', { rootDir: customRoot });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('foo');
	});

	test('When `rootDir` is provided and `recursive` is true, then it resolves the path recursively relative to it', async () => {
		const customRoot = await getDirHandle('CUSTOM_ROOT', { recursive: true });

		const handle = await getDirHandle('foo/bar', { rootDir: customRoot, recursive: true });

		expect(handle).toBeDefined();
		expect(handle.kind).toBe('directory');
		expect(handle.name).toBe('bar');
	});

	describe('Invalid directory names', () => {
		test('When the directory name starts with a null byte, then it throws an error', async () => {
			await expect(getDirHandle('\0', { recursive: true })).rejects.toThrow();
		});

		test('When the directory name contains a slash, then it is interpreted as a directory separator', async () => {
			const handle = await getDirHandle('test/foo', { recursive: true });

			expect(handle).toBeDefined();
			expect(handle.kind).toBe('directory');
			expect(handle.name).toBe('foo');
		});

		test('When the directory name contains a backslash, then it throws an error', async () => {
			await expect(getDirHandle('test\\foo', { recursive: true })).rejects.toThrow();
		});

		test('When the directory name is a dot, then it resolves to the current directory', async () => {
			const handle = await getDirHandle('.');

			expect(handle).toBeDefined();
			expect(handle.kind).toBe('directory');
			expect(handle.name).toBe('');
		});

		test('When the directory name is dot-dot, then it resolves to the parent directory', async () => {
			const handle = await getDirHandle('..');

			expect(handle).toBeDefined();
			expect(handle.kind).toBe('directory');
			expect(handle.name).toBe('');
		});
	});
});

describe('resolveHandle', () => {
	test('When the path is empty, then it resolves to root', async () => {
		const { parentPath, parentHandle, name } = await resolveHandle('');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When the path is a single slash, then it resolves to root', async () => {
		const { parentPath, parentHandle, name } = await resolveHandle('/');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When the input is a root handle, then it resolves to itself', async () => {
		const rootDir = await navigator.storage.getDirectory();
		const { parentPath, parentHandle, name } = await resolveHandle(rootDir);

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('');
	});

	test('When a handle is provided, then the same handle is returned', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		const { handle: returnedHandle } = await resolveHandle(handle);

		expect(returnedHandle).toBe(handle);
	});

	test('When a path to an existing file is provided, then a handle is returned', async () => {
		await writeFile('foo.txt', 'hello');
		const { handle } = await resolveHandle('foo.txt');

		expect(handle).toBeDefined();
		expect(handle?.kind).toBe('file');
		expect(handle?.name).toBe('foo.txt');
	});

	test('When a path to a non existing file is provided, then `handle` is undefined', async () => {
		const { handle } = await resolveHandle('missing.txt');

		expect(handle).toBeUndefined();
	});

	test('When a path to an existing directory is provided, then a handle is returned', async () => {
		await getDirHandle('foo', { recursive: true });
		const { handle } = await resolveHandle('foo');

		expect(handle).toBeDefined();
		expect(handle?.kind).toBe('directory');
		expect(handle?.name).toBe('foo');
	});

	test('When a path to a non existing directory is provided, then `handle` is undefined', async () => {
		const { handle } = await resolveHandle('missing-dir');

		expect(handle).toBeUndefined();
	});

	test('When the path is a first-level directory, then it resolves to the root as parent', async () => {
		const { parentPath, parentHandle, name } = await resolveHandle('foo');

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('When the path is deeply nested, then it resolves to its immediate parent correctly', async () => {
		await getDirHandle('foo/bar/baz', { recursive: true });

		const { parentPath, parentHandle, name } = await resolveHandle('foo/bar/baz');

		expect(parentPath).toBe('/foo/bar');
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('When the input is a first-level handle, then it resolves to the root as parent', async () => {
		const handle = await getDirHandle('foo', { recursive: true });
		const { parentPath, parentHandle, name } = await resolveHandle(handle);

		expect(parentPath).toBe('/');
		expect(parentHandle.name).toBe('');
		expect(name).toBe('foo');
	});

	test('When the input is a deeply nested handle, then it resolves to its immediate parent', async () => {
		const handle = await getDirHandle('foo/bar/baz', { recursive: true });
		const { parentPath, parentHandle, name } = await resolveHandle(handle);

		expect(parentPath).toBe('/foo/bar');
		expect(parentHandle.name).toBe('bar');
		expect(name).toBe('baz');
	});

	test('When the path does not exist and the `recursive` flag is false, then it throws an error', async () => {
		await expect(resolveHandle('foo/bar', { recursive: false })).rejects.toThrow();
	});

	test('When the path does not exist and the `recursive` flag is true, then it ensures the parent exists and resolves correctly', async () => {
		const { parentPath, parentHandle, name } = await resolveHandle('foo/bar', { recursive: true });

		expect(parentPath).toBe('/foo');
		expect(parentHandle.name).toBe('foo');
		expect(name).toBe('bar');
	});

	test('When `rootDir` is provided, then it resolves the parent handle relative to it', async () => {
		const customRoot = await getDirHandle('CUSTOM_ROOT', { recursive: true });
		await getDirHandle('CUSTOM_ROOT/foo/bar', { recursive: true });

		const { parentPath, name, parentHandle } = await resolveHandle('foo/bar', { rootDir: customRoot });

		expect(parentPath).toBe('/foo');
		expect(parentHandle.name).toBe('foo');
		expect(name).toBe('bar');
	});
});

describe('getFileHandle', () => {
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

	describe('Invalid file names', () => {
		test('When the file name starts with a null byte, then it throws an error', async () => {
			await expect(getFileHandle('\0', { touch: true })).rejects.toThrow();
		});

		test('When the file name contains a slash, then it should be interpreted as a directory separator', async () => {
			const handle = await getFileHandle('test/file.txt', { touch: true, recursive: true });

			expect(handle).toBeDefined();
			expect(handle.kind).toBe('file');
			expect(handle.name).toBe('file.txt');
		});

		test('When the file name contains a backslash, then it throws an error', async () => {
			await expect(getFileHandle('test\\file.txt', { touch: true })).rejects.toThrow();
		});

		test('When the file name is a dot, then it throws an error', async () => {
			await expect(getFileHandle('.', { touch: true })).rejects.toThrow();
		});

		test('When the file name is dot-dot, then it throws an error', async () => {
			await expect(getFileHandle('..', { touch: true })).rejects.toThrow();
		});
	});
});
// #endregion

// #region Check existence
describe('checkDirExists', () => {
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
// #endregion

// #region List dir entries
describe('listDirEntries', () => {
	test('When no depth is provided, then it returns only the immediate children', async () => {
		await getDirHandle('foo', { recursive: true });
		await getFileHandle('bar/baz.txt', { touch: true, recursive: true });
		await getFileHandle('bar/quux.txt', { touch: true, recursive: true });
		await getDirHandle('bar/woot', { recursive: true });
		await getFileHandle('bar/woot/zolt.txt', { touch: true });
		await getFileHandle('bar/woot/yeet.txt', { touch: true });

		const entries = await listDirEntries('/');

		expect(entries.length).toBe(2);
	});

	test('When a partial depth is provided, then it returns children up to that depth', async () => {
		await getDirHandle('foo', { recursive: true });
		await getFileHandle('bar/baz.txt', { touch: true, recursive: true });
		await getFileHandle('bar/quux.txt', { touch: true, recursive: true });
		await getDirHandle('bar/woot', { recursive: true });
		await getFileHandle('bar/woot/zolt.txt', { touch: true });
		await getFileHandle('bar/woot/yeet.txt', { touch: true });

		const entries = await listDirEntries('/', { depth: 1 });

		expect(entries.length).toBe(5);
	});

	test('When depth is set to Infinity, then it returns all nested children', async () => {
		await getDirHandle('foo', { recursive: true });
		await getFileHandle('bar/baz.txt', { touch: true, recursive: true });
		await getFileHandle('bar/quux.txt', { touch: true, recursive: true });
		await getDirHandle('bar/woot', { recursive: true });
		await getFileHandle('bar/woot/zolt.txt', { touch: true });
		await getFileHandle('bar/woot/yeet.txt', { touch: true });

		const entries = await listDirEntries('/', { depth: Infinity });

		expect(entries.length).toBe(7);
	});

	test('When sorting is not provided, then it defaults to numeric sorting', async () => {
		await getDirHandle('b-dir', { recursive: true });
		await getDirHandle('a-dir', { recursive: true });
		await writeFile('file10.txt', '10', { recursive: true });
		await writeFile('file2.txt', '2', { recursive: true });
		await writeFile('file1.txt', '1', { recursive: true });

		const entries = await listDirEntries('/');

		expect(entries.map((entry) => entry.name)).toEqual(['a-dir', 'b-dir', 'file1.txt', 'file2.txt', 'file10.txt']);
	});

	test('When logographic sorting is provided, then it sorts files logographically', async () => {
		await writeFile('file2.txt', '2', { recursive: true });
		await writeFile('file10.txt', '10', { recursive: true });
		await writeFile('file1.txt', '1', { recursive: true });

		const entries = await listDirEntries('/', { sorting: 'logo', type: 'files' });

		expect(entries.map((entry) => entry.name)).toEqual(['file1.txt', 'file10.txt', 'file2.txt']);
	});

	test('When numeric sorting is provided, then it sorts files numerically', async () => {
		await writeFile('file2.txt', '2', { recursive: true });
		await writeFile('file10.txt', '10', { recursive: true });
		await writeFile('file1.txt', '1', { recursive: true });

		const entries = await listDirEntries('/', { sorting: 'numeric', type: 'files' });

		expect(entries.map((entry) => entry.name)).toEqual(['file1.txt', 'file2.txt', 'file10.txt']);
	});

	test('When sorting is disabled, then it does not sort files', async () => {
		await getDirHandle('b-dir', { recursive: true });
		await getDirHandle('a-dir', { recursive: true });
		await writeFile('file10.txt', '10', { recursive: true });
		await writeFile('file2.txt', '2', { recursive: true });
		await writeFile('file1.txt', '1', { recursive: true });

		const entries = await listDirEntries('/', { sorting: false, type: 'both' });

		expect(entries.map((entry) => entry.name)).toEqual(['a-dir', 'b-dir', 'file1.txt', 'file10.txt', 'file2.txt']);
	});

	test('When type is not provided, then both files and directories are included', async () => {
		await getDirHandle('dir', { recursive: true });
		await writeFile('file.txt', 'content', { recursive: true });

		const entries = await listDirEntries('/');

		expect(entries.some((entry) => entry.name === 'dir')).toBe(true);
		expect(entries.some((entry) => entry.name === 'file.txt')).toBe(true);
	});

	test('When type is directory, then only directories are included', async () => {
		await getDirHandle('dir', { recursive: true });
		await writeFile('file.txt', 'content', { recursive: true });

		const entries = await listDirEntries('/', { type: 'directories' });

		expect(entries.every((entry) => entry.handle instanceof FileSystemDirectoryHandle)).toBe(true);
		expect(entries.map((entry) => entry.name)).toEqual(['dir']);
	});

	test('When type is file, then only files are included', async () => {
		await getDirHandle('dir', { recursive: true });
		await writeFile('file.txt', 'content', { recursive: true });

		const entries = await listDirEntries('/', { type: 'files' });

		expect(entries.every((entry) => entry.handle instanceof FileSystemFileHandle)).toBe(true);
		expect(entries.map((entry) => entry.name)).toEqual(['file.txt']);
	});

	test('When type is both, then both files and directories are included', async () => {
		await getDirHandle('dir', { recursive: true });
		await writeFile('file.txt', 'content', { recursive: true });

		const entries = await listDirEntries('/', { type: 'both' });

		expect(entries.some((entry) => entry.name === 'dir')).toBe(true);
		expect(entries.some((entry) => entry.name === 'file.txt')).toBe(true);
	});
});
// #endregion

// #region Write File
describe('writeFile', () => {
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

	test('When a file handle is provided, the file has content and `overwrite` is set to false, then it throw an error', async () => {
		await writeFile('foo.txt', 'foo');
		const handle = await getFileHandle('foo.txt');

		await expect(writeFile(handle, 'bar', { overwrite: false })).rejects.toThrow();
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
// #endregion

// #region Delete
describe('removeDir', () => {
	test('When the path is empty, then it throws an error', async () => {
		await expect(removeDir('')).rejects.toThrow();
	});

	test('When the path is a single slash, then it removes all entries in the root directory', async () => {
		await getDirHandle('foo', { recursive: true });
		await removeDir('/', { recursive: true });

		const rootDir = await navigator.storage.getDirectory();
		const names = await Array.fromAsync(rootDir.keys());

		expect(names.length).toBe(0);
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

		expect(await checkDirExists('foo')).toBe(false);
	});

	test('When the directory is not empty and the `recursive` flag is false, then it throws an error', async () => {
		await getFileHandle('foo/bar.txt', { touch: true, recursive: true });

		await expect(removeDir('foo', { recursive: false })).rejects.toThrow();
	});
});

describe('removeFile', () => {
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

		expect(await checkFileExists('foo.txt')).toBe(false);
	});

	test('When the handle provided is a file handle, then it removes the file', async () => {
		const handle = await getFileHandle('foo.txt', { touch: true });

		await removeFile(handle);

		expect(await checkFileExists('foo.txt')).toBe(false);
	});

	test('When the handle provided is a directory handle, then it throws an error', async () => {
		const handle = await getDirHandle('foo', { recursive: true });

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(removeFile(handle as unknown as FileSystemFileHandle)).rejects.toThrow();
	});
});
// #endregion

// #region Copy
describe('copyFile', () => {
	test('When the file is copied, then it exists in the destination', async () => {
		const content = 'Hello World';
		await writeFile('source.txt', content);
		await copyFile('source.txt', 'dest.txt');

		const exists = await checkFileExists('dest.txt');

		expect(exists).toBe(true);

		const handle = await getFileHandle('dest.txt');
		const file = await handle.getFile();
		const text = await file.text();

		expect(text).toBe(content);
	});

	test('When the destination exists and overwrite is false, then it throws an error', async () => {
		await writeFile('source.txt', 'source');
		await writeFile('dest.txt', 'dest');

		await expect(copyFile('source.txt', 'dest.txt', { overwrite: false })).rejects.toThrow();
	});
});

describe('copyDir', () => {
	test('When a directory is copied, then all its contents are copied recursively', async () => {
		await writeFile('src/file1.txt', 'content1', { recursive: true });
		await writeFile('src/sub/file2.txt', 'content2', { recursive: true });

		await getDirHandle('dest', { recursive: true });
		await copyDir('src', 'dest');

		expect(await checkFileExists('dest/file1.txt')).toBe(true);
		expect(await checkFileExists('dest/sub/file2.txt')).toBe(true);

		const file1 = await (await getFileHandle('dest/file1.txt')).getFile();
		expect(await file1.text()).toBe('content1');

		const file2 = await (await getFileHandle('dest/sub/file2.txt')).getFile();
		expect(await file2.text()).toBe('content2');
	});

	test('When the source directory does not exist, then it throws an error', async () => {
		await getDirHandle('dest', { recursive: true });

		await expect(copyDir('src-err', 'dest')).rejects.toThrow();
	});

	test('When the destination directory does not exist, then it throws an error', async () => {
		await getDirHandle('src', { recursive: true });

		await expect(copyDir('src', 'dest')).rejects.toThrow();
	});
});
// #endregion

// #region Move
describe('moveFile', () => {
	test('When the file is moved, then it exists in the destination and not in the source', async () => {
		const content = 'Move me';
		await writeFile('source.txt', content);
		await moveFile('source.txt', 'dest.txt');

		expect(await checkFileExists('dest.txt')).toBe(true);
		expect(await checkFileExists('source.txt')).toBe(false);

		const text = await (await (await getFileHandle('dest.txt')).getFile()).text();
		expect(text).toBe(content);
	});

	test('When the destination exists and overwrite is false, then it throws an error and keeps the source', async () => {
		await writeFile('source.txt', 'source content');
		await writeFile('dest.txt', 'dest content');

		await expect(moveFile('source.txt', 'dest.txt', { overwrite: false })).rejects.toThrow();
		expect(await checkFileExists('source.txt')).toBe(true);
	});
});

describe('moveDir', () => {
	test('When a directory is moved, then all its contents are moved to the destination', async () => {
		await writeFile('src/file1.txt', 'content1', { recursive: true });
		await writeFile('src/sub/file2.txt', 'content2', { recursive: true });
		await getDirHandle('dest', { recursive: true });

		await moveDir('src', 'dest');

		expect(await checkFileExists('dest/file1.txt')).toBe(true);
		expect(await checkFileExists('dest/sub/file2.txt')).toBe(true);
		expect(await checkFileExists('src/file1.txt')).toBe(false);
		expect(await checkFileExists('src/sub/file2.txt')).toBe(false);
		expect(await checkDirExists('src')).toBe(false);

		const file2 = await (await getFileHandle('dest/sub/file2.txt')).getFile();
		expect(await file2.text()).toBe('content2');
	});

	test('When the source directory does not exist, then it throws an error', async () => {
		await expect(moveDir('src-err', 'dest')).rejects.toThrow();
	});
});
// #endregion
