import { spawn } from "node:child_process";

const CHILD_ENVIRONMENT_KEYS = new Set([
  "comspec",
  "display",
  "dyld_fallback_library_path",
  "dyld_library_path",
  "fontconfig_file",
  "fontconfig_path",
  "home",
  "lang",
  "language",
  "lc_all",
  "lc_ctype",
  "localappdata",
  "path",
  "pathext",
  "systemdrive",
  "systemroot",
  "temp",
  "tmp",
  "tmpdir",
  "tz",
  "userprofile",
  "wayland_display",
  "windir",
  "xdg_cache_home",
  "xdg_config_home",
  "xdg_runtime_dir",
]);

/**
 * Build the deliberately small environment inherited by Chromium and media
 * helpers. Scenario capabilities and OPENAI_API_KEY must stay in this Node
 * process and never become readable from those child processes.
 */
export function safeChildEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  return Object.fromEntries(Object.entries(source).flatMap(([name, value]) => (
    value !== undefined && CHILD_ENVIRONMENT_KEYS.has(name.toLocaleLowerCase("en-US"))
      ? [[name, value]]
      : []
  )));
}

export interface ProcessOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  input?: string | Uint8Array;
  signal?: AbortSignal;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export interface ProcessResult {
  executable: string;
  args: readonly string[];
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class ProcessExecutionError extends Error {
  readonly executable: string;
  readonly args: readonly string[];
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;

  constructor(
    message: string,
    details: {
      executable: string;
      args: readonly string[];
      exitCode: number | null;
      stdout?: string;
      stderr?: string;
      cause?: unknown;
    },
  ) {
    super(message, { cause: details.cause });
    this.name = "ProcessExecutionError";
    this.executable = details.executable;
    this.args = details.args;
    this.exitCode = details.exitCode;
    this.stdout = details.stdout ?? "";
    this.stderr = details.stderr ?? "";
  }
}

function commandForDisplay(executable: string, args: readonly string[]): string {
  const quote = (part: string) =>
    /^[A-Za-z0-9_./:=+-]+$/.test(part)
      ? part
      : JSON.stringify(part);
  return [executable, ...args].map(quote).join(" ");
}

/**
 * Executes a program directly, without involving a command shell. Keeping the
 * executable and every argument separate is important here because scenario
 * paths and subtitle text may contain spaces or shell metacharacters.
 */
export async function runProcess(
  executable: string,
  args: readonly string[],
  options: ProcessOptions = {},
): Promise<ProcessResult> {
  const maxOutputBytes = options.maxOutputBytes ?? 16 * 1024 * 1024;
  if (!Number.isSafeInteger(maxOutputBytes) || maxOutputBytes <= 0) {
    throw new TypeError("maxOutputBytes must be a positive safe integer");
  }

  return await new Promise<ProcessResult>((resolve, reject) => {
    const child = spawn(executable, [...args], {
      cwd: options.cwd,
      env: options.env ?? safeChildEnvironment(),
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let outputBytes = 0;
    let terminationReason: string | undefined;
    let settled = false;

    const stop = (reason: string) => {
      if (!terminationReason) {
        terminationReason = reason;
        child.kill("SIGKILL");
      }
    };

    const collect = (target: Buffer[], chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes > maxOutputBytes) {
        stop(`combined process output exceeded ${maxOutputBytes} bytes`);
        return;
      }
      target.push(chunk);
    };

    child.stdout.on("data", (chunk: Buffer) => collect(stdoutChunks, chunk));
    child.stderr.on("data", (chunk: Buffer) => collect(stderrChunks, chunk));

    const timeout = options.timeoutMs
      ? setTimeout(
          () => stop(`process exceeded timeout of ${options.timeoutMs} ms`),
          options.timeoutMs,
        )
      : undefined;
    timeout?.unref();

    const abort = () => stop("process was aborted");
    if (options.signal?.aborted) {
      abort();
    } else {
      options.signal?.addEventListener("abort", abort, { once: true });
    }

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    };

    child.once("error", (cause) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new ProcessExecutionError(
          `Could not start ${commandForDisplay(executable, args)}`,
          { executable, args, exitCode: null, cause },
        ),
      );
    });

    child.once("close", (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (terminationReason || exitCode !== 0) {
        const detail = terminationReason ?? `process exited with code ${exitCode}`;
        reject(
          new ProcessExecutionError(
            `${commandForDisplay(executable, args)} failed: ${detail}`,
            { executable, args, exitCode, stdout, stderr },
          ),
        );
        return;
      }

      resolve({
        executable,
        args,
        exitCode: exitCode ?? 0,
        stdout,
        stderr,
      });
    });

    if (options.input !== undefined) {
      child.stdin.end(options.input);
    } else {
      child.stdin.end();
    }
  });
}
