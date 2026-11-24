// Say What Actually Broke — a make.fun entry (program/v1)
//
// The whole point of this bounty is honesty:
// no "something went wrong", no "oops", no hiding behind a spinner.
// Name the real failure, in plain language, in one line,
// and make the user laugh on the first read —
// ideally while they are still annoyed.
//
// This program holds exactly one line of error copy,
// validates it against the gate rules, writes it to entry.txt,
// then reads the file back and proves the bytes on disk
// are exactly the line it intended to ship.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The line
// ---------------------------------------------------------------------------
//
// Picked failure: a software update that silently resets user settings.
// It is specific (the update wiped the settings), it is honest about
// why it happened (testing only ever happened on fresh installs),
// and the comic turn is that the team calls the loss a "clean slate"
// as if destroying three years of careful tweaks were a feature.

const ERROR_LINE =
  "Our update just deleted all your settings because we only tested it on brand-new accounts. Your 3 years of tweaks are gone; our lesson was free.";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
//
// The gate is strict, so the program is strict with itself first.
// Every rule below throws an Error on violation rather than
// logging a warning and shipping a broken entry anyway.

const MAX_CHARS = 200;

function assertSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("Error line must be exactly one line: no newline characters.");
  }
}

function assertNonBlank(line: string): void {
  if (line.trim().length === 0) {
    throw new Error("Error line must not be blank or only whitespace.");
  }
}

function assertWithinLimit(line: string): void {
  if (line.length > MAX_CHARS) {
    throw new Error(
      `Error line is ${line.length} characters; the limit is ${MAX_CHARS}.`,
    );
  }
  if (line.length < 1) {
    throw new Error("Error line must contain at least one character.");
  }
}

function assertNoEdgeWhitespace(line: string): void {
  if (line !== line.trim()) {
    throw new Error("Error line must not have leading or trailing whitespace.");
  }
}

function assertNotVague(line: string): void {
  const lowered = line.toLowerCase();
  if (lowered.includes("something went wrong")) {
    throw new Error("Error line must name the real failure, not hide behind vagueness.");
  }
}

function validateErrorLine(line: string): void {
  assertSingleLine(line);
  assertNonBlank(line);
  assertWithinLimit(line);
  assertNoEdgeWhitespace(line);
  assertNotVague(line);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "/output";
}

function writeEntry(line: string): string {
  const outputDir = resolveOutputDir();
  mkdirSync(outputDir, { recursive: true });
  const entryPath = join(outputDir, "entry.txt");
  writeFileSync(entryPath, line, { encoding: "utf8" });
  return entryPath;
}

function verifyEntry(entryPath: string, expected: string): void {
  const onDisk = readFileSync(entryPath, { encoding: "utf8" });
  if (onDisk !== expected) {
    throw new Error(
      `Verification failed: entry.txt does not match the intended line. ` +
        `Expected ${expected.length} chars, read back ${onDisk.length} chars.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  validateErrorLine(ERROR_LINE);

  const entryPath = writeEntry(ERROR_LINE);
  verifyEntry(entryPath, ERROR_LINE);

  console.log(ERROR_LINE);
  console.log(`Character count: ${ERROR_LINE.length}`);
  console.log(`Written to: ${entryPath}`);
}

main();
