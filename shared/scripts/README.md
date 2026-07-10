# Harness Armor helper scripts

These Python 3.9+ scripts use only the standard library and are read-only. Run
any script with `--help`. All normal output is JSON.

Exit codes:

- `0`: completed successfully with no blocking findings;
- `1`: completed with validation, drift, or requested threshold findings;
- `2`: invalid command usage;
- `3`: operational or filesystem failure;
- `4`: a safety limit prevented a complete scan.

The scripts inventory, hash, and validate evidence. They do not interpret
product semantics, call a model, edit business code, or authorize writes.
