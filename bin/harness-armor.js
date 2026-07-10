#!/usr/bin/env node

import { main } from "../installer/cli.js";

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    process.stderr.write(`harness-armor: ${error?.stack || error}\n`);
    process.exitCode = 3;
  },
);

