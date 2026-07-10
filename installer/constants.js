export const VERSION = "0.1.0";
export const SPEC_VERSION = "1.0.0";
export const INSTALL_SCHEMA_VERSION = "1.0.0";

export const SKILLS = Object.freeze([
  "harness",
  "harness-init",
  "harness-build",
  "harness-promotion",
  "harness-update",
  "harness-check",
  "harness-prompt",
]);

export const COMMANDS = Object.freeze(["install", "update", "uninstall", "doctor", "version"]);

export const EXIT = Object.freeze({
  OK: 0,
  FINDINGS: 1,
  USAGE: 2,
  FILESYSTEM: 3,
  PAYLOAD: 4,
  RECOVERY: 5,
});

