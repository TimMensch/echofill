// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

type PrefixSearchState = {
    searchActive: boolean;
    prefixRange: vscode.Range | null;
    foundMatchRange: vscode.Range | null;
};

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
                    state.searchActive = false;
                    state.prefixRange = null;
                    state.foundMatchRange = null;
                }
            }

            console.warn(
                `PrefixSearch: Cursor: ${position.line}, ${position.character}`,
            );

            // const line = editor.document.lineAt(position);
            const wordRange =
                state.prefixRange || getWordBeforeCursor(editor, position);

            if (!wordRange) {
                console.warn("PrefixSearch: No prefix found.");
                return;
            }
            state.prefixRange = wordRange;

            const currentRange = state.foundMatchRange || wordRange;
            const prefix = editor.document.getText(wordRange);
            console.warn(`PrefixSearch: Prefix: ${prefix}`);
            
            // Search backward for a word that starts with the prefix and select it
            const searchStartPosition = currentRange.start.translate(0, -1);
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

function findMatchingWordPrefix(
    editor: vscode.TextEditor,
    startingPosition: vscode.Position,
    prefix: string,
) {
    let line = startingPosition.line;
    let character = startingPosition.character;
    while (line >= 0) {
        let text = editor.document.lineAt(line).text;
        if (character > 0) {
            text = text.substring(0, character);
            character = Number.MAX_SAFE_INTEGER;
        }
        const lastIndex = text.lastIndexOf(prefix, character);
        if (lastIndex !== -1) {
            return new vscode.Range(
                new vscode.Position(line, lastIndex),
                new vscode.Position(line, lastIndex).translate(
                    0,
                    prefix.length,
                ),
            );
        } else {
            line--;
        }
    }
    return null;
}

function getWordBeforeCursor(
    editor: vscode.TextEditor,
    position: vscode.Position,
): vscode.Range {
    const lineText = editor.document.lineAt(position.line).text;
    const cursorIndex = position.character;

    let start = cursorIndex;

    // Scan backward from the cursor until a non-word character is found
    while (start > 0) {
        const char = lineText.charAt(start - 1);
        if (!/\w/.test(char)) {
            break;
        }
        start--;
    }

    const wordStart = new vscode.Position(position.line, start);
    return new vscode.Range(wordStart, position);
}

// This method is called when your extension is deactivated
export function deactivate() {}
