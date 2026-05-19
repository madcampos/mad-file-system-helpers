import { getHandlePermisions } from './permissions.ts';

export function checkPickersAvailability() {
	const isOpenPickerAvailable = 'showOpenFilePicker' in window;
	const isSavePickerAvailable = 'showSaveFilePicker' in window;
	const isDirectoryPickerAvailable = 'showDirectoryPicker' in window;

	return {
		openFile: isOpenPickerAvailable,
		saveFile: isSavePickerAvailable,
		dir: isDirectoryPickerAvailable,
		all: isOpenPickerAvailable && isSavePickerAvailable && isDirectoryPickerAvailable
	};
}

export async function getUserOpenFileHandle(options: OpenFilePickerOptions = {}, permissions: FileSystemPermissionMode = 'read') {
	try {
		const [handle] = await window.showOpenFilePicker(options);

		if (!handle) {
			return undefined;
		}

		await getHandlePermisions(handle, permissions);

		return handle;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return undefined;
		}

		throw error;
	}
}

export async function getUserSaveFileHandle(options: SaveFilePickerOptions = {}) {
	try {
		const handle = await window.showSaveFilePicker(options);

		await getHandlePermisions(handle, 'readwrite');

		return handle;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return undefined;
		}

		throw error;
	}
}

export async function getUserDirHandle(options: DirectoryPickerOptions = {}, permissions: FileSystemPermissionMode = 'readwrite') {
	try {
		const handle = await window.showDirectoryPicker(options);

		await getHandlePermisions(handle, permissions);

		return handle;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return undefined;
		}

		throw error;
	}
}
