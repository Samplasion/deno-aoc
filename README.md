# deno-aoc

> Note: This tool is still in development. It is not guaranteed to work, at
> least until beta.

An Advent of Code runner for Deno. Inspired by, and
[partially compatible with](https://github.com/Samplasion/deno-aoc/wiki/Differences-with-caderek's-aocrunner),
[aocrunner by caderek](https://github.com/caderek/aocrunner).

## Installation

    $ deno install --allow-run --allow-net --allow-env --allow-read --allow-write -f -r -n aoc https://deno.land/x/aoc/cli.ts

### Permissions explanation

- `--allow-run`: Enables running the solutions by `aoc run <day>`
- `--allow-net`: Enables fetching the input files from the internet
- `--allow-env`: Enables reading the environment variables (more specifically,
  the session cookie from the Advent of Code website)
- `--allow-read`: Enables reading the configuration from the local filesystem
- `--allow-write`: Enables writing the configuration to the local filesystem

## Usage

### Initialize a directory

    $ mkdir aoc2021
    $ cd aoc2021
    $ aoc init

Specify the year of the challenge:

    $ aoc init -y 2021
    $ aoc init --year 2021

### Initialize a day and download the input files

    $ aoc init <day>

For example:

    $ aoc init 1

### Download the input files of a day

    $ aoc download <day>

For example:

    $ aoc download 1

[Abuse concerns](#abuse-concerns)

### Run the solutions

    $ aoc run <day>
    $ aoc run all

You can use `all` to run all the solutions in succession.

### Submit solutions

**Note** that you must run `aoc run <day>` before submitting. Also, you must
have the session cookie set in the environment variable `AOC_SESSION_COOKIE`.

    $ aoc submit <day>

### Update the README.md file

    $ aoc regen

Which regenerates the main README.md file (which displays the list of days), or:

    $ aoc regen <day>

Which downloads the text of the challenge of the day and stores it in the
README.md file inside the day's directory.

## Abuse concerns

This tool caches the input file and only downloads it once. To forcefully
re-download the input file, you must delete it. Furthermore, this tool caches
wrong solutions, so that you can't send them more than once. I've made my best
efforts to prevent abuse. If there's a way to circumvent this, it's most likely
a bug, and I'd love to hear about it.
