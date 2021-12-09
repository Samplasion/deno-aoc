# deno-aoc

An Advent of Code runner for Deno. Inspired by, and partially compatible with,
[aocrunner by caderek](https://github.com/caderek/aocrunner).

## Installation

    $ deno install --allow-run --allow-net --allow-env --allow-read --allow-write -n aoc <todo add link>

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

Specify the year and day of the challenge.

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

Run the solutions

    $ aoc run <day>
    $ aoc run all

You can use `all` to run all the solutions in succession.
