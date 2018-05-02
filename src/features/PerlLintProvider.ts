"use strict";

import * as path from "path";
import * as cp from "child_process";
import ChildProcess = cp.ChildProcess;

import * as vscode from "vscode";

export default class PerlLintProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private command: vscode.Disposable;

  public activate(subscriptions: vscode.Disposable[]) {}
}
