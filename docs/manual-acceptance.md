# Manual acceptance checklist

1. Run `npm test` from a clean checkout.
2. Run `node installer/cli.js doctor` and inspect the JSON report.
3. Install into a temporary custom directory, verify exactly seven skills plus
   `.harness-armor`, then run each installed wrapper with `--help`.
4. Modify one installed skill file, run update, and confirm the installer
   reports a conflict without overwriting it.
5. Run uninstall and confirm the modified file remains with a conflict report.
6. Copy an `empty-repo` fixture, invoke `harness-init` in a supported host, and
   inspect the proposed file list before authorizing writes.
7. Invoke `harness-check` on `custom-harness-repo`; confirm it remains read-only.
8. Invoke `harness-update` on `drifted-harness-repo`; confirm no write occurs
   before explicit approval.
9. Invoke `harness-prompt` on a fixture plan; confirm execute, test, and review
   prompts are independent and source-linked.

