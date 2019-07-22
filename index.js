const spawn = require("child_process").spawn;

const chalk = require("chalk");
const debug = require("debug")("grep-unused-selectors-sass");
const glob = require("glob");
const sass = require("node-sass");
const postcss = require("postcss");

const MAX_CONCURRENCY = 10;

module.exports = function grepUnusedSelectorsSass(opts) {
  debug(`opts: ${JSON.stringify(opts, null, 2)}`);

  const { grepPath, includePath, verbose } = opts;

  // glob multiple patterns and uniquify
  const entries = Array.from(
    new Set(
      Array.prototype.concat.apply(
        [],
        opts.entries.map(entry => glob.sync(entry))
      )
    )
  );

  debug(`entries: ${JSON.stringify(entries)}`);

  const cssString = getCompiledCss(entries, { includePath, verbose });
  const classSelectors = extractClassSelectorsFromCss(cssString, { verbose });
  grepClassSelectors(classSelectors, { grepPath, verbose });
};

const getCompiledCss = (entries, { includePath = [], verbose }) => {
  if (verbose) {
    console.log(chalk.cyan("Compiling Sass to CSS..."));
  }

  return entries
    .map(entry =>
      sass
        .renderSync({
          file: entry,
          includePaths: includePath
        })
        .css.toString()
        .replace(/@charset.+/, "")
    )
    .join("\n");
};

const extractClassSelectorsFromCss = (cssString, { verbose }) => {
  if (verbose) {
    console.log(chalk.cyan(`Extracting class selector from CSS...`));
  }

  const ret = Array.from(
    new Set(
      Array.prototype.concat.apply(
        [],
        postcss
          .parse(cssString)
          .nodes.filter(n => n.selector)
          .map(n => n.selector.match(/(?<=\.)[\w-]+/g))
      )
    )
  ).sort();

  if (verbose) {
    console.log(chalk.cyan(`${ret.length} class selectors is extracted.`));
  }

  return ret;
};

const grepClassSelectors = (classSelectors, { grepPath = ".", verbose }) => {
  if (verbose) {
    console.log(chalk.cyan(`Executing grep...`));
  }

  console.log("following class selector may not be used.");

  let stuckTimer = null;
  let runningProcs = 0;
  const queue = [...classSelectors];
  stuckTick();

  function stuckTick() {
    if (queue.length === 0) {
      return clearTimeout(stuckTimer);
    } else {
      stuckTimer = setTimeout(stuckTick, 10);
    }

    if (runningProcs < MAX_CONCURRENCY) {
      runningProcs += 1;
      const classSelector = queue.shift();
      const grepCommand = `git grep -nw ${classSelector} ${grepPath} | wc -l`;

      debug(`[run] ${grepCommand} (runningProcs: ${runningProcs})`);

      const proc = spawn(grepCommand, { shell: true });

      proc.stdout.on("data", data => {
        const ret = data.toString().trim();
        if (verbose) {
          console.log(chalk.yellow(`${classSelector} hits: ${ret}`));
        }
        if (ret === "0") {
          console.log(chalk.red(classSelector));
        }
      });

      proc.on("close", () => {
        debug(`[exit] ${grepCommand} (runningProcs: ${runningProcs})`);
        runningProcs -= 1;
      });
    }
  }
};
