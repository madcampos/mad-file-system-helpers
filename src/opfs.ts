// oxlint-disable max-lines

import { basename, dirname, pathToSegments, resolve } from './path.ts';
import { requestHandlePermissions } from './permissions.ts';

// #region Get handles
export interface GetDirHandleOptions {
	/** Creates the directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Gets the directory handle for a given path.
 *
 * @param path The path to get a directory handle.
 * @param options The options for function.
 */
export async function getDirHandle(path: string, { rootDir, recursive }: GetDirHandleOptions = {}) {
	const segments = pathToSegments(resolve(path));

	let currentDirHandle = rootDir ?? await navigator.storage.getDirectory();

	await requestHandlePermissions(currentDirHandle, 'read');

	for (const segment of segments) {
		// oxlint-disable-next-line no-await-in-loop
		currentDirHandle = await currentDirHandle.getDirectoryHandle(segment, { create: recursive });

		// oxlint-disable-next-line no-await-in-loop
		await requestHandlePermissions(currentDirHandle, 'read');
	}

	return currentDirHandle;
}

/**
 * Resolves the parent item for this path or handle.
 *
 * If the root of the file system is passed, it returns the root itself.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param options The options for function.
 */
export async function resolveParentHandle(pathOrHandle: string | FileSystemHandle, { recursive, rootDir }: GetDirHandleOptions = {}) {
	const resolvedRootDir = rootDir ?? await navigator.storage.getDirectory();
	let resolvedPath;

	if (typeof pathOrHandle === 'string') {
		resolvedPath = resolve(pathOrHandle);
	} else {
		resolvedPath = resolve((await resolvedRootDir.resolve(pathOrHandle) ?? []).join('/'));
	}

	const parentDirPath = dirname(resolvedPath);
	const parentDirHandle = await getDirHandle(parentDirPath, { rootDir, recursive });

	return {
		parentHandle: parentDirHandle,
		parentPath: parentDirPath,
		name: basename(resolvedPath)
	};
}

export interface GetFileHandleOptions {
	/** Creates the file if it doesn't exist. Throws an error otherwise */
	touch?: boolean;

	/** Creates the directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Gets a file handle for a given path. Optionally creating the file if it doesn't exist.
 *
 * @param path A path string for the file.
 * @param options The options for function.
 */
export async function getFileHandle(path: string, { touch, recursive, rootDir }: GetFileHandleOptions = {}) {
	const resolvedPath = resolve(path);
	const fileName = basename(resolvedPath);
	const resolvedDir = dirname(resolvedPath);

	const dirHandle = await getDirHandle(resolvedDir, { recursive, rootDir });

	return dirHandle.getFileHandle(fileName, { create: touch });
}

// #endregion

// #region Check existence
export interface CheckDirExistsOptions {
	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

export async function checkDirExists(path: string, { rootDir }: CheckDirExistsOptions = {}) {
	try {
		const { name, parentHandle } = await resolveParentHandle(path, { rootDir });

		await parentHandle.getDirectoryHandle(name, { create: false });

		return true;
	} catch (err) {
		if (err.name === 'NotFoundError') {
			return false;
		}

		throw err;
	}
}

export interface CheckFileExistsOptions {
	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

export async function checkFileExists(path: string, { rootDir }: CheckFileExistsOptions = {}) {
	try {
		const { name, parentHandle } = await resolveParentHandle(path, { rootDir });

		await parentHandle.getFileHandle(name, { create: false });

		return true;
	} catch (err) {
		if (err.name === 'NotFoundError') {
			return false;
		}

		throw err;
	}
}
// #endregion

// #region List Directory entries
export interface ListDirEntriesOptions {
	/** The depth to recurse on the directory tree. It defaults to 0 */
	depth?: number;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

export interface FileSystemEntry {
	name: string;
	handle: FileSystemHandle;
	children?: FileSystemEntry[];
}

/**
 * Lists the directory contents recursivelly up to the `depth` provided.
 *
 * It returns an array of items, if the item have children and the depth is not exceeded, the children property will be filled.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param options The options for function.
 */
export async function listDirEntries(pathOrHandle: string | FileSystemDirectoryHandle, { depth = 0, rootDir }: ListDirEntriesOptions = {}) {
	const { name, parentHandle, parentPath } = await resolveParentHandle(pathOrHandle, { rootDir });
	const resolvedRootHandle = rootDir ?? await navigator.storage.getDirectory();
	const dirHandle = (parentPath === '/' && name === '') ? resolvedRootHandle : await parentHandle.getDirectoryHandle(name);

	async function getRecursiveEntries(curDirHandle: FileSystemDirectoryHandle, curDepth: number) {
		const entries: FileSystemEntry[] = [];

		for await (const [name, entry] of curDirHandle.entries()) {
			if (entry.kind === 'file' || curDepth >= depth) {
				entries.push({
					name,
					handle: entry
				});
			} else {
				entries.push({
					name,
					handle: entry,
					children: await getRecursiveEntries(entry, curDepth + 1)
				});
			}
		}

		return entries;
	}

	return getRecursiveEntries(dirHandle, 0);
}
// #endregion

// #region Write File
export interface WriteFileHandleOptions {
	/** Creates the directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/** Overwrites the file if it exists. */
	overwrite?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Write data to a file, overwriting existing data.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param data The data to write to the file.
 * @param options The options for function.
 */
export async function writeFile(
	pathOrHandle: string | FileSystemFileHandle,
	data: FileSystemWriteChunkType,
	{ recursive = true, rootDir, overwrite = true }: WriteFileHandleOptions = {}
) {
	const { name, parentHandle } = await resolveParentHandle(pathOrHandle, { recursive: recursive, rootDir });
	const fileHandle = await parentHandle.getFileHandle(name, { create: true });
	const file = await fileHandle.getFile();

	if (file.size && !overwrite) {
		throw new DOMException('Cannot overwrite existing file', 'NotAllowedError');
	}

	await requestHandlePermissions(fileHandle, 'readwrite');

	const stream = await fileHandle.createWritable();

	await stream.truncate(0);
	await stream.write(data);
	await stream.close();
}

export interface AppendFileHandleOptions {
	/** Creates the directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Appends data to the end of a file.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param data The data to append to the file.
 * @param options The options for function.
 */
export async function appendFile(pathOrHandle: string | FileSystemFileHandle, data: FileSystemWriteChunkType, { recursive, rootDir }: AppendFileHandleOptions = {}) {
	const { name, parentHandle } = await resolveParentHandle(pathOrHandle, { recursive: recursive, rootDir });
	const fileHandle = await parentHandle.getFileHandle(name, { create: true });

	await requestHandlePermissions(fileHandle, 'readwrite');

	const stream = await fileHandle.createWritable({ keepExistingData: true });
	const file = await fileHandle.getFile();

	await stream.seek(file.size);
	await stream.write(data);
	await stream.close();
}
// #endregion

// #region Delete
export interface RemoveDirOptions {
	/**
	 * If the directory has children and this is set to `true`, removes the children.
	 * If it is set to `false` and the directory has children, throws an error.
	 * If the directory has no children, this has no effect.
	 */
	recursive?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Deletes a directory, optionally also deleting it's contents recursivelly.
 *
 * If the directory is the root of the file system, all children will be deleted but the root directory itself will be kept.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param options The options for function.
 */
export async function removeDir(pathOrHandle: string | FileSystemDirectoryHandle, { recursive, rootDir }: RemoveDirOptions) {
	const { name, parentHandle, parentPath } = await resolveParentHandle(pathOrHandle, { rootDir });

	if (parentPath === '/' && name === '') {
		await requestHandlePermissions(parentHandle, 'readwrite');

		for await (const childName of parentHandle.keys()) {
			await parentHandle.removeEntry(childName, { recursive });
		}

		return;
	}

	const dirHandle = await parentHandle.getDirectoryHandle(name);
	const entries = await listDirEntries(dirHandle, { rootDir, depth: 0 });

	for (const entry of entries) {
		// oxlint-disable-next-line no-await-in-loop
		await parentHandle.removeEntry(entry.name, { recursive });
	}

	await parentHandle.removeEntry(name, { recursive });
}

export interface RemoveFileOptions {
	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Deletes a file.
 *
 * @param pathOrHandle A path string or a {@link FileSystemHandle}
 * @param options The options for function.
 */
export async function removeFile(pathOrHandle: string | FileSystemFileHandle, { rootDir }: RemoveFileOptions = {}) {
	const { name, parentHandle } = await resolveParentHandle(pathOrHandle, { rootDir });
	const fileHandle = await parentHandle.getFileHandle(name);

	await requestHandlePermissions(fileHandle, 'readwrite');
	await requestHandlePermissions(parentHandle, 'readwrite');

	await parentHandle.removeEntry(name);
}
// #endregion

// #region Copy
export interface CopyDirOptions {
	/** Creates the destination directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/** Overwrites existing files in the destination. */
	overwrite?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Copies a directory from one location to another.
 *
 * @param sourcePathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the source directory.
 * @param destinationPathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the destination directory.
 * @param options The options for function.
 */
export async function copyDir(
	sourcePathOrHandle: string | FileSystemDirectoryHandle,
	destinationPathOrHandle: string | FileSystemDirectoryHandle,
	{ overwrite = true, rootDir, recursive = true }: CopyDirOptions = {}
) {
	const entries = await listDirEntries(sourcePathOrHandle, { depth: Infinity, rootDir });
	const { name: destName, parentHandle: destParentHandle } = await resolveParentHandle(destinationPathOrHandle, { recursive, rootDir });
	const destHandle = await destParentHandle.getDirectoryHandle(destName);

	async function copyRecursive(items: FileSystemEntry[], currentDestHandle: FileSystemDirectoryHandle) {
		for (const item of items) {
			const handle = item.handle;
			// oxlint-disable no-await-in-loop
			if (handle instanceof FileSystemFileHandle) {
				const destFileHandle = await currentDestHandle.getFileHandle(item.name, { create: true });

				// oxlint-disable-next-line no-use-before-define
				await copyFile(handle, destFileHandle, { recursive, rootDir, overwrite });
			} else if (item.children) {
				const newDestDirHandle = await currentDestHandle.getDirectoryHandle(item.name, { create: true });

				await copyRecursive(item.children, newDestDirHandle);
			}
			// oxlint-enable no-await-in-loop
		}
	}

	await copyRecursive(entries, destHandle);
}

export interface CopyFileOptions {
	/** Creates the destination directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/** Overwrites the file in the destination if it already exists. */
	overwrite?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Copies a file from one location to another.
 *
 * @param sourcePathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the source file.
 * @param destinationPathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the destination file.
 * @param options The options for function.
 */
export async function copyFile(
	sourcePathOrHandle: string | FileSystemFileHandle,
	destinationPathOrHandle: string | FileSystemFileHandle,
	{ overwrite = true, rootDir, recursive = true }: CopyDirOptions = {}
) {
	let sourceHandle;

	if (typeof sourcePathOrHandle === 'string') {
		sourceHandle = await getFileHandle(sourcePathOrHandle, { rootDir });
	} else {
		sourceHandle = sourcePathOrHandle;
	}

	const file = await sourceHandle.getFile();
	await writeFile(destinationPathOrHandle, await file.arrayBuffer(), { rootDir, recursive, overwrite });
}
// #endregion

// #region Move
export interface MoveDirOptions {
	/** Creates the destination directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/** Overwrites existing files in the destination. */
	overwrite?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Moves a directory from one location to another.
 *
 * @param sourcePathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the source directory.
 * @param destinationPathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the destination directory.
 * @param options The options for function.
 */
export async function moveDir(
	sourcePathOrHandle: string | FileSystemDirectoryHandle,
	destinationPathOrHandle: string | FileSystemDirectoryHandle,
	{ overwrite = true, rootDir, recursive = true }: CopyDirOptions = {}
) {
	const entries = await listDirEntries(sourcePathOrHandle, { depth: Infinity, rootDir });
	const { name: destName, parentHandle: destParentHandle } = await resolveParentHandle(destinationPathOrHandle, { recursive, rootDir });
	const destHandle = await destParentHandle.getDirectoryHandle(destName);

	async function moveRecursive(items: FileSystemEntry[], currentDestHandle: FileSystemDirectoryHandle) {
		for (const item of items) {
			const handle = item.handle;
			// oxlint-disable no-await-in-loop
			if (handle instanceof FileSystemFileHandle) {
				const destFileHandle = await currentDestHandle.getFileHandle(item.name, { create: true });

				// oxlint-disable-next-line no-use-before-define
				await moveFile(handle, destFileHandle, { recursive, rootDir, overwrite });
			} else if (item.children) {
				const newDestDirHandle = await currentDestHandle.getDirectoryHandle(item.name, { create: true });

				await moveRecursive(item.children, newDestDirHandle);
				// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
				await removeDir(handle as FileSystemDirectoryHandle, { recursive: true, rootDir });
			}
			// oxlint-enable no-await-in-loop
		}
	}

	await moveRecursive(entries, destHandle);
}

export interface MoveFileOptions {
	/** Creates the destination directory structure if it doesn't exist. Throws an error otherwise */
	recursive?: boolean;

	/** Overwrites the file in the destination if it already exists. */
	overwrite?: boolean;

	/**
	 * The file system root directory to resolve against. If not provided the Origin Private File System root will be used.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system|MDN Reference}
	 */
	rootDir?: FileSystemDirectoryHandle;
}

/**
 * Moves a file from one location to another.
 *
 * @param sourcePathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the source file.
 * @param destinationPathOrHandle The path string or a {@link FileSystemDirectoryHandle} for the destination file.
 * @param options The options for function.
 */
export async function moveFile(
	sourcePathOrHandle: string | FileSystemFileHandle,
	destinationPathOrHandle: string | FileSystemFileHandle,
	{ overwrite = true, rootDir, recursive = true }: CopyDirOptions = {}
) {
	await copyFile(sourcePathOrHandle, destinationPathOrHandle, { overwrite, rootDir, recursive });
	await removeFile(sourcePathOrHandle, { rootDir });
}

// #endregion
