# grep-unused-selectors-sass

Detect potentially unused class selectors of sass by `git-grep`.


## Installation

```
% npm i grep-unused-selectors-sass -g
```

or run by `npx` without installing

```
% npx grep-unused-selectors-sass [options] <entries...>
```


## Usage

```
% grep-unused-selectors-sass -h

Detect unused class selectors of sass by grep.

Usage: grep-unused-selectors-sass [options] <entries...>

Options:
  --version       Show version number                                  [boolean]
  --help, -h      Show help                                            [boolean]
  --verbose       Run with verbose logs                                [boolean]
  --include-path  Path to look for imported files                        [array]
  --grep-path     Pathspec of git-grep                                [required]
```


## Debug

Run with `DEBUG="grep-unused-selectors-sass"` then show debug logs.


# License

MIT (c) keik
