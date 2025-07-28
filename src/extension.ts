// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getPreviousPosition } from "./getPreviousPosition";
import { PrefixSearchState } from "./PrefixSearchState";
import { clearState } from "./clearState";
import { getWordBeforePosition } from "./getWordBeforePosition";
import { findMatchingWordPrefix } from "./findMatchingWordPrefix";

const stateMap = new WeakMap<vscode.TextDocument, PrefixSearchState>();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "extension.prefixSearchAndSelectBackwards",
        () => {
            // Get the current editor and selection
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                console.warn("PrefixSearch: No editor?");
                return;
            }

            const state = stateMap.get(editor.document) || {
                searchActive: false,
                foundMatchRange: null,
                prefixRange: null,
            };
            stateMap.set(editor.document, state);

            const selections = editor.selections;
            // Extract the prefix from the cursor position
            const position = editor.selection.start;

            if (state.searchActive) {
                if (
                    state.prefixRange?.end?.line !== position.line ||
                    state.prefixRange?.end?.character !== position.character
                ) {
                    clearState(state);
                }
            }

            console.warn(
                `PrefixSearch: Cursor: ${position.line}, ${position.character}`,
            );

            // const line = editor.document.lineAt(position);
            const wordRange =
                state.prefixRange || getWordBeforePosition(editor, position);

            if (!wordRange) {
                console.warn("PrefixSearch: No prefix found.");
                return;
            }
            state.prefixRange = wordRange;

            const currentRange = state.foundMatchRange || wordRange;
            const prefix = editor.document.getText(wordRange);
            console.warn(
                `PrefixSearch: Prefix: ${prefix} ${JSON.stringify(wordRange)}`,
            );

            const searchStartPosition = getPreviousPosition(
                editor.document,
                currentRange.start,
            );

            if (!searchStartPosition) {
                clearState(state);
                return;
            }
            console.warn(
                `PrefixSearch: search start: ${searchStartPosition.line}, ${searchStartPosition.character}`,
            );
            const range = findMatchingWordPrefix(
                editor,
                searchStartPosition,
                prefix,
            );

            if (range) {
                // Select the previous word that starts with the prefix
                const newSelections: vscode.Selection[] = [
                    new vscode.Selection(wordRange.start, wordRange.end),
                ];

                editor.selections = newSelections;
            } else {
                // No word found with the prefix, clear the selection
                editor.selections = [];
                state.foundMatchRange = null;
                state.prefixRange = null;
                state.searchActive = false;
            }
        },
    );

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
