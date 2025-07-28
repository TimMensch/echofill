import * as vscode from "vscode";

export type PrefixSearchState = {
    searchActive: boolean;
    prefixRange: vscode.Range | null;
    foundMatchRange: vscode.Range | null;
};
