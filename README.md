# Perl Toolbox

Perl Toolbox for Visual Studio Code provides support for linting and syntax checking for Perl

## Features

* Perlcritic linting with customizable severities

* Perl Syntax checking

## Requirements

* perl (for syntax highlighting)
* perlcritic (for linting)

## Extension Settings

| setting                              | default    | description                                                                         |
|--------------------------------------|------------|-------------------------------------------------------------------------------------|
| `perl-toolbox.temporaryPath`         | `null`     | Path to write temporary lint and syntax files to.  Defaults to OS specific tmp path |
| `perl-toolbox.syntax.exec`           | perl       | name of the perl binary                                                             |
| `perl-toolbox.syntax.path`           | `null`     | path to the perl binary                                                             |
| `perl-toolbox.syntax.enabled`        | true       | enable syntax checking                                                              |
| `perl-toolbox.syntax.includePaths`   | []         | An Array of paths to add to @INC                                                    |
| `perl-toolbox.lint.exec`             | perlcritic | name of the perlcritic binary                                                       |
| `perl-toolbox.lint.path`             | `null`     | path to the perlcritic binary                                                       |
| `perl-toolbox.lint.severity`         | brutal     | perlcritic severity [brutal,cruel,harsh,stern,gentle]                               |
| `perl-toolbox.lint.useProfile`       | false      | use settings in .perlcriticrc                                                       |
| `perl-toolbox.lint.useProfile`       | false      | use settings in .perlcriticrc                                                       |
| `perl-toolbox.lint.excludedPolicies` | []         | An array of perlcritic policies to ignore                                           |
| `perl-toolbox.lint.brutal`           | warning    | VS code Problem severity for brutal violations                                      |
| `perl-toolbox.lint.cruel`            | warning    | VS code Problem severity for cruel violations                                       |
| `perl-toolbox.lint.harsh`            | info       | VS code Problem severity for harsh violations                                       |
| `perl-toolbox.lint.stern`            | info       | VS code Problem severity for stern violations                                       |
| `perl-toolbox.lint.gentle`           | hint       | VS code Problem severity for gentle violations                                      |
| `perl-toolbox.lint.highlightMode`    | line       | highlight mode (word/line)                                                          |

## Configuration

`perl-toolbox.syntax.path` and `perl-toolbox.lint.path` must be set to the directory containing the executable files prior to linting/syntax checking.

Only documents with a "perl" language mode are checked.

## Known Issues

* Documents are only checked when they are opened or saved.
* On type checking is not supported.

## Troubleshooting

Linting error messages are displayed in "developer Tools"
