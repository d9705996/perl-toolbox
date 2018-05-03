"use strict";

import * as cp from "child_process";
import * as vscode from "vscode";

export default class PerlLintProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private command: vscode.Disposable;
  private configuration: vscode.WorkSpace.Configuration;
  private document: vscode.TextDocument;

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
    vscode.workspace.textDocuments.forEach(this.lint, this);
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  private lint(textDocument: vscode.TextDocument) {
    this.document = textDocument;
    this.configuration = vscode.workspace.getConfiguration("perlcritic");
    if (textDocument.languageId !== "perl") {
      return;
    }
    let decoded = "";
    let diagnostics: vscode.Diagnostic[] = [];
    let proc = cp.spawn("perlcritic", this.getCommandOptions(), {
      shell: true,
      cwd: "c:\\perl64\\bin"
    });
    proc.stdout.on("data", (data: Buffer) => {
      decoded += data;
    });

    proc.stderr.on("data", (data: Buffer) => {
      console.log(`stderr: ${data}`);
    });

    proc.stdout.on("end", () => {
      decoded.split("\n").forEach(item => {
        if (item) {
          item = item.replace("~||~", "");
          let tokens = item.split("~|~");

          let range = new vscode.Range(
            Number(tokens[1]) - 1,
            Number(tokens[2]) - 1,
            Number(tokens[1]) - 1,
            300
          );
          let diagnostic = new vscode.Diagnostic(
            range,
            tokens[3],
            vscode.DiagnosticSeverity.Error
          );
          diagnostics.push(diagnostic);
        }
        this.diagnosticCollection.set(this.document.uri, diagnostics);
      });
    });
  }
  private getCommandOptions() {
    return [
      "--" + this.configuration.lintseverity,
      "--noprofile",
      "--verbose",
      '"%s~|~%l~|~%c~|~%m~|~%e~|~%p~||~%n"',
      this.document.fileName
    ];
  }
}
