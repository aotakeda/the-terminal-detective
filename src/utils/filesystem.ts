import type { MissionDirectory, MissionFile } from "../types/mission";

export const resolvePath = (currentDir: string, targetPath: string): string =>
	targetPath.startsWith("/")
		? targetPath
		: `${currentDir}/${targetPath}`.replace("//", "/");

const splitPath = (path: string): string[] =>
	path.split("/").filter((part) => part !== "" && part !== ".");

const findDirectoryByParts = (
	parts: string[],
	directory: MissionDirectory,
): MissionDirectory | null =>
	parts.reduce<MissionDirectory | null>(
		(currentDir, part) =>
			currentDir?.subdirectories?.find((dir) => dir.name === part) ?? null,
		directory,
	);

export const findFileInDirectory = (
	path: string,
	directory: MissionDirectory,
): MissionFile | null => {
	const parts = splitPath(path);

	if (parts.length === 0) return null;

	const [fileName, ...dirParts] = parts.reverse();
	const targetDir =
		dirParts.length > 0
			? findDirectoryByParts(dirParts.reverse(), directory)
			: directory;

	return targetDir?.files.find((file) => file.name === fileName) ?? null;
};

const getDirectoryContents = (
	directory: MissionDirectory,
	showHidden = false,
): string[] => {
	const subdirs = directory.subdirectories?.map((dir) => `${dir.name}/`) ?? [];
	const files = directory.files
		.filter((file) => showHidden || !file.hidden)
		.map((file) => file.name);

	return [...subdirs, ...files];
};

const getDetailedDirectoryContents = (
	directory: MissionDirectory,
	showHidden = false,
): string[] => {
	const result: string[] = [];

	if (directory.subdirectories) {
		for (const subdir of directory.subdirectories) {
			if (showHidden || !subdir.name.startsWith(".")) {
				result.push(
					`drwxr-xr-x  2 user user     4096 Jan 15 01:47 ${subdir.name}`,
				);
			}
		}
	}

	for (const file of directory.files) {
		if (showHidden || !file.hidden) {
			const permissions = file.permissions || "rw-r--r--";
			const formattedPermissions = `-${permissions}`;
			const size = String(file.content.length).padStart(8);
			result.push(
				`${formattedPermissions}  1 user user ${size} Jan 15 01:47 ${file.name}`,
			);
		}
	}

	return result;
};

export const listDirectory = (
	path: string,
	directory: MissionDirectory,
	showHidden = false,
): string[] => {
	const parts = splitPath(path);
	const targetDir = findDirectoryByParts(parts, directory);

	if (!targetDir) return ["Directory not found"];

	const contents = getDirectoryContents(targetDir, showHidden);
	return contents.length > 0 ? contents : ["Empty directory"];
};

export const listDirectoryDetailed = (
	path: string,
	directory: MissionDirectory,
	showHidden = false,
): string[] => {
	const parts = splitPath(path);
	const targetDir = findDirectoryByParts(parts, directory);

	if (!targetDir) return ["Directory not found"];

	const contents = getDetailedDirectoryContents(targetDir, showHidden);
	return contents.length > 0 ? contents : ["Empty directory"];
};

export const directoryExists = (
	path: string,
	directory: MissionDirectory,
): boolean => {
	const parts = splitPath(path);
	return findDirectoryByParts(parts, directory) !== null;
};

export const filterByPrefix = (items: string[], prefix: string): string[] =>
	items.filter((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));

export const getDirectoriesOnly = (items: string[]): string[] =>
	items.filter((item) => item.endsWith("/")).map((item) => item.slice(0, -1));
