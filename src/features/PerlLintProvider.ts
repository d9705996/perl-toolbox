"use strict";

import * as cp from "child_process";
import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export default class PerlLintProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private command: vscode.Disposable;
  private configuration: vscode.WorkspaceConfiguration;
  private document: vscode.TextDocument;
  private _workspaceFolder: string;
  private tempfilepath;

  public activate(subscriptions: vscode.Disposable[]) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    vscode.workspace.onDidCloseTextDocument(
      textDocument => {
        this.diagnosticCollection.delete(textDocument.uri);
      },
      null,
      subscriptions
    );

    vscode.workspace.onDidOpenTextDocument(this.lint, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.lint, this);

    vscode.workspace.onDidCloseTextDocument(
      textDocument => {
        this.diagnosticCollection.delete(textDocument.uri);
      },
      null,
      subscriptions
    );
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  private lint(textDocument: vscode.TextDocument) {
    if (textDocument.uri.scheme === "git") {
      return;
    }

    if (textDocument.languageId !== "perl") {
      return;
    }

    this.document = textDocument;

    this.configuration = vscode.workspace.getConfiguration("perl-toolbox.lint");

    if (!this.configuration.enabled) {
      return;
    }
    let decoded = "";
    this.tempfilepath =
      this.getTemporaryPath() +
      path.sep +
      path.basename(this.document.fileName) +
      ".lint";
    fs.writeFile(this.tempfilepath, this.document.getText(), () => {
      let proc = cp.spawn(
        this.configuration.exec,
        this.getCommandArguments(),
        this.getCommandOptions()
      );
      proc.stdout.on("data", (data: Buffer) => {
        decoded += data;
      });

      proc.stderr.on("data", (data: Buffer) => {
        console.log(`stderr: ${data}`);
      });

      proc.stdout.on("end", () => {
        this.diagnosticCollection.set(
          this.document.uri,
          this.getDiagnostics(decoded)
        );
        fs.unlink(this.tempfilepath, () => {});
      });
    });
  }

  private getWorkspaceRoot(): string {
    if (!this._workspaceFolder) {
      this._workspaceFolder = this.getWorkspaceFolder();
    }
    return this._workspaceFolder;
  }

  private getWorkspaceFolder(): string {
    if (vscode.workspace.workspaceFolders) {
      if (this.document) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(this.document.uri);
        if (workspaceFolder) {
          return workspaceFolder.uri.fsPath;
        }
      }
      return vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
      return undefined;
    }
  }

  private getDiagnostics(output) {
    let diagnostics: vscode.Diagnostic[] = [];
    output.split("\n").forEach(violation => {
      if (this.isValidViolation(violation)) {
        diagnostics.push(this.createDiagnostic(violation));
      }
    });
    return diagnostics;
  }

  private createDiagnostic(violation) {
    let tokens = violation.replace("~||~", "").split("~|~");

    const diagnostic = new vscode.Diagnostic(
      this.getRange(tokens),
      this.getMessage(tokens),
      this.getSeverity(tokens)
    ); 
    diagnostic.source = this.getPolicyName(tokens);

    return diagnostic;
  }

  private getRange(tokens) {
    if (this.configuration.highlightMode === "word") {
      return this.document.getWordRangeAtPosition(
        new vscode.Position(Number(tokens[1]) - 1, Number(tokens[2]) - 1),
        /[^\s]+/
      );
    }

    return new vscode.Range(
      Number(tokens[1]) - 1,
      Number(tokens[2]) - 1,
      Number(tokens[1]) - 1,
      Number.MAX_VALUE
    );
  }

  private getMessage(tokens) {
    return (
      "Lint: " +
      this.getSeverityAsText(tokens[0]).toUpperCase() +
      ": " +
      tokens[3]
    );
  }

  private getSeverityAsText(severity) {
    switch (parseInt(severity)) {
      case 5:
        return "gentle";
      case 4:
        return "stern";
      case 3:
        return "harsh";
      case 2:
        return "cruel";
      default:
        return "brutal";
    }
  }

  private getSeverity(tokens) {
    switch (this.configuration[this.getSeverityAsText(tokens[0])]) {
      case "hint":
        return vscode.DiagnosticSeverity.Hint;
      case "info":
        return vscode.DiagnosticSeverity.Information;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      default:
        return vscode.DiagnosticSeverity.Error;
    }
  }

  private getPolicyName(tokens) {
    return tokens[5];
  }

  private isValidViolation(violation) {
    return violation.split("~|~").length === 6;
  }

  private getCommandOptions() {
    return {
      shell: true,
      cwd: this.configuration.path
    };
  }

  private getCommandArguments() {
    return [
      "--" + this.getLintSeverity(),
      ...this.useProfile(),
      ...this.getExcludedPolicies(),
      "--verbose",
      '"%s~|~%l~|~%c~|~%m~|~%e~|~%p~||~%n"',
      this.tempfilepath
    ];
  }

  private getExcludedPolicies(): string[] {
    let policies = [];
    this.configuration.excludedPolicies.forEach(policy => {
      policies.push("--exclude");
      policies.push(policy);
    });
    return policies;
  }

  private getTemporaryPath() {
    let configuration = vscode.workspace.getConfiguration("perl-toolbox");
    if (configuration.temporaryPath === null) {
      return os.tmpdir();
    }
    return configuration.temporaryPath;
  }

  private useProfile(): string[] {
    if (!this.configuration.useProfile) {
      return ["--noprofile"];
    } else {
      if (this.configuration.perlcriticProfile) {
        var profile: string = this.configuration.perlcriticProfile.replace(/\$workspaceRoot/g, this.getWorkspaceRoot());
        return ["--profile", profile];
      } else {
        return [];
      }
    }
  }

  private getLintSeverity() {
    return this.configuration.severity;
  }
}
