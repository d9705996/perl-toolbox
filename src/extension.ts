"use strict";

import * as vscode from "vscode";
import PerlLintProvider from "./features/PerlLintProvider";

export function activate(context: vscode.ExtensionContext) {
  let linter = new PerlLintProvider();
  linter.activate(context.subscriptions);
}

export function deactivate() {}
