"use strict";

import * as cp from "child_process";
import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
export default class PerlSyntaxProvider {
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

    vscode.workspace.onDidOpenTextDocument(this.check, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.check, this);

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

  private check(textDocument: vscode.TextDocument) {
    this.document = textDocument;

    if (this.document.uri.scheme === "git") {
      return;
    }

    if (this.document.languageId !== "perl") {
      return;
    }

    this.configuration = vscode.workspace.getConfiguration(
      "perl-toolbox.syntax"
    );

    if (!this.configuration.enabled) {
      return;
    }
    let decoded = "";

    this.tempfilepath =
      this.getTemporaryPath() +
      path.sep +
      path.basename(this.document.fileName) +
      ".syntax";
    fs.writeFile(this.tempfilepath, this.document.getText(), () => {
      let proc = cp.spawn(
        this.configuration.exec,
        [this.getIncludePaths(), "-c", this.tempfilepath],
        this.getCommandOptions()
      );

      proc.stderr.on("data", (data: Buffer) => {
        decoded += data;
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

  private getWorkspaceRoot(): string {
    if (!this._workspaceFolder) {
      this._workspaceFolder = this.getWorkspaceFolder();
    }
    return this._workspaceFolder;
  }

  private getTemporaryPath() {
    let configuration = vscode.workspace.getConfiguration("perl-toolbox");
    if (configuration.temporaryPath === null) {
      return os.tmpdir();
    }
    return configuration.temporaryPath;
  }

  private getIncludePaths() {
    let includePaths = [];
    this.configuration.includePaths.forEach(path => {
      includePaths.push("-I");
      path = path.replace(/\$workspaceRoot/g, this.getWorkspaceRoot());
      includePaths.push(path);
    });
    return includePaths.join(" ");
  }

  private getCommandOptions() {
    return {
      shell: true,
      cwd: this.configuration.path
    };
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
    return new vscode.Diagnostic(
      this.getRange(violation),
      "Syntax: " + violation,
      vscode.DiagnosticSeverity.Error
    );
  }

  private getRange(violation) {
    let patt = /line\s+(\d+)/i;
    let line = patt.exec(violation)[1];
    return new vscode.Range(
      Number(line) - 1,
      0,
      Number(line) - 1,
      Number.MAX_VALUE
    );
  }

  private isValidViolation(violation) {
    let patt = /line\s+\d+/i;
    return patt.exec(violation);
  }
}
