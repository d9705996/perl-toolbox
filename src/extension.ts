"use strict";

import * as vscode from "vscode";
import PerlLintProvider from "./features/PerlLintProvider";
import PerlSyntaxProvider from "./features/PerlSyntaxProvider";

export function activate(context: vscode.ExtensionContext) {
  let linter = new PerlLintProvider();
  linter.activate(context.subscriptions);
  let checker = new PerlSyntaxProvider();
  checker.activate(context.subscriptions);
}

export function deactivate() {}
