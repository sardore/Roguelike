// Running commands for the refactor tools: no shell, no pipes, and every failure is an exception.
// The shell scripts these replace swallowed exit codes through `| tail` and `$( ... && echo s )`; here a command
// either exits 0 or run() throws with the command line, the exit status (or signal) and the tail of its output.
import { spawnSync } from 'node:child_process';

const shown = (argv) => argv.map((a) => (/[\s"']/.test(a) ? JSON.stringify(a) : a)).join(' ');

// run(argv, { cwd, capture }) -> { stdout, stderr } (capture) or {} ; throws on spawn error, signal, or non-zero exit
export function run(argv, { cwd = process.cwd(), capture = false, env = process.env, input } = {}) {
  if (!Array.isArray(argv) || !argv.length || argv.some((a) => typeof a !== 'string')) throw new TypeError(`run: argv must be a non-empty array of strings, got ${JSON.stringify(argv)}`);
  const r = spawnSync(argv[0], argv.slice(1), { cwd, env, input, encoding: 'utf8', stdio: capture ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'], maxBuffer: 1 << 28 });
  if (r.error) throw new Error(`could not run ${shown(argv)}: ${r.error.message}`);
  if (r.signal) throw new Error(`${shown(argv)} was killed by ${r.signal}`);
  if (r.status !== 0) {
    const tail = capture ? `\n${String(r.stderr || r.stdout || '').trim().split('\n').slice(-12).join('\n')}` : '';
    throw new Error(`${shown(argv)} exited with status ${r.status}${tail}`);
  }
  return capture ? { stdout: r.stdout, stderr: r.stderr } : {};
}
