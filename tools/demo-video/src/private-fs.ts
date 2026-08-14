import { chmod, lstat, mkdir, open } from "node:fs/promises";
import { dirname, parse, resolve, sep } from "node:path";
import { constants, type MakeDirectoryOptions } from "node:fs";

const PRIVATE_DIRECTORY_MODE = 0o700;
const PRIVATE_FILE_MODE = 0o600;

function isUnsupportedPermissionError(error: unknown): boolean {
  if (process.platform !== "win32") return false;
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EINVAL" || code === "ENOSYS" || code === "EPERM";
}

async function applyPrivateMode(path: string, mode: number): Promise<void> {
  try {
    await chmod(path, mode);
  } catch (error) {
    if (!isUnsupportedPermissionError(error)) throw error;
  }
}

async function rejectSymlinkComponents(path: string): Promise<void> {
  const absolute = resolve(path);
  const root = parse(absolute).root;
  const components = absolute.slice(root.length).split(sep).filter(Boolean);
  let current = root;
  for (const component of components) {
    current = resolve(current, component);
    const metadata = await lstat(current).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    if (!metadata) return;
    if (metadata.isSymbolicLink()) {
      throw new Error(`Private path must not traverse a symbolic link: ${current}`);
    }
  }
}

export async function ensurePrivateDirectory(path: string): Promise<void> {
  await rejectSymlinkComponents(path);
  const existing = await lstat(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (existing?.isSymbolicLink()) throw new Error(`Private directory must not be a symbolic link: ${path}`);
  if (existing && !existing.isDirectory()) throw new Error(`Private directory path is not a directory: ${path}`);
  const options: MakeDirectoryOptions & { recursive: true } = {
    recursive: true,
    mode: PRIVATE_DIRECTORY_MODE,
  };
  await mkdir(path, options);
  // Never silently change the policy of a pre-existing shared directory.
  // Dedicated tool directories must already be private; newly created ones
  // are tightened here in case the process umask was permissive.
  if (existing) {
    if (process.platform !== "win32" && (existing.mode & 0o077) !== 0) {
      throw new Error(`Private directory is accessible by group or others: ${path}`);
    }
  } else {
    await applyPrivateMode(path, PRIVATE_DIRECTORY_MODE);
  }
}

export async function ensurePrivateFile(path: string): Promise<void> {
  await rejectSymlinkComponents(path);
  const metadata = await lstat(path);
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    throw new Error(`Private artifact must be a regular non-symlink file: ${path}`);
  }
  await applyPrivateMode(path, PRIVATE_FILE_MODE);
}

export async function writePrivateFile(
  path: string,
  data: string | Uint8Array,
  options: { encoding?: BufferEncoding | null; mode?: number } = {},
): Promise<void> {
  await ensurePrivateDirectory(dirname(path));
  const existing = await lstat(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (existing?.isSymbolicLink() || (existing && !existing.isFile())) {
    throw new Error(`Refusing to write a private artifact through a non-regular path: ${path}`);
  }
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC
    | (process.platform === "win32" ? 0 : constants.O_NOFOLLOW);
  const handle = await open(path, flags, options.mode ?? PRIVATE_FILE_MODE);
  try {
    await handle.chmod(PRIVATE_FILE_MODE).catch((error) => {
      if (!isUnsupportedPermissionError(error)) throw error;
    });
    if (typeof data === "string") await handle.writeFile(data, { encoding: options.encoding ?? "utf8" });
    else await handle.writeFile(data);
  } finally {
    await handle.close();
  }
  await ensurePrivateFile(path);
}

export async function assertPrivateInputFile(path: string, label: string): Promise<void> {
  await rejectSymlinkComponents(path);
  const metadata = await lstat(path);
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file`);
  }
  if (process.platform !== "win32") {
    const currentUid = process.getuid?.();
    if (currentUid !== undefined && metadata.uid !== currentUid) {
      throw new Error(`${label} must be owned by the current user`);
    }
    if ((metadata.mode & 0o077) !== 0) {
      throw new Error(`${label} must not be accessible by group or others`);
    }
  }
}
