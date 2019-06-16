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
| `perl-toolbox.lint.useProfile`       | false      | use settings in perlcriticProfile                                                   |
| `perl-toolbox.lint.perlcriticProfile`| `null`     | perlcritic profile; if not specified uses ~/.perlcriticrc                           |
| `perl-toolbox.lint.excludedPolicies` | []         | An array of perlcritic policies to ignore                                           |
| `perl-toolbox.lint.brutal`           | warning    | VS code Problem severity for brutal violations                                      |
| `perl-toolbox.lint.cruel`            | warning    | VS code Problem severity for cruel violations                                       |
| `perl-toolbox.lint.harsh`            | info       | VS code Problem severity for harsh violations                                       |
| `perl-toolbox.lint.stern`            | info       | VS code Problem severity for stern violations                                       |
| `perl-toolbox.lint.gentle`           | hint       | VS code Problem severity for gentle violations                                      |
| `perl-toolbox.lint.highlightMode`    | line       | highlight mode (word/line)                                                          |

## Placeholder `$workspaceRoot`

You can put in the placeholder `$workspaceRoot` into 
- `perl-toolbox.lint.perlcriticProfile` 
- and `perl-toolbox.syntax.includePaths`


### perlcritic profile

To use project specific perlcritic settings that are the same across all developers in the team, no matter which
machine they are using, put a `.perlcriticrc` file in the root directory of your project, and set the parameter to

    $workspaceRoot/.perlcriticrc

### include paths

Typically you will have library folders in your project, in a subfolder `lib`.
When you are using `carton`, the depencies are in a subfolder `local/lib/perl5`. 

To make the syntax check work no matter where the github repository is checked out to, you can use the following two entries in your workspace settings .json file

    "perl-toolbox.syntax.includePaths": [
        "$workspaceRoot/lib",
        "$workspaceRoot/local/lib/perl5"
    ]

## Configuration

`perl-toolbox.syntax.path` and `perl-toolbox.lint.path` must be set to the directory containing the executable files prior to linting/syntax checking.


Only documents with a "perl" language mode are checked.

## Known Issues

* Documents are only checked when they are opened or saved.
* On type checking is not supported.

## Troubleshooting

Linting error messages are displayed in "developer Tools"
