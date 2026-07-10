import { COMMANDS, EXIT, SPEC_VERSION, VERSION } from "./constants.js";
import { TARGETS, resolveTarget } from "./adapters.js";
import { doctor, installOrUpdate, uninstall } from "./operations.js";

const HELP = `Harness Armor — distribute Agent Skills (no Harness workflows in this CLI)

Usage:
  harness-armor [install] --target <target> [options]
  harness-armor update --target <target> [options]
  harness-armor uninstall --target <target> [options]
  harness-armor doctor [--target <target>] [options]
  harness-armor version [--json]

Commands: install, update, uninstall, doctor, version
Targets: ${Object.keys(TARGETS).join(", ")}

Options:
  --target <id>          Client/scope adapter
  --project-root <path>  Project root for project adapters
  --dest <absolute>      Destination for custom/generic target
  --home <path>          Override home directory (useful for isolated testing)
  --dry-run              Plan without writing
  --json                 Emit one JSON result to stdout
  --help                 Show this help

Invoke repository workflows inside an AI coding agent with /harness-* or
$harness-* according to the client. This installer intentionally has no init,
build, promotion, check, or prompt workflow commands.
`;

function parse(argv) {
  const args = [...argv];
  let command = "install";
  if (args[0] && !args[0].startsWith("-")) command = args.shift();
  if (!COMMANDS.includes(command)) {
    throw Object.assign(new Error(`unknown command '${command}'. The CLI only distributes Skills; use the Agent Skill for Harness workflows.`), { kind: "usage" });
  }
  const options = { json: false, dryRun: false, target: null, dest: null, projectRoot: null, home: null, help: false };
  while (args.length) {
    const flag = args.shift();
    if (flag === "--json") options.json = true;
    else if (flag === "--dry-run") options.dryRun = true;
    else if (flag === "--help" || flag === "-h") options.help = true;
    else if (["--target", "--dest", "--project-root", "--home"].includes(flag)) {
      if (!args.length) throw Object.assign(new Error(`${flag} requires a value`), { kind: "usage" });
      const key = { "--target": "target", "--dest": "dest", "--project-root": "projectRoot", "--home": "home" }[flag];
      options[key] = args.shift();
    } else throw Object.assign(new Error(`unknown option '${flag}'`), { kind: "usage" });
  }
  return { command, options };
}

function print(result, options) {
  if (options.json) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function codeFor(error) {
  if (error?.kind === "usage") return EXIT.USAGE;
  if (error?.kind === "conflict") return EXIT.FINDINGS;
  if (error?.kind === "payload") return EXIT.PAYLOAD;
  if (error?.kind === "recovery") return EXIT.RECOVERY;
  return EXIT.FILESYSTEM;
}

export async function main(argv = []) {
  let parsed;
  try {
    parsed = parse(argv);
    if (parsed.options.help) {
      process.stdout.write(HELP);
      return EXIT.OK;
    }
    if (parsed.command === "version") {
      print({ name: "harness-armor", installerVersion: VERSION, skillsVersion: VERSION, specVersion: SPEC_VERSION }, parsed.options);
      return EXIT.OK;
    }
    if (!parsed.options.target) {
      if (parsed.command === "doctor") {
        const outcome = await doctor();
        print(outcome.result, parsed.options);
        return outcome.code;
      }
      if (argv.length === 0 && process.stdin.isTTY && process.stdout.isTTY) parsed.options.target = "claude-user";
      else throw Object.assign(new Error("--target is required in non-interactive mode"), { kind: "usage" });
    }
    const adapter = resolveTarget(parsed.options);
    let outcome;
    if (parsed.command === "install" || parsed.command === "update") outcome = await installOrUpdate(adapter, parsed.options, parsed.command);
    else if (parsed.command === "uninstall") outcome = await uninstall(adapter, parsed.options);
    else outcome = await doctor(adapter);
    print(outcome.result, parsed.options);
    return outcome.code;
  } catch (error) {
    const code = codeFor(error);
    const result = { status: "error", error: error.message, exitCode: code };
    if (parsed?.options?.json) process.stdout.write(`${JSON.stringify(result)}\n`);
    else process.stderr.write(`harness-armor: ${error.message}\n`);
    return code;
  }
}

export { HELP, parse };

