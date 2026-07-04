import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	checkPickersAvailability,
	getHandle,
	getUserDirHandle,
	getUserOpenFileHandle,
	getUserSaveFileHandle,
	saveHandle
} from './fs-access.ts';
import { getHandlePermisions } from './permissions.ts';

vi.mock('./permissions.ts', () => ({
	getHandlePermisions: vi.fn()
}));

describe('checkPickersAvailability', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('When all pickers are available, then it returns all as true', () => {
		vi.stubGlobal('showOpenFilePicker', vi.fn());
		vi.stubGlobal('showSaveFilePicker', vi.fn());
		vi.stubGlobal('showDirectoryPicker', vi.fn());

		const result = checkPickersAvailability();

		expect(result).toEqual({
			openFile: true,
			saveFile: true,
			dir: true,
			all: true
		});
	});

	test('When no pickers are available, then it returns all as false', () => {
		// @ts-expect-error Mocking non-existent window property
		delete window.showOpenFilePicker;
		// @ts-expect-error Mocking non-existent window property
		delete window.showSaveFilePicker;
		// @ts-expect-error Mocking non-existent window property
		delete window.showDirectoryPicker;

		const result = checkPickersAvailability();

		expect(result).toEqual({
			openFile: false,
			saveFile: false,
			dir: false,
			all: false
		});
	});

	test('When only some pickers are available, then it returns partial availability', () => {
		vi.stubGlobal('showOpenFilePicker', vi.fn());
		// @ts-expect-error Mocking non-existent window property
		delete window.showSaveFilePicker;
		// @ts-expect-error Mocking non-existent window property
		delete window.showDirectoryPicker;

		const result = checkPickersAvailability();

		expect(result).toEqual({
			openFile: true,
			saveFile: false,
			dir: false,
			all: false
		});
	});
});

describe('getUserOpenFileHandle', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('When a handle is returned, then it returns the handle', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const mockHandle = { name: 'test-file.txt' } as FileSystemFileHandle;
		const showOpenFilePickerMock = vi.fn().mockResolvedValue([mockHandle]);
		vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);
		vi.mocked(getHandlePermisions).mockResolvedValue('granted');

		const result = await getUserOpenFileHandle();

		expect(result).toBe(mockHandle);
		expect(showOpenFilePickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).toHaveBeenCalledWith(mockHandle, 'read');
	});

	test('When no handle is returned, then it returns undefined', async () => {
		const showOpenFilePickerMock = vi.fn().mockResolvedValue([]);
		vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);

		const result = await getUserOpenFileHandle();

		expect(result).toBeUndefined();
		expect(showOpenFilePickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).not.toHaveBeenCalled();
	});

	test('When user cancels (AbortError), then it returns undefined', async () => {
		const abortError = new DOMException('The user aborted a request.', 'AbortError');

		const showOpenFilePickerMock = vi.fn().mockRejectedValue(abortError);
		vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);

		const result = await getUserOpenFileHandle();

		expect(result).toBeUndefined();
		expect(showOpenFilePickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).not.toHaveBeenCalled();
	});

	test('When other errors occurs, then it rethrows the error', async () => {
		const otherError = new Error('Some other error');
		const showOpenFilePickerMock = vi.fn().mockRejectedValue(otherError);
		vi.stubGlobal('showOpenFilePicker', showOpenFilePickerMock);

		await expect(getUserOpenFileHandle()).rejects.toThrow('Some other error');
	});
});

describe('getUserSaveFileHandle', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('When a handle is returned, then it returns the handle', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const mockHandle = { name: 'test-file.txt' } as FileSystemFileHandle;
		const showSaveFilePickerMock = vi.fn().mockResolvedValue(mockHandle);
		vi.stubGlobal('showSaveFilePicker', showSaveFilePickerMock);
		vi.mocked(getHandlePermisions).mockResolvedValue('granted');

		const result = await getUserSaveFileHandle();

		expect(result).toBe(mockHandle);
		expect(showSaveFilePickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).toHaveBeenCalledWith(mockHandle, 'readwrite');
	});

	test('When user cancels (AbortError), then it returns undefined', async () => {
		const abortError = new DOMException('The user aborted a request.', 'AbortError');
		const showSaveFilePickerMock = vi.fn().mockRejectedValue(abortError);
		vi.stubGlobal('showSaveFilePicker', showSaveFilePickerMock);

		const result = await getUserSaveFileHandle();

		expect(result).toBeUndefined();
		expect(showSaveFilePickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).not.toHaveBeenCalled();
	});

	test('When other errors occurs, then it rethrows the error', async () => {
		const otherError = new Error('Some other error');
		const showSaveFilePickerMock = vi.fn().mockRejectedValue(otherError);
		vi.stubGlobal('showSaveFilePicker', showSaveFilePickerMock);

		await expect(getUserSaveFileHandle()).rejects.toThrow('Some other error');
	});
});

describe('getUserDirHandle', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('When a handle is returned, then it returns the handle', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const mockHandle = { name: 'test-folder' } as FileSystemDirectoryHandle;
		const showDirectoryPickerMock = vi.fn().mockResolvedValue(mockHandle);
		vi.stubGlobal('showDirectoryPicker', showDirectoryPickerMock);
		vi.mocked(getHandlePermisions).mockResolvedValue('granted');

		const result = await getUserDirHandle();

		expect(result).toBe(mockHandle);
		expect(showDirectoryPickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).toHaveBeenCalledWith(mockHandle, 'readwrite');
	});

	test('When user cancels (AbortError), then it returns undefined', async () => {
		const abortError = new DOMException('The user aborted a request.', 'AbortError');
		const showDirectoryPickerMock = vi.fn().mockRejectedValue(abortError);
		vi.stubGlobal('showDirectoryPicker', showDirectoryPickerMock);

		const result = await getUserDirHandle();

		expect(result).toBeUndefined();
		expect(showDirectoryPickerMock).toHaveBeenCalled();
		expect(getHandlePermisions).not.toHaveBeenCalled();
	});

	test('When other errors occurs, then it rethrows the error', async () => {
		const otherError = new Error('Some other error');
		const showDirectoryPickerMock = vi.fn().mockRejectedValue(otherError);
		vi.stubGlobal('showDirectoryPicker', showDirectoryPickerMock);

		await expect(getUserDirHandle()).rejects.toThrow('Some other error');
	});
});

describe('saveHandle', () => {
	const IDB_DATABASE = '0ae297cf-5989-46b8-adc9-dbb7f5806087';
	const IDB_STORE = 'handles';

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	test('When saving a handle, then it should open IndexedDB and put the handle', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const mockHandle = { name: 'test.txt' } as FileSystemFileHandle;
		const store = {
			put: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: () => unknown) => {
					if (evt === 'success') {
						callback();
					}
				}),
				error: null
			})
		};
		const mockIDB = {
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue(store)
			}),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(true)
			}
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		await saveHandle('test-id', mockHandle, { meta: 'data' });

		expect(indexedDB.open).toHaveBeenCalledWith(IDB_DATABASE, 1);
		expect(mockIDB.transaction).toHaveBeenCalledWith(IDB_STORE, 'readwrite');
		expect(store.put).toHaveBeenCalledWith({ handle: mockHandle, metadata: { meta: 'data' } }, 'test-id');
	});

	test('When IndexedDB open fails, then it should throw an error', async () => {
		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'error') {
						callback({ target: { error: new Error('Failed to open IndexedDB') } });
					}
				}),
				error: new Error('Failed to open IndexedDB')
			})
		});

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(saveHandle('test-id', {} as FileSystemHandle)).rejects.toThrow('Failed to open IndexedDB');
	});

	test('When IndexedDB put fails, then it should throw an error', async () => {
		const mockIDB = {
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue({
					put: vi.fn().mockReturnValue({
						addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
							if (evt === 'error') {
								callback({ target: { error: new Error('Failed to save handle on IndexedDB') } });
							}
						}),
						error: new Error('Failed to save handle on IndexedDB')
					})
				})
			}),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(true)
			}
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await expect(saveHandle('test-id', {} as FileSystemHandle)).rejects.toThrow('Failed to save handle on IndexedDB');
	});

	test('When IndexedDB needs upgrade, then it should create the object store', async () => {
		const mockIDB = {
			createObjectStore: vi.fn(),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(false)
			},
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue({
					put: vi.fn().mockReturnValue({
						addEventListener: vi.fn((evt: string, callback: () => unknown) => {
							if (evt === 'success') {
								callback();
							}
						}),
						error: null
					})
				})
			})
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (args: { target: { result: unknown } }) => unknown) => {
					if (evt === 'upgradeneeded' || evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		await saveHandle('test-id', {} as FileSystemHandle);

		expect(mockIDB.createObjectStore).toHaveBeenCalledWith(IDB_STORE);
	});
});

describe('getHandle', () => {
	const IDB_DATABASE = '0ae297cf-5989-46b8-adc9-dbb7f5806087';
	const IDB_STORE = 'handles';

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	test('When retrieving a handle, then it should open IndexedDB and return the result', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const mockHandle = { name: 'test.txt' } as FileSystemFileHandle;
		const mockResult = { handle: mockHandle, metadata: { foo: 'bar' } };

		const store = {
			get: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: () => unknown) => {
					if (evt === 'success') {
						callback();
					}
				}),
				result: mockResult,
				error: null
			})
		};
		const mockIDB = {
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue(store)
			}),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(true)
			}
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		const result = await getHandle('test-id');

		expect(indexedDB.open).toHaveBeenCalledWith(IDB_DATABASE, 1);
		expect(mockIDB.transaction).toHaveBeenCalledWith(IDB_STORE, 'readonly');
		expect(store.get).toHaveBeenCalledWith('test-id');
		expect(result).toEqual(mockResult);
	});

	test('When the handle is not found, then it should return undefined', async () => {
		const mockIDB = {
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue({
					get: vi.fn().mockReturnValue({
						addEventListener: vi.fn((evt: string, callback: () => unknown) => {
							if (evt === 'success') {
								callback();
							}
						}),
						result: undefined,
						error: null
					})
				})
			}),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(true)
			}
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		const result = await getHandle('unknown-id');

		expect(result).toBeUndefined();
	});

	test('When IndexedDB open fails, then it should throw an error', async () => {
		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'error') {
						callback({ target: { error: new Error('Failed to open IndexedDB') } });
					}
				}),
				error: new Error('Failed to open IndexedDB')
			})
		});

		await expect(getHandle('test-id')).rejects.toThrow('Failed to open IndexedDB');
	});

	test('When IndexedDB get fails, then it should throw an error', async () => {
		const mockIDB = {
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue({
					get: vi.fn().mockReturnValue({
						addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
							if (evt === 'error') {
								callback({ target: { error: new Error('Failed to get handle from IndexedDB') } });
							}
						}),
						error: new Error('Failed to get handle from IndexedDB')
					})
				})
			}),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(true)
			}
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (...args: unknown[]) => unknown) => {
					if (evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		await expect(getHandle('test-id')).rejects.toThrow('Failed to get handle from IndexedDB');
	});

	test('When IndexedDB needs upgrade, then it should create the object store', async () => {
		const mockIDB = {
			createObjectStore: vi.fn(),
			objectStoreNames: {
				contains: vi.fn().mockReturnValue(false)
			},
			transaction: vi.fn().mockReturnValue({
				objectStore: vi.fn().mockReturnValue({
					get: vi.fn().mockReturnValue({
						addEventListener: vi.fn((evt: string, callback: () => unknown) => {
							if (evt === 'success') {
								callback();
							}
						}),
						result: undefined,
						error: null
					})
				})
			})
		};

		vi.stubGlobal('indexedDB', {
			open: vi.fn().mockReturnValue({
				addEventListener: vi.fn((evt: string, callback: (args: { target: { result: unknown } }) => unknown) => {
					if (evt === 'upgradeneeded' || evt === 'success') {
						callback({ target: { result: mockIDB } });
					}
				}),
				result: mockIDB
			})
		});

		await getHandle('test-id');

		expect(mockIDB.createObjectStore).toHaveBeenCalledWith(IDB_STORE);
	});
});
