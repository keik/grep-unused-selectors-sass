#!/usr/bin/env node

const argv = require("yargs")
  .usage(
    "Detect unused class selectors of sass by grep.\n\nUsage: grep-unused-selectors-sass [options] <entries...>"
  )
  .help("help")
  .alias("help", "h")
  .demandCommand(1, "You need at least one entries")
  .options({
    verbose: {
      boolean: true,
      description: "Run with verbose logs",
      required: false
    },
    "include-path": {
      array: true,
      description: "Path to look for imported files",
      required: false
    },
    "grep-path": {
      description: "Pathspec of git-grep",
      required: true
    }
  }).argv;

const grepUnusedSelectorsSass = require("../");
grepUnusedSelectorsSass({ entries: argv._, ...argv });
