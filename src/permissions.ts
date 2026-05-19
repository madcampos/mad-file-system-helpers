/**
 * Get the current permission state for the handle.
 *
 * @param handle The handle to check permissions.
 * @param permissions The permission type to check.
 */
export async function getHandlePermisions(handle: FileSystemHandle, permissions: FileSystemPermissionMode = 'read') {
	const permission = await handle.queryPermission({ mode: permissions });

	return permission;
}

/**
 * Checks and then request for permissions for a given handle.
 *
 * @param handle The handle to request permissions.
 * @param permissions The permission type to get.
 */
export async function requestHandlePermissions(handle: FileSystemHandle, permissions: FileSystemPermissionMode = 'read') {
	const permission = await getHandlePermisions(handle, permissions);

	if (permission !== 'granted') {
		const request = await handle.requestPermission({ mode: permissions });

		if (request !== 'granted') {
			throw new Error('Permission to access the entry was denied');
		}
	}
}
